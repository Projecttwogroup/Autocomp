using System.ComponentModel.DataAnnotations;

namespace AutoComp.DTOs
{
    public class UploadAttachmentRequest
    {
        [Required]
        public IFormFile File { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        public string Sender { get; set; } // user or admin

    }
}
