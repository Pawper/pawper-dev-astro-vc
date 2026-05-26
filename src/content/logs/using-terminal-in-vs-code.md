---
title: "Using the Terminal in VS Code"
devto: "https://dev.to/pawper/using-the-terminal-in-vs-code-1f3g"
devto: ""
devto: ""
date: "2026.05.25"
kicker: "Tutorial"
tags: ["Terminal", "vscode", "Bash", "Mentoring"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1779771516/pawper.dev/logs/ChatGPT_Image_May_25_2026_09_51_12_PM_muxefy.png"
hook: "The integrated terminal in VS Code is where you'll spend half your development time. Learn how to set it up, customize it, use shells effectively, and work faster with keyboard shortcuts..."
series:
  name: "Foundations of Digital Agency"
  part: 5
  total: 6
---

VS Code is technically an editor, not a full IDE (Integrated Development Environment). Unlike IDEs like Visual Studio or JetBrains products that bundle everything together, VS Code starts minimal and lets you add what you need. But here's where it gets interesting: features like the integrated [terminal](https://pawper.dev/l/operating-systems-terminals-shells#what-is-a-terminal), source control integration, debugging, and extensions blur that line significantly. By integrating tools into VS Code—especially the terminal—you're not adding bloat; you're building a customized developer experience tailored to your workflow.

This is the power of VS Code: you control what you integrate. In this tutorial, you'll learn to use the integrated terminal to run commands, build projects, commit code, and debug applications—turning VS Code into an environment that feels more like an IDE without the overhead. As covered in [Part 1 of this series](https://pawper.dev/l/operating-systems-terminals-shells), understanding terminals and how they integrate into your workflow is foundational. Here, we'll make that integration practical.

## Why Use the Terminal in VS Code?

### Problem: Switching Between Windows

Without an integrated terminal, you're constantly:
1. Writing code in VS Code
2. Switching to Terminal to run commands
3. Switching back to VS Code to see the results
4. Repeating this loop hundreds of times per day

Context switching is awful for you. It's important that your developer experience is conducive to flow.

### Solution: Integrated Terminal

VS Code's integrated terminal runs **inside your editor**. You can:
- Run commands without leaving VS Code
- See your code and terminal output at the same time
- Execute build commands, run tests, and start development servers with a few keystrokes
- Use the same terminal window for your entire development session

## What Shell Should You Use?

The integrated terminal in VS Code can run any shell installed on your system. Your choice depends on your operating system and setup:

### On Windows
Use **bash** (from Ubuntu through WSL). This gives you a Unix-based development environment that matches your production servers and aligns with most tutorials. If you haven't already, [install WSL](http://pawper.dev/l/installing-wsl-windows-subsystem-linux) and [configure VS Code to use it](http://pawper.dev/l/using-vs-code-with-wsl).

From here on we'll assume you're using Windows & VS Code with the Bash [shell](http://pawper.dev/l/operating-systems-terminals-shells#what-is-a-shell) from WSL in your VS Code integrated terminal.

### On macOS
Use **zsh** (default in modern macOS).

## Setting Up the Integrated Terminal

### Step 1: Open the Integrated Terminal

Open VS Code and press <kbd>Ctrl</kbd>+<kbd>`</kbd> (backtick, the key below <kbd>Esc</kbd>) to open the integrated terminal.

Alternatively, go to **View → Terminal** or right-click in the editor and select **"Open in Integrated Terminal"**.

The terminal will open at the bottom of your editor.

> **Windows Users: Ensure VS Code is remote connected with WSL**
> 
> By default on Windows, VS Code opens terminals in PowerShell. But if you [have VS Code configured for WSL](http://pawper.dev/l/using-vs-code-with-wsl), the terminal should open with the Ubuntu (WSL) or Bash shell. If it opens to PowerShell, [ensure VS Code is remote connected with WSL](http://localhost:4322/l/using-vs-code-with-wsl#opening-a-wsl-project-folder).

### Step 2: Create a New Terminal

Close your current terminal (click the X) and open a new one with <kbd>Ctrl</kbd>+<kbd>`</kbd>.

Verify by running:

```bash
echo $SHELL
```

You should see `/bin/bash` (WSL) or `/bin/zsh` (macOS).

## Using the Integrated Terminal

### Basic Workflow

Now that your terminal is set up, here's how you'll use it:

1. **Open a project folder**: File → Open Folder, then select your project directory
2. **Open the terminal**: <kbd>Ctrl</kbd>+<kbd>`</kbd>
3. **Run commands**: Type whatever you need (`npm install`, `git commit`, etc.)
4. **See output immediately**: Right above your code in the same window

### Multiple Terminals

You can open multiple terminal tabs within the integrated terminal:

- **New terminal**: Click the **+** button in the terminal panel, or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>`</kbd>
- **Switch between terminals**: Click the terminal name at the top, or use <kbd>Ctrl</kbd>+<kbd>PageUp</kbd>/<kbd>PageDown</kbd> to cycle through them
- **Split terminals**: Click the split icon (or right-click and select "Split Terminal") to run two terminals side-by-side

This is useful for:
- Running a development server in one terminal (`npm start`)
- Running tests in another (`npm test`)
- Having a third for git commands or other tasks

### Terminal Shortcuts

Learn these keyboard shortcuts to work faster:

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd>+<kbd>`</kbd> | Toggle terminal open/close |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>`</kbd> | Create new terminal |
| <kbd>Ctrl</kbd>+<kbd>PageUp</kbd> | Previous terminal |
| <kbd>Ctrl</kbd>+<kbd>PageDown</kbd> | Next terminal |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> | Copy selected text |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | Paste |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>W</kbd> | Close terminal |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Home</kbd> | Clear terminal (or `clear` command) |

## Customizing Your Terminal

### Change Terminal Font Size

In Settings (<kbd>Ctrl</kbd>+<kbd>,</kbd>), search "terminal font size":

```json
"terminal.integrated.fontSize": 14
```

### Change Terminal Font Family

```json
"terminal.integrated.fontFamily": "Cascadia Code"
```

Popular options:
- **Cascadia Code** (Microsoft's modern monospace font)
- **Fira Code** (elegant, with ligatures)
- **JetBrains Mono** (developer-focused)
- **Consolas** (Windows built-in, simple)

### Change Terminal Appearance

```json
"terminal.integrated.colorScheme": "One Dark Pro",
"terminal.integrated.lineHeight": 1.5
```

## Troubleshooting

### "bash: command not found"

If bash isn't in your PATH, you need to specify the full path. In VS Code settings:

```json
"terminal.integrated.defaultProfile.windows": "bash",
"terminal.integrated.profiles.windows": {
  "bash": {
    "path": "C:\\Windows\\System32\\bash.exe"
  }
}
```

Or simply use `Ubuntu (WSL)` as your default profile instead.

### Terminal Opens in Wrong Directory

By default, the integrated terminal opens in your project root (where you opened the folder). If it opens elsewhere, you can force it:

```json
"terminal.integrated.cwd": "${workspaceFolder}"
```

### Terminal Text is Too Small or Too Large

Adjust in Settings (<kbd>Ctrl</kbd>+<kbd>,</kbd>):

```json
"terminal.integrated.fontSize": 14
```

Try sizes between 12-18 depending on your monitor.

---

> **Sources / additional material:**
>
> https://code.visualstudio.com/docs/editor/integrated-terminal
>
> https://code.visualstudio.com/docs/editor/command-line
>
> https://github.com/microsoft/vscode/wiki/Terminal-Profiles

_This article was generated with AI for the purpose of providing practical information. I have reviewed it and edited it appropriately._
