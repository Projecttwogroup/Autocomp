using System.Text.Json.Serialization;
using AutoComp.Models;

public class User
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Role { get; set; } = "User";

    public bool ReceiveStatusEmails { get; set; } = true;


    [JsonIgnore]
    public List<Notification> Notifications { get; set; } = new();

    [JsonIgnore]
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
