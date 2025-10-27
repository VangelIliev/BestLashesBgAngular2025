using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BestLashesBgAngular.Server.Models
{
    public class LashViewModel
    {
        [Required]
        public required string Name { get; set; }

        [Range(1, 20, ErrorMessage = "Невалидно количество за артикул.")]
        public int Quantity { get; set; }

        [Range(0, 10000, ErrorMessage = "Невалидна цена на артикул.")]
        [JsonPropertyName("unitPrice")]
        public double Price { get; set; }

        [JsonPropertyName("totalPrice")]
        public double? TotalPrice { get; set; }

        public string? Id { get; set; }
    }
}
