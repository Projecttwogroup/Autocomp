namespace AutoComp.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty;
        public string? Content { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
