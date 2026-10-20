using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using backend.Data;
using backend.Features.Auth.Services;
using backend.Infrastructure.Authentication;
using backend.Features.Farmers.Services;
using backend.Features.Farms.Services;
using backend.Features.Procurement.Services;
using backend.Features.Quality.Services;
using backend.Features.Warehouses.Services;
using backend.Features.Inventory.Services;
using backend.Features.Logistics.Services;
using backend.Features.Notifications.Services;
using backend.Features.Settlements.Services;
using backend.Features.Reports.Services;
using backend.Features.Marketplace.Services;

// Enable legacy timestamp behavior for Npgsql to prevent ArgumentException with DateTimeKind.Unspecified
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Load .env file (if present) into environment variables before configuration is built.
// ASP.NET Core's config system reads environment variables automatically,
// and the double-underscore (__) maps to nested JSON keys, e.g.
//   AzureStorage__ConnectionString  →  AzureStorage:ConnectionString
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    DotNetEnv.Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5066");
// --------------------------------------------------
// Database
// --------------------------------------------------

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ).ConfigureWarnings(warnings =>
        warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)
    ));

// --------------------------------------------------
// JWT configuration
// --------------------------------------------------

builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection("Jwt")
);

var jwtOptions = builder.Configuration
    .GetSection("Jwt")
    .Get<JwtOptions>()
    ?? throw new InvalidOperationException(
        "JWT configuration is missing."
    );

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Key)
            ),

            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();


var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
                      policy =>
                      {
                          policy.SetIsOriginAllowed(_ => true)
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials();
                      });
});


// --------------------------------------------------
// Services
// --------------------------------------------------

builder.Services.Configure<backend.Infrastructure.Storage.AzureStorageOptions>(
    builder.Configuration.GetSection("AzureStorage")
);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IFarmerService, FarmerService>();
builder.Services.AddScoped<IFarmerAuthService, FarmerAuthService>();
builder.Services.AddScoped<IDriverAuthService, DriverAuthService>();
builder.Services.AddScoped<IFarmService, FarmService>();
builder.Services.AddScoped<ILotService, LotService>();
builder.Services.AddScoped<IQualityService, QualityService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<ILogisticsService, LogisticsService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<backend.Infrastructure.Storage.IBlobStorageService, backend.Infrastructure.Storage.AzureBlobStorageService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IRazorpayMockGatewayService, RazorpayMockGatewayService>();
builder.Services.AddScoped<ISettlementService, SettlementService>();
builder.Services.AddScoped<IReportsService, ReportsService>();
builder.Services.AddScoped<backend.Features.Procurement.Services.IPurchaseRequestService, backend.Features.Procurement.Services.PurchaseRequestService>();
builder.Services.AddScoped<IMarketplaceService, MarketplaceService>();

// --------------------------------------------------
// Controllers & Swagger
// --------------------------------------------------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ShreeAnna API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Bearer token"
    });

    options.AddSecurityRequirement((document) => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

// --------------------------------------------------
// Application
// --------------------------------------------------

var app = builder.Build();

// 1. RUN MIGRATIONS & SEEDING FIRST (Before handling any requests)
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        await db.Database.MigrateAsync();
        await DbSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database migration or seeding.");
    }
}

// 2. CONFIGURE PIPELINE
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ShreeAnna API v1");
    c.RoutePrefix = "swagger";
});

app.MapGet("/", () => Results.Redirect("/swagger"));

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(myAllowSpecificOrigins); // Apply the named policy globally


// 3. SECURITY & STATIC FILES MIDDLEWARE
var uploadsDir = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
if (!Directory.Exists(uploadsDir))
{
    Directory.CreateDirectory(uploadsDir);
}
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsDir),
    RequestPath = "/uploads"
});
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
