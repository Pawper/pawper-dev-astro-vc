---
title: "Installing Terminal & WSL (Windows Subsystem for Linux)"
date: "2026.05.23"
kicker: "Tutorial"
tags: ["WSL", "Bash"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1779561479/pawper.dev/logs/ChatGPT_Image_May_23_2026_11_37_00_AM_drmpxt.png"
hook: "Everything you need to know to install and configure Windows Subsystem for Linux: what WSL is, why you need it, and step-by-step setup for development..."
series:
  name: "Foundations of Digital Agency"
  part: 3
  total: 4
---

If you're a web developer on Windows, Windows Subsystem for Linux (WSL) is essential. This tutorial walks you through understanding what WSL is, why you should use it, and how to install and configure it for development.

## Do I really need WSL?

Short answer: **Yes, if you're doing web development on Windows.**

Most web development tools, packages, and tutorials assume a Unix-based environment (Linux or macOS). While you *can* develop on Windows using PowerShell or cmd.exe, you'll constantly run into compatibility issues with package managers, build tools, and open-source projects that assume a Unix shell. WSL lets you run Linux directly on Windows without the overhead of a virtual machine.

## What exactly is WSL?

Windows Subsystem for Linux (WSL) is a compatibility layer that allows you to run a genuine Linux environment directly on Windows. It runs a real Linux kernel in a lightweight virtual machine while remaining tightly integrated with Windows—you get the speed and compatibility of Linux with the convenience of Windows.

![WSL is a layer between Windows & Linux (Generated with ChatGPT)](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779525456/pawper.dev/logs/623a0be0-2359-4b01-9f30-27afd2782062_q7luri.png)

## What's a Linux distribution (distro)?

A Linux distribution is a packaged version of the Linux kernel bundled with specific tools, package managers, and system utilities. Common distributions include Ubuntu, Debian, Fedora, and Alpine. For development, **Ubuntu** is the most beginner-friendly and widely supported choice.

## Why WSL instead of dual-booting Linux?

Dual-booting lets you choose your OS at startup, but you can't use Windows and Linux simultaneously without rebooting. WSL gives you both environments running at the same time with seamless file access between them. You get the best of both worlds.

## Why WSL instead of a virtual machine (VM)?

VMs use more system resources (CPU, RAM, storage) than WSL. WSL is lightweight, boots faster, and integrates better with Windows. If you're resource-constrained or want a quick development environment, WSL is superior.

## Do I lose anything by using WSL?

WSL gives you a Linux shell and command-line tools, but it doesn't run a full graphical Linux desktop by default. You'll still use Windows for your GUI applications (VS Code, browsers, etc.) and access Linux through the terminal. This is exactly what most developers want.

---

## 💻 Install WSL

These instructions are for **Windows 10 (Build 19041+) or Windows 11**.

### Step 1: Check Your Windows Version

Press `Win + R`, type `winver`, and press Enter. You need:
- **Windows 10**: Version 21H2 or later (Build 19041 or higher)
- **Windows 11**: Any version

If you need to update, go to Settings → System → About → Windows Update.

### Step 2: Enable WSL

Open **PowerShell as Administrator** (right-click → "Run as Administrator") and run:

```powershell
wsl --install
```

This single command will:
1. Enable WSL and the Virtual Machine Platform feature
2. Download and install Ubuntu (the default distro)
3. Automatically configure the latest version for you

> **Note**: If you see an error about virtualization, you may need to enable it in your BIOS. Restart your computer, enter BIOS (usually by pressing F2, F10, DEL, or ESC during startup — varies by manufacturer), and look for "Virtualization" or "Intel VT-x" / "AMD-V" and enable it.

### Step 3: Restart Your Computer

WSL requires a system restart. Do this now.

### Step 4: Complete Ubuntu Setup

After restarting, Ubuntu will launch automatically. You'll be prompted to create a username and password:

```
Installing, this may take a few minutes...
Please create a default UNIX user account. The username does not need to match your Windows user name.
For more information visit: https://aka.ms/wsluserstore
Enter new UNIX username: [type your username]
New password: [type a password]
Retype new password: [confirm password]
```

Choose a simple username (e.g., `dev` or your first name). **Remember this password** — you'll need it for administrative tasks in WSL.

[log:guide-password-management-cybersecurity-beginners](log:guide-password-management-cybersecurity-beginners)

### Step 5: Verify Installation

In the Ubuntu terminal that's now open, verify everything works:

```bash
wsl --version
```

You should see output showing WSL version 2.x.

Also verify your Linux distribution:

```bash
lsb_release -a
```

You should see Ubuntu information.

> **Sources / additional material:**
> https://docs.microsoft.com/en-us/windows/wsl/install
> https://docs.microsoft.com/en-us/windows/wsl/about
> https://docs.microsoft.com/en-us/windows/wsl/setup/environment

---

## Configure WSL for Development

### Update Your Linux Packages

WSL comes with Ubuntu, but the package lists may be outdated. Run:

```bash
sudo apt update
sudo apt upgrade -y
```

The `sudo` command runs commands with administrator privileges. You'll be prompted for your password (the one you created in Step 4).

### Install Essential Build Tools

Most web development depends on a C/C++ compiler. Install it:

```bash
sudo apt install build-essential -y
```

This installs `gcc`, `g++`, `make`, and other tools needed to compile native packages.

### (Optional) Install Git

If you don't have Git installed on your Windows machine, install it in WSL:

```bash
sudo apt install git -y
```

> **Note**: You can use either the Windows version or WSL version of Git. I recommend installing it in both places so you have flexibility.

### (Optional) Install Node.js (via nvm)

Many web tutorials use Node.js. The easiest way to manage Node versions is with nvm (Node Version Manager):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Then reload your shell:

```bash
source ~/.bashrc
```

Install Node.js:

```bash
nvm install node
```

Verify:

```bash
node --version
npm --version
```

---

## Access Your Files

WSL and Windows share a file system, but you need to know the paths:

### From WSL, Access Windows Files

Your Windows `C:` drive is mounted at `/mnt/c/` in WSL:

```bash
cd /mnt/c/Users/YourUsername/Documents
```

### From Windows, Access WSL Files

Your WSL home directory is located at:

```
\\wsl$\Ubuntu\home\username\
```

Open File Explorer and type this path in the address bar. You can also open it with `explorer.exe ~` from the WSL terminal.

### Best Practice

Keep your development projects in **WSL's home directory** (`~/projects/` or similar), not in Windows. This avoids file permission issues and improves performance.

![Shared file system (Generated with ChatGPT)](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779525456/pawper.dev/logs/86ad4ac8-5b08-4fdd-be8c-22689be7b2e5_dlngpd.png)

---

## Troubleshooting

### WSL Doesn't Start / "Command Not Found"

Make sure you ran `wsl --install` in **PowerShell as Administrator**, not cmd.exe or a regular PowerShell window.

### "Virtualization is not enabled"

You need to enable virtualization in your BIOS. Restart your computer, enter BIOS (varies by manufacturer), and look for "Virtualization" or "VT-x" / "AMD-V".

### WSL Is Slow

This might mean you're accessing files across the Windows/WSL boundary. Keep your projects in WSL's home directory, not `/mnt/c/`.

### Forgot Your WSL Password

In PowerShell, reset it with:

```powershell
wsl --user root
passwd username
```

Then exit and log back in as your regular user.

---


> **Sources / additional material:**
>
> https://docs.microsoft.com/en-us/windows/wsl/install
> https://docs.microsoft.com/en-us/windows/wsl/about
> https://docs.microsoft.com/en-us/windows/wsl/setup/environment
> https://docs.microsoft.com/en-us/windows/wsl/troubleshoot/common-issues
> https://docs.microsoft.com/en-us/windows/wsl/setup/windows-terminal

_This article was generated with AI for the purpose of providing practical information. I have reviewed it for accuracy and edited it appropriately._