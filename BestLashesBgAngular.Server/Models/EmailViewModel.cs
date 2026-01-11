using System.ComponentModel.DataAnnotations;

namespace BestLashesBgAngular.Server.Models
{
    public class EmailViewModel
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(?:\\+359|0)(?:[\\s-]?\\d){9}$", ErrorMessage = "Невалиден телефонен номер.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(econt-office|personal-address)$", ErrorMessage = "Невалиден метод на доставка.")]
        public string DeliveryMethod { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Моля, въведете подробен адрес." )]
        [MaxLength(250, ErrorMessage = "Адресът е твърде дълъг." )]
        public string DeliveryAddress { get; set; } = string.Empty;

        [Range(typeof(bool), "true", "true", ErrorMessage = "Моля, потвърдете съгласието за обработка на лични данни.")]
        public bool IsDataProcessingConsented { get; set; }
    }
}
