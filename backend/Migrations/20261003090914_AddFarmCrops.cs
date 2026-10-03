using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmCrops : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MilletType",
                table: "ProcurementLots");

            migrationBuilder.AddColumn<Guid>(
                name: "FarmCropId",
                table: "ProcurementLots",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "FarmCrops",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FarmId = table.Column<Guid>(type: "uuid", nullable: false),
                    CropName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Season = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SowingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpectedHarvestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedAreaInAcres = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FarmCrops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FarmCrops_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcurementLots_FarmCropId",
                table: "ProcurementLots",
                column: "FarmCropId");

            migrationBuilder.CreateIndex(
                name: "IX_FarmCrops_FarmId_CropName_Season",
                table: "FarmCrops",
                columns: new[] { "FarmId", "CropName", "Season" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcurementLots_FarmCrops_FarmCropId",
                table: "ProcurementLots",
                column: "FarmCropId",
                principalTable: "FarmCrops",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcurementLots_FarmCrops_FarmCropId",
                table: "ProcurementLots");

            migrationBuilder.DropTable(
                name: "FarmCrops");

            migrationBuilder.DropIndex(
                name: "IX_ProcurementLots_FarmCropId",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "FarmCropId",
                table: "ProcurementLots");

            migrationBuilder.AddColumn<string>(
                name: "MilletType",
                table: "ProcurementLots",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
