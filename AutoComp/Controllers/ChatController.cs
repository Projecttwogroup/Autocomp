namespace AutoComp.Controllers
{
    using AutoComp.Data;
    using AutoComp.DTOs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public IActionResult GetMessages(string userId)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var messages = _context.ChatMessages
                .Where(m => m.UserId == userId && m.Content != null)
                .Select(m => new UnifiedChatEntry
                {
                    UserId = m.UserId,
                    Sender = m.Sender,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                });

            var attachments = _context.ChatAttachments
                .Where(a => a.UserId == userId)
                .Select(a => new UnifiedChatEntry
                {
                    UserId = a.UserId,
                    Sender = a.Sender,
                    AttachmentUrl = $"{baseUrl}{a.FilePath}",
                    AttachmentName = a.OriginalFileName,
                    Timestamp = a.UploadDate
                });

            var combined = messages.ToList()
                .Concat(attachments.ToList())
                .OrderBy(e => e.Timestamp)
                .ToList();

            return Ok(combined);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetChatUsers()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var messageGroups = await _context.ChatMessages
                .GroupBy(m => m.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    LastMessage = g.OrderByDescending(m => m.Timestamp).FirstOrDefault()
                })
                .ToListAsync();

            var attachmentGroups = await _context.ChatAttachments
                .GroupBy(a => a.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    LastAttachment = g.OrderByDescending(a => a.UploadDate).FirstOrDefault()
                })
                .ToListAsync();

            var users = await _context.Users
                .Where(u => u.Role != "admin")
                .ToListAsync();

            var result = users.Select(user =>
            {
                var userId = user.Id;

                var msg = messageGroups.FirstOrDefault(m => m.UserId == userId)?.LastMessage;
                var att = attachmentGroups.FirstOrDefault(a => a.UserId == userId)?.LastAttachment;

                // Determine which is newer: message or attachment
                var latestTime = new[] {
            msg?.Timestamp ?? DateTime.MinValue,
            att?.UploadDate ?? DateTime.MinValue
        }.Max();

                var latestIsAttachment = att != null && att.UploadDate >= (msg?.Timestamp ?? DateTime.MinValue);

                return new
                {
                    userId = user.Id,
                    userName = user.Name,
                    email = user.Email,
                    lastMessage = latestIsAttachment ? "" : msg?.Content ?? "",
                    lastAttachmentUrl = latestIsAttachment ? $"{baseUrl}{att.FilePath}" : null,
                    lastAttachmentName = latestIsAttachment ? att.OriginalFileName : null,
                    lastTimestamp = (att == null && msg == null) ? ""
    : (latestIsAttachment ? att?.UploadDate : msg?.Timestamp)?.ToString("o") ?? "",
                    unreadCount = 0
                };
            });

            return Ok(result);
        }


    }
}
