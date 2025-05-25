using System.Text;
using System.Text.Json;
using AutoComp.Data;
using AutoComp.Models;
using Microsoft.AspNetCore.Mvc;

namespace AutoComp.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AiAssistantController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AppDbContext _context;

        public AiAssistantController(IHttpClientFactory httpClientFactory, AppDbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AiRequest request)
        {
            var client = _httpClientFactory.CreateClient();
            var ollamaPayload = new
            {
                model = "phi:latest",
                prompt = "Respond at the following in a very brief (short) manner and NEVER bring up games or scenarios. " + request.Prompt,
                stream = false
            };

            var json = JsonSerializer.Serialize(ollamaPayload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await client.PostAsync("http://localhost:11434/api/generate", content);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Failed to get AI response.");
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseBody);
                var reply = doc.RootElement.GetProperty("response").GetString();

                var aiChatMessage = new AiChatMessage
                {
                    UserId = request.UserId,
                    Prompt = request.Prompt,
                    Response = reply ?? string.Empty,
                    Timestamp = DateTime.UtcNow
                };

                _context.AiChatMessages.Add(aiChatMessage);
                await _context.SaveChangesAsync();

                return Ok(new { response = reply });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Exception: {ex.Message}");
            }
        }
    }

    public class AiRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
    }
}