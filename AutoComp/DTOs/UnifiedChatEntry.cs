namespace AutoComp.DTOs
{
    public class UnifiedChatEntry
    {
        public string UserId { get; set; } = string.Empty;
        public string Sender { get; set; } = "user"; // or "admin"
        public string? Content { get; set; } = null; // only for text
        public string? AttachmentUrl { get; set; } = null; // only for files
        public string? AttachmentName { get; set; } = null;
        public DateTime Timestamp { get; set; }
    }
}
