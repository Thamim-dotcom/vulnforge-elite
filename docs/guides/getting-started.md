# 🚀 Getting Started with VulnForge Elite

Welcome to the apex operational documentation for **VulnForge Elite**. This guide covers the initial onboarding setup, autonomous CLI engine verification, and local execution options.

## 1. System Requirements

- **Operating System**: Linux (Ubuntu 22.04+, Debian, Arch, Fedora) or Windows 11.
- **Python**: Version 3.11 or higher.
- **Node.js**: Version 22+ (for compiling GUI source assets).

## 2. Execution Methods

### Option A: Portable Standalone Executables
For rapid deployment without installing dependencies:
- **Linux**: Download the bundled `VulnForge-Elite-0.0.0.AppImage`, grant execution permissions (`chmod +x`), and launch directly.
- **Windows**: Extract the portable ZIP archive and launch `VulnForge Elite.exe` inside the unpacked directory.

### Option B: Local Python Engine Core
To run automated programmatic campaigns directly from standard terminal instances:
```bash
pip install vulnforge-elite --upgrade
vulnforge verify_all --sim-mode
```

## 3. Launching Your First Autopilot Hunt

Run headless operations utilizing automated AI mapping:
```bash
vulnforge autopilot --program hackerone/example-target --max-time 4h
```
Upon completion, scan summaries are securely populated inside local database layers for direct GUI visualization.
