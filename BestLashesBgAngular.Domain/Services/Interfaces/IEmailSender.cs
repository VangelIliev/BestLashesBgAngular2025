using BestLashesBgAngular.Domain.Models;
using System.Threading;
using System.Threading.Tasks;

namespace BestLashesBgAngular.Domain.Services.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(ShoppingBasketModel model, CancellationToken cancellationToken = default);
    }
}
