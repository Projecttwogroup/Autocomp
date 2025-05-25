using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoComp.Migrations
{
    /// <inheritdoc />
    public partial class thirteenth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Technician",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Technician",
                table: "Tickets");
        }
    }
}
