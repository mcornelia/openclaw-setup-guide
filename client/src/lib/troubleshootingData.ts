// OpenClaw Setup Guide — Troubleshooting Data
// Categories: Docker, Network, API, OpenClaw App, Telegram, General

export type TroubleshootingCategory =
  | "docker"
  | "network"
  | "api"
  | "openclaw"
  | "telegram"
  | "general";

export type Severity = "critical" | "warning" | "info";

export interface TroubleshootingFix {
  label: string;
  code?: string;
  os?: "windows" | "macos" | "linux" | "all";
  note?: string;
}

export interface TroubleshootingEntry {
  id: string;
  category: TroubleshootingCategory;
  severity: Severity;
  title: string;
  symptom: string;
  cause: string;
  fixes: TroubleshootingFix[];
  tags: string[];
  relatedStepIds?: number[];
}

export const CATEGORY_LABELS: Record<TroubleshootingCategory, string> = {
  docker: "Docker",
  network: "Network",
  api: "API / Keys",
  openclaw: "OpenClaw App",
  telegram: "Telegram",
  general: "General",
};

export const CATEGORY_COLORS: Record<TroubleshootingCategory, { bg: string; text: string; border: string }> = {
  docker: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  network: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  api: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  openclaw: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  telegram: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  general: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export const TROUBLESHOOTING_ENTRIES: TroubleshootingEntry[] = [
  // ── DOCKER ERRORS ──────────────────────────────────────────────────────────
  {
    id: "docker-not-found",
    category: "docker",
    severity: "critical",
    title: "'docker' command not found",
    symptom: "Running `docker --version` in the terminal returns: `command not found` or `'docker' is not recognized as an internal or external command`.",
    cause: "Docker is either not installed, or the installation did not add Docker to your system's PATH environment variable.",
    tags: ["install", "command not found", "path", "docker"],
    relatedStepIds: [7],
    fixes: [
      {
        label: "Restart your terminal first",
        note: "After installing Docker, you must open a completely new terminal window — not just a new tab. Close all terminal windows and reopen.",
      },
      {
        label: "Verify Docker Desktop is running (Windows / macOS)",
        note: "Docker Desktop must be actively running in the background. Look for the Docker whale icon in your system tray (Windows) or menu bar (macOS). If it's not there, launch Docker Desktop from your Applications folder or Start menu.",
      },
      {
        label: "Re-run the Docker installer",
        note: "If the above steps don't help, download the latest Docker Desktop installer from docker.com and run it again. Choose 'Repair' if prompted.",
      },
      {
        label: "Add Docker to PATH manually (Linux)",
        code: `# Check if docker binary exists
which docker || ls /usr/bin/docker

# If missing, reinstall
sudo apt-get remove docker.io
sudo apt-get install -y docker.io

# Verify
docker --version`,
        os: "linux",
      },
    ],
  },
  {
    id: "docker-permission-denied",
    category: "docker",
    severity: "critical",
    title: "Permission denied when running Docker commands",
    symptom: "Running any `docker` command returns: `permission denied while trying to connect to the Docker daemon socket` or `Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock`.",
    cause: "On Linux, your user account has not been added to the `docker` group. Docker's Unix socket is owned by root and the docker group by default.",
    tags: ["permission denied", "linux", "sudo", "docker group", "socket"],
    relatedStepIds: [7],
    fixes: [
      {
        label: "Add your user to the docker group",
        code: `# Add your current user to the docker group
sudo usermod -aG docker $USER

# Apply the group change — you MUST log out and log back in
# (or run the command below as a temporary fix for the current session)
newgrp docker

# Verify it worked
docker ps`,
        os: "linux",
      },
      {
        label: "Use sudo as a temporary workaround",
        code: `# Prefix all docker commands with sudo until you log out and back in
sudo docker ps
sudo docker compose up -d`,
        os: "linux",
        note: "This is a temporary fix only. Logging out and back in after adding yourself to the docker group is the proper solution.",
      },
    ],
  },
  {
    id: "docker-daemon-not-running",
    category: "docker",
    severity: "critical",
    title: "Docker daemon is not running",
    symptom: "Commands fail with: `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?` or `error during connect: ... pipe/docker_engine: The system cannot find the file specified.`",
    cause: "The Docker background service (daemon) has stopped or was never started.",
    tags: ["daemon", "not running", "connect", "service"],
    relatedStepIds: [7],
    fixes: [
      {
        label: "Start Docker Desktop (Windows / macOS)",
        note: "Open Docker Desktop from your Start menu or Applications folder and wait for the whale icon to stop animating (usually 30–60 seconds). Then retry your command.",
      },
      {
        label: "Start the Docker service (Linux)",
        code: `# Start Docker
sudo systemctl start docker

# Check its status
sudo systemctl status docker

# Enable it to start automatically on boot
sudo systemctl enable docker`,
        os: "linux",
      },
    ],
  },
  {
    id: "docker-compose-not-found",
    category: "docker",
    severity: "critical",
    title: "'docker compose' command not found",
    symptom: "Running `docker compose up` returns: `docker: 'compose' is not a docker command` or `unknown command: compose`.",
    cause: "The Docker Compose plugin (V2) is not installed. Older systems may have the standalone `docker-compose` (V1) instead.",
    tags: ["compose", "plugin", "v2", "install"],
    relatedStepIds: [7, 11],
    fixes: [
      {
        label: "Update Docker Desktop (Windows / macOS)",
        note: "Docker Compose V2 is bundled with Docker Desktop 3.6+. Open Docker Desktop, go to Settings > Software Updates, and install any available updates.",
      },
      {
        label: "Install the Docker Compose plugin (Linux)",
        code: `# Install the compose plugin
sudo apt-get install -y docker-compose-plugin

# Verify
docker compose version`,
        os: "linux",
      },
      {
        label: "Use the legacy docker-compose command as a fallback",
        code: `# If you have the older standalone version installed, use hyphens
docker-compose up -d
docker-compose ps`,
        os: "all",
        note: "The guide uses 'docker compose' (no hyphen, V2). If you must use V1, replace all 'docker compose' commands with 'docker-compose'.",
      },
    ],
  },
  {
    id: "docker-port-already-in-use",
    category: "docker",
    severity: "warning",
    title: "Port already in use — container fails to start",
    symptom: "`docker compose up` fails with: `Bind for 0.0.0.0:18789 failed: port is already allocated` or `address already in use`.",
    cause: "Another application on your computer is already listening on port 18789 (the default OpenClaw port), or a previous OpenClaw container was not properly stopped.",
    tags: ["port", "already in use", "bind", "18789"],
    relatedStepIds: [13],
    fixes: [
      {
        label: "Stop any existing OpenClaw containers",
        code: `# Stop all running OpenClaw containers
docker compose down

# Then start fresh
docker compose up -d`,
        os: "all",
      },
      {
        label: "Find and kill the process using the port (Linux / macOS)",
        code: `# Find what is using port 18789
sudo lsof -i :18789

# Kill the process (replace PID with the number shown above)
sudo kill -9 <PID>`,
        os: "linux",
      },
      {
        label: "Find and kill the process using the port (Windows)",
        code: `# Find what is using port 18789
netstat -ano | findstr :18789

# Kill the process (replace PID with the number in the last column)
taskkill /PID <PID> /F`,
        os: "windows",
      },
    ],
  },
  {
    id: "docker-container-exits-immediately",
    category: "docker",
    severity: "critical",
    title: "OpenClaw container starts then exits immediately",
    symptom: "After running `docker compose up -d`, running `docker ps` shows no running containers. `docker ps -a` shows the container with status `Exited (1)` or similar.",
    cause: "The container crashed on startup, usually due to a missing or invalid configuration file, a bad API key, or a missing required environment variable.",
    tags: ["exits", "crash", "exited", "startup", "config"],
    relatedStepIds: [12, 13],
    fixes: [
      {
        label: "Check the container logs for the error message",
        code: `# View the last 50 lines of logs
docker compose logs --tail=50 openclaw-gateway

# Or follow logs in real time (press Ctrl+C to stop)
docker compose logs -f openclaw-gateway`,
        os: "all",
        note: "The logs will tell you exactly what went wrong. Look for lines starting with ERROR or FATAL.",
      },
      {
        label: "Re-run the onboarding wizard to fix configuration",
        code: `# Re-run the wizard — it will overwrite the existing config
docker compose run --rm openclaw-cli onboard`,
        os: "all",
      },
      {
        label: "Check that your config file exists",
        code: `# The config file should exist at:
ls ~/.openclaw/config.yaml

# If missing, re-run the onboarding wizard`,
        os: "linux",
      },
    ],
  },
  {
    id: "docker-image-pull-failed",
    category: "docker",
    severity: "warning",
    title: "Docker image pull fails or times out",
    symptom: "`docker compose pull` or `docker compose up` fails with: `Error response from daemon: Get https://registry-1.docker.io/v2/: net/http: request canceled` or `pull access denied`.",
    cause: "Network connectivity issue, Docker Hub rate limiting (unauthenticated pulls are limited to 100/6 hours), or a firewall blocking Docker's registry access.",
    tags: ["pull", "timeout", "rate limit", "registry", "network"],
    relatedStepIds: [11],
    fixes: [
      {
        label: "Check your internet connection",
        note: "Ensure your server computer has internet access. Try opening a browser and loading a webpage.",
      },
      {
        label: "Log in to Docker Hub to increase rate limits",
        code: `# Create a free account at hub.docker.com, then log in:
docker login

# Enter your Docker Hub username and password when prompted
# Then retry the pull`,
        os: "all",
      },
      {
        label: "Retry after a few minutes",
        note: "If you hit the rate limit, wait 6 hours or log in to Docker Hub. The limit resets automatically.",
      },
    ],
  },
  {
    id: "docker-disk-space",
    category: "docker",
    severity: "warning",
    title: "Docker fails due to insufficient disk space",
    symptom: "Errors containing `no space left on device` or `write /var/lib/docker/...: no space left on device`.",
    cause: "Docker has accumulated old images, stopped containers, and build cache over time, consuming disk space.",
    tags: ["disk space", "no space", "storage", "prune"],
    relatedStepIds: [17],
    fixes: [
      {
        label: "Run Docker system prune to free space",
        code: `# Remove stopped containers, unused networks, dangling images, and build cache
# WARNING: This removes data for stopped containers — running containers are safe
docker system prune -f

# For a more aggressive cleanup (also removes unused images):
docker system prune -af

# Check how much space Docker is using
docker system df`,
        os: "all",
      },
    ],
  },

  // ── NETWORK ERRORS ─────────────────────────────────────────────────────────
  {
    id: "network-no-internet-in-container",
    category: "network",
    severity: "critical",
    title: "Container has no internet access",
    symptom: "OpenClaw logs show it cannot reach the AI API (e.g., `connection refused`, `no route to host`, or `dial tcp: lookup api.anthropic.com: no such host`).",
    cause: "Docker's internal DNS or network bridge is misconfigured, or a firewall/VPN on the host is blocking container traffic.",
    tags: ["no internet", "dns", "network bridge", "vpn", "firewall"],
    relatedStepIds: [13],
    fixes: [
      {
        label: "Test internet access from inside the container",
        code: `# Run a quick connectivity test inside the container
docker run --rm alpine ping -c 3 8.8.8.8

# Test DNS resolution
docker run --rm alpine nslookup api.anthropic.com`,
        os: "all",
      },
      {
        label: "Restart Docker to reset network bridges",
        code: `# Linux
sudo systemctl restart docker

# Then restart OpenClaw
docker compose up -d`,
        os: "linux",
        note: "On Windows/macOS, quit Docker Desktop completely and relaunch it.",
      },
      {
        label: "Disable VPN temporarily",
        note: "If you are running a VPN on your server computer, try disabling it. VPNs often interfere with Docker's virtual network interfaces. If OpenClaw works without the VPN, you will need to configure split tunneling or a VPN-aware Docker network.",
      },
      {
        label: "Set a custom DNS server for Docker",
        code: `# Edit or create Docker's daemon config
sudo nano /etc/docker/daemon.json

# Add this content (uses Google DNS):
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}

# Restart Docker
sudo systemctl restart docker`,
        os: "linux",
      },
    ],
  },
  {
    id: "network-cannot-reach-dashboard",
    category: "network",
    severity: "warning",
    title: "Cannot reach the OpenClaw dashboard from another device",
    symptom: "The dashboard works at `http://localhost:18789` on the server, but when you try to access it from another device using the server's IP address (e.g., `http://192.168.86.50:18789`), the browser shows 'This site can't be reached' or times out.",
    cause: "The container may be bound to `127.0.0.1` (localhost only) instead of `0.0.0.0` (all interfaces), or a local firewall on the server is blocking the port.",
    tags: ["dashboard", "remote access", "localhost", "firewall", "port"],
    relatedStepIds: [14],
    fixes: [
      {
        label: "Find your server's local IP address",
        code: `# Linux / macOS
ip addr show | grep "inet " | grep -v 127.0.0.1
# or
hostname -I

# Windows (PowerShell)
ipconfig | Select-String "IPv4"`,
        os: "all",
      },
      {
        label: "Allow the port through the Linux firewall (ufw)",
        code: `# Check if ufw is active
sudo ufw status

# If active, allow port 18789 from your local network only
sudo ufw allow from 192.168.0.0/16 to any port 18789

# Reload
sudo ufw reload`,
        os: "linux",
      },
      {
        label: "Allow the port through Windows Firewall",
        code: `# Run in PowerShell as Administrator
New-NetFirewallRule -DisplayName "OpenClaw Dashboard" \`
  -Direction Inbound -Protocol TCP -LocalPort 18789 \`
  -Action Allow -RemoteAddress LocalSubnet`,
        os: "windows",
      },
    ],
  },
  {
    id: "network-guest-network-isolation",
    category: "network",
    severity: "info",
    title: "Server on Guest network cannot be reached from main network",
    symptom: "After connecting your server to the Guest network, you can no longer access the OpenClaw dashboard from your laptop or phone (which are on the main network).",
    cause: "This is expected and intentional behavior. The Google Nest Guest network isolation prevents devices on different networks from communicating — which is exactly the security goal.",
    tags: ["guest network", "isolation", "cannot reach", "nest", "vlan"],
    relatedStepIds: [4, 14],
    fixes: [
      {
        label: "Access the dashboard from the server itself",
        note: "The simplest solution: use a browser directly on the server computer (which is on the Guest network) to access http://localhost:18789.",
      },
      {
        label: "Use Cloudflare Tunnel for secure remote access (recommended)",
        note: "Cloudflare Tunnel creates an encrypted outbound tunnel from your server to Cloudflare's network, giving you a public HTTPS URL without any port forwarding or firewall changes. This is the safest way to access your dashboard remotely.",
        code: `# Install cloudflared on your server
# Linux:
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Create a quick tunnel (no account needed for testing):
cloudflared tunnel --url http://localhost:18789

# Cloudflared will print a temporary public HTTPS URL like:
# https://random-words-here.trycloudflare.com`,
        os: "linux",
      },
      {
        label: "Temporarily move server to main network for dashboard access",
        note: "If you only need occasional dashboard access, you can temporarily connect the server to your main Wi-Fi network, access the dashboard, then move it back to the Guest network. This is less secure but workable for infrequent use.",
      },
    ],
  },
  {
    id: "network-upnp-re-enabled",
    category: "network",
    severity: "warning",
    title: "UPnP appears to have re-enabled itself",
    symptom: "After a Google Nest firmware update, you notice UPnP is turned back on in the Google Home app settings.",
    cause: "Google Nest firmware updates occasionally reset some advanced networking settings back to defaults.",
    tags: ["upnp", "firmware update", "reset", "nest"],
    relatedStepIds: [5],
    fixes: [
      {
        label: "Re-disable UPnP after each firmware update",
        note: "Open Google Home app > Wi-Fi > Settings (gear icon) > Advanced networking > Toggle UPnP to OFF. Make it a habit to check this after any Nest firmware update notification.",
      },
      {
        label: "Set a monthly reminder to audit router settings",
        note: "Add a recurring monthly calendar reminder to check: (1) UPnP is off, (2) Guest network isolation is still enabled, (3) WPA3 is still on. This takes less than 2 minutes.",
      },
    ],
  },
  {
    id: "network-slow-performance",
    category: "network",
    severity: "info",
    title: "OpenClaw responses are very slow",
    symptom: "Requests to OpenClaw take 30+ seconds to respond, or the dashboard feels sluggish.",
    cause: "Could be slow AI API response times (normal for complex tasks), the server computer being under-resourced, or network latency between the Guest network and the internet.",
    tags: ["slow", "performance", "latency", "timeout"],
    relatedStepIds: [13, 14],
    fixes: [
      {
        label: "Check container resource usage",
        code: `# View real-time CPU and memory usage for all containers
docker stats

# Press Ctrl+C to exit`,
        os: "all",
        note: "If CPU is consistently above 80% or memory is near the limit, your server hardware may be underpowered for the chosen AI model.",
      },
      {
        label: "Switch to a faster (smaller) AI model",
        note: "In the OpenClaw dashboard settings, try switching from claude-opus-4-5 to claude-haiku-3-5 (Anthropic) or gpt-4o-mini (OpenAI). These models respond 3–5x faster for simple tasks, at lower cost.",
      },
      {
        label: "Check AI provider status pages",
        note: "AI providers occasionally experience slowdowns. Check status.anthropic.com or status.openai.com to see if there is an active incident.",
      },
    ],
  },

  // ── API ERRORS ─────────────────────────────────────────────────────────────
  {
    id: "api-invalid-key",
    category: "api",
    severity: "critical",
    title: "Invalid API key error",
    symptom: "OpenClaw logs show: `AuthenticationError: Invalid API key`, `401 Unauthorized`, or `Incorrect API key provided`.",
    cause: "The API key entered during onboarding is incorrect, has been revoked, or was copied with extra whitespace.",
    tags: ["api key", "invalid", "401", "authentication", "unauthorized"],
    relatedStepIds: [9, 12],
    fixes: [
      {
        label: "Verify your API key in the provider dashboard",
        note: "Log in to console.anthropic.com or platform.openai.com/api-keys and confirm the key is active (not revoked). Copy it fresh — do not retype it manually.",
      },
      {
        label: "Re-run the onboarding wizard with the correct key",
        code: `# Re-run onboarding to update the API key
docker compose run --rm openclaw-cli onboard

# When prompted for the API key, paste it carefully
# Make sure there are no leading/trailing spaces`,
        os: "all",
      },
      {
        label: "Edit the config file directly",
        code: `# Open the config file
nano ~/.openclaw/config.yaml

# Find the line with your API key and update it
# Save with Ctrl+O, then Ctrl+X

# Restart OpenClaw to apply the change
docker compose restart`,
        os: "linux",
      },
    ],
  },
  {
    id: "api-rate-limit",
    category: "api",
    severity: "warning",
    title: "API rate limit exceeded",
    symptom: "OpenClaw returns errors like: `RateLimitError: Rate limit reached`, `429 Too Many Requests`, or tasks fail with `quota exceeded`.",
    cause: "You have exceeded the number of API requests or tokens allowed in a given time period on your current plan.",
    tags: ["rate limit", "429", "quota", "too many requests"],
    relatedStepIds: [13],
    fixes: [
      {
        label: "Wait and retry",
        note: "Rate limits typically reset within 1 minute. For quota limits, they reset at the start of the next billing period. Check your provider dashboard for exact reset times.",
      },
      {
        label: "Check your usage in the provider dashboard",
        note: "Visit console.anthropic.com or platform.openai.com/usage to see your current usage and limits. Consider upgrading your plan if you hit limits regularly.",
      },
      {
        label: "Switch to a model with higher rate limits",
        note: "Smaller models (claude-haiku-3-5, gpt-4o-mini) typically have higher rate limits than flagship models. Consider using them for routine tasks.",
      },
    ],
  },
  {
    id: "api-billing",
    category: "api",
    severity: "critical",
    title: "API calls failing due to billing / no credits",
    symptom: "Errors like: `insufficient_quota`, `You exceeded your current quota`, or `Your account has no active subscription`.",
    cause: "Your AI provider account has run out of prepaid credits or your payment method has failed.",
    tags: ["billing", "credits", "quota", "payment", "subscription"],
    relatedStepIds: [9],
    fixes: [
      {
        label: "Add credits or update payment method",
        note: "Log in to your provider's billing page: console.anthropic.com/settings/billing (Anthropic) or platform.openai.com/account/billing (OpenAI). Add a credit card or purchase prepaid credits.",
      },
      {
        label: "Set a usage spending limit",
        note: "Both Anthropic and OpenAI allow you to set monthly spending limits. Set a limit (e.g., $10/month) to prevent unexpected charges. This is strongly recommended for home use.",
      },
    ],
  },

  // ── OPENCLAW APP ERRORS ────────────────────────────────────────────────────
  {
    id: "openclaw-onboard-fails",
    category: "openclaw",
    severity: "critical",
    title: "Onboarding wizard fails or hangs",
    symptom: "Running `docker compose run --rm openclaw-cli onboard` hangs indefinitely, exits with an error, or produces garbled output.",
    cause: "The Docker image may be outdated, the container may not have internet access, or there is a conflict with an existing config file.",
    tags: ["onboard", "wizard", "hangs", "config", "setup"],
    relatedStepIds: [12],
    fixes: [
      {
        label: "Pull the latest Docker image first",
        code: `# Update to the latest image
docker compose pull

# Then retry onboarding
docker compose run --rm openclaw-cli onboard`,
        os: "all",
      },
      {
        label: "Delete the existing config and start fresh",
        code: `# WARNING: This removes your existing OpenClaw configuration
rm -rf ~/.openclaw/config.yaml

# Re-run onboarding
docker compose run --rm openclaw-cli onboard`,
        os: "linux",
        note: "On Windows, the config is at %USERPROFILE%\\.openclaw\\config.yaml",
      },
      {
        label: "Run in interactive mode with verbose logging",
        code: `# Add verbose flag to see detailed error output
docker compose run --rm openclaw-cli onboard --verbose`,
        os: "all",
      },
    ],
  },
  {
    id: "openclaw-dashboard-token-invalid",
    category: "openclaw",
    severity: "warning",
    title: "Dashboard access token is invalid or expired",
    symptom: "Opening the dashboard URL shows a login error, 'Invalid token', or a blank white page.",
    cause: "The access token in the URL has expired (tokens are time-limited) or was copied incorrectly.",
    tags: ["token", "dashboard", "expired", "login", "access"],
    relatedStepIds: [14],
    fixes: [
      {
        label: "Generate a fresh dashboard URL",
        code: `# Get a new dashboard URL with a fresh token
docker compose run --rm openclaw-cli dashboard --no-open

# Copy the ENTIRE URL printed (including the ?token= part)`,
        os: "all",
      },
    ],
  },
  {
    id: "openclaw-workspace-permission",
    category: "openclaw",
    severity: "warning",
    title: "OpenClaw cannot read or write files in the workspace",
    symptom: "OpenClaw reports `Permission denied` when trying to read or write files, or file operations silently fail.",
    cause: "The workspace directory has incorrect ownership or permissions — often caused by creating it as root before running the setup script.",
    tags: ["workspace", "permission denied", "files", "read", "write"],
    relatedStepIds: [11],
    fixes: [
      {
        label: "Fix ownership of the workspace directory",
        code: `# Fix ownership so your user owns the workspace
sudo chown -R $USER:$USER ~/openclaw/workspace

# Fix permissions
chmod -R 755 ~/openclaw/workspace

# Restart OpenClaw
docker compose restart`,
        os: "linux",
      },
    ],
  },
  {
    id: "openclaw-update-breaks-config",
    category: "openclaw",
    severity: "warning",
    title: "OpenClaw stops working after an update",
    symptom: "After running `docker compose pull && docker compose up -d`, OpenClaw fails to start or behaves unexpectedly.",
    cause: "A new version of OpenClaw may have changed the configuration file format, requiring a migration or re-onboarding.",
    tags: ["update", "migration", "config", "breaking change"],
    relatedStepIds: [17],
    fixes: [
      {
        label: "Check the release notes",
        note: "Visit github.com/openclaw/openclaw/releases to read the changelog for the new version. Look for any 'Breaking Changes' or 'Migration Required' notices.",
      },
      {
        label: "Back up config before updating",
        code: `# Always back up your config before major updates
cp ~/.openclaw/config.yaml ~/.openclaw/config.yaml.backup-$(date +%Y%m%d)

# Then update
docker compose pull && docker compose up -d`,
        os: "linux",
      },
      {
        label: "Restore from backup if the update breaks things",
        code: `# Stop OpenClaw
docker compose down

# Restore the backup config
cp ~/.openclaw/config.yaml.backup-YYYYMMDD ~/.openclaw/config.yaml

# Roll back to the previous Docker image
docker compose pull --no-cache
docker compose up -d`,
        os: "linux",
      },
    ],
  },

  // ── TELEGRAM ERRORS ────────────────────────────────────────────────────────
  {
    id: "telegram-bot-not-responding",
    category: "telegram",
    severity: "warning",
    title: "Telegram bot does not respond to messages",
    symptom: "You send a message to your Telegram bot but receive no reply, even though OpenClaw appears to be running.",
    cause: "The Telegram channel pairing may have failed, the bot token may be incorrect, or OpenClaw lost its connection to the Telegram API.",
    tags: ["telegram", "bot", "no response", "pairing", "token"],
    relatedStepIds: [15, 16],
    fixes: [
      {
        label: "Check OpenClaw logs for Telegram errors",
        code: `# Look for Telegram-related errors in the logs
docker compose logs openclaw-gateway | grep -i telegram`,
        os: "all",
      },
      {
        label: "Re-add the Telegram channel",
        code: `# Remove and re-add the Telegram channel
docker compose run --rm openclaw-cli channels remove telegram
docker compose run --rm openclaw-cli channels add telegram

# Restart OpenClaw
docker compose restart`,
        os: "all",
      },
      {
        label: "Verify your bot token with BotFather",
        note: "Open Telegram, message @BotFather, and send /mybots. Select your bot and choose 'API Token' to see or regenerate the token. If you regenerate it, re-run the channel setup with the new token.",
      },
    ],
  },
  {
    id: "telegram-unauthorized",
    category: "telegram",
    severity: "critical",
    title: "Unauthorized users can message your bot",
    symptom: "You receive messages in your bot from unknown users, or you realize your bot is publicly accessible to anyone on Telegram.",
    cause: "Telegram bots are publicly discoverable by default. Without user restrictions, anyone who finds your bot's username can send it commands.",
    tags: ["telegram", "security", "unauthorized", "public", "restrict"],
    relatedStepIds: [15, 16],
    fixes: [
      {
        label: "Restrict the bot to your Telegram user ID only",
        note: "In the OpenClaw dashboard, navigate to Settings > Channels > Telegram and add your Telegram User ID to the allowed users list. You can find your User ID by messaging @userinfobot on Telegram.",
      },
      {
        label: "Disable the bot if not in use",
        note: "If you are not actively using the Telegram integration, remove it: run `docker compose run --rm openclaw-cli channels remove telegram`. You can re-add it at any time.",
      },
    ],
  },

  // ── GENERAL ERRORS ─────────────────────────────────────────────────────────
  {
    id: "general-git-clone-fails",
    category: "general",
    severity: "warning",
    title: "git clone fails or is very slow",
    symptom: "`git clone https://github.com/openclaw/openclaw` fails with a network error, SSL error, or times out.",
    cause: "Network connectivity issue, corporate firewall blocking GitHub, or SSL certificate problem.",
    tags: ["git", "clone", "ssl", "github", "network"],
    relatedStepIds: [10],
    fixes: [
      {
        label: "Check your internet connection first",
        note: "Open a browser and navigate to github.com. If it loads, your internet is working. If not, troubleshoot your network connection first.",
      },
      {
        label: "Try cloning over HTTPS with verbose output",
        code: `# Clone with verbose SSL debugging
GIT_CURL_VERBOSE=1 git clone https://github.com/openclaw/openclaw`,
        os: "linux",
      },
      {
        label: "Download the ZIP archive as an alternative",
        note: "If git clone keeps failing, go to github.com/openclaw/openclaw in your browser, click the green 'Code' button, and choose 'Download ZIP'. Extract the ZIP file to your home directory.",
      },
    ],
  },
  {
    id: "general-setup-script-permission",
    category: "general",
    severity: "warning",
    title: "Permission denied running docker-setup.sh",
    symptom: "Running `./docker-setup.sh` returns: `permission denied: ./docker-setup.sh` or `-bash: ./docker-setup.sh: Permission denied`.",
    cause: "The setup script file does not have the executable permission set.",
    tags: ["permission denied", "chmod", "setup script", "executable"],
    relatedStepIds: [11],
    fixes: [
      {
        label: "Make the script executable",
        code: `# Add execute permission to the script
chmod +x docker-setup.sh

# Now run it
./docker-setup.sh`,
        os: "linux",
      },
      {
        label: "Run it explicitly with bash (alternative)",
        code: `# Run without needing execute permission
bash docker-setup.sh`,
        os: "linux",
      },
    ],
  },
  {
    id: "general-wsl-issues",
    category: "general",
    severity: "info",
    title: "Issues running Docker on Windows with WSL 2",
    symptom: "On Windows, Docker commands work but are very slow, or you see errors related to WSL 2 integration.",
    cause: "Docker Desktop on Windows uses WSL 2 (Windows Subsystem for Linux). Performance issues often stem from files being stored on the Windows filesystem instead of the WSL filesystem.",
    tags: ["windows", "wsl", "wsl2", "performance", "integration"],
    relatedStepIds: [7, 10],
    fixes: [
      {
        label: "Store project files inside WSL filesystem",
        note: "For best performance on Windows, clone the OpenClaw repository inside your WSL home directory (e.g., /home/yourusername/openclaw) rather than on your Windows drive (e.g., C:\\Users\\...).",
        code: `# Open a WSL terminal (search for 'Ubuntu' or 'WSL' in Start menu)
# Then clone inside WSL:
cd ~
git clone https://github.com/openclaw/openclaw
cd openclaw`,
        os: "windows",
      },
      {
        label: "Ensure WSL 2 integration is enabled in Docker Desktop",
        note: "Open Docker Desktop > Settings > Resources > WSL Integration. Make sure your WSL distribution (e.g., Ubuntu) has integration enabled.",
      },
    ],
  },
];

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TroubleshootingCategory[];
export const ALL_SEVERITIES = Object.keys(SEVERITY_LABELS) as Severity[];

// Top 3 most frequently encountered issues — shown on the main page quick-access panel
export const TOP_ISSUE_IDS = [
  "docker-permission-denied",      // #1 — Linux users hit this almost universally
  "docker-container-exits-immediately", // #2 — Bad API key / missing config on first run
  "network-cannot-reach-dashboard",    // #3 — Accessing dashboard from another device
] as const;

export const TOP_ISSUES = TOP_ISSUE_IDS.map(
  (id) => TROUBLESHOOTING_ENTRIES.find((e) => e.id === id)!
);
