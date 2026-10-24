using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Features.Orders.Entities;

[Table("orders")]
public class Order
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    [Column("order_number")]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("customer_email")]
    public string CustomerEmail { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("customer_phone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    [Column("shipping_address")]
    public string ShippingAddress { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("city")]
    public string City { get; set; } = "Dahod";

    [MaxLength(100)]
    [Column("state")]
    public string State { get; set; } = "Gujarat";

    [MaxLength(20)]
    [Column("pincode")]
    public string Pincode { get; set; } = "389151";

    [MaxLength(50)]
    [Column("payment_method")]
    public string PaymentMethod { get; set; } = "UPI"; // UPI, CARD, COD

    [MaxLength(50)]
    [Column("payment_status")]
    public string PaymentStatus { get; set; } = "PAID"; // PAID, PENDING

    [MaxLength(100)]
    [Column("razorpay_payment_link_id")]
    public string? RazorpayPaymentLinkId { get; set; }

    [MaxLength(500)]
    [Column("razorpay_short_url")]
    public string? RazorpayShortUrl { get; set; }

    [MaxLength(100)]
    [Column("transaction_id")]
    public string? TransactionId { get; set; }

    [Column("subtotal", TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column("delivery_fee", TypeName = "decimal(18,2)")]
    public decimal DeliveryFee { get; set; } = 40.00m;

    [Column("total_amount", TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "CONFIRMED"; // CONFIRMED, ASSIGNED_TO_DRIVER, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    [MaxLength(10)]
    [Column("delivery_otp")]
    public string DeliveryOtp { get; set; } = "4829";

    [Column("assigned_driver_id")]
    public Guid? AssignedDriverId { get; set; }

    [MaxLength(150)]
    [Column("driver_name")]
    public string? DriverName { get; set; }

    [MaxLength(30)]
    [Column("driver_phone")]
    public string? DriverPhone { get; set; }

    [MaxLength(50)]
    [Column("vehicle_number")]
    public string? VehicleNumber { get; set; }

    [Column("customer_latitude", TypeName = "decimal(10,6)")]
    public decimal? CustomerLatitude { get; set; }

    [Column("customer_longitude", TypeName = "decimal(10,6)")]
    public decimal? CustomerLongitude { get; set; }

    [Column("driver_latitude", TypeName = "decimal(10,6)")]
    public decimal? DriverLatitude { get; set; }

    [Column("driver_longitude", TypeName = "decimal(10,6)")]
    public decimal? DriverLongitude { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("delivered_at")]
    public DateTime? DeliveredAt { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}
