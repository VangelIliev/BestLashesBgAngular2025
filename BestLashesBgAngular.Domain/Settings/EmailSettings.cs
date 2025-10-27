namespace BestLashesBgAngular.Domain.Settings
{
    public class EmailSettings
    {
        public string Host { get; set; } = string.Empty;

        public int Port { get; set; }

        public bool EnableSSL { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string? FromName { get; set; }

        public string? ToAddress { get; set; }
    }
}

