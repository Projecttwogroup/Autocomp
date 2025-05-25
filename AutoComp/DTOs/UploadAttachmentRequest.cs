namespace AutoComp.DTOs
{
    public class UploadAttachmentRequest
    {
        public IFormFile File { get; set; }
        public string UserId { get; set; }
        public string Sender { get; set; } // user or admin

    }
}
