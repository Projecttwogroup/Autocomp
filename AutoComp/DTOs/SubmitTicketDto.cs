using System.ComponentModel.DataAnnotations;

namespace AutoComp.DTOs
{
    public class SubmitTicketDto
    {
        [Required]
        public string? Description { get; set; }

        [Required]
        public string? Department { get; set; }

        [Required]
        public string? Location { get; set; }

        [Required]
        public string? ContactNumber { get; set; }

        [Required]
        public string? OfficeHoursStart { get; set; }

        [Required]
        public string? OfficeHoursEnd { get; set; }

        [Required]
        public DateTime? PreferredDate { get; set; }

        [Required]
        public string? AvailableFrom { get; set; }

        [Required]
        public string? AvailableUntil { get; set; }

        [Required]
        public string? UserId { get; set; }

        public IFormFileCollection? Attachments { get; set; }
    }
}
