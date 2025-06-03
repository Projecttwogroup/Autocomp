using AutoComp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserPreferencesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserPreferencesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{userId}/preferences")]
        public async Task<IActionResult> UpdatePreferences(string userId, [FromBody] UserPreferenceDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found.");

            user.ReceiveStatusEmails = dto.ReceiveStatusEmails;
            await _context.SaveChangesAsync();

            return Ok("Preferences updated.");
        }
    }

    public class UserPreferenceDto
    {
        public bool ReceiveStatusEmails { get; set; }
    }
}
