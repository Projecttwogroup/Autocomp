using AutoComp.Data;
using AutoComp.DTOs;
using AutoComp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetNotificationsForUser(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            var response = notifications.Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                CreatedAt = n.CreatedAt,
                UserId = n.UserId,
                IsSeen = n.IsSeen
            }).ToList();

            return Ok(response);
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> CreateNotification(string userId, [FromBody] NotificationRequestDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            var notification = new Notification
            {
                Id = Guid.NewGuid().ToString(),
                Title = request.Title,
                Message = request.Message,
                CreatedAt = DateTime.Now,
                UserId = userId,
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.CreatedAt
            });
        }


        [HttpGet("{userId}/has-unseen")]
        public async Task<IActionResult> HasUnseen(string userId)
        {
            var hasUnseen = await _context.Notifications
                .AnyAsync(n => n.UserId == userId && !n.IsSeen);

            return Ok(new { hasUnseen });
        }

        [HttpPost("{userId}/mark-seen")]
        public async Task<IActionResult> MarkAsSeen(string userId)
        {
            var unseen = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsSeen)
                .ToListAsync();

            if (!unseen.Any())
                return NoContent();

            foreach (var n in unseen)
                n.IsSeen = true;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{userId}/{notificationId}")]
        public async Task<IActionResult> DeleteNotification(string userId, string notificationId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return NotFound();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notifications = await _context.Notifications
                .Include(n => n.User)
                .OrderByDescending(n => n.CreatedAt)
                .Take(5)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    UserId = n.UserId,
                    UserName = n.User.Name,
                    IsSeen = n.IsSeen
                })
                .ToListAsync();

            return Ok(notifications);
        }


    }
}
