using System.Text.Json.Serialization;

namespace AutoComp.Models
{
    public class EmailTemplate
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Type { get; set; } //"newRequest", "statusUpdate", "requestCompleted"
        public string Subject { get; set; }
        public string Body { get; set; }
    }

}
