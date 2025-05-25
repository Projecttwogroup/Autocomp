using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoComp.Models
{
    public class Ticket
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string? Technician { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Department { get; set; }

        public ICollection<TicketAttachment> Attachments { get; set; }

        public string Location { get; set; }

        public string ContactNumber { get; set; }

        public TimeSpan OfficeHoursStart { get; set; }

        public TimeSpan OfficeHoursEnd { get; set; }

        public DateTime? PreferredDate { get; set; }

        public TimeSpan? AvailableFrom { get; set; }

        public TimeSpan? AvailableUntil { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        public string Status { get; set; } = "Received";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
