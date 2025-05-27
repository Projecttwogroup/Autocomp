using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AutoComp.Models
{
    public class Technician
    {
        [Key]
        [JsonIgnore]
        public Guid Id { get; set; } = new Guid();

        [Required]
        public string Name { get; set; }

        public string Department { get; set; }

        public int CompletedRequests { get; set; }

        public double Performance { get; set; } = 100;

        public string AverageResolutionTime { get; set; } = "00:00";
    }
}
