﻿using MailKit.Net.Smtp;
using MimeKit;

namespace AutoComp
{
    public static class EmailService
    {
        public static async Task SendAsync(string to, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse("projecttwogroup1@gmail.com"));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };
            using var smtp = new SmtpClient();
            smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;

            await smtp.ConnectAsync("smtp.gmail.com", 465, true); // Use SSL
            await smtp.AuthenticateAsync("projecttwogroup1@gmail.com", "npcs gpaq rybk vfvq");

            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }

}
