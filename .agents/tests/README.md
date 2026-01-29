# Agent-Browser Testing for KidCreatives AI

This directory contains automated browser tests using Vercel's agent-browser CLI tool.

## Prerequisites

1. **agent-browser installed**: Already installed (v0.8.4)
2. **Dev server running**: `npm run dev` in kidcreatives-ai directory
3. **Bash shell**: Linux/macOS or WSL on Windows

## Available Tests

### 1. Basic Phase 1 Test (`test-phase1-basic.sh`)

**Purpose**: Verify Phase 1 (Handshake) loads correctly

**What it does**:
- Opens the application
- Takes screenshots
- Captures interactive element snapshots
- Verifies Phase 1 renders
- Checks for Sparky component

**Run**:
```bash
cd .agents/tests
./test-phase1-basic.sh
```

**Output**:
- `test-screenshots/01-phase1-initial.png` - Initial page load
- `test-screenshots/01-initial-snapshot.txt` - Accessibility tree
- `test-screenshots/02-phase1-elements.txt` - Interactive elements with refs

---

### 2. UI Elements Test (`test-ui-elements.sh`)

**Purpose**: Analyze and verify UI elements are present

**What it does**:
- Opens application
- Detects all interactive elements (buttons, inputs, textareas)
- Generates element refs (@e1, @e2, etc.) for automation
- Takes before/after screenshots
- Counts UI components

**Run**:
```bash
cd .agents/tests
./test-ui-elements.sh
```

**Output**:
- `test-screenshots/01-initial.png` - Initial state
- `test-screenshots/02-analyzed.png` - After analysis
- `test-screenshots/interactive-elements.txt` - Element refs for automation

---

## How agent-browser Works

### 1. Element References (Refs)

agent-browser generates refs like `@e1`, `@e2` for interactive elements:

```bash
# Get interactive elements with refs
agent-browser snapshot -i

# Output example:
# button "Analyze" [ref=e1]
# textbox "Intent" [ref=e2]
# button "Upload" [ref=e3]

# Use refs to interact
agent-browser click @e1
agent-browser fill @e2 "A robot doing a backflip"
```

### 2. Common Commands

```bash
# Navigation
agent-browser open http://localhost:5174
agent-browser back
agent-browser reload

# Interaction
agent-browser click @e1              # Click element by ref
agent-browser fill @e2 "text"        # Fill input
agent-browser type @e2 "text"        # Type without clearing
agent-browser press Enter            # Press key
agent-browser upload @e1 image.png   # Upload file

# Information
agent-browser get text @e1           # Get element text
agent-browser get count "button"     # Count elements
agent-browser get title              # Page title
agent-browser get url                # Current URL

# Waiting
agent-browser wait @e1               # Wait for element
agent-browser wait 2000              # Wait milliseconds
agent-browser wait --text "Success"  # Wait for text

# Screenshots
agent-browser screenshot output.png
agent-browser screenshot --full      # Full page

# Snapshots (for AI)
agent-browser snapshot               # Full accessibility tree
agent-browser snapshot -i            # Interactive elements only
agent-browser snapshot -c            # Compact output
```

### 3. Sessions

Use sessions to isolate tests:

```bash
# Start session
agent-browser --session test1 open http://localhost:5174

# Continue in same session
agent-browser --session test1 click @e1

# Close session
agent-browser --session test1 close
```

---

## Creating New Tests

### Template for New Test Script

```bash
#!/bin/bash
set -e

SESSION_NAME="my-test-$(date +%s)"
APP_URL="http://localhost:5174"

# Open app
agent-browser --session "$SESSION_NAME" open "$APP_URL"
sleep 2

# Get interactive elements
agent-browser --session "$SESSION_NAME" snapshot -i > elements.txt

# Find refs in output
# Example: button "Analyze" [ref=e1]

# Interact with elements
agent-browser --session "$SESSION_NAME" click @e1
agent-browser --session "$SESSION_NAME" fill @e2 "test input"

# Take screenshot
agent-browser --session "$SESSION_NAME" screenshot result.png

# Close
agent-browser --session "$SESSION_NAME" close
```

---

## Testing Phase 1-3 Workflow (Manual Steps)

Since Phase 1 requires file upload (which needs actual files), here's how to test manually with agent-browser:

### Step 1: Prepare Test Image

```bash
# Create a simple test image or use existing
cp /path/to/test-image.png .agents/tests/test-robot.png
```

### Step 2: Run Interactive Test

```bash
# Open app
agent-browser --session test open http://localhost:5174

# Get interactive elements
agent-browser --session test snapshot -i

# Look for upload button ref (e.g., @e1)
# Upload image
agent-browser --session test upload @e1 test-robot.png

# Fill intent (find textarea ref, e.g., @e2)
agent-browser --session test fill @e2 "A robot doing a backflip"

# Click analyze button (find button ref, e.g., @e3)
agent-browser --session test click @e3

# Wait for Phase 2
agent-browser --session test wait --text "Let's build" --timeout 10000

# Take screenshot
agent-browser --session test screenshot phase2-loaded.png

# Continue with Phase 2 questions...
```

---

## Troubleshooting

### Dev Server Not Running

```bash
# Start dev server first
cd kidcreatives-ai
npm run dev

# Then run tests
cd ../.agents/tests
./test-phase1-basic.sh
```

### Port Changed

If dev server uses different port (e.g., 5173 instead of 5174):

```bash
# Edit test script
# Change: APP_URL="http://localhost:5174"
# To:     APP_URL="http://localhost:5173"
```

### Browser Not Installed

```bash
# Install Chromium
agent-browser install
```

### Permission Denied

```bash
# Make scripts executable
chmod +x .agents/tests/*.sh
```

---

## Next Steps

1. **Run basic tests** to verify setup works
2. **Review screenshots** to confirm UI renders correctly
3. **Check element refs** in snapshot files
4. **Create Phase 2-3 tests** using refs for automation
5. **Add to CI/CD** for automated testing

---

## Integration with Kiro CLI

agent-browser is configured as a steering-based tool in `.kiro/steering/agent-browser.md`.

You can ask Kiro to:
- "Use agent-browser to test Phase 1"
- "Create a test script for the complete workflow"
- "Verify the UI elements are present"

Kiro will execute agent-browser commands via bash tool.

---

## Resources

- [agent-browser GitHub](https://github.com/vercel-labs/agent-browser)
- [Steering File](../../.kiro/steering/agent-browser.md)
- [Testing Standards](../../.kiro/steering/testing-standards.md)
