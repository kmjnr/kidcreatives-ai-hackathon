#!/bin/bash
# Advanced test for KidCreatives AI - Tests UI interactions
# Uses agent-browser snapshot refs for element interaction

set -e

echo "🧪 KidCreatives AI - Advanced UI Test"
echo "======================================"

APP_URL="http://localhost:5174"
SESSION_NAME="kidcreatives-advanced-$(date +%s)"
SCREENSHOT_DIR="./test-screenshots"

mkdir -p "$SCREENSHOT_DIR"

echo ""
echo "🔧 Session: $SESSION_NAME"
echo "📸 Screenshots: $SCREENSHOT_DIR"
echo ""

# Check server
if ! curl -s "$APP_URL" > /dev/null; then
    echo "❌ Dev server not running"
    exit 1
fi

echo "✅ Dev server running"
echo ""

# Open app
echo "🌐 Opening application..."
agent-browser --session "$SESSION_NAME" open "$APP_URL"
sleep 2

# Take initial screenshot
echo "📸 Initial state..."
agent-browser --session "$SESSION_NAME" screenshot "$SCREENSHOT_DIR/01-initial.png"

# Get interactive elements with refs
echo ""
echo "🔍 Analyzing interactive elements..."
agent-browser --session "$SESSION_NAME" snapshot -i > "$SCREENSHOT_DIR/interactive-elements.txt"

echo ""
echo "📋 Interactive Elements Found:"
echo "------------------------------"
grep -E "@e[0-9]+" "$SCREENSHOT_DIR/interactive-elements.txt" | head -20 || echo "No refs found"

echo ""
echo "🎯 Testing Element Detection:"
echo "-----------------------------"

# Check for specific UI elements
echo "→ Checking for buttons..."
BUTTON_COUNT=$(agent-browser --session "$SESSION_NAME" get count "button" 2>/dev/null || echo "0")
echo "  Found $BUTTON_COUNT button(s)"

echo "→ Checking for input fields..."
INPUT_COUNT=$(agent-browser --session "$SESSION_NAME" get count "input" 2>/dev/null || echo "0")
echo "  Found $INPUT_COUNT input field(s)"

echo "→ Checking for textareas..."
TEXTAREA_COUNT=$(agent-browser --session "$SESSION_NAME" get count "textarea" 2>/dev/null || echo "0")
echo "  Found $TEXTAREA_COUNT textarea(s)"

echo ""
echo "📊 Page Structure:"
echo "-----------------"
echo "  Title: $(agent-browser --session "$SESSION_NAME" get title)"
echo "  URL: $(agent-browser --session "$SESSION_NAME" get url)"

# Check for phase indicators
echo ""
echo "🔍 Checking for Phase indicators..."
agent-browser --session "$SESSION_NAME" wait --text "Phase" --timeout 3000 && echo "  ✅ Phase text found" || echo "  ⚠️  Phase text not found"

# Take final screenshot
echo ""
echo "📸 Final screenshot..."
agent-browser --session "$SESSION_NAME" screenshot "$SCREENSHOT_DIR/02-analyzed.png"

# Close
echo ""
echo "🧹 Closing browser..."
agent-browser --session "$SESSION_NAME" close

echo ""
echo "✨ Test Complete!"
echo ""
echo "📁 Artifacts saved:"
echo "   $SCREENSHOT_DIR/01-initial.png"
echo "   $SCREENSHOT_DIR/02-analyzed.png"
echo "   $SCREENSHOT_DIR/interactive-elements.txt"
echo ""
echo "💡 Next steps:"
echo "   1. Review screenshots to verify UI rendering"
echo "   2. Check interactive-elements.txt for element refs"
echo "   3. Use refs (@e1, @e2, etc.) for automated interactions"
echo ""
