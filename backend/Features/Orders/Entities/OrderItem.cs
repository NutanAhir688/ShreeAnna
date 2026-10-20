using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Features.Orders.Entities;

[Table("order_items")]
public class OrderItem
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("order_id")]
    public Guid OrderId { get; set; }

    [ForeignKey(nameof(OrderId))]
    public Order? Order { get; set; }

    [Column("product_id")]
    public Guid? ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("product_title")]
    public string ProductTitle { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("category")]
    public string Category { get; set; } = "Flours & Grains";

    [MaxLength(100)]
    [Column("producer_name")]
    public string ProducerName { get; set; } = "Millet Shakti SHG";

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("unit_price", TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Column("total_price", TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }
}
