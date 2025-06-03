using System.Globalization;
using AutoComp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;

namespace AutoComp.Controllers
{
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        private byte[] CreatePdf(List<(string Name, string Dept, double Performance, double Satisfaction, string Resolution, List<(string Month, int Completed, int InProgress)> Chart)> data)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header().Text("Technician Performance Report").Bold().FontSize(20).AlignCenter();

                    page.Content().Column(col =>
                    {
                        foreach (var t in data)
                        {
                            col.Item().PaddingBottom(10).Column(section =>
                            {
                                section.Item().Text($"Technician: {t.Name}").Bold();
                                section.Item().Text($"Department: {t.Dept}");
                                section.Item().Text($"Performance: {t.Performance}%");
                                section.Item().Text($"Satisfaction Rate: {t.Satisfaction}%");
                                section.Item().Text($"Avg. Resolution Time: {t.Resolution}");

                                section.Item().PaddingVertical(5).Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Text("Month").Bold();
                                        header.Cell().Text("Completed").Bold();
                                        header.Cell().Text("In Progress").Bold();
                                    });

                                    if (t.Chart.Any())
                                    {
                                        foreach (var c in t.Chart)
                                        {
                                            table.Cell().Text(c.Month);
                                            table.Cell().Text(c.Completed.ToString());
                                            table.Cell().Text(c.InProgress.ToString());
                                        }
                                    }
                                    else
                                    {
                                        table.Cell().ColumnSpan(3).AlignCenter().Text("No data").Italic().FontColor(Colors.Grey.Medium);
                                    }
                                });


                                section.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                            });
                        }
                    });
                });
            }).GeneratePdf();
        }

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

        [HttpGet("admin/technicians-report")]
        public async Task<IActionResult> GenerateTechnicianReport()
        {
            var technicians = await _context.Technicians.ToListAsync();

            var reportData = new List<(string Name, string Dept, double Performance, double Satisfaction, string Resolution, List<(string Month, int Completed, int InProgress)> Chart)>();

            foreach (var tech in technicians)
            {
                // Get stats
                var statsResponse = await _context.Tickets
                    .Where(t => t.Technician == tech.Name && t.Status == "Completed")
                    .ToListAsync();

                double satisfaction = 0;
                string avgResTime = "N/A";
                double performance = 0;

                if (statsResponse.Any())
                {
                    var rated = statsResponse.Where(t => t.Rating.HasValue).ToList();
                    satisfaction = rated.Any() ? Math.Round(rated.Average(t => t.Rating.Value) / 5.0 * 100, 2) : 0;

                    var resolved = statsResponse.Where(t => t.CompletedAt.HasValue && t.PreferredDate.HasValue).ToList();
                    double avgMinutes = resolved.Any()
                        ? resolved.Average(t => (t.CompletedAt.Value - t.PreferredDate.Value).TotalMinutes)
                        : 0;

                    var totalHours = (int)(avgMinutes / 60);
                    var days = totalHours / 24;
                    var hours = totalHours % 24;
                    avgResTime = $"{days}d {hours}h";

                    double avgDelayHours = resolved.Any()
                        ? resolved.Average(t => (t.CompletedAt.Value - t.PreferredDate.Value).TotalHours)
                        : 0;

                    double timeScore = avgDelayHours <= 48 ? 100 : Math.Max(0, 100 - (avgDelayHours - 48));
                    performance = Math.Round((satisfaction * 0.5) + (timeScore * 0.5), 2);
                }

                // Chart
                var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-11);
                var grouped = await _context.Tickets
                    .Where(t => t.Technician == tech.Name && t.CreatedAt >= twelveMonthsAgo)
                    .ToListAsync();

                var chart = Enumerable.Range(0, 12).Select(i =>
                {
                    var m = twelveMonthsAgo.AddMonths(i);
                    var monthly = grouped.Where(t => t.CreatedAt.Month == m.Month && t.CreatedAt.Year == m.Year);
                    return (
                        Month: m.ToString("MMM", CultureInfo.InvariantCulture),
                        Completed: monthly.Count(t => t.Status == "Completed"),
                        InProgress: monthly.Count(t => t.Status == "In Progress")
                    );
                }).ToList();

                reportData.Add((tech.Name, tech.Department, performance, satisfaction, avgResTime, chart));
            }

            byte[] pdfBytes = CreatePdf(reportData);

            return File(pdfBytes, "application/pdf", "Technicians-Report.pdf");
        }

    }

}
