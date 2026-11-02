using System.Diagnostics;
using System.Net.Http;
using Microsoft.Web.WebView2.WinForms;

namespace BitBucketHelper.Launcher;

public partial class frmBitBucketHelperLauncher : Form
{
    private WebView2? _webView;
    private Label? _statusLabel;
    private Process? _backendProcess;

    // The backend listens on this URL (configured via appsettings.json Kestrel endpoints).
    private const string AppUrl = "http://localhost:5219";

    public frmBitBucketHelperLauncher()
    {
        InitializeComponent();
    }

    private async void frmBitBucketHelperLauncher_Load(object? sender, EventArgs e)
    {
        ShowStatus("Starting BitBucket Helper backend…");

        // Start the backend if it isn't already running.
        await StartBackendIfNeededAsync();

        // Wait for the API to respond.
        var ready = await WaitForBackendAsync();
        if (!ready)
        {
            ShowStatus("Could not start the backend. Please run it manually:\ndotnet run --project BitBucketHelper.Backend",
                       error: true);
            return;
        }

        // Host the React UI inside WebView2.
        ShowStatus("Loading UI…");
        _webView = new WebView2 { Dock = DockStyle.Fill };
        Controls.Add(_webView);
        _webView.BringToFront();
        await _webView.EnsureCoreWebView2Async(null);
        _webView.CoreWebView2.Navigate(AppUrl);

        HideStatus();
    }

    private async Task StartBackendIfNeededAsync()
    {
        // If the backend is already reachable, don't start another instance.
        if (await IsBackendReachableAsync())
            return;

        var exePath = FindBackendExecutable();
        if (exePath is null)
            return;

        var psi = new ProcessStartInfo
        {
            FileName = exePath,
            WorkingDirectory = Path.GetDirectoryName(exePath)!,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardError = true,
        };

        try
        {
            _backendProcess = Process.Start(psi);
        }
        catch
        {
            // Fallback: run via the dotnet host if the exe fails (e.g. framework-dependent).
            var dllPath = Path.ChangeExtension(exePath, ".dll");
            if (File.Exists(dllPath))
            {
                _backendProcess = Process.Start(new ProcessStartInfo("dotnet", dllPath)
                {
                    WorkingDirectory = Path.GetDirectoryName(exePath)!,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                });
            }
        }
    }

    /// <summary>
    /// Walks up from the launcher directory looking for the built backend executable.
    /// </summary>
    private static string? FindBackendExecutable()
    {
        var relative = Path.Combine(
            "BitBucketHelper.Backend", "BitBucketHelper.Backend",
            "bin", "Debug", "net10.0", "BitBucketHelper.Backend.exe");

        var dir = AppContext.BaseDirectory;
        for (var i = 0; i < 8; i++)
        {
            var candidate = Path.GetFullPath(Path.Combine(dir, relative));
            if (File.Exists(candidate))
                return candidate;

            // Also check a Release build.
            var release = candidate.Replace(Path.Combine("bin", "Debug", "net10.0"),
                                             Path.Combine("bin", "Release", "net10.0"));
            if (File.Exists(release))
                return release;

            var parent = Path.GetFullPath(Path.Combine(dir, ".."));
            if (parent == dir) break; // reached drive root
            dir = parent;
        }
        return null;
    }

    private static async Task<bool> IsBackendReachableAsync()
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(1) };
            var resp = await http.GetAsync(AppUrl);
            return resp.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private static async Task<bool> WaitForBackendAsync(int attempts = 40, int delayMs = 500)
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(2) };
        for (var i = 0; i < attempts; i++)
        {
            try
            {
                var resp = await http.GetAsync(AppUrl);
                if (resp.IsSuccessStatusCode)
                    return true;
            }
            catch
            {
                // backend still starting
            }
            await Task.Delay(delayMs);
        }
        return false;
    }

    private void ShowStatus(string text, bool error = false)
    {
        if (_statusLabel is null)
        {
            _statusLabel = new Label
            {
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter,
                Font = new Font("Segoe UI", 12F),
                AutoSize = false,
            };
            Controls.Add(_statusLabel);
        }
        _statusLabel.Text = text;
        _statusLabel.ForeColor = error ? Color.Firebrick : Color.DimGray;
        _statusLabel.BringToFront();
    }

    private void HideStatus()
    {
        if (_statusLabel is not null)
        {
            Controls.Remove(_statusLabel);
            _statusLabel.Dispose();
            _statusLabel = null;
        }
    }

    private void frmBitBucketHelperLauncher_FormClosing(object? sender, FormClosingEventArgs e)
    {
        // Stop the backend we started so it doesn't linger.
        if (_backendProcess is not null && !_backendProcess.HasExited)
        {
            try
            {
                _backendProcess.Kill(entireProcessTree: true);
            }
            catch
            {
                // best effort
            }
        }
    }
}
