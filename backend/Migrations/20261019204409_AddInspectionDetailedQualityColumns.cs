using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInspectionDetailedQualityColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DamagedGrainsPercentage",
                table: "Inspections",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ForeignMatterPercentage",
                table: "Inspections",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ImmatureGrainsPercentage",
                table: "Inspections",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InsectDamage",
                table: "Inspections",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DamagedGrainsPercentage",
                table: "Inspections");

            migrationBuilder.DropColumn(
                name: "ForeignMatterPercentage",
                table: "Inspections");

            migrationBuilder.DropColumn(
                name: "ImmatureGrainsPercentage",
                table: "Inspections");

            migrationBuilder.DropColumn(
                name: "InsectDamage",
                table: "Inspections");
        }
    }
}
