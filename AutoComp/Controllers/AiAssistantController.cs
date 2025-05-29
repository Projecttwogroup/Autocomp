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

            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "sk-2b0234613c2f4cd18197c7dcd2f42033");

            var payload = new
            {
                model = "deepseek-chat",
                messages = new[]
                {
        new { role = "system", content = "You are an English-speaking assistant. Only reply in English. Keep answers brief and helpful." },
        new { role = "user", content = request.Prompt }
    },
                temperature = 0.7,
                stream = false
            };


            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await client.PostAsync("https://api.deepseek.com/v1/chat/completions", content);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Failed to get AI response.");
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseBody);
                var reply = doc.RootElement.GetProperty("choices")[0]
                                           .GetProperty("message")
                                           .GetProperty("content")
                                           .GetString();

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

        [HttpGet("history/{userId}")]
        public IActionResult GetHistory(string userId)
        {
            var messages = _context.AiChatMessages
                .Where(m => m.UserId == userId)
                .OrderBy(m => m.Timestamp)
                .ToList();

            var result = messages.Select(m => new
            {
                id = m.Id.ToString(),
                content = m.Prompt,
                response = m.Response,
                timestamp = m.Timestamp
            });

            return Ok(result);
        }


    }

    public class AiRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
    }
}