using AutoComp.Data;
using AutoComp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autocomp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TechnicianController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Technician>>> GetAll()
        {
            return await _context.Technicians.ToListAsync();
        }

        [HttpGet("{name}")]
        public async Task<ActionResult<Technician>> GetByName(string name)
        {
            var technician = await _context.Technicians.FirstOrDefaultAsync(t => t.Name == name);
            if (technician == null) return NotFound();
            return technician;
        }

        [HttpPost]
        public async Task<ActionResult<Technician>> Create(Technician technician)
        {
            _context.Technicians.Add(technician);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByName), new { name = technician.Name }, technician);
        }
    }
}
