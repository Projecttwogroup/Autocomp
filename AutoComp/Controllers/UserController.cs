using AutoComp.Data;
using AutoComp.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.Name,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.Name, user.Email });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.ReceiveStatusEmails
            });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            Console.WriteLine($"[SEARCH API] Incoming query: '{query}'");

            query = query.ToLower().Trim();

            var matchedUsers = await _context.Users
                .Where(u => u.Role.ToLower() != "admin" &&
                    (u.Name.ToLower().Contains(query) || u.Email.ToLower().Contains(query)))
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email
                })
                .Take(10)
                .ToListAsync();

            Console.WriteLine($"[SEARCH API] Users matched: {matchedUsers.Count}");

            foreach (var user in matchedUsers)
            {
                Console.WriteLine($"[SEARCH API] Match → {user.Name} ({user.Email})");
            }

            return Ok(matchedUsers);
        }

        [HttpPut("update-preferences/{userId}")]
        public async Task<IActionResult> UpdateNotificationPreference(string userId, [FromBody] bool receiveStatusEmails)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            user.ReceiveStatusEmails = receiveStatusEmails;
            await _context.SaveChangesAsync();

            return Ok("Notification preference updated.");
        }

    }

}
