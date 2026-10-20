using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Features.Marketplace.Entities;

[Table("marketplace_products")]
public class MarketplaceProduct
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("category")]
    public string Category { get; set; } = "Flours & Grains";

    [MaxLength(100)]
    [Column("brand")]
    public string Brand { get; set; } = "ShreeAnna Organics";

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(50)]
    [Column("lot_id")]
    public string? LotId { get; set; }

    [MaxLength(100)]
    [Column("millet_type")]
    public string? MilletType { get; set; }

    [MaxLength(150)]
    [Column("farmer_name")]
    public string? FarmerName { get; set; }

    [Column("quantity_kg", TypeName = "decimal(18,2)")]
    public decimal? QuantityKg { get; set; }

    [Column("price_per_kg", TypeName = "decimal(18,2)")]
    public decimal? PricePerKg { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Active"; // "Active", "Draft", "Unpublished"

    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Column("created_by_user_id")]
    public Guid? CreatedByUserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;
}
