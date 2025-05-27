using System.Globalization;
using AutoComp.Data;
using AutoComp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autocomp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TechnicianController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Technician>>> GetAll()
        {
            return await _context.Technicians.ToListAsync();
        }

        [HttpGet("{name}")]
        public async Task<ActionResult<Technician>> GetByName(string name)
        {
            var technician = await _context.Technicians.FirstOrDefaultAsync(t => t.Name == name);
            if (technician == null) return NotFound();
            return technician;
        }

        [HttpPost]
        public async Task<ActionResult<Technician>> Create(Technician technician)
        {
            _context.Technicians.Add(technician);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByName), new { name = technician.Name }, technician);
        }

        [HttpGet("{name}/chart")]
        public async Task<IActionResult> GetMonthlyStats(string name)
        {
            var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-11);

            var groupedData = await _context.Tickets
                .Where(t => t.Technician == name && t.CreatedAt >= twelveMonthsAgo)
                .ToListAsync();

            var result = Enumerable.Range(0, 12)
                .Select(i =>
                {
                    var month = twelveMonthsAgo.AddMonths(i);
                    var monthTickets = groupedData.Where(t =>
                        t.CreatedAt.Month == month.Month &&
                        t.CreatedAt.Year == month.Year
                    );

                    return new
                    {
                        name = month.ToString("MMM", CultureInfo.InvariantCulture),
                        completed = monthTickets.Count(t => t.Status == "Completed"),
                        inProgress = monthTickets.Count(t => t.Status == "In Progress")
                    };
                })
                .ToList();

            return Ok(result);
        }

        [HttpGet("{name}/stats")]
        public async Task<IActionResult> GetTechnicianStats(string name)
        {
            var tickets = await _context.Tickets
                .Where(t => t.Technician == name && t.Status == "Completed")
                .ToListAsync();

            if (!tickets.Any())
            {
                return Ok(new
                {
                    satisfactionRate = 0,
                    averageResolutionTime = "N/A",
                    performance = 0
                });
            }

            var rated = tickets.Where(t => t.Rating.HasValue).ToList();
            double satisfactionRate = rated.Any()
                ? Math.Round(rated.Average(t => t.Rating.Value) / 5.0 * 100, 2)
                : 0;

            var resolved = tickets.Where(t => t.CompletedAt.HasValue && t.PreferredDate.HasValue).ToList();
            double avgMinutes = resolved.Any()
                ? resolved.Average(t => (t.CompletedAt.Value - t.PreferredDate.Value).TotalMinutes)
                : 0;

            var totalHours = (int)(avgMinutes / 60);
            var days = totalHours / 24;
            var hours = totalHours % 24;
            var averageResolutionTime = $"{days}d {hours}h";

            // Performance formula based on 2-day (48h) ideal window
            double avgDelayHours = resolved.Any()
                ? resolved.Average(t => (t.CompletedAt.Value - t.PreferredDate.Value).TotalHours)
                : 0;

            double timeScore = avgDelayHours <= 48
                ? 100
                : Math.Max(0, 100 - (avgDelayHours - 48)); // lose 1 point per hour of delay

            double performance = Math.Round((satisfactionRate * 0.5) + (timeScore * 0.5), 2);

            return Ok(new
            {
                satisfactionRate,
                averageResolutionTime,
                performance
            });
        }

        [HttpGet("{name}/requests")]
        public async Task<IActionResult> GetCompletedRequests(string name)
        {
            var tickets = await _context.Tickets
                .Where(t => t.Technician == name && t.Status == "Completed")
                .OrderByDescending(t => t.CompletedAt)
                .ToListAsync();

            var formatted = tickets.Select(t => new
            {
                id = t.Id,
                description = t.Description,
                completedAt = t.CompletedAt,
                preferredDate = t.PreferredDate
            });

            return Ok(formatted);
        }

    }
}
