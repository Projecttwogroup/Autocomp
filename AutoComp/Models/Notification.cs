using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AutoComp.Models
{
    public class Notification
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string UserId { get; set; } = string.Empty;

        [JsonIgnore]
        public User User { get; set; }

        public bool IsSeen { get; set; } = false;
    }
}
