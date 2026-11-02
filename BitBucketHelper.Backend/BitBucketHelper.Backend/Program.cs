using BitBucketHelper.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// CORS: allow the Vite dev server (and any local origin during development).
var corsPolicy = "BitBucketHelperCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Application services.
builder.Services.AddSingleton<ConfigService>();
builder.Services.AddHttpClient<BitbucketService>();
builder.Services.AddSingleton<GitService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(corsPolicy);

// Serve the built React UI from wwwroot.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

// SPA fallback: any non-API route serves index.html so client-side routing works.
app.MapFallback(async context =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.StatusCode = 404;
        return;
    }

    var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    var indexFile = Path.Combine(webRoot, "index.html");
    if (!File.Exists(indexFile))
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("UI not built. Run the frontend build first.");
        return;
    }

    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(indexFile);
});

app.Run();
