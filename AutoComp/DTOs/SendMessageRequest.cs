namespace AutoComp.DTOs
{
    public class SendMessageRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
