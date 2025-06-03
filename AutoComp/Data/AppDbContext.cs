using AutoComp.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoComp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<TicketAttachment> TicketAttachments { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatAttachment> ChatAttachments { get; set; }
        public DbSet<AiChatMessage> AiChatMessages { get; set; }
        public DbSet<Technician> Technicians { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasMany(u => u.Notifications)
                .WithOne(n => n.User)
                .HasForeignKey(n => n.UserId);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Tickets)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId);

        }
    }
}