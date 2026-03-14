// OpenClaw Setup Guide — Troubleshooting Data
// Categories: Docker, Network, API, OpenClaw App, Telegram, General

export type TroubleshootingCategory =
  | "docker"
  | "network"
  | "api"
  | "openclaw"
  | "telegram"
  | "syncthing"
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
  syncthing: "Syncthing",
  general: "General",
};

export const CATEGORY_COLORS: Record<TroubleshootingCategory, { bg: string; text: string; border: string }> = {
  docker: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  network: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  api: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  openclaw: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  telegram: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  syncthing: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
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

  // ── SYNCTHING ERRORS ───────────────────────────────────────────────────────
  {
    id: "syncthing-devices-not-connecting",
    category: "syncthing",
    severity: "critical",
    title: "Syncthing devices not connecting to each other",
    symptom: "The Mac Mini and laptop both show 'Disconnected' in the Syncthing UI. The device ID was added correctly on both sides but they never reach 'Connected' status.",
    cause: "Both devices are behind NAT routers and cannot reach each other directly. The global relay discovery may be temporarily unavailable, or a local firewall is blocking Syncthing's outbound connection on port 22067.",
    fixes: [
      {
        label: "Verify Syncthing is running on both devices",
        os: "macos",
        code: `# Check if Syncthing is running on macOS
brew services list | grep syncthing

# If stopped, start it
brew services start syncthing

# Open the web UI to confirm
open http://127.0.0.1:8384`,
      },
      {
        label: "Verify Syncthing is running on Linux",
        os: "linux",
        code: `systemctl --user status syncthing

# If inactive, start it
systemctl --user start syncthing`,
      },
      {
        label: "Check that global discovery and relaying are enabled",
        note: "In the Syncthing web UI on both devices, go to Actions → Settings → Connections. Ensure 'Global Discovery', 'Enable Relaying', and 'NAT Traversal' are all checked.",
      },
      {
        label: "Test outbound connectivity on port 22067",
        os: "all",
        code: `# Test that the relay port is reachable outbound
curl -v telnet://relay.syncthing.net:22067 2>&1 | head -5`,
      },
      {
        label: "Re-add the remote device using the exact Device ID",
        note: "Copy the Device ID from Actions → Show ID in the Syncthing UI. Even a single character difference will prevent connection. Remove and re-add the device if unsure.",
      },
    ],
    tags: ["syncthing", "disconnected", "NAT", "relay", "devices", "second brain"],
    relatedStepIds: [24],
  },
  {
    id: "syncthing-sync-conflict",
    category: "syncthing",
    severity: "warning",
    title: "Sync conflict files appearing in the vault",
    symptom: "Files with names like 'My Note.sync-conflict-20260314-123456-DEVICEID.md' appear in your Obsidian vault. Obsidian shows duplicate notes.",
    cause: "A conflict occurs when the same file is modified on both devices before Syncthing has a chance to sync the changes. This is common when editing a note on your laptop while OpenClaw (or another process) also modifies the same file on the Mac Mini.",
    fixes: [
      {
        label: "Identify and resolve conflict files",
        os: "all",
        code: `# List all conflict files in your vault
find ~/second-brain -name '*.sync-conflict-*' -type f

# Compare the conflict file with the original
diff 'My Note.md' 'My Note.sync-conflict-20260314-123456-ABCDEF.md'`,
      },
      {
        label: "Delete conflict files after reviewing them",
        os: "all",
        code: `# After reviewing, remove all conflict files
find ~/second-brain -name '*.sync-conflict-*' -type f -delete

# Verify none remain
find ~/second-brain -name '*.sync-conflict-*' | wc -l`,
      },
      {
        label: "Prevent conflicts by mounting the vault read-only in Docker",
        note: "In your docker-compose.yml, ensure the vault bind mount ends with :ro (read-only). This prevents OpenClaw from writing to the vault and eliminates the most common source of conflicts.",
        code: `# In ~/openclaw/docker-compose.yml:
# volumes:
#   - ~/second-brain:/vault:ro   ← :ro prevents OpenClaw writes`,
      },
      {
        label: "Install the Obsidian 'Conflict Resolver' community plugin",
        note: "In Obsidian, go to Settings → Community Plugins → Browse and search for 'Conflict Resolver'. This plugin highlights conflict files in the file tree and provides a side-by-side merge view.",
      },
    ],
    tags: ["syncthing", "conflict", "duplicate", "obsidian", "vault", "second brain"],
    relatedStepIds: [23, 24, 25],
  },
  {
    id: "syncthing-not-starting-on-login",
    category: "syncthing",
    severity: "warning",
    title: "Syncthing does not start automatically after Mac Mini restarts",
    symptom: "After rebooting the Mac Mini, Syncthing is not running. The vault is not syncing until you manually start it. The Syncthing web UI at http://127.0.0.1:8384 is unreachable.",
    cause: "The Syncthing launch agent (launchd service) is not registered, or it was installed for a different user account. On macOS, Homebrew services must be started per-user.",
    fixes: [
      {
        label: "Register Syncthing as a login service with Homebrew",
        os: "macos",
        code: `# Register Syncthing to start at login for your user
brew services start syncthing

# Verify it is registered
brew services list | grep syncthing
# Should show: syncthing  started  youruser ~/Library/LaunchAgents/homebrew.mxcl.syncthing.plist`,
      },
      {
        label: "Manually add a launchd plist if Homebrew services does not work",
        os: "macos",
        code: `# Create the LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Create the plist file
cat > ~/Library/LaunchAgents/net.syncthing.syncthing.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>net.syncthing.syncthing</string>
  <key>ProgramArguments</key>
  <array><string>/opt/homebrew/bin/syncthing</string><string>serve</string><string>--no-browser</string><string>--no-restart</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
EOF

# Load it immediately
launchctl load ~/Library/LaunchAgents/net.syncthing.syncthing.plist`,
      },
      {
        label: "Enable systemd service on Linux",
        os: "linux",
        code: `systemctl --user enable syncthing
systemctl --user start syncthing

# Verify it starts on boot
systemctl --user is-enabled syncthing`,
      },
    ],
    tags: ["syncthing", "autostart", "login", "launchd", "startup", "mac mini"],
    relatedStepIds: [24],
  },
  {
    id: "syncthing-slow-sync",
    category: "syncthing",
    severity: "info",
    title: "Syncthing sync is very slow or takes hours",
    symptom: "File changes on the laptop take many minutes or hours to appear on the Mac Mini (or vice versa). The Syncthing UI shows 'Syncing' for a long time with a very slow progress bar.",
    cause: "Both devices are on different networks (e.g., laptop on main Wi-Fi, Mac Mini on guest network) and cannot reach each other directly. All traffic is being routed through a global relay server, which has limited bandwidth. Alternatively, a large number of small files (common in Obsidian vaults with many attachments) causes high overhead.",
    fixes: [
      {
        label: "Check if devices are using a relay (slow) or direct connection (fast)",
        note: "In the Syncthing UI, click on the remote device name. If the connection type shows 'Relay', traffic is being routed through a third-party server. If it shows 'Direct', the devices found each other on the local network.",
      },
      {
        label: "Enable local network discovery to allow direct connections",
        note: "In Syncthing Settings → Connections, ensure 'Local Discovery' is enabled on both devices. When both are on the same physical network (even different subnets), this allows direct connections without a relay.",
      },
      {
        label: "Exclude large attachment folders from sync",
        os: "all",
        code: `# Create a .stignore file in your vault to exclude large folders
cat > ~/second-brain/.stignore << 'EOF'
# Ignore Obsidian attachment folders with large files
.obsidian/plugins
.obsidian/themes
attachments/*.mp4
attachments/*.mov
attachments/*.pdf
EOF`,
      },
      {
        label: "Check Syncthing bandwidth usage and set limits if needed",
        note: "In Syncthing Settings → Connections, you can set 'Maximum Send Rate' and 'Maximum Receive Rate' to prevent Syncthing from saturating your network. For a text-only vault, no limits are needed.",
      },
    ],
    tags: ["syncthing", "slow", "relay", "performance", "bandwidth", "obsidian"],
    relatedStepIds: [24],
  },
  {
    id: "syncthing-vault-not-visible-in-obsidian",
    category: "syncthing",
    severity: "warning",
    title: "Synced vault folder not appearing in Obsidian on laptop",
    symptom: "Syncthing shows 'Up to Date' on the laptop, but when you open Obsidian the vault is empty or Obsidian does not show the synced notes. The synced folder exists on disk but Obsidian is pointing to a different location.",
    cause: "Obsidian on the laptop is still pointing to an old vault path, or the Syncthing folder was accepted to a different directory than expected. Obsidian vaults are path-sensitive.",
    fixes: [
      {
        label: "Verify the synced folder path on the laptop",
        os: "macos",
        code: `# Check where Syncthing placed the synced folder
ls ~/second-brain

# You should see your Markdown files here
# If the folder is empty, check Syncthing UI for sync status`,
      },
      {
        label: "Point Obsidian to the correct synced folder",
        note: "Open Obsidian → click the vault name in the bottom-left → Manage vaults → Open folder as vault → navigate to ~/second-brain (or wherever Syncthing placed it). Do NOT use 'Create new vault' as that would create an empty vault.",
      },
      {
        label: "Check Syncthing folder path on the laptop",
        note: "In the Syncthing web UI on the laptop, click on the 'Second Brain' folder and verify the 'Folder Path' matches the directory you expect (e.g., /Users/yourname/second-brain). If it points elsewhere, click Edit and correct the path, then wait for re-sync.",
      },
    ],
    tags: ["syncthing", "obsidian", "vault", "path", "empty", "second brain"],
    relatedStepIds: [24, 25],
  },
  {
    id: "syncthing-vault-not-mounted-in-docker",
    category: "syncthing",
    severity: "critical",
    title: "OpenClaw cannot see vault files — /vault is empty inside Docker",
    symptom: "Running 'docker exec openclaw ls /vault' returns an empty directory or 'No such file or directory'. OpenClaw reports it cannot find any notes when asked to search the vault.",
    cause: "The bind mount in docker-compose.yml is missing, uses the wrong path, or the container was not restarted after the mount was added. Docker bind mounts require an exact absolute path — tilde (~) expansion does not work in all Docker Compose versions.",
    fixes: [
      {
        label: "Verify the bind mount in docker-compose.yml uses an absolute path",
        os: "macos",
        code: `# Find your exact home directory path
echo $HOME
# e.g. /Users/tmike

# Your docker-compose.yml volumes section should look like:
# volumes:
#   - /Users/tmike/.openclaw:/root/.openclaw
#   - /Users/tmike/second-brain:/vault:ro

# NOT like this (tilde may not expand):
# volumes:
#   - ~/second-brain:/vault:ro`,
      },
      {
        label: "Restart the container after editing docker-compose.yml",
        os: "all",
        code: `cd ~/openclaw
docker compose down
docker compose up -d

# Verify the vault is now visible
docker exec openclaw ls /vault`,
      },
      {
        label: "Check that the vault directory exists on the host",
        os: "macos",
        code: `# Confirm the directory exists and has files
ls -la ~/second-brain

# If it doesn't exist, create it first
mkdir -p ~/second-brain`,
      },
    ],
    tags: ["syncthing", "docker", "vault", "bind mount", "openclaw", "second brain"],
    relatedStepIds: [23, 24, 25],
  },

  // ── TAILSCALE ERRORS ────────────────────────────────────────────────────
  {
    id: "tailscale-devices-not-appearing",
    category: "syncthing",
    severity: "critical",
    title: "Mac Mini not appearing in Tailscale admin console after install",
    symptom: "After running 'sudo tailscale up', the Mac Mini does not appear in the Tailscale admin console at login.tailscale.com/admin/machines. The command printed a URL but the device never shows as connected.",
    cause: "The authentication URL was not opened, the Tailscale daemon (tailscaled) is not running, or the device was already registered under a different account. On macOS, the system extension may need approval.",
    fixes: [
      {
        label: "Ensure tailscaled daemon is running before authenticating",
        os: "macos",
        code: `# Check if tailscaled is running
pgrep tailscaled || echo "Not running"

# Start it if not running
sudo tailscaled &

# Wait 2 seconds, then authenticate
sleep 2 && sudo tailscale up`,
      },
      {
        label: "Approve the system extension on macOS",
        note: "On macOS, Tailscale requires a system extension approval. Go to System Settings → Privacy & Security → scroll to the bottom → click 'Allow' next to the Tailscale extension message. Then run 'sudo tailscale up' again.",
      },
      {
        label: "Re-run tailscale up and open the URL immediately",
        os: "macos",
        code: `sudo tailscale up
# Copy the https://login.tailscale.com/... URL that appears
# Open it in a browser and sign in within 5 minutes
# The device should appear in the admin console within 30 seconds`,
      },
      {
        label: "Check Tailscale status after authentication",
        os: "macos",
        code: `tailscale status
# Should show your device with a 100.x.x.x IP address
# If it shows 'Stopped', run: sudo tailscale up`,
      },
    ],
    tags: ["tailscale", "not connecting", "admin console", "authentication", "second brain"],
    relatedStepIds: [26],
  },
  {
    id: "tailscale-ping-fails",
    category: "syncthing",
    severity: "warning",
    title: "Cannot ping Mac Mini over Tailscale from laptop",
    symptom: "Both devices appear in the Tailscale admin console with 100.x.x.x IPs, but 'ping 100.x.x.x' from the laptop times out or returns 'Request timeout'. SSH and Syncthing also fail to connect.",
    cause: "A local firewall on the Mac Mini is blocking incoming Tailscale traffic, or the Tailscale subnet routes are not configured correctly. On macOS, the built-in firewall may block ICMP (ping) packets.",
    fixes: [
      {
        label: "Check macOS firewall settings on the Mac Mini",
        note: "Go to System Settings → Network → Firewall. If the firewall is enabled, click 'Options' and ensure Tailscale is in the allowed applications list, or temporarily disable the firewall to test.",
      },
      {
        label: "Use tailscale ping instead of regular ping",
        os: "macos",
        code: `# Tailscale's own ping bypasses OS firewall rules
tailscale ping 100.x.x.x

# If this succeeds but regular ping fails, the OS firewall
# is blocking ICMP. Add a firewall exception for Tailscale.`,
      },
      {
        label: "Verify both devices are on the same Tailscale account",
        note: "In the Tailscale admin console, confirm both the Mac Mini and laptop appear under the same account. Devices on different accounts cannot communicate unless you set up Tailscale ACLs.",
      },
      {
        label: "Re-authenticate if the session has expired",
        os: "macos",
        code: `# Check if Tailscale session is still valid
tailscale status

# If it shows 'Needs reauthentication', run:
sudo tailscale up --reset`,
      },
    ],
    tags: ["tailscale", "ping", "firewall", "connectivity", "second brain"],
    relatedStepIds: [26],
  },
  {
    id: "tailscale-not-starting-on-boot",
    category: "syncthing",
    severity: "warning",
    title: "Tailscale does not reconnect after Mac Mini restarts",
    symptom: "After rebooting the Mac Mini, Tailscale is not running. The device disappears from the Tailscale admin console and the laptop cannot reach it until Tailscale is manually started.",
    cause: "The Tailscale daemon (tailscaled) is not configured to start at login. On macOS, Homebrew installs Tailscale as a formula but does not register it as a login service automatically.",
    fixes: [
      {
        label: "Download the official Tailscale macOS app for automatic startup",
        note: "The easiest fix is to use the official Tailscale app from the Mac App Store instead of the Homebrew formula. The App Store version registers itself as a login item automatically and shows in the menu bar.",
      },
      {
        label: "Register tailscaled as a launchd service (Homebrew install)",
        os: "macos",
        code: `# Create a launchd plist for tailscaled
sudo tee /Library/LaunchDaemons/com.tailscale.tailscaled.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.tailscale.tailscaled</string>
  <key>ProgramArguments</key>
  <array><string>/opt/homebrew/bin/tailscaled</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
EOF

# Load it
sudo launchctl load /Library/LaunchDaemons/com.tailscale.tailscaled.plist`,
      },
      {
        label: "Enable systemd service on Linux",
        os: "linux",
        code: `sudo systemctl enable tailscaled
sudo systemctl start tailscaled

# Verify it starts on boot
sudo systemctl is-enabled tailscaled`,
      },
    ],
    tags: ["tailscale", "autostart", "boot", "launchd", "mac mini", "second brain"],
    relatedStepIds: [26],
  },
  {
    id: "tailscale-syncthing-still-using-relay",
    category: "syncthing",
    severity: "info",
    title: "Syncthing still shows 'Relay' connection even after Tailscale is installed",
    symptom: "Tailscale is working (devices can ping each other), but in the Syncthing UI the remote device still shows 'Relay' as the connection type instead of 'Direct'. Sync is slower than expected.",
    cause: "Syncthing is still using its default 'dynamic' address discovery, which may prefer a public relay over the Tailscale tunnel. You need to explicitly tell Syncthing to use the Tailscale IP address.",
    fixes: [
      {
        label: "Find the Mac Mini's Tailscale IP",
        os: "macos",
        code: `# Run on the Mac Mini
tailscale ip -4
# e.g., 100.64.0.1`,
      },
      {
        label: "Set the Syncthing device address to the Tailscale IP",
        note: "In the Syncthing web UI on your LAPTOP (http://127.0.0.1:8384): click on the Mac Mini device → Edit → change the 'Addresses' field from 'dynamic' to 'tcp://100.64.0.1:22000' (replace with your actual Tailscale IP). Click Save and wait 30 seconds for reconnection.",
      },
      {
        label: "Verify the connection type changed to Direct",
        note: "After saving, click on the Mac Mini device in the Syncthing UI. The 'Connection' field should now show 'Direct (TCP)' instead of 'Relay'. If it still shows Relay, check that Tailscale is running on both devices and they can ping each other.",
      },
    ],
    tags: ["tailscale", "syncthing", "relay", "direct connection", "performance", "second brain"],
    relatedStepIds: [24, 26],
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
