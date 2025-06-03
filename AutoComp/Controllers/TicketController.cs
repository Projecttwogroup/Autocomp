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

            // Save attachments
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

            // Send new request confirmation email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == fields.UserId);
            Console.WriteLine($"[DEBUG] user = {user?.Email}, receive = {user?.ReceiveStatusEmails}");
            if (user != null && user.ReceiveStatusEmails)
            {
                var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Type == "newRequest");
                if (template != null)
                {
                    var emailBody = template.Body
                        .Replace("[User Name]", user.Name)
                        .Replace("[Request ID]", ticket.Id)
                        .Replace("[Department]", ticket.Department)
                        .Replace("[Description]", ticket.Description)
                        .Replace("[Preferred Time]", ticket.PreferredDate?.ToString("F") ?? "Not specified")
                        .Replace("[Status]", ticket.Status)
                        .Replace("[Technician]", "Unassigned");

                    var subject = template.Subject.Replace("[Request ID]", ticket.Id);

                    try
                    {
                        Console.WriteLine($"Sending new request email to: {user.Email}");
                        await EmailService.SendAsync(user.Email, subject, emailBody);

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Failed to send email: " + ex.Message);
                    }

                }
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

            var previousStatus = ticket.Status;
            var technicianName = ticket.Technician;

            ticket.Status = newStatus;

            if (newStatus == "Received")
                ticket.Technician = null;

            // Update technician CompletedRequests
            if (!string.IsNullOrEmpty(technicianName))
            {
                var technician = await _context.Technicians.FirstOrDefaultAsync(t => t.Name == technicianName);
                if (technician != null)
                {
                    if (previousStatus == "Completed" && newStatus != "Completed")
                        technician.CompletedRequests = Math.Max(0, technician.CompletedRequests - 1);

                    if (previousStatus != "Completed" && newStatus == "Completed")
                        technician.CompletedRequests += 1;
                }
            }

            await _context.SaveChangesAsync();

            // Email logic
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == ticket.UserId);
            if (user != null && user.ReceiveStatusEmails)
            {
                string templateType = newStatus == "Completed" ? "requestCompleted" : "statusUpdate";
                var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Type == templateType);

                if (template != null)
                {
                    var emailBody = template.Body
                        .Replace("[User Name]", user.Name)
                        .Replace("[Request ID]", ticket.Id)
                        .Replace("[Department]", ticket.Department)
                        .Replace("[Description]", ticket.Description)
                        .Replace("[Preferred Time]", ticket.PreferredDate?.ToString("F") ?? "Not specified")
                        .Replace("[Status]", ticket.Status)
                        .Replace("[Technician]", ticket.Technician ?? "Unassigned");

                    var subject = template.Subject.Replace("[Request ID]", ticket.Id);

                    await EmailService.SendAsync(user.Email, subject, emailBody);
                }
            }

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

        [HttpPut("rate/{ticketId}")]
        public async Task<IActionResult> RateTicket(string ticketId, [FromBody] RatingDto input)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null || ticket.Status != "Completed")
                return BadRequest("Only completed tickets can be rated.");

            ticket.Rating = input.Rating;
            ticket.Feedback = input.Feedback;
            ticket.CompletedAt ??= DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Rated successfully.");
        }

        [HttpGet("user/{userId}/stats")]
        public async Task<IActionResult> GetUserTicketStats(string userId)
        {
            var userTickets = await _context.Tickets
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var activeCount = userTickets.Count(t => t.Status != "Completed");
            var completedCount = userTickets.Count(t => t.Status == "Completed");
            var totalCount = userTickets.Count;

            return Ok(new
            {
                active = activeCount,
                completed = completedCount,
                total = totalCount
            });
        }


    }
}
