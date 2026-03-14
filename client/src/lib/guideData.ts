// OpenClaw Setup Guide — Complete Step Data
// Design: Blueprint (Swiss Modernism) — Fraunces + Source Sans 3 + JetBrains Mono

export type OS = "windows" | "macos" | "linux";
export type CalloutType = "warning" | "info" | "success";

export interface CodeBlock {
  os?: OS;
  label?: string;
  code: string;
  language?: string;
}

export interface Callout {
  type: CalloutType;
  title: string;
  body: string;
}

export interface TableRow {
  cells: string[];
  highlight?: boolean;
}

export interface GuideTable {
  headers: string[];
  rows: TableRow[];
}

export interface StepContent {
  type: "paragraph" | "code" | "callout" | "table" | "checklist" | "substep" | "image";
  text?: string;
  codeBlocks?: CodeBlock[];  // multiple OS variants
  callout?: Callout;
  table?: GuideTable;
  items?: string[];
  substeps?: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
}

export interface Step {
  id: number;
  part: number;
  title: string;
  shortTitle: string;
  icon: string;
  estimatedMinutes: number;
  content: StepContent[];
}

export interface Part {
  id: number;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  steps: number[];
}

export const PARTS: Part[] = [
  {
    id: 1,
    title: "Understanding Your Environment",
    shortTitle: "Overview",
    icon: "BookOpen",
    description: "Learn what Docker is, why it matters for security, and understand your Google Nest H2D router's capabilities and limitations.",
    steps: [1, 2],
  },
  {
    id: 2,
    title: "Securing Your Network",
    shortTitle: "Network",
    icon: "Wifi",
    description: "Configure your Google Nest H2D router with WPA3, a dedicated guest network for isolation, and disable UPnP.",
    steps: [3, 4, 5, 6],
  },
  {
    id: 3,
    title: "Preparing Your Server",
    shortTitle: "Server Prep",
    icon: "Server",
    description: "Install Docker, Git, and obtain your AI API key from Anthropic or OpenAI.",
    steps: [7, 8, 9],
  },
  {
    id: 4,
    title: "Installing OpenClaw",
    shortTitle: "Install",
    icon: "Download",
    description: "Download OpenClaw, run the Docker setup, and configure your AI agent through the onboarding wizard.",
    steps: [10, 11, 12, 13],
  },
  {
    id: 5,
    title: "Accessing the Dashboard",
    shortTitle: "Dashboard",
    icon: "LayoutDashboard",
    description: "Get your secure access token and connect to the OpenClaw web interface.",
    steps: [14],
  },
  {
    id: 6,
    title: "Telegram Integration",
    shortTitle: "Telegram",
    icon: "MessageCircle",
    description: "Optionally connect OpenClaw to Telegram so you can control your AI agent from your phone.",
    steps: [15, 16],
  },
  {
    id: 7,
    title: "Ongoing Security",
    shortTitle: "Security",
    icon: "ShieldCheck",
    description: "Establish update routines, apply the principle of least privilege, and enable human-in-the-loop approval.",
    steps: [17, 18, 19],
  },
  {
    id: 8,
    title: "Final Checklist",
    shortTitle: "Checklist",
    icon: "CheckSquare",
    description: "Verify every security step is complete before going live.",
    steps: [20],
  },
  {
    id: 9,
    title: "Second Brain: Obsidian + Syncthing",
    shortTitle: "Second Brain",
    icon: "Brain",
    description: "Set up an Obsidian vault on the same Mac Mini, mount it into OpenClaw via Docker, and sync it to your laptop using Syncthing — all without opening any inbound ports.",
    steps: [21, 22, 23, 24, 25],
  },
];

export const STEPS: Step[] = [
  // ─── PART 1: Understanding Your Environment ───────────────────────────────
  {
    id: 1,
    part: 1,
    title: "What Is Docker and Why Are We Using It?",
    shortTitle: "What Is Docker?",
    icon: "Box",
    estimatedMinutes: 3,
    content: [
      {
        type: "paragraph",
        text: "Think of Docker as a set of digital shipping containers. Just as a physical shipping container keeps its contents isolated from the rest of a cargo ship, a Docker container keeps OpenClaw isolated from the rest of your computer's operating system.",
      },
      {
        type: "paragraph",
        text: "If something goes wrong inside the container — for example, if a malicious instruction tricks OpenClaw into doing something harmful — the damage is largely contained within that digital box and cannot easily spread to your personal files, other applications, or the rest of your network.",
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Why Docker Is the #1 Security Measure",
          body: "Docker is the single most important security step you can take when self-hosting an AI agent. The official Docker documentation explicitly recommends this approach because it 'severely limits' the agent's ability to damage the host operating system if compromised.",
        },
      },
      {
        type: "image",
        imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663316870629/h86LJCyEcebf7LCbpydtGg/docker-illustration-mP5vSq3fYfvgNDMucstE8x.webp",
        imageAlt: "Docker containers illustration",
        imageCaption: "Docker containers isolate OpenClaw from your host operating system — like a secure room within your home.",
      },
    ],
  },
  {
    id: 2,
    part: 1,
    title: "Understanding Your Google Nest H2D Router",
    shortTitle: "Router Capabilities",
    icon: "Wifi",
    estimatedMinutes: 4,
    content: [
      {
        type: "paragraph",
        text: "Your Google Nest H2D is a capable mesh Wi-Fi router, but it has important limitations you need to understand before planning your security strategy. The table below summarizes what it can and cannot do.",
      },
      {
        type: "table",
        table: {
          headers: ["Feature", "H2D Capability", "Notes"],
          rows: [
            { cells: ["Stateful Firewall", "✅ Yes (built-in)", "Blocks unsolicited inbound connections from the internet"] },
            { cells: ["WPA2 / WPA3 Encryption", "✅ Yes", "WPA3 can be enabled via the Google Home app"] },
            { cells: ["Guest Network", "✅ Yes", "Provides basic network isolation from your main network"] },
            { cells: ["VLAN Tagging (internal)", "⚠️ Limited", "Only supports VLAN tags 2, 7, and 10 for ISP use — NOT for internal segmentation"], highlight: true },
            { cells: ["Automatic Firmware Updates", "✅ Yes", "Signed updates are pushed automatically by Google"] },
            { cells: ["Port Forwarding", "✅ Yes", "Required only if accessing OpenClaw from outside your home"] },
            { cells: ["UPnP", "⚠️ On by default", "Should be DISABLED — allows devices to open ports without your knowledge"], highlight: true },
          ],
        },
      },
      {
        type: "callout",
        callout: {
          type: "warning",
          title: "No Internal VLANs on the H2D",
          body: "The Google Nest H2D does not support creating internal VLANs for network segmentation. We will use the Guest Network feature as the next best available option, combined with Docker's built-in isolation.",
        },
      },
      {
        type: "image",
        imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663316870629/h86LJCyEcebf7LCbpydtGg/network-diagram-HgnkWCyB8aZbUTmnw5TLTF.webp",
        imageAlt: "Home network diagram showing router, main network devices, and isolated server",
        imageCaption: "Our goal: place the OpenClaw server on the Guest network, isolated from your personal devices.",
      },
    ],
  },

  // ─── PART 2: Securing Your Network ────────────────────────────────────────
  {
    id: 3,
    part: 2,
    title: "Enable WPA3 on Your Main Network",
    shortTitle: "Enable WPA3",
    icon: "Lock",
    estimatedMinutes: 3,
    content: [
      {
        type: "paragraph",
        text: "WPA3 is significantly more resistant to password-cracking attacks than the older WPA2 standard. Let's make sure your main Wi-Fi network is using the strongest available encryption before we do anything else.",
      },
      {
        type: "substep",
        substeps: [
          "Open the Google Home app on your smartphone or tablet.",
          "Tap the Wi-Fi icon on the home screen.",
          "Tap the gear icon (Settings) in the top-right corner.",
          "Scroll down and tap Advanced networking.",
          "Toggle on WPA3 transition mode.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Brief Disconnection Expected",
          body: "When you toggle WPA3 on, your network will restart briefly and all connected devices will lose connectivity for a moment. This is completely normal — everything will reconnect automatically within 30 seconds.",
        },
      },
    ],
  },
  {
    id: 4,
    part: 2,
    title: "Create a Dedicated Guest Network for Your Server",
    shortTitle: "Create Guest Network",
    icon: "Network",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "This is the most important network-level security step available to you on the H2D. By placing your OpenClaw server on the Guest network, you create a digital barrier between it and your other devices — laptops, phones, smart TVs, and so on.",
      },
      {
        type: "substep",
        substeps: [
          "In the Google Home app, tap Wi-Fi.",
          "Tap Guest network.",
          "Tap Set up (if not already configured) or Edit.",
          "Give the network a recognizable name, such as HomeServer-Net.",
          "Set a strong, unique password — at least 16 characters, mixing letters, numbers, and symbols. Make it different from your main network password.",
          "CRITICAL: Make sure 'Allow guests to access devices on my local network' is turned OFF.",
          "Tap Save.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "warning",
          title: "The Most Critical Toggle",
          body: "Ensure 'Allow guests to access devices on my local network' is set to OFF. This is the setting that prevents your server from being able to reach your personal devices. If this is left ON, the isolation provides no meaningful security benefit.",
        },
      },
    ],
  },
  {
    id: 5,
    part: 2,
    title: "Disable UPnP on Your Router",
    shortTitle: "Disable UPnP",
    icon: "ShieldOff",
    estimatedMinutes: 2,
    content: [
      {
        type: "paragraph",
        text: "Universal Plug and Play (UPnP) is a feature that allows devices on your network to automatically open ports in your router's firewall. While convenient, it is a known security risk because malware or a compromised device can use it to open ports without your knowledge.",
      },
      {
        type: "substep",
        substeps: [
          "In the Google Home app, tap Wi-Fi.",
          "Tap the gear icon (Settings).",
          "Tap Advanced networking.",
          "Toggle UPnP to OFF.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Good Work",
          body: "With WPA3 enabled, a dedicated guest network created, and UPnP disabled, your router is now configured as securely as the H2D allows. These three steps alone significantly reduce your attack surface.",
        },
      },
    ],
  },
  {
    id: 6,
    part: 2,
    title: "Connect Your Server to the Guest Network",
    shortTitle: "Connect Server",
    icon: "Plug",
    estimatedMinutes: 2,
    content: [
      {
        type: "paragraph",
        text: "On the computer you will use as your OpenClaw server, connect to the new HomeServer-Net Wi-Fi network you just created. From this point forward, all traffic to and from your server will be isolated from your main home network.",
      },
      {
        type: "substep",
        substeps: [
          "On your server computer, open your Wi-Fi settings.",
          "Find and select the HomeServer-Net network you just created.",
          "Enter the strong password you set.",
          "Confirm the connection is successful.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Ethernet Is Even Better",
          body: "If your server computer has an ethernet port and your router is nearby, a wired ethernet connection is more stable and slightly more secure than Wi-Fi. You can still connect it to the guest network segment using a managed switch, but for simplicity, Wi-Fi works fine for most home setups.",
        },
      },
    ],
  },

  // ─── PART 3: Preparing Your Server ────────────────────────────────────────
  {
    id: 7,
    part: 3,
    title: "Install Docker on Your Server",
    shortTitle: "Install Docker",
    icon: "Package",
    estimatedMinutes: 10,
    content: [
      {
        type: "paragraph",
        text: "Docker is the foundation of our secure setup. Follow the instructions for your operating system below. Use the tabs to switch between Windows, macOS, and Linux instructions.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            os: "windows",
            label: "Windows",
            code: `# Step 1: Download Docker Desktop
# Go to: https://www.docker.com/products/docker-desktop/
# Download and run the installer for Windows

# Step 2: Launch Docker Desktop
# After installation, launch Docker Desktop from the Start menu
# Wait for the green "Running" status in the system tray

# Step 3: Verify installation
# Open PowerShell and run:
docker --version
# Expected output: Docker version 27.x.x, build ...`,
          },
          {
            os: "macos",
            label: "macOS",
            code: `# Step 1: Download Docker Desktop
# Go to: https://www.docker.com/products/docker-desktop/
# Download the installer for macOS (choose Apple Silicon or Intel)

# Step 2: Install and launch
# Open the downloaded .dmg file and drag Docker to Applications
# Launch Docker Desktop from Applications
# Wait for the whale icon in the menu bar to stop animating

# Step 3: Verify installation
# Open Terminal and run:
docker --version
# Expected output: Docker version 27.x.x, build ...`,
          },
          {
            os: "linux",
            label: "Linux (Ubuntu/Debian)",
            code: `# Update your package list
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io docker-compose-plugin

# Start Docker and enable it to run on boot
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (avoids needing 'sudo' every time)
sudo usermod -aG docker $USER

# IMPORTANT: Log out and log back in for the group change to take effect
# Then verify installation:
docker --version
# Expected output: Docker version 27.x.x, build ...`,
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Verify Docker Is Working",
          body: "After installation, run 'docker --version' in your terminal. If you see a version number, Docker is installed correctly. If you get 'command not found', restart your terminal and try again.",
        },
      },
    ],
  },
  {
    id: 8,
    part: 3,
    title: "Install Git",
    shortTitle: "Install Git",
    icon: "GitBranch",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "Git is a tool for downloading code from the internet. You will use it to download the OpenClaw source code to your server.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            os: "windows",
            label: "Windows",
            code: `# Download and install Git for Windows from:
# https://git-scm.com/download/win

# Run the installer with default settings
# After installation, open a new PowerShell window and verify:
git --version
# Expected output: git version 2.x.x.windows.x`,
          },
          {
            os: "macos",
            label: "macOS",
            code: `# Git is usually pre-installed on macOS
# Open Terminal and check:
git --version

# If not installed, macOS will prompt you to install Xcode Command Line Tools
# Click "Install" in the dialog that appears, then wait for it to complete

# Verify after installation:
git --version`,
          },
          {
            os: "linux",
            label: "Linux (Ubuntu/Debian)",
            code: `# Install Git
sudo apt-get install -y git

# Verify installation
git --version
# Expected output: git version 2.x.x`,
          },
        ],
      },
    ],
  },
  {
    id: 9,
    part: 3,
    title: "Obtain an AI API Key",
    shortTitle: "Get API Key",
    icon: "Key",
    estimatedMinutes: 8,
    content: [
      {
        type: "paragraph",
        text: "OpenClaw needs to connect to an AI service to function as your agent. You have two main options. Anthropic's Claude is recommended because its advanced reasoning models are particularly good at resisting 'prompt injection' attacks — where a malicious email or document tries to trick your AI into doing something harmful.",
      },
      {
        type: "table",
        table: {
          headers: ["Provider", "Recommended Model", "Strengths", "Sign Up URL"],
          rows: [
            { cells: ["Anthropic (Claude)", "claude-opus-4-5", "Best security reasoning, resists prompt injection", "console.anthropic.com"], highlight: true },
            { cells: ["OpenAI (ChatGPT)", "gpt-4o", "Widely used, good general capability", "platform.openai.com/api-keys"] },
          ],
        },
      },
      {
        type: "substep",
        substeps: [
          "Go to console.anthropic.com (Anthropic) or platform.openai.com/api-keys (OpenAI) and create an account.",
          "Navigate to API Keys in the dashboard.",
          "Click Create Key, give it a name like 'OpenClaw Home Server', and copy the key.",
          "Store this key securely — treat it like a password. A password manager is ideal.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "warning",
          title: "Protect Your API Key",
          body: "Your API key is like a credit card number for AI usage. Never share it, never post it online, and never commit it to a public code repository. If you believe it has been compromised, immediately revoke it from the provider's dashboard and generate a new one.",
        },
      },
    ],
  },

  // ─── PART 4: Installing OpenClaw ──────────────────────────────────────────
  {
    id: 10,
    part: 4,
    title: "Download the OpenClaw Repository",
    shortTitle: "Download OpenClaw",
    icon: "Download",
    estimatedMinutes: 3,
    content: [
      {
        type: "paragraph",
        text: "Now we will download the OpenClaw source code to your server computer using Git. Open a terminal (Terminal on macOS/Linux, PowerShell on Windows) and run the following commands.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "All Operating Systems",
            code: `# Download the OpenClaw source code
git clone https://github.com/openclaw/openclaw

# Navigate into the downloaded folder
cd openclaw

# Confirm you're in the right place
ls
# You should see files like: docker-compose.yml, docker-setup.sh, etc.`,
          },
        ],
      },
    ],
  },
  {
    id: 11,
    part: 4,
    title: "Run the Docker Setup Script",
    shortTitle: "Docker Setup",
    icon: "Play",
    estimatedMinutes: 8,
    content: [
      {
        type: "paragraph",
        text: "This script will build the Docker image and prepare your environment. It creates two important folders on your computer that OpenClaw will use.",
      },
      {
        type: "table",
        table: {
          headers: ["Folder", "Purpose", "Security Note"],
          rows: [
            { cells: ["~/.openclaw", "Stores configuration, memory, and API keys", "Keep this folder private — it contains your API key"] },
            { cells: ["~/openclaw/workspace", "OpenClaw's working directory for reading/writing files", "Do NOT place sensitive documents here unless necessary"], highlight: true },
          ],
        },
      },
      {
        type: "code",
        codeBlocks: [
          {
            os: "macos",
            label: "macOS / Linux",
            code: `# Make the script executable (only needed once)
chmod +x docker-setup.sh

# Run the setup script
./docker-setup.sh

# This will take a few minutes to download and build the Docker image
# You will see a lot of text scrolling by — this is normal`,
          },
          {
            os: "windows",
            label: "Windows (PowerShell)",
            code: `# Run the setup script using bash
bash docker-setup.sh

# This will take a few minutes to download and build the Docker image
# You will see a lot of text scrolling by — this is normal`,
          },
          {
            os: "linux",
            label: "Linux",
            code: `# Make the script executable (only needed once)
chmod +x docker-setup.sh

# Run the setup script
./docker-setup.sh

# This will take a few minutes to download and build the Docker image
# You will see a lot of text scrolling by — this is normal`,
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "warning",
          title: "Workspace Folder Security",
          body: "OpenClaw has full read/write access to everything in ~/openclaw/workspace. Do not place sensitive documents (tax returns, passwords, private keys, medical records) in this folder unless you have a specific reason to do so.",
        },
      },
    ],
  },
  {
    id: 12,
    part: 4,
    title: "Run the Onboarding Wizard",
    shortTitle: "Onboarding Wizard",
    icon: "Wand2",
    estimatedMinutes: 10,
    content: [
      {
        type: "paragraph",
        text: "The first time you run OpenClaw, it will ask you a series of questions to configure your agent. Run the following command to start the wizard.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "All Operating Systems",
            code: `docker compose run --rm openclaw-cli onboard`,
          },
        ],
      },
      {
        type: "table",
        table: {
          headers: ["Question", "Recommended Answer", "Why"],
          rows: [
            { cells: ["Onboarding mode", "manual", "Gives you full control over the setup"] },
            { cells: ["What to set up?", "Local gateway (this machine)", "Runs OpenClaw on your own hardware"] },
            { cells: ["Model provider", "Anthropic or OpenAI", "Choose based on which API key you obtained"] },
            { cells: ["API Key", "Your API key", "Paste the key you copied in Step 9"] },
            { cells: ["Which model?", "claude-opus-4-5 or gpt-4o", "More powerful models have better security reasoning"], highlight: true },
            { cells: ["Tailscale", "No (for now)", "Skip unless you are already a Tailscale user"] },
            { cells: ["Messaging channels", "Telegram (optional)", "Telegram is the easiest to set up securely"] },
          ],
        },
      },
    ],
  },
  {
    id: 13,
    part: 4,
    title: "Start OpenClaw",
    shortTitle: "Start OpenClaw",
    icon: "Rocket",
    estimatedMinutes: 3,
    content: [
      {
        type: "paragraph",
        text: "Once the wizard is complete, start the OpenClaw server with the following command. The -d flag runs it in 'detached' mode, meaning it runs in the background and will continue running even if you close the terminal.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "All Operating Systems",
            code: `# Start OpenClaw in the background
docker compose up -d

# Verify it is running (look for a container with status "Up")
docker ps

# To see live logs (press Ctrl+C to stop watching):
docker compose logs -f openclaw-gateway`,
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "OpenClaw Is Running",
          body: "If you see a container named 'openclaw-openclaw-gateway-1' with a status of 'Up' in the docker ps output, OpenClaw is running successfully. Congratulations — the hardest part is done!",
        },
      },
    ],
  },

  // ─── PART 5: Dashboard ────────────────────────────────────────────────────
  {
    id: 14,
    part: 5,
    title: "Access the OpenClaw Dashboard",
    shortTitle: "Open Dashboard",
    icon: "Monitor",
    estimatedMinutes: 4,
    content: [
      {
        type: "paragraph",
        text: "OpenClaw's web interface requires a special token to log in. Run this command to get the URL, then open it in your browser.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "All Operating Systems",
            code: `# Get the dashboard URL with your access token
docker compose run --rm openclaw-cli dashboard --no-open

# This will print a URL like:
# http://localhost:18789/?token=abc123xyz...

# Copy the ENTIRE URL (including the token) and open it in your browser`,
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "warning",
          title: "Keep Your Dashboard URL Private",
          body: "This URL contains your access token. Do not share it with anyone. If you need to access the dashboard from another device on your network, replace 'localhost' with your server's local IP address (e.g., http://192.168.86.50:18789/?token=...). Find your server's IP by running 'ipconfig' (Windows) or 'ip addr' (Linux/macOS).",
        },
      },
    ],
  },

  // ─── PART 6: Telegram ─────────────────────────────────────────────────────
  {
    id: 15,
    part: 6,
    title: "Create a Telegram Bot",
    shortTitle: "Create Bot",
    icon: "Bot",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "Connecting OpenClaw to Telegram allows you to interact with your AI agent from your phone, anywhere in the world. Telegram is recommended over WhatsApp for this purpose because it has a well-documented, free bot API.",
      },
      {
        type: "substep",
        substeps: [
          "Open Telegram on your phone and search for @BotFather.",
          "Start a chat with BotFather and send the command: /newbot",
          "When prompted, give your bot a display name (e.g., 'My OpenClaw Agent').",
          "Give your bot a username — it must end in 'bot' (e.g., 'MyOpenClawBot').",
          "BotFather will give you a token that looks like: 123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ",
          "Copy this token and store it securely.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "This Step Is Optional",
          body: "Telegram integration is entirely optional. You can use OpenClaw exclusively through the web dashboard if you prefer. However, Telegram makes it much more convenient to interact with your agent on the go.",
        },
      },
    ],
  },
  {
    id: 16,
    part: 6,
    title: "Connect Telegram to OpenClaw",
    shortTitle: "Connect Telegram",
    icon: "Link",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "Now we will link your Telegram bot to your OpenClaw instance.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "All Operating Systems",
            code: `# Add the Telegram channel to OpenClaw
docker compose run --rm openclaw-cli channels add telegram

# When prompted, paste your Telegram bot token
# OpenClaw will send you a pairing message via Telegram
# Follow the on-screen instructions to complete the pairing`,
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Test Your Connection",
          body: "After pairing, send a message to your Telegram bot. It should respond! Try asking it something simple like 'What time is it?' to confirm the connection is working.",
        },
      },
    ],
  },

  // ─── PART 7: Ongoing Security ─────────────────────────────────────────────
  {
    id: 17,
    part: 7,
    title: "Establish a Monthly Update Routine",
    shortTitle: "Keep Updated",
    icon: "RefreshCw",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "Security vulnerabilities are discovered regularly, and updates are the primary defense against them. Set a calendar reminder to run the following commands at least once a month.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "Update OpenClaw (All OS)",
            code: `# Navigate to your openclaw folder
cd ~/openclaw

# Pull the latest code
git pull

# Rebuild and restart the Docker container with the latest image
docker compose pull
docker compose up -d --force-recreate

# Verify the updated container is running
docker ps`,
          },
          {
            os: "linux",
            label: "Update Docker & OS (Linux)",
            code: `# Update Docker and the operating system
sudo apt-get update && sudo apt-get upgrade -y

# Prune old Docker images to free up disk space
docker image prune -f`,
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Windows & macOS Updates",
          body: "On Windows and macOS, Docker Desktop will notify you of updates automatically. Accept these updates promptly. Also keep your operating system up to date via Windows Update or macOS System Settings > Software Update.",
        },
      },
    ],
  },
  {
    id: 18,
    part: 7,
    title: "Apply the Principle of Least Privilege",
    shortTitle: "Least Privilege",
    icon: "Shield",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "Only grant OpenClaw access to what it truly needs. The more access you give it, the more damage a compromised agent can do. Use the table below as a guide.",
      },
      {
        type: "table",
        table: {
          headers: ["Access Type", "Recommendation", "Reason"],
          rows: [
            { cells: ["Shell / Terminal access", "Avoid unless necessary", "A compromised agent with shell access can cause serious damage"] },
            { cells: ["Email access", "Use with caution", "Susceptible to 'prompt injection' via malicious emails"], highlight: true },
            { cells: ["File system access", "Limit to ~/openclaw/workspace", "Prevents access to sensitive personal files"] },
            { cells: ["Smart home / IoT devices", "Isolate IoT on a separate network", "Prevents lateral movement to vulnerable devices"] },
            { cells: ["Financial accounts", "Require human approval for ALL transactions", "Prevents unauthorized spending"], highlight: true },
          ],
        },
      },
    ],
  },
  {
    id: 19,
    part: 7,
    title: "Enable Human-in-the-Loop Approval",
    shortTitle: "Human Approval",
    icon: "UserCheck",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "For any action that involves spending money, deleting files, or sending messages on your behalf, configure OpenClaw to require your explicit approval first. You can set this up by adding an instruction to your agent's system prompt in the dashboard.",
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Recommended System Prompt Addition",
          body: "In the OpenClaw dashboard, add this to your agent's system prompt: \"For any action that involves sending an email, deleting a file, making a purchase, or any other irreversible action, you must first send me a confirmation message via Telegram and wait for my explicit 'yes' reply before proceeding.\"",
        },
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Review the Activity Log Regularly",
          body: "The OpenClaw dashboard includes a full activity log showing every action your agent has taken. Make it a habit to review this log periodically to ensure your agent is only doing what you expect.",
        },
      },
    ],
  },

  // ─── PART 9: Second Brain ────────────────────────────────────────────────
  {
    id: 21,
    part: 9,
    title: "Understanding the Second Brain Architecture",
    shortTitle: "Architecture",
    icon: "Brain",
    estimatedMinutes: 4,
    content: [
      {
        type: "paragraph",
        text: "A 'Second Brain' is a personal knowledge management system — a place where you capture notes, ideas, research, and tasks in a structured way. Obsidian is the ideal tool for this: it stores everything as plain Markdown files on disk, which means your AI agent can read and write to it directly without any special API.",
      },
      {
        type: "paragraph",
        text: "The architecture below shows how all three components — OpenClaw, the Obsidian vault, and Syncthing — coexist on your Mac Mini without any inbound network ports being opened. Syncthing uses outbound-only relay/NAT traversal to sync your vault to your laptop on the main network.",
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Why This Architecture Is Secure",
          body: "Localhost is the most secure communication channel possible — no network traffic to intercept. OpenClaw accesses the vault via a Docker bind mount (a direct folder link), not over any network. Syncthing uses only outbound connections, so no new inbound firewall holes are needed on your Google Nest H2D.",
        },
      },
      {
        type: "table",
        table: {
          headers: ["Component", "Role", "Network Exposure"],
          rows: [
            { cells: ["Obsidian Vault", "Plain Markdown files stored at ~/second-brain on the Mac Mini", "None — local disk only"] },
            { cells: ["OpenClaw (Docker)", "Reads and writes vault files via a bind mount at /vault inside the container", "None — localhost only"] },
            { cells: ["Syncthing (Mac Mini)", "Watches ~/second-brain and syncs changes outbound to your laptop", "Outbound only — no inbound ports"] },
            { cells: ["Syncthing (Laptop)", "Receives vault changes and stores them locally for Obsidian to open", "Outbound only"], highlight: true },
            { cells: ["Obsidian (Laptop)", "Opens the synced vault folder for reading and editing on your main device", "None — local disk only"] },
          ],
        },
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Mac Mini Resource Usage",
          body: "A Mac Mini (M1/M2 or Intel) has plenty of headroom for both OpenClaw and an Obsidian vault. Obsidian is a lightweight Electron app and the vault is just a folder of text files. Syncthing uses less than 50 MB of RAM at idle. These are not GPU-heavy workloads unless you add a local LLM.",
        },
      },
    ],
  },
  {
    id: 22,
    part: 9,
    title: "Create the Obsidian Vault on the Mac Mini",
    shortTitle: "Create Vault",
    icon: "FolderOpen",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "First, create the vault directory on your Mac Mini. This is the folder that OpenClaw will mount and Syncthing will watch. We place it in your home directory so it is outside the Docker container's own storage.",
      },
      {
        type: "code",
        codeBlocks: [
          {
            os: "macos",
            label: "macOS Terminal",
            language: "bash",
            code: "# Create the vault directory\nmkdir -p ~/second-brain\n\n# Create a starter note so the vault is not empty\ncat > ~/second-brain/README.md << 'EOF'\n# My Second Brain\n\nThis vault is managed by Obsidian and accessible to your OpenClaw AI agent.\n\n## Structure\n- [[Inbox]] — quick capture\n- [[Projects]] — active work\n- [[Resources]] — reference material\n- [[Archive]] — completed items\nEOF\n\necho \"Vault created at: ~/second-brain\"",
          },
          {
            os: "linux",
            label: "Linux Terminal",
            language: "bash",
            code: "# Create the vault directory\nmkdir -p ~/second-brain\n\n# Create a starter note\ncat > ~/second-brain/README.md << 'EOF'\n# My Second Brain\n\nThis vault is managed by Obsidian and accessible to your OpenClaw AI agent.\nEOF\n\necho \"Vault created at: ~/second-brain\"",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Next, install Obsidian on the Mac Mini so you can manage the vault locally when you are sitting at it. Obsidian is free for personal use.",
      },
      {
        type: "substep",
        substeps: [
          "Go to https://obsidian.md and download the macOS .dmg installer.",
          "Open the .dmg and drag Obsidian to your Applications folder.",
          "Launch Obsidian and click 'Open folder as vault'.",
          "Navigate to your home folder and select the second-brain folder you just created.",
          "Click Open. Obsidian will open the vault and display your README.md.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Vault Location Matters",
          body: "Keep the vault at ~/second-brain (i.e., /Users/yourname/second-brain on macOS). This exact path is used in the Docker Compose file in the next step. If you choose a different location, update the bind mount path accordingly.",
        },
      },
    ],
  },
  {
    id: 23,
    part: 9,
    title: "Mount the Vault into OpenClaw via Docker",
    shortTitle: "Mount Vault",
    icon: "Link",
    estimatedMinutes: 6,
    content: [
      {
        type: "paragraph",
        text: "Now we need to tell Docker to share the vault folder with the OpenClaw container. This is done with a bind mount — a direct link between a folder on your Mac Mini and a path inside the container. OpenClaw will see the vault at /vault and can read and write Markdown files there.",
      },
      {
        type: "paragraph",
        text: "Open your docker-compose.yml file (located at ~/openclaw/docker-compose.yml) and add the vault bind mount to the openclaw service:",
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "~/openclaw/docker-compose.yml (add the highlighted line)",
            language: "yaml",
            code: "services:\n  openclaw:\n    image: ghcr.io/openclaw/openclaw:latest\n    restart: unless-stopped\n    ports:\n      - \"127.0.0.1:3000:3000\"\n    volumes:\n      - ~/.openclaw:/root/.openclaw        # existing line\n      - ~/second-brain:/vault:ro            # ADD THIS LINE\n    environment:\n      - OPENCLAW_HOST=0.0.0.0",
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "warning",
          title: "The :ro Flag Is Important",
          body: "The :ro suffix mounts the vault as read-only inside the container. This means OpenClaw can read your notes but cannot accidentally delete or overwrite them. Remove :ro only if you explicitly want OpenClaw to be able to write new notes to your vault.",
        },
      },
      {
        type: "paragraph",
        text: "After editing the file, restart the OpenClaw container to apply the new mount:",
      },
      {
        type: "code",
        codeBlocks: [
          {
            os: "macos",
            label: "macOS / Linux Terminal",
            language: "bash",
            code: "cd ~/openclaw\ndocker compose down && docker compose up -d\n\n# Verify the vault is mounted correctly\ndocker exec openclaw ls /vault",
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Vault Mounted Successfully",
          body: "If the ls /vault command shows your Markdown files (including README.md), the bind mount is working correctly. OpenClaw can now reference your vault using the path /vault in any agent instructions.",
        },
      },
    ],
  },
  {
    id: 24,
    part: 9,
    title: "Install and Configure Syncthing",
    shortTitle: "Install Syncthing",
    icon: "RefreshCw",
    estimatedMinutes: 10,
    content: [
      {
        type: "paragraph",
        text: "Syncthing is a free, open-source, peer-to-peer file synchronization tool. It syncs your vault between your Mac Mini and your laptop in real time, using only outbound connections — no cloud service, no inbound ports, and no subscription required.",
      },
      {
        type: "paragraph",
        text: "Install Syncthing on the Mac Mini first using Homebrew (the macOS package manager):",
      },
      {
        type: "code",
        codeBlocks: [
          {
            os: "macos",
            label: "Mac Mini — Install via Homebrew",
            language: "bash",
            code: "# Install Homebrew if you don't have it\n/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"\n\n# Install Syncthing\nbrew install syncthing\n\n# Start Syncthing and enable it to launch at login\nbrew services start syncthing\n\n# Open the Syncthing web UI\nopen http://127.0.0.1:8384",
          },
          {
            os: "linux",
            label: "Linux Server — Install via apt",
            language: "bash",
            code: "# Add the Syncthing release key and repository\ncurl -s https://syncthing.net/release-key.txt | sudo apt-key add -\necho \"deb https://apt.syncthing.net/ syncthing stable\" | sudo tee /etc/apt/sources.list.d/syncthing.list\nsudo apt update && sudo apt install syncthing -y\n\n# Enable and start the service for your user\nsystemctl --user enable syncthing\nsystemctl --user start syncthing\n\n# Open the web UI (from the server's browser)\nxdg-open http://127.0.0.1:8384",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Once the Syncthing web UI is open at http://127.0.0.1:8384, configure it to share your vault:",
      },
      {
        type: "substep",
        substeps: [
          "In the Syncthing web UI, click 'Add Folder'.",
          "Set the Folder Path to /Users/yourname/second-brain (replace yourname with your actual macOS username).",
          "Give it a Folder Label such as 'Second Brain'.",
          "Leave the Folder ID as the auto-generated value (you will need it on the laptop).",
          "Click Save.",
          "Note your Mac Mini's Device ID shown in the top-right of the UI — you will need it when setting up Syncthing on your laptop.",
        ],
      },
      {
        type: "paragraph",
        text: "Now install Syncthing on your laptop (the device on your main home network) and pair the two devices:",
      },
      {
        type: "substep",
        substeps: [
          "Download Syncthing for your laptop OS from https://syncthing.net/downloads/ and install it.",
          "Open the Syncthing web UI on your laptop at http://127.0.0.1:8384.",
          "Click 'Add Remote Device' and paste the Mac Mini's Device ID.",
          "Give the device a name like 'Mac Mini Server'.",
          "On the Mac Mini's Syncthing UI, accept the incoming connection request from your laptop.",
          "On the Mac Mini, edit the 'Second Brain' folder and check the box next to your laptop's device to share it.",
          "On the laptop, accept the folder share and choose a local path (e.g., ~/second-brain).",
          "Wait for the initial sync to complete — the status bar will show 'Up to Date'.",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "No Inbound Ports Required",
          body: "Syncthing uses global relay servers and NAT traversal to connect devices even when both are behind NAT routers. Your Google Nest H2D does not need any port forwarding rules for Syncthing to work. The Mac Mini only makes outbound connections.",
        },
      },
    ],
  },
  {
    id: 25,
    part: 9,
    title: "Configure OpenClaw to Use Your Second Brain",
    shortTitle: "Configure Agent",
    icon: "Bot",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "With the vault mounted at /vault inside the container, you can now instruct OpenClaw to use your Second Brain as a knowledge base. The simplest way is to add a system prompt instruction that tells the agent about the vault structure.",
      },
      {
        type: "substep",
        substeps: [
          "Open the OpenClaw dashboard at http://localhost:3000.",
          "Navigate to Settings → Agent Behavior → System Prompt.",
          "Add the following block to your existing system prompt (or create a new one):",
        ],
      },
      {
        type: "code",
        codeBlocks: [
          {
            label: "System Prompt Addition",
            language: "text",
            code: "You have read access to the user's personal knowledge vault at /vault.\nThis is an Obsidian-format Markdown vault. Notes use [[wikilinks]] for internal links.\n\nWhen the user asks you to:\n- Find information: search /vault using grep or read specific .md files\n- Summarize notes: read the relevant files and synthesize\n- Create a new note: write a .md file to /vault/Inbox/ (only if write access is enabled)\n\nAlways cite the source file path when referencing vault content.",
          },
        ],
      },
      {
        type: "callout",
        callout: {
          type: "info",
          title: "Enabling Write Access (Optional)",
          body: "By default the vault is mounted read-only (:ro). To allow OpenClaw to create new notes, remove the :ro flag from the docker-compose.yml bind mount and restart the container. Consider restricting write access to a specific subfolder like /vault/Inbox to limit the agent's reach.",
        },
      },
      {
        type: "paragraph",
        text: "You can now ask OpenClaw questions like 'What did I write about project X last month?' or 'Summarize my notes on topic Y' and it will search your vault and respond with context from your own notes.",
      },
      {
        type: "checklist",
        items: [
          "~/second-brain folder created on the Mac Mini",
          "Obsidian vault opened and pointing to ~/second-brain",
          "Docker bind mount added to docker-compose.yml",
          "docker exec openclaw ls /vault confirms files are visible",
          "Syncthing installed and running on both Mac Mini and laptop",
          "Devices paired and initial sync shows 'Up to Date'",
          "Obsidian on laptop opens the synced ~/second-brain folder",
          "System prompt updated to reference /vault",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Second Brain Active!",
          body: "Your OpenClaw agent can now read your personal knowledge base. Notes you write on your laptop sync to the Mac Mini within seconds via Syncthing, and OpenClaw can immediately reference them. No cloud services, no inbound ports, no firewall changes needed.",
        },
      },
    ],
  },

  // ─── PART 8: Final Checklist ──────────────────────────────────────────────
  {
    id: 20,
    part: 8,
    title: "Final Security Checklist",
    shortTitle: "Final Checklist",
    icon: "CheckSquare",
    estimatedMinutes: 5,
    content: [
      {
        type: "paragraph",
        text: "Use this checklist to confirm you have completed all the important security steps before going live. Every item here represents a meaningful layer of protection.",
      },
      {
        type: "checklist",
        items: [
          "WPA3 enabled on your main Google Nest network",
          "Guest network created with a strong, unique password",
          "'Allow guests to access local network' is turned OFF",
          "Server computer connected to the Guest network",
          "UPnP disabled on the router",
          "OpenClaw running inside a Docker container (not installed directly on the host OS)",
          "API key stored securely (e.g., in a password manager) and not shared",
          "Sensitive documents are NOT placed in ~/openclaw/workspace",
          "Human-in-the-loop approval configured for irreversible actions",
          "Monthly update schedule established (calendar reminder set)",
          "Dashboard access token kept private",
          "Activity log reviewed at least once after initial setup",
        ],
      },
      {
        type: "callout",
        callout: {
          type: "success",
          title: "Congratulations — Setup Complete!",
          body: "You have successfully deployed a personal OpenClaw AI Agent server with a practical, layered security setup appropriate for a home environment. Your agent is isolated in Docker, your network provides a guest network barrier, and you have established good security hygiene. Welcome to the world of personal AI agents!",
        },
      },
    ],
  },
];

export const TOTAL_STEPS = STEPS.length;

export function getStepsByPart(partId: number): Step[] {
  return STEPS.filter((s) => s.part === partId);
}

export function getPartForStep(stepId: number): Part | undefined {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) return undefined;
  return PARTS.find((p) => p.id === step.part);
}
