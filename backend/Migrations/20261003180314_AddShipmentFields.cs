using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddShipmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dispatches_Warehouses_WarehouseId",
                table: "Dispatches");

            migrationBuilder.AlterColumn<Guid>(
                name: "WarehouseId",
                table: "Dispatches",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "AgreementId",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BatchId",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Dispatches",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Direction",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerOrProcessorName",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "FinalReceivedQuantityKg",
                table: "Dispatches",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LotId",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MilletType",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProcessorType",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ScheduledEndTime",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ScheduledStartTime",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SourceAddress",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SpecialInstructions",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TransportResponsibility",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "VehicleCapacityKg",
                table: "Dispatches",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseReceiptStatus",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "WarehouseStockAfterDispatchKg",
                table: "Dispatches",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Dispatches_Warehouses_WarehouseId",
                table: "Dispatches",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dispatches_Warehouses_WarehouseId",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "AgreementId",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "Direction",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "FarmerOrProcessorName",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "FinalReceivedQuantityKg",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "LotId",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "MilletType",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "ProcessorType",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "ScheduledEndTime",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "ScheduledStartTime",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "SourceAddress",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "SpecialInstructions",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "TransportResponsibility",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "VehicleCapacityKg",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "WarehouseReceiptStatus",
                table: "Dispatches");

            migrationBuilder.DropColumn(
                name: "WarehouseStockAfterDispatchKg",
                table: "Dispatches");

            migrationBuilder.AlterColumn<Guid>(
                name: "WarehouseId",
                table: "Dispatches",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Dispatches_Warehouses_WarehouseId",
                table: "Dispatches",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
