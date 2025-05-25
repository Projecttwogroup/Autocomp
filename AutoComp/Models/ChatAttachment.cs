namespace AutoComp.Models
{
    public class ChatAttachment
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        public string Sender { get; set; } = String.Empty;

    }
}
