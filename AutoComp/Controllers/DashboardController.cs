using System.Globalization;
using AutoComp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Controllers
{
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("admin/stats")]
        public async Task<IActionResult> GetAdminStats()
        {
            var users = await _context.Users.CountAsync(u => u.Role != "admin");
            var tickets = await _context.Tickets.CountAsync();
            var completed = await _context.Tickets.CountAsync(t => t.Status == "Completed");
            var inProgress = await _context.Tickets.CountAsync(t => t.Status == "In Progress");
            var pending = await _context.Tickets.CountAsync(t => t.Status == "Received");

            return Ok(new
            {
                totalUsers = users,
                totalTickets = tickets,
                completedTickets = completed,
                inProgressTickets = inProgress,
                pendingTickets = pending
            });
        }

        [HttpGet("admin/overview")]
        public async Task<IActionResult> GetDashboardOverview()
        {
            var technicianList = await _context.Technicians.ToListAsync();

            var technicians = technicianList.Select(t => new
            {
                name = t.Name,
                performance = t.Performance,
                averageResolutionTime = t.AverageResolutionTime
            }).ToList();

            var recentTickets = await _context.Tickets
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new
                {
                    id = t.Id,
                    department = t.Department,
                    status = t.Status,
                    createdAt = t.CreatedAt
                })
                .ToListAsync();

            var departmentStats = await _context.Tickets
                .GroupBy(t => t.Department)
                .Select(g => new
                {
                    department = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            var requestsChartData = await _context.Tickets
    .Where(t => t.Status == "Completed" || t.Status == "In Progress")
    .GroupBy(t => t.Status)
    .Select(g => new
    {
        status = g.Key,
        count = g.Count()
    })
    .ToListAsync();


            return Ok(new
            {
                technicians,
                recentTickets,
                departmentStats,
                requestsChartData = Enumerable.Range(1, 12).Select(month => new
                {
                    name = new DateTime(2025, month, 1).ToString("MMM", CultureInfo.InvariantCulture),
                    completed = _context.Tickets.Count(t => t.CreatedAt.Month == month && t.Status == "Completed"),
                    inProgress = _context.Tickets.Count(t => t.CreatedAt.Month == month && t.Status == "In Progress")
                }).ToList()
            });

        }

        [HttpGet("admin/request-status-chart")]
        public async Task<IActionResult> GetRequestStatusChart()
        {
            var monthlyStats = await _context.Tickets
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .Select(g => new
                {
                    name = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(g.Key.Month),
                    completed = g.Count(t => t.Status == "Completed"),
                    inProgress = g.Count(t => t.Status == "In Progress")
                })
                .OrderBy(x => DateTime.ParseExact(x.name, "MMM", CultureInfo.InvariantCulture).Month)
                .ToListAsync();

            return Ok(monthlyStats);
        }


    }

}
