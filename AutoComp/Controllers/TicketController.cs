using AutoComp.Data;
using AutoComp.DTOs;
using AutoComp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetTicketsForUser(string userId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.UserId == userId)
                .Include(t => t.Attachments)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var response = tickets.Select(t => new TicketResponseDto
            {
                Id = t.Id,
                Description = t.Description,
                Department = t.Department,
                Location = t.Location,
                ContactNumber = t.ContactNumber,
                OfficeHoursStart = t.OfficeHoursStart,
                OfficeHoursEnd = t.OfficeHoursEnd,
                PreferredDate = t.PreferredDate,
                AvailableFrom = t.AvailableFrom,
                AvailableUntil = t.AvailableUntil,
                UserId = t.UserId,
                Status = t.Status,
                CreatedAt = t.CreatedAt,

                Attachments = t.Attachments.Select(a => new AttachmentDto
                {
                    Url = a.FilePath,
                    Name = a.OriginalFileName
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        [HttpPost("submit")]
        [RequestSizeLimit(10_000_000)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitTicket(
            [FromForm] SubmitTicketFieldsDto fields,
            [FromForm] List<IFormFile> attachments
        )
        {
            if (fields == null)
                return BadRequest("Ticket data is required.");

            var ticket = new Ticket
            {
                Description = fields.Description,
                Department = fields.Department,
                Location = fields.Location,
                ContactNumber = fields.ContactNumber,
                OfficeHoursStart = TimeSpan.Parse(fields.OfficeHoursStart),
                OfficeHoursEnd = TimeSpan.Parse(fields.OfficeHoursEnd),
                PreferredDate = fields.PreferredDate,
                AvailableFrom = TimeSpan.Parse(fields.AvailableFrom),
                AvailableUntil = TimeSpan.Parse(fields.AvailableUntil),
                UserId = fields.UserId,
                Status = "Received",
                CreatedAt = DateTime.Now,
                Technician = null
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            if (attachments != null && attachments.Count > 0)
            {
                foreach (var file in attachments)
                {
                    if (file.Length > 0)
                    {
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "attachments");
                        Directory.CreateDirectory(uploadsFolder);

                        var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await stream.WriteAsync(await file.GetBytesAsync());
                        }

                        var attachment = new TicketAttachment
                        {
                            TicketId = ticket.Id,
                            FilePath = $"attachments/{uniqueFileName}",
                            OriginalFileName = file.FileName
                        };

                        _context.TicketAttachments.Add(attachment);
                    }
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new { ticket.Id });
        }


        [HttpDelete("{userId}/{ticketId}")]
        public async Task<IActionResult> DeleteTicket(string userId, string ticketId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == ticketId && t.UserId == userId);

            if (ticket == null)
                return NotFound();

            foreach (var attachment in ticket.Attachments)
            {
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", attachment.FilePath.TrimStart('/'));
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _context.Tickets
                .Include(t => t.Attachments)
                .Include(t => t.User)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var response = tickets.Select(t => new TicketResponseDto
            {
                Id = t.Id,
                Description = t.Description,
                Department = t.Department,
                Location = t.Location,
                ContactNumber = t.ContactNumber,
                OfficeHoursStart = t.OfficeHoursStart,
                OfficeHoursEnd = t.OfficeHoursEnd,
                PreferredDate = t.PreferredDate,
                AvailableFrom = t.AvailableFrom,
                AvailableUntil = t.AvailableUntil,
                UserName = t.User?.Name,
                UserId = t.User?.Id,
                Status = t.Status,
                Technician = t.Technician,
                CreatedAt = t.CreatedAt,
                Attachments = t.Attachments.Select(a => new AttachmentDto
                {
                    Url = a.FilePath,
                    Name = a.OriginalFileName
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        [HttpPut("admin/update-status/{ticketId}")]
        public async Task<IActionResult> UpdateStatus(string ticketId, [FromBody] string newStatus)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound("Ticket not found.");

            ticket.Status = newStatus;

            if (newStatus == "Received")
                ticket.Technician = null;

            await _context.SaveChangesAsync();

            return Ok("Status updated.");
        }



        [HttpPut("admin/assign-technician/{ticketId}")]
        public async Task<IActionResult> AssignTechnician(string ticketId, [FromBody] string technicianName)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound("Ticket not found.");

            ticket.Technician = technicianName;
            ticket.Status = "In Progress";
            await _context.SaveChangesAsync();

            return Ok("Technician assigned.");
        }



    }
}
