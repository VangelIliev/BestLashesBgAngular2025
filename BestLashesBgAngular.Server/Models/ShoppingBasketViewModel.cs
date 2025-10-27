using System.ComponentModel.DataAnnotations;

namespace BestLashesBgAngular.Server.Models
{
    public class ShoppingBasketViewModel
    {
        [Required]
        public EmailViewModel Customer { get; set; } = new EmailViewModel();

        [Required]
        [MinLength(1, ErrorMessage = "Количката е празна.")]
        public List<LashViewModel> Items { get; set; } = new();

        public string? DiscountCode { get; set; }

        [Range(0, 100000)]
        public double Subtotal { get; set; }

        [Range(0, 100000)]
        public double DiscountValue { get; set; }

        [Range(0, 100000)]
        public double Total { get; set; }
    }
}
