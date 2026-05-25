---
title: "Editors, IDEs & Installing VS Code"
date: "2022.02.04"
kicker: "Tutorial"
tags: ["Git", "JavaScript", "DX", "Mentoring"]
hook: "Everything you need to know to get started with VS Code: useful context to the world's most popular..."
devto: "https://dev.to/pawper/faq-editors-ides-vs-code-3fp0"
series:
  name: "Foundations of Digital Agency"
  part: 2
  total: 2
noThumb:
  - https://code.visualstudio.com/docs
  - https://code.visualstudio.com/docs/editor/whyvscode
  - https://code.visualstudio.com/docs/getstarted/userinterface
  - https://code.visualstudio.com/docs/editor/codebasics
  - https://code.visualstudio.com/docs/editor/extension-marketplace
  - https://code.visualstudio.com/docs/setup/windows
  - https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons
  - https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense
  - https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
  - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
  - https://marketplace.visualstudio.com/items?itemName=GitHub.copilot

---

Everything you need to know to get started with VS Code: useful context to the world's most popular code editor, a simple install guide, and some useful keyboard shortcuts.

## What's a code editor?
At its most basic level, a code editor could be a text editor such as Notepad. While it is possible to use such an application, there are dedicated applications for writing code with features such as syntax highlighting. Visual Studio Code (VS Code) is one of them, but you may also encounter others such as Notepad++, Sublime, and Zed. Many editors are extensible.

## What's an Integrated Development Environment (IDE)?
An IDE is an application that comes with a comprehensive set of features for software development, including a code editor. Standalone editors are distinct from full IDEs, but the distinction is blurred once an editor is sufficiently extended.

## What's the difference between Visual Studio Code and Visual Studio IDE?
Visual Studio Code is a code editor for a quick code-build-debug cycle with debugging, task running, and version control. Visual Studio IDE is for more complex workflows. While VS Code is free, Visual Studio IDE is premium software.

## Why use VS Code?
VS Code is the most popular editor and has many features, including syntax highlighting, IntelliSense code completion, snippets, an integrated terminal, git support out of the box, and the ability to install extensions.

> Sources / additional material:
> The official VS Code documentation: 
> https://code.visualstudio.com/docs 
> https://code.visualstudio.com/docs/editor/whyvscode
> https://code.visualstudio.com/docs/getstarted/userinterface 
> https://code.visualstudio.com/docs/editor/codebasics 

---

## 💻 Set Up VS Code
1. Download the Visual Studio Code installer. https://code.visualstudio.com/download
   * The Insiders edition is a nightly build with the latest features, but it is not a stable release and you may encounter issues. That said, you can have both versions installed. https://code.visualstudio.com/insiders/ 
1. Once it is downloaded, run the installer. This will only take a minute.

> Sources / additional material:
> https://code.visualstudio.com/docs/setup/setup-overview 

---

## Extensions
Extensions are key to the VS Code developer experience. You absolutely should explore extensions; often times you will do so to find the best & laziest way to do things. Extensions help make development more accessible. We'll be installing some extensions in this series.

> Sources / additional material:
> https://code.visualstudio.com/docs/editor/extension-marketplace 

---

## Settings
VS Code's settings are stored in `settings.json`. You can access this by opening the command palette and entering "Preferences: Open Settings (JSON)". `.json` files are in JSON - JavaScript Object Notation. This means settings have to be entered in a specific way.
1. The entire settings object is in a single pair of curly brackets (`{}`).
1. Keys - the names of different settings - need to be in quotation marks. E.g., `"editor.tabSize"`.
1. Values can be strings (in quotation marks), numbers (without quotation marks), boolean (`true`/`false`), arrays (comma-separated elements in square brackets `[]`), or objects (comma-separated key: value pairs in curly brackets `{}`). It's out of our scope here to cover data types, but you can be mindful of the indicated syntax.

Here are some settings that I recommend:
1. Set the default tab size to 2 spaces. I find that a minimal tab size makes it easier to share blocks of code.
1. Set the word wrap as on by default. I don't like scrolling left & right to read a long line of code.

```json
{
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
}
```
You can create settings specific to a certain project as well. Just create a `.vscode` directory at the top level, and inside it create a `settings.json` file. Any specific settings here will override those settings within VS Code's main settings.json.

![JavaScript React Language Mode](https://res.cloudinary.com/dr1sonbsi/image/upload/v1779696818/pawper.dev/logs/rjor2xf2ui82ffch7m98_qmyqo2.png)

Here you can see that since this is a React project, I am setting all JavaScript files (`.js`) to be associated with the JavaScript React language mode (`"javascriptreact"`). The icons update as well to the React icon.
 
> Sources / additional material:
> https://code.visualstudio.com/docs/configure/settings

---

## 📜Key Bindings: VS Code

| Shortcut | Action |
|---|---|
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> | Show Command Palette |
| <kbd>Ctrl</kbd>+<kbd>P</kbd> | Quick Open, Go to File |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> | Open Extensions panel |
| <kbd>Ctrl</kbd>+<kbd>`</kbd> | Show Integrated Terminal |
| <kbd>Alt</kbd>+<kbd>Click</kbd> | Insert additional cursors |

## 📜Key Bindings: Navigating & Selecting Text

| Shortcut | Action |
|---|---|
| <kbd>Ctrl</kbd>+<kbd>→</kbd> | Move the cursor one word to the right |
| <kbd>Ctrl</kbd>+<kbd>←</kbd> | Move the cursor one word to the left |
| <kbd>Shift</kbd>+<kbd>→</kbd> | Select text to the right |
| <kbd>Shift</kbd>+<kbd>←</kbd> | Select text to the left |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>→</kbd> | Select the word to the right |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>←</kbd> | Select the word to the left |
| <kbd>Shift</kbd>+<kbd>Home</kbd> | Select to the beginning of the current line |
| <kbd>Shift</kbd>+<kbd>End</kbd> | Select to the end of the current line |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Home</kbd> | Select to the beginning of the document |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>End</kbd> | Select to the end of the document |
| <kbd>Ctrl</kbd>+<kbd>A</kbd> | Select all document content |

> Sources / additional material:
> https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
> https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf
> https://code.visualstudio.com/docs/configure/keybindings