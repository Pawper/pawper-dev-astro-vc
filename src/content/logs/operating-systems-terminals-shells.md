---
title: "Operating Systems, Terminals & Shells"
date: "2022.02.02"
kicker: "Tutorial"
tags: ["Terminal", "PowerShell", "Bash", "WSL", "Mentoring"]
image: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1779690568/pawper.dev/logs/3178c9eb-9890-4b2f-9ab6-a5801b64761f_wrlk2d.png"
hook: "Before you build anything, understand what's underneath: operating systems, the command line, and why Windows/Mac/Linux are different (and the same). This foundation matters."
devto: "https://dev.to/pawper/intro-to-operating-systems-terminals-shells-faq-4agm"
series:
  name: "Foundations of Digital Agency"
  part: 1
  total: 2
---

Welcome to **Foundations of Digital Agency**—a series built for anyone who wants to seize the tools and technology reshaping opportunity. You don't need permission. You don't need a computer science degree. You just need a cogntivie foundation and some scaffolding assembled from simple ideas. Once you have that sense of structure in mind, you can frame technology within it, move through it and build on top of it. Sound complicated? Language is magic. Once you start reading and applying it, the pieces -- mental models -- fall into place.

This tutorial starts that process. You'll learn why operating systems matter, what terminals and shells are, and why a Windows developer and a Mac developer can follow the same instructions without confusion. These concepts aren't optional—they're the vocabulary you need to navigate, troubleshoot, and build confidently.

So, get excited: this knowledge removes barriers. Once you understand these fundamentals, everything that comes next makes sense. You're not intimidated by strange commands or mysterious jargon. You recognize the patterns. You truly own the technology. That's agency.

Let's get started.

## What is UNIX? 
  UNIX is the ancestor of many modern operating systems (OSs), like macOS and Linux. In 1969 at Bell Laboraties, Ken Thompson starting developing UNIX OS in PDP-7 computer assembly language. Dennis Ritchie joined Thompson and invented the C programming language. Then they rewrote UNIX in C, allowing different computers to run the code. UNIX also included user management and hierarchical file systems. Bell Labs released the first version of UNIX, Version 6 (V6), in 1976. Its design philosophy emphasizes small modular programs that can be used in combination for complex tasks:
  * Write programs that do one thing and do it well.
  * Write programs to work together.
  * Write programs to handle text streams, because that is a universal interface.

## What is Linux?
  The open-source GNU/Linux (commonly referred to as Linux) is the most famous Unix-like operating system (OS). Released in 1993, it spawned from the Free Software movement of the 1980s. Richard Stallman started the GNU Project of free software which needed a kernel. Fortunately, Linus Torvalds released the Linux kernel in 1991, which the GNU Project was able to combine with for a full OS that was released in 1993. Countless distributions have derived from GNU/Linux.

## Why aren't all Unix-like operating systems called UNIX? Why do macOS and Linux use the same commands?
  The UNIX brand is trademarked and "True UNIX" operating systems like macOS paid to be certified by The Open Group. While not officially UNIX, Unix-like OSs like Linux do fully or mostly meet the UNIX specification but are not certified; therefore, they do not use the UNIX name. The command line works the same, whether True UNIX or Unix-like. While not officially licensed, Unix-like OSs like Linux are designed to meet the UNIX specification.

## What is the history of the modern Windows OS?
Windows NT, upon which the modern Windows and Xbox OSs derive from, started in 1977 with Digital Equipment's release of VMS 1.0 (one year after the release of the first version of UNIX). Many of the developers left Digital in 1988 to join Microsoft, which released Windows NT 3.1 in 1993 (the same year as the release of GNU/Linux).

## How do Windows and UNIX-based OSs differ?
Both Windows NT and UNIX have roots in the mid-1970s and both were influenced by many identical theoretical OS concepts and principles. However, Windows and UNIX-based systems have different kernels engaging the hardware with different software built on top of those kernels, all based on different specifications. The software differs in many ways.

## What is Windows Subsystem for Linux (WSL)?
Windows Subsystem for Linux lets developers run a GNU/Linux environment—including most command-line tools, utilities, and applications—directly on Windows, unmodified, without the overhead of a traditional virtual machine or dualboot setup. WSL 2 introduced an entirely new architecture that benefits from running a real Linux kernel. It runs in a lightweight virtual machine environment through a subset of Microsoft's Hyper-V features.

![OS Lineage (Generated with Claude Design)](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779689030/pawper.dev/logs/ChatGPT_Image_May_24_2026_02_24_26_PM_woinhd.png)

## On Windows, why not use a virtual machine (VM) for Linux?
You can, but WSL requires fewer resources (CPU, memory, and storage) than a full VM. You can't easily work between the VM and Windows software.

## What is a terminal?
A terminal is a program that runs a shell. There are many terminal applications, one being the Windows Terminal, another the integrated terminal in VS Code.

## What is a shell?
A shell is an interpreter for command line language. Common shells include Bash and Zsh for UNIX-based operating systems, and PowerShell for Windows. Note: You cannot run UNIX-based commands through PowerShell, but there are many aliases matching UNIX-based commands which map to PowerShell cmdlets (that just means you kind of can... kind of).

## What is a CLI?
A CLI is a **Command Line Interface**—any interface where you interact with a computer using text commands instead of clicking buttons. The terminal is the application; the shell is the interpreter; but CLI is the broader concept: communicating with software by typing commands. When you use Bash, PowerShell, or Zsh, you're using a CLI. When you run `npm install` or `git commit`, you're using a CLI. CLIs are powerful because they let you express complex instructions precisely and automate tasks through scripts. Many development tools—especially agentic AI tools like Claude Code—live entirely in the CLI.

![Anatomy of the Command Line (Generated with Claude Design)](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779688440/pawper.dev/logs/Screenshot_2026-05-24_225335_ro0q4w.png)

## Are Bash and PowerShell just shells?
The same names are used to refer to the shells' scripting languages as well.

## Why are Bash and PowerShell both useful?
Bash is the scripting language of the Bash shell and its various packages, while PowerShell adds advanced efficiency as an object-oriented scripting language.

## What is Zsh?
Zsh (Z shell) is a Unix shell that is largely compatible with Bash but adds many improvements such as better tab completion, spelling correction, and a richer plugin ecosystem. Since macOS Catalina (2019), Zsh has been the default shell on macOS, replacing Bash. On macOS you may see the prompt message "The default interactive shell is now zsh" — this is expected. Most Bash scripts and commands work in Zsh without modification.

## What is PowerShell 7?
PowerShell 7 is the current cross-platform (Windows, Linux, and macOS), open-source version of PowerShell. It is the successor to both Windows PowerShell (which remains at version 5.1 and is built into Windows) and PowerShell Core (versions 6.x, a transitional release). PowerShell 7 is what you should install if you want to use PowerShell on macOS or Linux, or want the latest features on Windows.

![Bash • Zsh • PowerShell (Generated with Claude Design)](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779688665/pawper.dev/logs/Screenshot_2026-05-24_225731_mmhhb4.png)

---

## You Now Have the Foundation

You understand operating systems. You know terminals and shells. You recognize that macOS and Linux speak the same language—UNIX—while Windows is fundamentally different, but that tools like WSL let you bridge that gap. You're not confused by terminology anymore.

This knowledge is power. In the next tutorials in this series, you'll further grow it, and start using the tools of the trade:

- **Editors, IDEs & Installing VS Code** — Understanding your tools and setting up your editor
- **Installing Terminal & WSL** — Setting up a development environment on Windows\
  (Windows only; macOS users skip this)
- **Using VS Code with WSL** — Configuring your editor for development\
  (Windows only; macOS users skip this)
- **Using the Terminal in VS Code** — Mastering the command line where your work happens\
  (all platforms going forward)
- And more, building toward full capability

**Note:** If you're on macOS, you already have a Unix-based terminal (bash/zsh) built in. You'll skip the Windows-specific setup articles and move straight to using the editor and terminal.

**Why This Matters for AI-Assisted Development:** Comfort with the terminal and command line is a **prerequisite** for using agentic AI tools like [Claude Code](https://www.anthropic.com/product/claude-code) and [OpenClaw](https://github.com/openclaw/openclaw). These tools live in your terminal see your codebase, edit files, run commands, and handle version control—but they're not perfect, and you'll need to understand the fundamentals of CLIs.

With each step you'll grow the understanding to navigate confidently, make informed decisions, and see the world opportunistically -- through the eyes of someone who possesses the technology.

![Mind = blown](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779659070/pawper.dev/logs/blow-mind-mind-blown_pawb4a.gif)

> Sources / additional material:
> https://web.archive.org/web/20240226110454/https://www.itprotoday.com/windows-78/nt-vsunix-one-substantially-better#close-modal
> https://docs.microsoft.com/en-us/windows/wsl/about
> https://www.udemy.com/course/the-linux-command-line-bootcamp/

_This article was revised & expanded with AI for the purpose of providing practical information. I have reviewed it for accuracy and edited it appropriately._