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

// Load .env file (if present) into environment variables before configuration is built.
// ASP.NET Core's config system reads environment variables automatically,
// and the double-underscore (__) maps to nested JSON keys, e.g.
//   AzureStorage__ConnectionString  →  AzureStorage:ConnectionString
DotNetEnv.Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

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
builder.Services.AddScoped<IFarmService, FarmService>();
builder.Services.AddScoped<backend.Infrastructure.Storage.IBlobStorageService, backend.Infrastructure.Storage.AzureBlobStorageService>();

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

// 1. RUN SEEDING FIRST (Before handling any requests)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    await DbSeeder.SeedAsync(db);
}

// 2. CONFIGURE PIPELINE
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ShreeAnna API v1");
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// 3. SECURITY & STATIC FILES MIDDLEWARE
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
