namespace AutoComp.Controllers
{
    using AutoComp.Data;
    using AutoComp.DTOs;
    using AutoComp.Hubs;
    using AutoComp.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.SignalR;

    [ApiController]
    [Route("api/chathub")]
    public class ChatHubController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatHubController(AppDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost("sendmessage")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Message content cannot be empty.");
            }

            var message = new ChatMessage
            {
                UserId = request.UserId,
                Sender = request.Sender,
                Content = request.Content,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync(
                "ReceiveMessage",
                message.UserId,
                message.Sender,
                message.Content,
                message.Timestamp,
                new List<object>()
            );

            return Ok();
        }

        [HttpPost("sendattachments")]
        [RequestSizeLimit(10_000_000)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SendAttachments([FromForm] UploadAttachmentRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "attachments");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var storedFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.File.FileName);
            var filePath = Path.Combine(uploadsPath, storedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var relativePath = $"/attachments/{storedFileName}";

            var chatAttachment = new ChatAttachment
            {
                UserId = request.UserId,
                FilePath = relativePath,
                OriginalFileName = request.File.FileName,
                UploadDate = DateTime.UtcNow,
                Sender = request.Sender
            };

            _context.ChatAttachments.Add(chatAttachment);
            await _context.SaveChangesAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var attachmentInfo = new
            {
                name = request.File.FileName,
                url = $"{baseUrl}{relativePath}"
            };

            await _hubContext.Clients.All.SendAsync(
                "ReceiveMessage",
                request.UserId,
                request.Sender,
                null,
                DateTime.UtcNow,
                new List<object> { attachmentInfo }
            );

            return Ok(attachmentInfo);
        }
    }
}
