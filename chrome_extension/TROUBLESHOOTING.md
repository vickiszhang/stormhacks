# 🚨 Chrome Extension Loading Issues - TROUBLESHOOTING

## Problem: "Load Unpacked" is Unresponsive or Hangs

### ✅ **Solution 1: Complete Chrome Reset** (Most Effective)

1. **Remove Extension Completely**
   - Go to `chrome://extensions/`
   - Find "Job Application Tracker"
   - Click **Remove** (trash icon)

2. **Quit Chrome Completely**
   - Close ALL Chrome windows
   - On Mac: `Cmd + Q` to fully quit
   - Or: Chrome menu → Quit Google Chrome

3. **Kill Any Stuck Processes** (Optional)
   ```bash
   pkill -9 "Google Chrome"
   ```

4. **Reopen Chrome Fresh**
   - Launch Chrome again
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (top right toggle)

5. **Load Extension**
   - Click "Load unpacked"
   - Navigate to: `/Users/davidlim/Desktop/stormhacks/chrome_extension/frontend`
   - Click "Select"

---

### ✅ **Solution 2: Check Extension Folder**

Make sure you're selecting the **correct folder**:
- ✅ Select: `/Users/davidlim/Desktop/stormhacks/chrome_extension/frontend`
- ❌ Don't select: `/Users/davidlim/Desktop/stormhacks/chrome_extension` (parent folder)

The folder MUST contain:
- `manifest.json`
- `background.js`
- `content.js`
- `popup.html`
- `popup.js`
- `icon.png`

---

### ✅ **Solution 3: Disable Other Extensions**

1. Go to `chrome://extensions/`
2. **Disable all other extensions** temporarily
3. Try loading your extension again
4. Re-enable other extensions after successful load

---

### ✅ **Solution 4: Clear Extension Cache**

```bash
# Navigate to Chrome's extension cache
cd ~/Library/Application\ Support/Google/Chrome/Default/Extensions

# List extensions
ls -la

# Optional: Remove all extensions (BE CAREFUL - backs up first)
# This will remove ALL your extensions
```

---

### ✅ **Solution 5: Use Chrome Canary**

If Chrome stable keeps hanging:
1. Download [Chrome Canary](https://www.google.com/chrome/canary/)
2. Load extension in Canary instead
3. Chrome Canary has separate extension storage

---

### ✅ **Solution 6: Check for File Permission Issues**

```bash
# Check permissions on frontend folder
ls -la ~/Desktop/stormhacks/chrome_extension/frontend

# Fix permissions if needed
chmod -R 755 ~/Desktop/stormhacks/chrome_extension/frontend
```

---

### ✅ **Solution 7: Create Minimal Test Extension**

Test if Chrome can load ANY extension:

**Create test folder:**
```bash
mkdir ~/Desktop/test-extension
cd ~/Desktop/test-extension
```

**Create minimal manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "Test Extension",
  "version": "1.0"
}
```

Try loading this minimal extension. If it works, the issue is with your extension. If it doesn't, Chrome itself has issues.

---

## 🔍 **Diagnostic Steps**

### Check Chrome Console for Errors:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Errors" button (if visible)
4. Check browser console (F12) for error messages

### Check Background Service Worker:
1. After loading extension, click "service worker" link
2. Check console for any errors
3. Look for infinite loops or crashes

---

## 🆘 **Still Not Working?**

### Nuclear Option: Reset Chrome Completely
```bash
# BACKUP YOUR DATA FIRST!
# This removes all Chrome data including bookmarks, passwords, etc.

# Close Chrome
pkill -9 "Google Chrome"

# Rename Chrome folder (backup)
mv ~/Library/Application\ Support/Google/Chrome ~/Library/Application\ Support/Google/Chrome.backup

# Restart Chrome (it will create fresh profile)
open -a "Google Chrome"
```

---

## 📊 **Common Causes**

1. ✅ **Too many extensions loaded** - Disable others
2. ✅ **Chrome extension cache corrupted** - Clear cache
3. ✅ **Background script infinite loop** - Check service worker console
4. ✅ **File permission issues** - Fix with chmod
5. ✅ **Chrome process stuck** - Fully quit and restart
6. ✅ **Wrong folder selected** - Must select `frontend` folder

---

## 🎯 **Quick Diagnosis**

Run this command to verify your extension structure:
```bash
cd ~/Desktop/stormhacks/chrome_extension/frontend
ls -1
```

You should see:
```
background.js
content.js
icon.png
manifest.json
options.html
options.js
popup.html
popup.js
```

If any are missing, that's your problem!

---

## 💡 **Prevention Tips**

- Always fully quit Chrome between extension reloads
- Don't have too many extensions in dev mode
- Use extension reload button instead of removing/re-adding
- Keep DevTools open to catch errors early
- Test in Incognito mode to isolate issues
