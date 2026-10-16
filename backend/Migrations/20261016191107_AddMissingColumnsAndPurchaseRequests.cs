using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingColumnsAndPurchaseRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PurchaseRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestCode = table.Column<string>(type: "text", nullable: false),
                    LotId = table.Column<string>(type: "text", nullable: false),
                    MilletType = table.Column<string>(type: "text", nullable: false),
                    RequestedQuantityKg = table.Column<decimal>(type: "numeric", nullable: false),
                    IndicativePricePerKg = table.Column<decimal>(type: "numeric", nullable: false),
                    IndicativeValue = table.Column<decimal>(type: "numeric", nullable: false),
                    FpoName = table.Column<string>(type: "text", nullable: false),
                    ProcessorId = table.Column<string>(type: "text", nullable: false),
                    ProcessorName = table.Column<string>(type: "text", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AgreementId = table.Column<string>(type: "text", nullable: true),
                    AgreedQuantityKg = table.Column<decimal>(type: "numeric", nullable: true),
                    SellingPricePerKg = table.Column<decimal>(type: "numeric", nullable: true),
                    TotalValue = table.Column<decimal>(type: "numeric", nullable: true),
                    AgreementValidUntil = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    OwnershipTransfer = table.Column<string>(type: "text", nullable: true),
                    CancellationTerms = table.Column<string>(type: "text", nullable: true),
                    PaymentStatus = table.Column<string>(type: "text", nullable: true),
                    PaymentMethod = table.Column<string>(type: "text", nullable: true),
                    PaymentTransactionId = table.Column<string>(type: "text", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "text", nullable: true),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    DispatchCode = table.Column<string>(type: "text", nullable: true),
                    DeliveryChallanNumber = table.Column<string>(type: "text", nullable: true),
                    DeliveryOtp = table.Column<string>(type: "text", nullable: true),
                    DeliveryProofPhotoUrl = table.Column<string>(type: "text", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeliveryNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequests", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PurchaseRequests");
        }
    }
}
