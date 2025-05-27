using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoComp.Migrations
{
    /// <inheritdoc />
    public partial class tweny : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Tickets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Feedback",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Tickets",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Feedback",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Tickets");
        }
    }
}
