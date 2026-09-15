# Troubleshooting Guide

## Overview

Having trouble with WasteFi? This guide covers common issues and solutions to get you back on track quickly.

## 🚀 Quick Fixes

Try these first for most common issues:

```
1. Force close and restart the app
2. Check your internet connection
3. Update to the latest version
4. Clear app cache (Settings → Storage)
5. Restart your phone
```

If problems persist, see specific solutions below.

---

## 📱 App Issues

### App Won't Open / Crashes on Launch

**Possible causes:**
- Outdated app version
- Corrupted cache
- Insufficient storage
- OS compatibility issue

**Solutions:**

1. **Update the app:**
   - Go to Play Store / App Store
   - Search "WasteFi"
   - Tap "Update"
   - Wait for installation
   - Try opening again

2. **Clear app cache:**
   - Settings → Apps → WasteFi
   - Tap "Storage"
   - Tap "Clear Cache" (NOT "Clear Data")
   - Open app again

3. **Check storage:**
   - Settings → Storage
   - Need at least 500 MB free
   - Delete unused apps/files if needed

4. **Reinstall app:**
   ```
   ⚠️ IMPORTANT: Backup wallet first!
   Settings → Wallet → Backup
   Write down recovery phrase
   
   Then:
   - Uninstall WasteFi
   - Restart phone
   - Reinstall from official store
   - Restore wallet with recovery phrase
   ```

### App is Slow / Freezing

**Causes:**
- Poor internet connection
- Too many background apps
- Low phone memory
- Outdated phone OS

**Solutions:**

1. **Close background apps:**
   - Recent apps button
   - Swipe away unused apps
   - Keep only WasteFi running

2. **Check internet:**
   - Toggle WiFi/mobile data off and on
   - Try different network
   - Move to area with better signal

3. **Restart phone:**
   - Often fixes performance issues
   - Clears temporary memory

4. **Free up space:**
   - Delete photos/videos
   - Remove unused apps
   - Move files to cloud storage

### Can't Update App

**Error: "Update unavailable" or "Incompatible"**

**Causes:**
- Phone OS too old
- Insufficient storage
- Play Store / App Store issues

**Solutions:**

1. **Check OS version:**
   - Settings → About Phone
   - WasteFi requires:
     - Android 8.0+ or
     - iOS 13.0+
   - Update OS if possible

2. **Free up storage:**
   - Need at least 100 MB for update
   - Delete temporary files

3. **Reset app store:**
   - Clear Play Store / App Store cache
   - Sign out and back in
   - Try update again

---

## 🔐 Login & Account Issues

### Forgot PIN

**Solution:**

1. On login screen, tap "Forgot PIN"
2. Enter your phone number
3. Tap "Send OTP"
4. Enter the 6-digit code from SMS
5. Create new PIN
6. Confirm new PIN
7. Login with new PIN

**No SMS received?**
- Check phone number is correct
- Wait 2-3 minutes
- Check spam/blocked messages
- Request new OTP (wait 5 min between requests)
- Contact support if still no SMS

### Can't Login - "Invalid Credentials"

**Causes:**
- Wrong phone number format
- Incorrect PIN
- Account suspended
- App cache issue

**Solutions:**

1. **Check phone number:**
   ```
   ✅ Correct: +254712345678
   ❌ Wrong: 0712345678 (missing country code)
   ❌ Wrong: 254712345678 (missing +)
   ```

2. **Reset PIN:**
   - Use "Forgot PIN" option
   - Follow SMS verification

3. **Check account status:**
   - If suspended: Contact support
   - Check email for notifications
   - May need to verify identity

4. **Clear app data:**
   ```
   ⚠️ Backup wallet first!
   
   Settings → Apps → WasteFi
   Storage → Clear Data
   Reopen app and login
   ```

### Account Locked After Multiple Attempts

**What happened:**
- Security feature after 5 failed login attempts
- Protects your account from unauthorized access

**Solution:**

**Option 1: Wait (Recommended)**
- Account auto-unlocks after 30 minutes
- Try again after waiting
- Use correct PIN

**Option 2: Reset PIN**
- Tap "Forgot PIN"
- Follow verification process
- Unlocks account immediately

**Option 3: Contact Support**
- If urgent access needed
- Call +254-XXX-XXXXX
- Verify identity
- Support can unlock manually

### "Phone Number Already Registered"

**Causes:**
- You already have an account
- Someone else registered your number (fraud)
- Previous registration not completed

**Solutions:**

1. **Login to existing account:**
   - Use "Forgot PIN" if needed
   - Access your existing account

2. **If you didn't register:**
   - Immediately contact support
   - Report fraudulent registration
   - Provide proof of ownership (ID + phone bill)
   - Support will investigate and transfer account

3. **Previous incomplete registration:**
   - Contact support
   - Account will be reset
   - Complete registration again

---

## 💸 Transaction Issues

### Transaction Failed

**Error codes and solutions:**

#### "Insufficient Balance at Collection Point"

**Cause:** Collection point wallet low on funds

**Solution:**
- Wait 15-30 minutes for top-up
- Try different collection point
- Operator should contact admin for wallet refill

#### "Network Error"

**Cause:** Internet connection lost during transaction

**Solution:**
1. Check if money was deducted (Check balance)
2. If deducted but not received:
   - File dispute in app
   - Provide transaction details
   - Refund processed within 24 hours
3. If not deducted:
   - Try transaction again
   - Ensure stable internet

#### "Quality Verification Failed"

**Cause:** Material doesn't meet quality standards

**Solution:**
- Ask operator to explain issue
- Check material for contamination
- Clean/sort material better
- Remove non-recyclable items
- Try again after improvements

#### "Scale Calibration Error"

**Cause:** Collection point scale needs recalibration

**Solution:**
- Operator must recalibrate scale
- Try different collection point temporarily
- Report to support for follow-up

### Transaction Pending for Too Long

**Normal processing time:** 1-3 minutes

**If pending > 10 minutes:**

1. **Check Stellar network status:**
   - Go to: https://status.stellar.org
   - If issues: Wait for resolution
   - Usually resolved within 1 hour

2. **Check mobile money status:**
   - M-Pesa: https://status.safaricom.co.ke
   - MTN: Check MTN app
   - Airtel: Check Airtel app

3. **Contact support:**
   - Provide transaction ID
   - Support can check status
   - May need manual processing

### Wrong Amount Received

**Causes:**
- Price changed mid-transaction
- Platform fee applied
- Weight dispute
- System error

**Solutions:**

1. **Check transaction details:**
   ```
   Material: PET Plastic
   Weight: 5.5 kg
   Price: $0.36/kg
   Gross: $1.98
   Platform fee (2%): $0.04
   Net received: $1.94
   ```

2. **Verify calculation:**
   - Weight × Price = Gross amount
   - Gross - Platform fee = Net amount
   - Quality multiplier applied?

3. **File dispute if wrong:**
   - Transactions → Select transaction
   - Tap "Report Issue"
   - Select "Amount incorrect"
   - Provide evidence (photos, witnesses)
   - Include expected vs received amount
   - Submit within 48 hours

### Can't See Recent Transaction

**Causes:**
- App not synced
- Network delay
- Cache issue

**Solutions:**

1. **Refresh transaction list:**
   - Pull down on transaction screen
   - Wait for sync to complete

2. **Check internet connection:**
   - Ensure connected to internet
   - Try toggling WiFi/data

3. **Force sync:**
   - Settings → Account
   - Tap "Sync Now"
   - Wait 1-2 minutes

4. **Clear cache:**
   - Settings → Storage
   - Clear Cache
   - Restart app

---

## 💳 Payment Issues

### Mobile Money Payment Not Received

**Processing time:** Usually instant, up to 5 minutes

**If not received after 10 minutes:**

1. **Check transaction status in app:**
   - Transactions → Select transaction
   - Check "Payment Status"
   - If "Completed": Check mobile money balance
   - If "Processing": Wait up to 1 hour
   - If "Failed": See failure reason

2. **Check mobile money balance:**
   ```
   M-Pesa: *334# (balance)
   MTN: *156# (balance)
   Airtel: *222# (balance)
   ```

3. **Check SMS notifications:**
   - Look for payment confirmation SMS
   - Check spam/blocked messages
   - SMS sometimes delayed

4. **Verify phone number:**
   - Settings → Payment Methods
   - Ensure mobile money number is correct
   - Update if wrong

5. **Contact support:**
   - Provide transaction ID
   - Screenshot showing payment status
   - Support will trace payment

### "Payment Method Not Available"

**Causes:**
- Mobile money provider downtime
- Region not supported
- Account not verified

**Solutions:**

1. **Check provider status:**
   - M-Pesa, MTN, Airtel may have scheduled maintenance
   - Check provider's website or app
   - Wait for service restoration

2. **Try alternative method:**
   - If M-Pesa down, use bank transfer
   - Switch to different mobile money provider
   - Settings → Payment Methods → Add Method

3. **Verify account:**
   - Some payment methods require KYC
   - Settings → Payment Methods
   - Complete verification if needed

### Wrong Mobile Money Number

**Before any transactions:**
- Go to Settings → Payment Methods
- Tap mobile money method
- Tap "Edit"
- Update phone number
- Verify with OTP
- Save changes

**After transaction already made:**

**If payment not yet sent:**
1. Contact support immediately
2. Provide correct number
3. Support can update before processing

**If payment already sent to wrong number:**
1. Contact support urgently
2. Provide transaction details
3. Support contacts mobile money provider
4. Reversal may be possible (not guaranteed)
5. Process takes 3-7 days

**⚠️ Always double-check payment number!**

---

## 📍 Location & Map Issues

### Can't Find Nearby Collection Points

**Causes:**
- Location permission denied
- GPS not working
- No collection points nearby
- Map not loaded

**Solutions:**

1. **Enable location permission:**
   - Settings → Apps → WasteFi → Permissions
   - Enable "Location"
   - Choose "While using app" or "Always"

2. **Check GPS:**
   - Go outside (GPS works poorly indoors)
   - Toggle location services off and on
   - Wait 1-2 minutes for GPS fix

3. **Refresh map:**
   - Pull down on map screen
   - Or tap refresh icon
   - Wait for map to reload

4. **Search manually:**
   - Tap search icon
   - Enter area/street name
   - View collection points in that area

5. **Expand search radius:**
   - Tap filter icon
   - Increase "Distance" range
   - Apply filters

### Map Not Loading

**Causes:**
- No internet connection
- Google Maps service issue
- App cache problem

**Solutions:**

1. **Check internet:**
   - Need stable connection for maps
   - WiFi works better than mobile data
   - Try different network

2. **Clear app cache:**
   - Settings → Storage → Clear Cache
   - Restart app

3. **Update Google Play Services:**
   - Play Store → My Apps
   - Update Google Play Services
   - Required for maps to work

### Wrong Location Shown

**Causes:**
- GPS not accurate
- Using WiFi/network location only
- Location cache outdated

**Solutions:**

1. **Improve GPS accuracy:**
   - Go outside (away from buildings)
   - Wait 1-2 minutes
   - Enable "High accuracy" mode:
     - Phone Settings → Location
     - Mode → High accuracy

2. **Refresh location:**
   - Tap location icon on map
   - Wait for update
   - Should center on correct location

---

## 📶 Connectivity Issues

### "No Internet Connection" Error

**When you know you have internet:**

1. **Test connection:**
   - Open browser
   - Visit any website
   - Confirms internet works

2. **Toggle connection:**
   - Turn off WiFi/mobile data
   - Wait 10 seconds
   - Turn back on
   - Reopen app

3. **Switch networks:**
   - If on WiFi → Try mobile data
   - If on mobile data → Try WiFi
   - One may work better

4. **Check DNS:**
   - Try using Google DNS:
     - WiFi Settings → Advanced
     - DNS 1: 8.8.8.8
     - DNS 2: 8.8.4.4

### App Works on WiFi but Not Mobile Data

**Causes:**
- Data saver mode enabled
- App background data restricted
- Insufficient data balance

**Solutions:**

1. **Disable data saver:**
   - Settings → Network → Data Saver
   - Turn off or add WasteFi to exceptions

2. **Enable background data:**
   - Settings → Apps → WasteFi
   - Mobile data & WiFi
   - Enable "Background data"

3. **Check data balance:**
   - Ensure you have active data
   - WasteFi uses ~5-10 MB per session

---

## 🔔 Notification Issues

### Not Receiving Notifications

**Causes:**
- Notifications disabled
- Battery optimization blocking
- Do Not Disturb mode
- App not running in background

**Solutions:**

1. **Enable notifications:**
   - Settings → Apps → WasteFi → Notifications
   - Enable "Show notifications"
   - Enable all notification types

2. **Disable battery optimization:**
   - Settings → Battery
   - Battery optimization
   - Select WasteFi
   - Choose "Don't optimize"

3. **Check Do Not Disturb:**
   - Disable DND or
   - Add WasteFi to exceptions

4. **Test notifications:**
   - Settings → Notifications
   - Tap "Send Test Notification"
   - Should receive notification

### Notifications Delayed

**Causes:**
- Battery saver mode
- Poor network connection
- Background restrictions

**Solutions:**

1. **Disable battery saver:**
   - Uses more battery but faster notifications
   - Or add WasteFi to exceptions

2. **Keep app running:**
   - Don't force close app
   - Let it run in background
   - Enables instant notifications

---

## 🗂️ App Storage & Cache

### "Storage Full" Error

**Solutions:**

1. **Clear app cache:**
   - Settings → Apps → WasteFi
   - Storage → Clear Cache
   - Frees up space without losing data

2. **Delete old files:**
   - Photos, videos, downloads
   - Use Google Photos backup then delete locals
   - Use Files app to find large files

3. **Move apps to SD card:**
   - Settings → Apps
   - Select apps → Storage
   - Move to SD card (if supported)

4. **Uninstall unused apps:**
   - Free up significant space
   - Reinstall if needed later

### App Taking Too Much Storage

**WasteFi should use ~50-100 MB**

**If using > 500 MB:**

1. **Clear cache:**
   - Settings → Apps → WasteFi
   - Storage → Clear Cache

2. **Delete transaction receipts:**
   - Old receipts/photos stored
   - Settings → Storage
   - Clear old receipts
   - Keeps recent 30 days

3. **Reinstall if excessive:**
   - Backup wallet first
   - Uninstall and reinstall
   - Restore wallet

---

## 🔄 Sync Issues

### "Sync Failed" Error

**Causes:**
- Network interruption
- Server maintenance
- Account issue

**Solutions:**

1. **Manual sync:**
   - Settings → Account
   - Tap "Sync Now"
   - Wait for completion

2. **Check network:**
   - Ensure stable internet
   - Try different network

3. **Wait and retry:**
   - Server may be busy
   - Wait 5-10 minutes
   - Try again

4. **Logout and login:**
   - Settings → Account → Logout
   - Login again
   - Triggers full sync

### Data Not Syncing Across Devices

**Note:** WasteFi is single-device by design for security

**If you got a new device:**

1. **Backup wallet on old device:**
   - Settings → Wallet → Backup
   - Write down recovery phrase

2. **Install app on new device:**
   - Download from official store
   - Open app

3. **Restore wallet:**
   - Login with phone number
   - When prompted, select "Restore Wallet"
   - Enter recovery phrase
   - All data syncs

4. **Logout from old device:**
   - Security best practice
   - Settings → Account → Logout

---

## 📸 Camera & QR Code Issues

### Camera Not Working

**Causes:**
- Camera permission denied
- Another app using camera
- Hardware issue

**Solutions:**

1. **Enable camera permission:**
   - Settings → Apps → WasteFi → Permissions
   - Enable "Camera"

2. **Close other apps:**
   - Recent apps button
   - Close apps that might use camera
   - Try WasteFi again

3. **Test camera:**
   - Open phone's camera app
   - If doesn't work → Hardware issue
   - If works → Reinstall WasteFi

### Can't Scan QR Code

**Solutions:**

1. **Improve lighting:**
   - QR codes need good lighting
   - Avoid glare/shadows
   - Use flashlight if needed

2. **Focus camera:**
   - Hold steady
   - 4-8 inches from QR code
   - Wait for auto-focus

3. **Clean camera lens:**
   - Wipe with soft cloth
   - Often overlooked solution

4. **Enter code manually:**
   - Tap "Enter manually"
   - Type collection point code
   - Continue without QR scan

---

## 🆘 Emergency Issues

### Lost Access to Account (Phone Lost/Stolen)

**Immediate actions:**

1. **Contact support ASAP:**
   - Call: +254-XXX-XXXXX
   - Email: support@wastefi.org
   - Request account freeze

2. **On new phone:**
   - Install WasteFi
   - Login with phone number
   - Restore wallet with recovery phrase
   - All funds safe if you have recovery phrase

3. **If no recovery phrase:**
   - Contact support
   - Identity verification required
   - May need police report
   - Process takes 3-7 days

### Funds Missing / Stolen

**Immediate actions:**

1. **Check transaction history:**
   - Transactions → View All
   - Look for unauthorized transactions
   - Screenshot everything

2. **Change PIN immediately:**
   - Settings → Security
   - Change PIN
   - Enable 2FA

3. **Contact support urgently:**
   - Report theft
   - Provide transaction IDs
   - File police report
   - Support will investigate

4. **Freeze account:**
   - Request temporary freeze
   - Prevents further transactions
   - Can be lifted after resolution

---

## 📞 Contact Support

### Before Contacting Support

**Gather this information:**

```
1. Phone number registered with WasteFi
2. Transaction ID (if transaction issue)
3. Screenshot of error message
4. What you were trying to do
5. What happened instead
6. Steps you've already tried
```

### Support Channels

**24/7 Phone Support:**
- Kenya: +254-XXX-XXXXX
- Nigeria: +234-XXX-XXXXXXX
- Ghana: +233-XXX-XXXXXXX
- South Africa: +27-XX-XXX-XXXX

**Email Support:**
- General: support@wastefi.org
- Technical: tech@wastefi.org
- Security: security@wastefi.org
- Response time: 24 hours

**In-App Chat:**
- Settings → Help → Chat with Support
- Fastest for non-urgent issues
- Typical response: 5-30 minutes

**WhatsApp:**
- +254-XXX-XXXXX (Kenya)
- Business hours: 8am - 8pm EAT

**Social Media:**
- Twitter: @wastefi_support (DM open)
- Facebook: facebook.com/wastefi
- Response time: 2-4 hours

### Response Times

| Priority | Response Time | Resolution Time |
|----------|--------------|-----------------|
| Critical (funds lost, account locked) | < 1 hour | 24 hours |
| High (can't make transactions) | < 4 hours | 48 hours |
| Medium (app issues) | < 24 hours | 3-5 days |
| Low (general questions) | < 48 hours | 5-7 days |

---

## 💡 Pro Tips

### Prevent Issues Before They Happen

1. **Keep app updated** → Fewer bugs
2. **Enable 2FA** → Better security
3. **Backup wallet regularly** → Never lose access
4. **Monitor transactions weekly** → Catch issues early
5. **Save support number** → Quick access in emergency
6. **Read release notes** → Know about new features/fixes
7. **Join community** → Learn from others
8. **Test small transactions first** → Before large ones

### When to Contact Support vs. Self-Fix

**Contact Support:**
- Account compromised
- Funds missing
- Payment not received after 1 hour
- Account locked/suspended
- Verification issues

**Try Self-Fix First:**
- App slow/crashes
- Can't login (try PIN reset)
- Map not loading
- Notifications not working
- General app issues

---

## 📚 Additional Resources

**Help Center:**
- https://help.wastefi.org
- Searchable knowledge base
- Video tutorials
- Step-by-step guides

**Community Forum:**
- https://community.wastefi.org
- Ask questions
- Share experiences
- Get peer support

**Video Tutorials:**
- YouTube: youtube.com/wastefi
- Covers all features
- Multiple languages

**FAQ:**
- See [FAQ page](./faq.md)
- Common questions answered

---

**Still stuck? Don't hesitate to reach out to support. We're here to help! 💚**

---

*Last updated: September 15, 2024*
*Version: 1.0*
