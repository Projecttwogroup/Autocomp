namespace AutoComp.DTOs
{
    public class NotificationResponseDto
    {
        public string? Id { get; set; }

        public string? Title { get; set; }

        public string? Message { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? UserId { get; set; }

        public bool IsSeen { get; set; }

        public string? UserName { get; set; }
    }
}
