using AutoComp.Data;
using AutoComp.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

// 1. Database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Add SignalR
builder.Services.AddSignalR();

// 3. Add Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient(); // add this near other services

// 4. Fix CORS for Vite (localhost:8080)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://localhost:8080", "https://localhost:8081")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // <- Needed for SignalR
    });
});

var app = builder.Build();

// 5. Dev middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 6. Middleware order matters
app.UseCors();
app.UseHttpsRedirection();
app.UseStaticFiles(); // Enables serving everything from wwwroot/
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "attachments")),
    RequestPath = "/attachments"
});

app.UseRouting(); // <--- add this
app.UseAuthorization();

// 7. Map endpoints
app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
