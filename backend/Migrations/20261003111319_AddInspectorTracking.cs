using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInspectorTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedInspectorId",
                table: "ProcurementLots",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedInspectorName",
                table: "ProcurementLots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedInspectorPhone",
                table: "ProcurementLots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionTrackingStatus",
                table: "ProcurementLots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InspectorLastUpdated",
                table: "ProcurementLots",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InspectorLatitude",
                table: "ProcurementLots",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InspectorLongitude",
                table: "ProcurementLots",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledInspectionDate",
                table: "ProcurementLots",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedInspectorId",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "AssignedInspectorName",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "AssignedInspectorPhone",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "InspectionTrackingStatus",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "InspectorLastUpdated",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "InspectorLatitude",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "InspectorLongitude",
                table: "ProcurementLots");

            migrationBuilder.DropColumn(
                name: "ScheduledInspectionDate",
                table: "ProcurementLots");
        }
    }
}
