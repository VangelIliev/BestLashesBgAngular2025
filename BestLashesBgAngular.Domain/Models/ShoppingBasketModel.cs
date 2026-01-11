using System.Collections.Generic;
using System;

namespace BestLashesBgAngular.Domain.Models
{
    public class ShoppingBasketModel
    {
        public CustomerModel Customer { get; set; } = new CustomerModel();

        public List<BasketItemModel> Items { get; set; } = new List<BasketItemModel>();

        public string? OrderId { get; set; }

        public string? DiscountCode { get; set; }

        public double Subtotal { get; set; }

        public double DiscountValue { get; set; }

        public double Total { get; set; }
    }

    public class CustomerModel
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string DeliveryMethod { get; set; } = string.Empty;

        public string DeliveryAddress { get; set; } = string.Empty;

        public bool IsDataProcessingConsented { get; set; }
    }

    public class BasketItemModel
    {
        public string Name { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public double UnitPrice { get; set; }

        public double TotalPrice => Math.Round(UnitPrice * Quantity, 2);
    }
}
