using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace backend.Features.Settlements.Services;

public class RazorpayMockGatewayService : IRazorpayMockGatewayService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RazorpayMockGatewayService> _logger;
    private readonly string _baseUrl;
    private readonly string _authHeader;
    private readonly string _keyId;

    public RazorpayMockGatewayService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<RazorpayMockGatewayService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _baseUrl = (configuration["MockGateway:BaseUrl"]
            ?? Environment.GetEnvironmentVariable("MockGateway__BaseUrl")
            ?? "https://mockgateway.com/api/base/razorpay-qmgxzz").TrimEnd('/');

        if (string.IsNullOrWhiteSpace(_baseUrl))
        {
            _baseUrl = "https://mockgateway.com/api/base/razorpay-qmgxzz";
        }

        _keyId = configuration["MockGateway:KeyId"]
            ?? Environment.GetEnvironmentVariable("MockGateway__KeyId")
            ?? "rzp_test_P6JuER2JQ580UR";

        var keySecret = configuration["MockGateway:KeySecret"]
            ?? Environment.GetEnvironmentVariable("MockGateway__KeySecret")
            ?? "134S9NUTWf7DEUnnHrAo";

        var configuredAuth = configuration["MockGateway:AuthHeader"]
            ?? Environment.GetEnvironmentVariable("MockGateway__AuthHeader");

        if (!string.IsNullOrEmpty(configuredAuth))
        {
            _authHeader = configuredAuth;
        }
        else
        {
            var raw = $"{_keyId}:{keySecret}";
            _authHeader = "Basic " + Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
        }
    }

    public async Task<RazorpayPaymentLinkResult> CreatePaymentLinkAsync(
        decimal amountInRupees,
        string description,
        string referenceId,
        string? customerName = null,
        string? customerPhone = null)
    {
        try
        {
            // MockGateway expects the rupee amount directly.
            // Multiplying by 100 caused the hosted checkout / captured popup to display 100x more (e.g. ₹2,736,000.00 instead of ₹27,360.00).
            var amountToCharge = (long)Math.Max(1, Math.Round(amountInRupees));

            var phone = customerPhone?.Trim();
            if (!string.IsNullOrEmpty(phone) && !phone.StartsWith("+"))
            {
                phone = "+91" + phone;
            }

            var payload = new JsonObject
            {
                ["amount"] = amountToCharge,
                ["currency"] = "INR",
                ["description"] = description,
                ["reference_id"] = referenceId
            };

            if (!string.IsNullOrEmpty(customerName) || !string.IsNullOrEmpty(phone))
            {
                var customerObj = new JsonObject();
                if (!string.IsNullOrEmpty(customerName)) customerObj["name"] = customerName;
                if (!string.IsNullOrEmpty(phone)) customerObj["contact"] = phone;
                payload["customer"] = customerObj;
            }

            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/v1/payment_links")
            {
                Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", _authHeader);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("MockGateway CreatePaymentLink returned {Status}: {Content}. Falling back to simulated payment link.", response.StatusCode, content);
                var fallbackId = $"plink_{Guid.NewGuid().ToString("N")[..14]}";
                return new RazorpayPaymentLinkResult
                {
                    Id = fallbackId,
                    Status = "created",
                    Amount = amountInRupees,
                    ShortUrl = $"{_baseUrl}/pg/pay/{fallbackId}",
                    ReferenceId = referenceId,
                    PaymentInternalId = fallbackId
                };
            }

            var json = JsonNode.Parse(content);
            var id = json?["id"]?.ToString() ?? string.Empty;
            var shortUrl = json?["short_url"]?.ToString() ?? string.Empty;
            var status = json?["status"]?.ToString() ?? "created";

            string paymentInternalId = string.Empty;
            if (!string.IsNullOrEmpty(shortUrl) && shortUrl.Contains("/pg/pay/"))
            {
                paymentInternalId = shortUrl.Substring(shortUrl.LastIndexOf("/pg/pay/") + 8).Trim('/');
            }

            return new RazorpayPaymentLinkResult
            {
                Id = id,
                Status = status,
                Amount = amountInRupees,
                ShortUrl = shortUrl,
                ReferenceId = referenceId,
                PaymentInternalId = paymentInternalId
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to connect to MockGateway for ref {ReferenceId}. Using simulated payment link fallback.", referenceId);
            var fallbackId = $"plink_{Guid.NewGuid().ToString("N")[..14]}";
            return new RazorpayPaymentLinkResult
            {
                Id = fallbackId,
                Status = "created",
                Amount = amountInRupees,
                ShortUrl = $"{_baseUrl}/pg/pay/{fallbackId}",
                ReferenceId = referenceId,
                PaymentInternalId = fallbackId
            };
        }
    }

    public async Task<RazorpayActionResult> CompletePaymentAsync(string paymentIdOrGuid, string status = "captured")
    {
        try
        {
            var payload = new JsonObject
            {
                ["payment_id"] = paymentIdOrGuid
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/payment/action/{status}")
            {
                Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", _authHeader);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("MockGateway CompletePayment response: {Status} {Content}", response.StatusCode, content);

            if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.Conflict)
            {
                _logger.LogWarning("MockGateway CompletePayment returned {Status}: {Content}. Falling back to simulated completion.", response.StatusCode, content);
                return new RazorpayActionResult
                {
                    Success = true,
                    PaymentId = paymentIdOrGuid,
                    Status = status,
                    Resolution = "success"
                };
            }

            var json = JsonNode.Parse(content);
            return new RazorpayActionResult
            {
                Success = json?["success"]?.GetValue<bool>() ?? (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.Conflict),
                PaymentId = paymentIdOrGuid,
                Status = json?["status"]?.ToString() ?? status,
                Resolution = json?["resolution"]?.ToString() ?? "success",
                RedirectUrl = json?["redirect_url"]?.ToString()
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to complete MockGateway payment {PaymentId}. Falling back to simulated completion.", paymentIdOrGuid);
            return new RazorpayActionResult
            {
                Success = true,
                PaymentId = paymentIdOrGuid,
                Status = status,
                Resolution = "success"
            };
        }
    }

    public async Task<RazorpayPaymentLinkResult?> GetPaymentLinkAsync(string paymentLinkId)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/v1/payment_links/{paymentLinkId}");
            request.Headers.Add("Authorization", _authHeader);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonNode.Parse(content);
            return new RazorpayPaymentLinkResult
            {
                Id = json?["id"]?.ToString() ?? paymentLinkId,
                Status = json?["status"]?.ToString() ?? "unknown",
                Amount = json?["amount"]?.GetValue<decimal>() ?? 0,
                ShortUrl = json?["short_url"]?.ToString() ?? string.Empty,
                ReferenceId = json?["reference_id"]?.ToString() ?? string.Empty
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch MockGateway payment link {Id}", paymentLinkId);
            return null;
        }
    }
}
