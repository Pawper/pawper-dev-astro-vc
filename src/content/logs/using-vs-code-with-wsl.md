---
title: "Using VS Code with WSL"
devto: "https://dev.to/pawper/using-vs-code-with-wsl-2i3f"
date: "2026.05.23"
kicker: "Tutorial"
tags: ["vscode", "WSL", "Mentoring"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1779743630/pawper.dev/logs/ChatGPT_Image_May_25_2026_02_13_10_PM_vwdt6q.png"
hook: "VS Code is a Windows editor, but your development happens in Linux. Learn how to configure VS Code to work seamlessly with WSL, access your Linux files, and run your entire workflow in a Unix environment..."
series:
  name: "Foundations of Digital Agency"
  part: 4
  total: 5
mentor: true
---

> **Note: This guide is for Windows only.** If you're on macOS, you are already living in Unix in VS Code, so you can skip this tutorial and move on to the next one in the series.

So, you're on Windows. You've installed VS Code, WSL and Windows Terminal per the previous entries in the series -- but here's the problem: your editor VS Code is a Windows application. As discussed in the last entry in the series, the world of modern web development assumes a Unix-based environment. You have WSL (Linux) -- so you're close! -- but if you don't configure VS Code properly, you'll be:
- Editing files in Windows while tools run in Linux (file sync issues)
- Running commands in the wrong environment
- Dealing with path mismatches and permission problems
- Losing the seamless development experience you're after

The solution is **Remote - WSL**, an extension that connects VS Code directly to your WSL environment. This tutorial shows you how to set it up.

## What's Remote - WSL?

Remote - WSL is a Microsoft extension that lets VS Code run **inside your WSL environment** instead of Windows. Here's what that unlocks:
- VS Code connects to WSL and runs there
- You edit files in your Linux home directory (`~/projects/...`)
- All commands run in the same Linux environment
- Everything is unified and seamless

It's the missing link between your Windows editor and Linux development environment.

## Why This Matters

Here's the key insight: you want to **stay on one side of the fence**. Don't straddle Windows and Linux simultaneously while developing. It's really for the best! And VS Code makes it easy.

When you configure VS Code to work with WSL, several things happen:

**A Common Base Experience:** Your terminal automatically opens bash, not PowerShell. This means instructions in future tutorials work identically whether you're on Windows or macOS. No need for special "Windows version" steps—you're developing in a Unix environment on both platforms.

**Better Performance:** Accessing files from your WSL home directory is faster than accessing Windows files through `/mnt/c/`. Keeping everything on the Linux side means no cross-filesystem overhead.

**A Single Source of Truth:** All your projects live in one place (WSL), one filesystem, one set of permissions. No confusion about whether you edited a file from Windows or WSL, no permission conflicts, no npm package installation weirdness.

**The Foundation for What's Next:** Later in this series, you'll use Docker to run projects in isolated containers. Docker extends this principle—your code runs in the same type of environment locally as it does in production. WSL is the first step: establishing that your local development happens in a Unix environment, not Windows.

So -- when you are working on a project, in most cases you'll live on the WSL side of the fence through VS Code. Don't be intimidated. You can do it!

## Installing Remote - WSL

### Step 1: Install the Extension

Open VS Code and install **Remote - WSL** (by Microsoft):

1. Press **Ctrl+Shift+X** to open Extensions
2. Search for "Remote - WSL"
3. Click the first result (official Microsoft extension)
4. Click **Install**

That's it. The extension will install in seconds.

### Step 2: Verify Installation

Look at the bottom-left corner of VS Code. You should see a green button or icon indicating the remote connection status. If you see "WSL" or a green icon, the extension is active.

## Opening a WSL Project Folder

### Method 1: Open Folder from WSL

This is the most reliable way:

1. Open Windows Terminal and launch bash (which opens WSL)
2. Navigate to your project folder:
   ```bash
   cd ~/projects/my-project
   ```
   Or create a new one:
   ```bash
   mkdir -p ~/projects/my-project
   cd ~/projects/my-project
   ```

3. Open VS Code from that directory:
   ```bash
   code .
   ```

VS Code will launch and automatically detect WSL. You'll see "WSL" in the bottom-left corner, confirming you're connected.

### Method 2: Open Folder via VS Code UI

1. Open VS Code
2. Click **File → Open Folder**
3. Navigate to `\\wsl$\Ubuntu\home\your-username\` (your WSL home)
4. Select your project folder
5. Click **Select Folder**

VS Code will connect to WSL automatically.

### Method 3: Use the Remote Connection Button

1. Open VS Code
2. Click the green icon or button in the bottom-left corner
3. Select **"Open Folder in WSL"** or **"Connect to WSL"**
4. Select your project folder when prompted

## Working Inside WSL

Once VS Code is connected to WSL, everything works in the Linux environment:

### File Explorer
Your file explorer shows your WSL filesystem, not Windows:
- `/home/username/` is your home directory
- `/home/username/projects/` is where you keep projects
- Paths use `/` not `\`

### Terminal
When you open a terminal in VS Code (Ctrl+`), it opens **bash in WSL**, not PowerShell in Windows. This is perfect because all your tools (npm, git, node) are already here.

### File Permissions
Files are created with proper Linux permissions. No more permission issues when switching between editors.

## Verifying Your Environment

Open the terminal in VS Code (Ctrl+`) and verify you're in WSL:

```bash
echo $SHELL
```

Should show `/bin/bash` or `/bin/zsh`.

Check your location:

```bash
pwd
```

Should show `/home/username/...`, not `C:\Users\...`.

## Common Issues

### VS Code Doesn't Show WSL Option

Make sure:
1. You've installed the **Remote - WSL** extension
2. You have WSL installed (run `wsl --version` in Windows Terminal)
3. You have a Linux distribution installed (like Ubuntu)
4. You've restarted VS Code after installing the extension

### Can't Find Your Project Folder

Use `\\wsl$\Ubuntu\` in the File → Open Folder dialog:
1. Click **File → Open Folder**
2. Type `\\wsl$\Ubuntu\` in the address bar
3. Press Enter
4. Navigate to `/home/your-username/`
5. Select your project

### Terminal Shows PowerShell Instead of Bash

Your VS Code terminal might still default to PowerShell. Change it:

1. Press **Ctrl+,** to open Settings
2. Search "terminal default profile"
3. Find **Terminal › Integrated: Default Profile: Windows**
4. Change to **bash** or **Ubuntu (WSL)**

### Files Show as Modified Even Though You Didn't Change Them

This usually happens when you edit files from both Windows and WSL. To avoid it:
- Always edit files **inside VS Code connected to WSL**
- Don't edit the same files from Windows and WSL simultaneously
- Use VS Code's WSL connection exclusively for development

## Best Practice: Organize Your Projects in WSL

Create a dedicated projects directory in WSL and keep all your work there. You should do this directly via Bash in the terminal:

```bash
mkdir -p ~/projects/my-project
cd ~/projects/my-project
code .
```

Then always use `code .` from WSL to open projects in VS Code. This ensures VS Code always knows it's in WSL and everything stays in one environment.

## What About Windows Files?

If you absolutely need to access Windows files (like Downloads), you can. They're mounted at `/mnt/c/`:

```bash
cd /mnt/c/Users/YourUsername/Downloads
```

But for development, keep projects in your WSL home directory. Performance and permissions are better there.

![The Shared Filesystem (Generated with Claude Design)](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779767818/pawper.dev/logs/Screenshot_2026-05-25_205638_rqywgk.png)

---

> **Sources / additional material:**
>
> https://code.visualstudio.com/docs/remote/remote-overview
>
> https://code.visualstudio.com/docs/remote/wsl
>
> https://code.visualstudio.com/docs/remote/wsl-tutorial

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
