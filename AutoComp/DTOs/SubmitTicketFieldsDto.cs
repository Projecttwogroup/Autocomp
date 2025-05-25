namespace AutoComp.DTOs
{
    public class SubmitTicketFieldsDto
    {
        public string? Description { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? ContactNumber { get; set; }
        public string? OfficeHoursStart { get; set; }
        public string? OfficeHoursEnd { get; set; }
        public DateTime? PreferredDate { get; set; }
        public string? AvailableFrom { get; set; }
        public string? AvailableUntil { get; set; }
        public string? UserId { get; set; }
    }
}
