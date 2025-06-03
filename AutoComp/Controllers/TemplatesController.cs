using AutoComp.Data;
using AutoComp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TemplatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TemplatesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SaveTemplate([FromBody] EmailTemplate request)
        {
            if (string.IsNullOrWhiteSpace(request.Type))
                return BadRequest("Template type is required.");

            var existing = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Type == request.Type);

            if (existing != null)
            {
                existing.Subject = request.Subject;
                existing.Body = request.Body;
            }
            else
            {
                _context.EmailTemplates.Add(new EmailTemplate
                {
                    Type = request.Type,
                    Subject = request.Subject,
                    Body = request.Body
                });
            }

            await _context.SaveChangesAsync();
            return Ok("Template saved.");
        }

        [HttpGet("{type}")]
        public async Task<IActionResult> GetTemplateByType(string type)
        {
            var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Type == type);
            if (template == null)
                return NotFound();

            return Ok(new
            {
                template.Type,
                template.Subject,
                template.Body
            });
        }

    }
}
