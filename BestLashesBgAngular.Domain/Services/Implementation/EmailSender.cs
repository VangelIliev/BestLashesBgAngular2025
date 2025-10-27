using BestLashesBgAngular.Domain.Models;
using BestLashesBgAngular.Domain.Services.Interfaces;
using BestLashesBgAngular.Domain.Settings;
using System;
using System.Globalization;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BestLashesBgAngular.Domain.Services.Implementation
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailSettings _settings;
        private readonly CultureInfo _culture = CultureInfo.GetCultureInfo("bg-BG");

        public EmailSender(EmailSettings settings)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        public async Task SendEmailAsync(ShoppingBasketModel model, CancellationToken cancellationToken = default)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model));
            }

            if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(_settings.UserName))
            {
                throw new InvalidOperationException("Email settings are not configured correctly.");
            }

            using var message = CreateMailMessage(model);
            using var smtpClient = new SmtpClient(_settings.Host, _settings.Port)
            {
                EnableSsl = _settings.EnableSSL,
                Credentials = new NetworkCredential(_settings.UserName, _settings.Password)
            };

#if NET8_0_OR_GREATER
            await smtpClient.SendMailAsync(message, cancellationToken);
#else
            cancellationToken.ThrowIfCancellationRequested();
            await smtpClient.SendMailAsync(message);
#endif
        }

        private MailMessage CreateMailMessage(ShoppingBasketModel model)
        {
            var toAddress = string.IsNullOrWhiteSpace(_settings.ToAddress) ? _settings.UserName : _settings.ToAddress;
            if (string.IsNullOrWhiteSpace(toAddress))
            {
                throw new InvalidOperationException("Recipient email address is not configured.");
            }

            var fromDisplay = string.IsNullOrWhiteSpace(_settings.FromName) ? _settings.UserName : _settings.FromName;

            var message = new MailMessage
            {
                From = new MailAddress(_settings.UserName, fromDisplay, Encoding.UTF8),
                Subject = GenerateSubject(model),
                Body = BuildBody(model),
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8,
                IsBodyHtml = false
            };

            message.To.Add(new MailAddress(toAddress));
            return message;
        }

        private string BuildBody(ShoppingBasketModel model)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Нова поръчка от Best Lashes BG");
            if (!string.IsNullOrWhiteSpace(model.OrderId))
            {
                sb.AppendLine($"Номер на поръчка: {model.OrderId}");
            }
            sb.AppendLine(new string('-', 50));
            sb.AppendLine("Клиент");
            sb.AppendLine($"Име: {model.Customer.FirstName} {model.Customer.LastName}".Trim());
            sb.AppendLine($"Телефон: {model.Customer.PhoneNumber}");

            var deliveryLabel = model.Customer.DeliveryMethod switch
            {
                "econt-office" => "Офис на Еконт",
                "personal-address" => "Личен адрес",
                _ => model.Customer.DeliveryMethod
            };
            sb.AppendLine($"Метод на доставка: {deliveryLabel}");
            sb.AppendLine($"Адрес / Офис: {model.Customer.DeliveryAddress}");

            sb.AppendLine();
            sb.AppendLine("Продукти:");
            foreach (var item in model.Items)
            {
                sb.AppendLine($" - {item.Name}: {item.Quantity} × {item.UnitPrice.ToString("F2", _culture)} лв = {(item.UnitPrice * item.Quantity).ToString("F2", _culture)} лв");
            }

            sb.AppendLine();
            sb.AppendLine($"Междинна сума: {model.Subtotal.ToString("F2", _culture)} лв");
            if (model.DiscountValue > 0)
            {
                sb.AppendLine($"Отстъпка: -{model.DiscountValue.ToString("F2", _culture)} лв" + (string.IsNullOrWhiteSpace(model.DiscountCode) ? string.Empty : $" (код: {model.DiscountCode})"));
            }
            sb.AppendLine($"Общо за плащане: {model.Total.ToString("F2", _culture)} лв");

            sb.AppendLine();
            sb.AppendLine("Изпратено автоматично от Best Lashes BG уеб сайта.");

            return sb.ToString();
        }

        private string GenerateSubject(ShoppingBasketModel model)
        {
            var fullName = $"{model.Customer.FirstName} {model.Customer.LastName}".Trim();
            var customerName = string.IsNullOrWhiteSpace(fullName) ? "клиент" : fullName;
            var orderInfo = string.IsNullOrWhiteSpace(model.OrderId) ? string.Empty : $" №{model.OrderId}";
            return $"Нова поръчка{orderInfo} от {customerName}";
        }
    }
}
