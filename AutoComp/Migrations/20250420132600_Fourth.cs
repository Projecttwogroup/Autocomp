using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoComp.Migrations
{
    /// <inheritdoc />
    public partial class Fourth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StoredPath",
                table: "TicketAttachments",
                newName: "OriginalFileName");

            migrationBuilder.RenameColumn(
                name: "OriginalName",
                table: "TicketAttachments",
                newName: "FilePath");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OriginalFileName",
                table: "TicketAttachments",
                newName: "StoredPath");

            migrationBuilder.RenameColumn(
                name: "FilePath",
                table: "TicketAttachments",
                newName: "OriginalName");
        }
    }
}
