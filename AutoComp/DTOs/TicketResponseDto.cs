namespace AutoComp.DTOs
{
    public class TicketResponseDto
    {
        public string? Id { get; set; }
        public string? Description { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? ContactNumber { get; set; }
        public TimeSpan OfficeHoursStart { get; set; }
        public TimeSpan OfficeHoursEnd { get; set; }
        public DateTime? PreferredDate { get; set; }
        public TimeSpan? AvailableFrom { get; set; }
        public TimeSpan? AvailableUntil { get; set; }
        public string? UserId { get; set; }
        public string UserName { get; set; }
        public string? Status { get; set; }
        public string Technician { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<AttachmentDto>? Attachments { get; set; }
    }

    public class AttachmentDto
    {
        public string? Url { get; set; }
        public string? Name { get; set; }
    }
}
