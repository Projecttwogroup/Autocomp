namespace AutoComp.Models
{
    public class AiChatMessage
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
