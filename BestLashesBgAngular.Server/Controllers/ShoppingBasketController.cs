using BestLashesBgAngular.Domain.Models;
using BestLashesBgAngular.Domain.Services.Interfaces;
using BestLashesBgAngular.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BestLashesBgAngular.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShoppingBasketController : ControllerBase
    {
        private readonly ILogger<ShoppingBasketController> _logger;
        private readonly IEmailSender _emailSender;

        public ShoppingBasketController(ILogger<ShoppingBasketController> logger, IEmailSender emailSender)
        {
            _logger = logger;
            _emailSender = emailSender;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] ShoppingBasketViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (model.Customer is null)
            {
                return BadRequest("Липсва информация за клиента.");
            }

            if (model.Items == null || model.Items.Count == 0)
            {
                return BadRequest("Количката е празна. Добави продукти преди да финализираш.");
            }

            var subtotal = model.Items.Sum(item => item.Price * item.Quantity);

            if (Math.Abs(subtotal - model.Subtotal) > 0.5)
            {
                return BadRequest("Възникна несъответствие в сумите на поръчката. Моля, опитайте отново.");
            }

            var submittedCode = string.IsNullOrWhiteSpace(model.DiscountCode) ? null : model.DiscountCode.Trim();
            var normalizedDiscountCode = submittedCode?.ToUpperInvariant();

            var expectedDiscount = 0d;
            if (!string.IsNullOrEmpty(normalizedDiscountCode))
            {
                if (normalizedDiscountCode == "CHRISTMAS10")
                {
                    expectedDiscount = Math.Round(subtotal * 0.10, 2);
                }
                else
                {
                    return BadRequest("Невалиден код за отстъпка.");
                }
            }

            var discount = Math.Round(Math.Min(expectedDiscount, subtotal), 2);

            if (discount > 0 && Math.Abs(model.DiscountValue - discount) > 0.5)
            {
                return BadRequest("Стойността на отстъпката не съвпада с активирания код.");
            }

            if (discount == 0 && model.DiscountValue > 0.5)
            {
                return BadRequest("Подадена е отстъпка без валиден код.");
            }

            var total = Math.Round(subtotal - discount, 2);

            if (Math.Abs(total - model.Total) > 0.5)
            {
                return BadRequest("Крайната сума на поръчката не съвпада. Моля, опитайте отново.");
            }

            var orderId = Guid.NewGuid().ToString("N");

            _logger.LogInformation(
                "Получена е поръчка {OrderId} от {FirstName} {LastName} ({Phone}) с {ItemCount} артикула. Доставка: {DeliveryMethod} - {DeliveryAddress}.",
                orderId,
                model.Customer.FirstName,
                model.Customer.LastName,
                model.Customer.PhoneNumber,
                model.Items.Count,
                model.Customer.DeliveryMethod,
                model.Customer.DeliveryAddress);

            var domainModel = MapToDomainModel(model, orderId, subtotal, discount, total, normalizedDiscountCode);

            try
            {
                await _emailSender.SendEmailAsync(domainModel, HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Неуспешно изпращане на имейл за поръчка {OrderId}.", orderId);
                return StatusCode(500, "Възникна грешка при изпращане на имейл. Моля, опитайте отново.");
            }

            return Ok(new { success = true, orderId });
        }

        private static ShoppingBasketModel MapToDomainModel(ShoppingBasketViewModel viewModel, string orderId, double subtotal, double discount, double total, string? normalizedDiscountCode)
        {
            return new ShoppingBasketModel
            {
                OrderId = orderId,
                Customer = new CustomerModel
                {
                    FirstName = viewModel.Customer.FirstName,
                    LastName = viewModel.Customer.LastName,
                    PhoneNumber = viewModel.Customer.PhoneNumber,
                    DeliveryMethod = viewModel.Customer.DeliveryMethod,
                    DeliveryAddress = viewModel.Customer.DeliveryAddress,
                    IsDataProcessingConsented = viewModel.Customer.IsDataProcessingConsented
                },
                Items = viewModel.Items
                    .Select(item => new BasketItemModel
                    {
                        Name = item.Name,
                        Quantity = item.Quantity,
                        UnitPrice = item.Price
                    })
                    .ToList(),
                DiscountCode = normalizedDiscountCode,
                Subtotal = subtotal,
                DiscountValue = discount,
                Total = total
            };
        }
    }
}
