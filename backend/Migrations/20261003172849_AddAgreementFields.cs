using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAgreementFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AgreedQuantityKg",
                table: "ProcurementLots",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AgreementVersion",
                table: "ProcurementLots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LogisticsCost",
                table: "ProcurementLots",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NegotiationRemarks",
                table: "ProcurementLots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OfferedPricePerKg",
                table: "ProcurementLots",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OtherAdjustments",
                table: "ProcurementLots",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgreedQuantityKg",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "AgreementVersion",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "LogisticsCost",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "NegotiationRemarks",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "OfferedPricePerKg",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "OtherAdjustments",
                table: "ProcurementLots");
        }
    }
}
