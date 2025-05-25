using System.Text.Json.Serialization;

namespace AutoComp.Models
{
    public class TicketAttachment
    {
        public int Id { get; set; }
        public string? TicketId { get; set; }
        [JsonIgnore]
        public Ticket? Ticket { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
    }
}
