# Screenshot Instructions for Desktop View (When User is on Mobile)

## Overview
When the user is on mobile and needs to see the desktop view of their website, use browser automation to capture and send screenshots from the Chrome instance running on their PC.

## Prerequisites
- Have Chrome tab open with the Cloudflare tunnel URL or local development URL
- User is on mobile and cannot see desktop view themselves
- Need visual confirmation of changes made to the site

## Steps to Take & Send Screenshots

### 1. Navigate to the Correct Page
```javascript
// Use the navigate function to go to the desired page
navigate(url, tabId)

// Example: for contact page
https://offset-cigarettes-naples-endless.trycloudflare.com/contact
```

### 2. Wait for Page to Load
```javascript
// Always wait after navigation or refresh to ensure page is fully loaded
computer.wait(tabId, 3) // Wait 3 seconds for full render
```

### 3. Take Screenshot with save_to_disk Flag
```javascript
computer.screenshot(tabId, save_to_disk: true)
```

**Key details:**
- Always set `save_to_disk: true` - this ensures the screenshot is saved to a local path
- The tool will return a path like: `C:\Users\Phillip\AppData\Roaming\Claude\...\outputs\screenshot-[timestamp].jpg`
- Screenshot ID is returned (e.g., `ss_5657r722j`) but **don't use the ID** - use the file path instead

### 4. Send Screenshot to User
Use `SendUserMessage` with the `attachments` array:

```javascript
SendUserMessage({
  message: "Description of what the screenshot shows:",
  attachments: ["C:\\Users\\Phillip\\AppData\\Roaming\\Claude\\..\\outputs\\screenshot-[timestamp].jpg"],
  status: "normal"
})
```

## Common Workflow (Refresh & Screenshot)

When making code changes and need to verify visually:

```javascript
// Option 1: Use browser_batch for speed (preferred)
browser_batch({
  actions: [
    {name: "computer", input: {action: "key", tabId: 1581907174, text: "F5"}},
    {name: "computer", input: {action: "wait", tabId: 1581907174, duration: 2}},
    {name: "computer", input: {action: "screenshot", tabId: 1581907174, save_to_disk: true}}
  ]
})

// Option 2: Sequential calls
computer.key(tabId, "F5")           // F5 to refresh
computer.wait(tabId, 2)             // Wait for load
computer.screenshot(tabId, true)    // Save screenshot
```

## Important Notes

### Page Redirects
- After F5 refresh, the page may redirect to home page instead of staying on current page
- If this happens, navigate back to the desired URL before taking screenshot
- Example: After refresh redirects to `/?v=entry&cat=contact&entry=all`, navigate back to `/contact`

### Wait Duration
- Minimum 2-3 seconds after navigation/refresh before taking screenshot
- Use 3 seconds for safer results, especially on tunneled URLs
- Cloudflare tunnels may have slight latency

### File Path Handling
- Always use the full path returned by screenshot function
- Path format: `C:\Users\Phillip\AppData\Roaming\Claude\local-agent-mode-sessions\...\outputs\screenshot-[timestamp].jpg`
- The `...\` represents the full session path structure
- Backslashes in path strings should be escaped: `\\` in JSON strings

### Attachment Array
- Must use double backslashes in JSON: `"C:\\Users\\Phillip\\..."`
- Use `save_to_disk: true` to get the path - without it, only an ID is returned
- Pass the actual file path to `attachments` array, not the screenshot ID

## Example Complete Workflow

```javascript
// 1. Make code changes
Edit({file_path: "...", old_string: "...", new_string: "..."})

// 2. Take screenshot to verify
browser_batch({
  actions: [
    {name: "computer", input: {action: "key", tabId: 1581907174, text: "F5"}},
    {name: "computer", input: {action: "wait", tabId: 1581907174, duration: 3}},
    {name: "computer", input: {action: "screenshot", tabId: 1581907174, save_to_disk: true}}
  ]
})

// 3. Handle redirect (if needed)
navigate("https://offset-cigarettes-naples-endless.trycloudflare.com/contact", tabId)
computer.wait(tabId, 3)
computer.screenshot(tabId, save_to_disk: true)

// 4. Send to user
SendUserMessage({
  message: "Updated screenshot showing [description]:",
  attachments: ["C:\\Users\\Phillip\\...\\screenshot-1780169588608.jpg"],
  status: "normal"
})
```

## Tips for Efficiency

- Use `browser_batch` to combine multiple actions into one call
- This is faster than sequential individual calls
- Batch up to 3 actions together (navigate/key/wait/screenshot)
- Always wait 2-3 seconds after navigation before screenshotting

## Troubleshooting

**Screenshot returns empty/dark screen:**
- Page hasn't finished loading - increase wait duration to 3+ seconds
- Try navigating to the URL again after the blank screenshot

**Can't find screenshot file path:**
- Make sure `save_to_disk: true` was set
- Without it, only screenshot ID is returned, not a file path
- The ID (e.g., `ss_5657r722j`) cannot be used directly in attachments

**Attachment not showing to user:**
- Double-check the file path has double backslashes in JSON: `C:\\Users\\...`
- Ensure the path is correct and complete
- The file must have been saved with `save_to_disk: true`
