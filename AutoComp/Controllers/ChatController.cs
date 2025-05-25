namespace AutoComp.Controllers
{
    using AutoComp.Data;
    using AutoComp.DTOs;
    using Microsoft.AspNetCore.Mvc;

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
                .Where(m => m.UserId == userId)
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
    }
}
