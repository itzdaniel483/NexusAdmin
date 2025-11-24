# NexusAdmin

<div align="center">

![NexusAdmin Banner](https://via.placeholder.com/800x200/111827/3b82f6?text=NEXUS+ADMIN)

**A modern, high-performance game server management panel.**
Built for speed, security, and ease of use.

[Features](#features) • [Installation](#installation) • [Supported Games](#supported-games) • [Documentation](#documentation)

</div>

---

## 🚀 Features

- 🎮 **Multi-Game Support** - Native support for Source Engine, Rust, ARK, and more.
- ⚡ **Instant Deployment** - Smart pre-caching system for lightning-fast server installs.
- 🛡️ **Enterprise Security** - Cloudflare Zero Trust integration & role-based access control.
- 📊 **Real-Time Console** - Live server monitoring, logs, and player management.
- 📂 **Web File Manager** - Edit configuration files directly from your browser.
- 🔄 **Automated Backups** - Schedule backups to keep your data safe.
- 🔌 **Plugin System** - Extensible architecture for custom functionality.

## 🛠️ System Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows, Linux, or macOS |
| **Node.js** | Version 18 or higher |
| **RAM** | 4GB+ Recommended |
| **Disk** | 10GB+ (varies by game) |

## 📦 Installation

### 🪟 Windows (One-Click)

1.  **Run the installer** (PowerShell as Administrator):
    ```powershell
    .\installers\windows\install.ps1
    ```
2.  **Start the panel:**
    ```cd ..
    npm start
    ```
3.  **Login:** Open `http://localhost:5173`
    *   Default User: `admin`
    *   Default Pass: `admin`

### 🐧 Linux / macOS

1.  **Run the installer:**
    ```bash
    chmod +x installers/linux/install.sh
    ./installers/linux/install.sh
    ```
2.  **Start the panel:**
    ```bash
    npm start
    ```

## 🎮 Supported Games

NexusAdmin supports 16+ games out of the box, including:

*   **FPS:** CS:GO, CS:Source, TF2, L4D2, Insurgency
*   **Survival:** Rust, ARK: Survival Evolved, 7 Days to Die, The Forest, Project Zomboid
*   **Sandbox:** Garry's Mod
*   **Classic:** Half-Life 2: DM, Day of Defeat: Source

## 🔒 Authentication

NexusAdmin supports two authentication modes:

1.  **Local Auth (Default):** Standard username/password login.
2.  **External Auth:** Integration with **Cloudflare Zero Trust** for enterprise-grade security (SSO, MFA).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
