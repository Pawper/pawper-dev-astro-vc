---
title: "FAQ: Operating Systems, Terminals & Shells"
date: "2022.02.02"
kicker: "Tutorial"
tags: ["Git", "PowerShell", "Bash", "Mentoring"]
hook: "Hello! This is the first in a series of FAQ posts for beginner web developers. I hope this format is..."
devto: "https://dev.to/pawper/intro-to-operating-systems-terminals-shells-faq-4agm"
series:
  name: "Foundations of Digital Agency"
  part: 1
  total: 2
---

Hello! This is the first in a series of FAQ posts for beginner web developers. I hope this format is helpful!

## What is UNIX? 
  UNIX is the ancestor of many modern operating systems (OSs). In 1969 at Bell Laboraties, Ken Thompson starting developing UNIX OS in PDP-7 computer assembly language. Dennis Ritchie joined Thompson and invented the C programming language. Then they rewrote UNIX in C, allowing different computers to run the code. UNIX also included user management and hierarchical file systems. Bell Labs released the first version of UNIX, Version 6 (V6), in 1976. Its design philosophy emphasizes small modular programs that can be used in combination for complex tasks:
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

## On Windows, why not use a virtual machine (VM) for Linux?
You can, but WSL requires fewer resources (CPU, memory, and storage) than a full VM. You can't easily work between the VM and Windows software.

## What is a terminal?
A terminal is a program that runs a shell. There are many terminal applications, one being the Windows Terminal, another the integrated terminal in VS Code.

## What is a shell?
A shell is an interpreter for command line language. Common shells include Bash and Zsh for UNIX-based operating systems, and PowerShell for Windows. Note: You cannot run UNIX-based commands through PowerShell, but there are many aliases matching UNIX-based commands which map to PowerShell cmdlets.

## Are Bash and PowerShell just shells?
The same names are used to refer to the shells' scripting languages as well.

## Why are Bash and PowerShell both useful?
Bash is the scripting language of the Bash shell and its various packages, while PowerShell adds advanced efficiency as an object-oriented scripting language.

## What is Zsh?
Zsh (Z shell) is a Unix shell that is largely compatible with Bash but adds many improvements such as better tab completion, spelling correction, and a richer plugin ecosystem. Since macOS Catalina (2019), Zsh has been the default shell on macOS, replacing Bash. On macOS you may see the prompt message "The default interactive shell is now zsh" — this is expected. Most Bash scripts and commands work in Zsh without modification.

## What is PowerShell 7?
PowerShell 7 is the current cross-platform (Windows, Linux, and macOS), open-source version of PowerShell. It is the successor to both Windows PowerShell (which remains at version 5.1 and is built into Windows) and PowerShell Core (versions 6.x, a transitional release). PowerShell 7 is what you should install if you want to use PowerShell on macOS or Linux, or want the latest features on Windows.

> Sources / additional material:
> https://www.itprotoday.com/windows-78/nt-vsunix-one-substantially-better 
> https://docs.microsoft.com/en-us/windows/wsl/about 
> https://www.udemy.com/course/the-linux-command-line-bootcamp/
