# Security & Privacy Guidelines

## Overview

Your security and privacy are paramount to WasteFi. This guide explains how we protect your data, what you can do to stay safe, and your privacy rights.

## 🔐 Security Features

### Account Security

#### PIN Protection

Your PIN is your first line of defense:

**Best Practices:**
- Choose a unique 4-6 digit PIN
- Never share your PIN with anyone
- Don't use obvious PINs (1234, 0000, birthdays)
- Change your PIN regularly
- Don't write it down or save in notes

**If Someone Asks for Your PIN:**
```
❌ WasteFi staff will NEVER ask for your PIN
❌ Collection point operators don't need your PIN
❌ Support agents will never request your PIN
✅ Only enter your PIN in the official WasteFi app
```

#### Two-Factor Authentication (2FA)

Add extra security to your account:

**Enable 2FA:**
1. Open WasteFi app
2. Go to Settings → Security
3. Tap "Enable Two-Factor Authentication"
4. Choose method:
   - SMS code
   - Authenticator app (recommended)
5. Follow setup instructions
6. Save backup codes securely

**Benefits:**
- Even if someone gets your PIN, they can't access your account
- Protects against unauthorized login attempts
- Required for large transactions

### Transaction Security

#### Verify Before Confirming

**Always check:**
```
Transaction Preview:
┌─────────────────────────────┐
│ Material: PET Plastic       │
│ Weight: 5.5 kg             │
│ Quality: Grade A           │
│ Amount: $1.94              │
│                            │
│ ✓ Verify these details     │
│ ✓ Check the amount         │
│ ✓ Confirm material type    │
└─────────────────────────────┘
```

**If something looks wrong:**
1. Don't confirm the transaction
2. Ask the operator to explain
3. Check the scale yourself
4. Request a supervisor if needed
5. Report if you suspect fraud

#### Digital Signatures

Every transaction is cryptographically signed:
- Your device signs with your private key
- Creates tamper-proof record on blockchain
- Impossible to forge or alter
- Full audit trail maintained

### Wallet Security

#### Stellar Wallet Protection

Your Stellar wallet holds your earnings:

**Security Measures:**
- Private keys never leave your device
- Encrypted with your PIN
- Backed up securely (if enabled)
- Multi-signature for large amounts
- Hardware security module (HSM) for platform wallet

**Backup Your Wallet:**

1. Go to Settings → Wallet
2. Tap "Backup Wallet"
3. Write down 12-word recovery phrase
4. Store securely offline
5. Never share with anyone
6. Never take a photo of it

**⚠️ Critical: Without your recovery phrase, lost access = lost funds!**

#### Mobile Money Integration

When connecting mobile money:

**We Never:**
- Store your mobile money PIN
- Access your mobile money balance
- Make unauthorized transfers
- Share your data with mobile money provider

**We Only:**
- Request your phone number
- Send payment notifications
- Transfer your earnings when you request
- Verify transaction completion

### Network Security

#### Encrypted Communications

All data transmission is encrypted:

```
Your Device → [SSL/TLS Encryption] → WasteFi Servers
           256-bit AES Encryption
           Perfect Forward Secrecy
           Certificate Pinning
```

**What This Means:**
- No one can intercept your data
- No one can see your transactions in transit
- Protected from man-in-the-middle attacks

#### Secure API Access

**Authentication:**
- JWT tokens with short expiration
- Refresh tokens for extended sessions
- API keys for integrations
- Rate limiting to prevent abuse

---

## 🛡️ Privacy Protection

### Data Collection

#### What We Collect

**Account Data:**
- Phone number (for login and payments)
- Name (optional, for verification)
- Location (to find nearby collection points)
- Device information (for security)

**Transaction Data:**
- Material type and weight
- Collection point
- Quality grade
- Amount earned
- Date and time
- GPS coordinates (optional)

**Usage Data:**
- App interactions
- Feature usage
- Performance metrics
- Crash reports

#### What We DON'T Collect

```
❌ We don't track your browsing outside the app
❌ We don't access your contacts or photos (unless you share)
❌ We don't record your conversations
❌ We don't sell your personal data
❌ We don't share data with advertisers
```

### How We Use Your Data

#### Primary Uses

**To Provide Service:**
- Process your transactions
- Calculate your earnings
- Send payments to mobile money
- Show nearby collection points
- Generate impact reports

**To Improve Service:**
- Fix bugs and crashes
- Optimize app performance
- Understand usage patterns
- Develop new features

**To Ensure Security:**
- Detect fraud
- Prevent abuse
- Verify identities
- Comply with regulations

#### Data Sharing

**We share data only when necessary:**

| Who | What | Why | Legal Basis |
|-----|------|-----|-------------|
| Mobile Money Providers | Phone number, amount | Process payments | Service delivery |
| Stellar Network | Public transactions | Record on blockchain | Service delivery |
| Recycling Partners | Aggregate statistics | EPR compliance | Legitimate interest |
| Law Enforcement | Upon legal order | Comply with law | Legal obligation |
| Analytics Services | Anonymized usage | Improve service | Legitimate interest |

**We NEVER:**
- Sell your personal data
- Share with advertisers
- Give access to third parties without consent
- Transfer outside legal frameworks

### Your Privacy Rights

#### Access Your Data

**Request a copy:**
1. Go to Settings → Privacy
2. Tap "Download My Data"
3. Confirm identity
4. Receive export within 48 hours
5. Download encrypted file

**Includes:**
- All account information
- Complete transaction history
- Usage data
- Communications

#### Delete Your Data

**Right to be forgotten:**
1. Go to Settings → Privacy
2. Tap "Delete My Account"
3. Confirm decision (irreversible)
4. We delete within 30 days

**What happens:**
- Account permanently closed
- Personal data deleted
- Transaction records anonymized (legally required to retain)
- Wallet funds must be withdrawn first

#### Correct Your Data

**Update incorrect information:**
1. Go to Settings → Profile
2. Update any field
3. Some changes require verification
4. Changes logged for audit

#### Restrict Processing

**Limit how we use your data:**
1. Go to Settings → Privacy
2. Choose what to limit:
   - Marketing communications
   - Analytics tracking
   - Location services
   - Crash reporting
3. Save preferences

### Data Retention

**How long we keep data:**

| Data Type | Retention Period | Reason |
|-----------|-----------------|---------|
| Account Info | While account active + 1 year | Service provision |
| Transaction Records | 7 years | Financial regulations |
| Support Tickets | 3 years | Customer service |
| Usage Analytics | 2 years | Product improvement |
| Crash Logs | 90 days | Bug fixing |
| Audit Logs | 7 years | Compliance |

**After retention period:** Data is permanently deleted or anonymized.

---

## 🚨 Threat Protection

### Common Scams

#### Phishing Attacks

**Example phishing SMS:**
```
❌ "Your WasteFi account has been suspended.
   Click here to reactivate: wastefi-verify.com
   Enter your PIN to continue."
```

**Red flags:**
- Urgent/threatening language
- Asks for PIN or password
- Suspicious links
- Poor grammar/spelling
- Unofficial sender

**What to do:**
1. Don't click links in unexpected messages
2. Don't provide personal information
3. Go directly to official WasteFi app
4. Report to support@wastefi.org

#### Fake Collection Points

**Warning signs:**
- Not listed in official app
- Offers prices that are too good to be true
- Asks for payment to register
- Operates from suspicious location
- No official signage

**Stay safe:**
- Only use collection points listed in app
- Check point is verified (green badge)
- Don't pay any registration fees
- Report suspicious points

#### Impersonation

**Someone pretends to be WasteFi staff:**

```
❌ "Hello, I'm from WasteFi support. We need to
   verify your account. Please share your PIN
   and recovery phrase."
```

**Real WasteFi staff will:**
- ✅ Verify YOUR identity (not the other way around)
- ✅ Never ask for PIN or recovery phrase
- ✅ Only contact through official channels
- ✅ Have official email domain (@wastefi.org)

### Device Security

#### Secure Your Phone

**Essential protections:**

1. **Lock Screen**
   - Use strong PIN/password/biometric
   - Auto-lock after 1-5 minutes
   - Don't disable for convenience

2. **Update Regularly**
   - Install OS updates
   - Update WasteFi app
   - Update other security apps

3. **Install Security Software**
   - Antivirus (optional but recommended)
   - Firewall
   - VPN for public WiFi

4. **Be Careful What You Install**
   - Only official app stores
   - Check app permissions
   - Avoid pirated apps
   - Read reviews

#### If Phone is Lost/Stolen

**Act immediately:**

1. **Remote lock/wipe** (if set up)
2. **Call WasteFi support:** +254-XXX-XXXXX
3. **Suspend your account** (temporarily)
4. **Report to police** (get case number)
5. **Change passwords** on other accounts
6. **Monitor for suspicious activity**

**Prevent total loss:**
- Enable remote wipe feature
- Backup your wallet recovery phrase
- Note your device IMEI number
- Enable "Find My Device"

### Public WiFi Safety

**Risks:**
- Unencrypted connections
- Man-in-the-middle attacks
- Fake WiFi hotspots
- Traffic interception

**Safe practices:**

```
When using public WiFi:
✅ Use VPN (encrypts all traffic)
✅ Verify network name with staff
✅ Avoid sensitive transactions
✅ Forget network after use
❌ Don't auto-connect to open networks
❌ Don't enter financial information
```

---

## 🔍 Monitoring & Alerts

### Security Alerts

**We notify you immediately if:**

- Login from new device
- Login from unusual location
- Multiple failed login attempts
- PIN changed
- Wallet backup created
- Large withdrawal requested
- Suspicious transaction pattern

**Alert channels:**
- Push notification
- SMS
- Email (if provided)

**Action required:**
1. Review alert details
2. Confirm if it was you
3. Secure your account if not
4. Contact support if needed

### Activity Monitoring

**Check your account regularly:**

1. Go to Settings → Security
2. View "Recent Activity"
3. See:
   - Login history
   - Device list
   - Transaction summary
   - Account changes

**Red flags:**
- Unrecognized devices
- Logins from wrong locations
- Transactions you didn't make
- Changes you didn't authorize

**If you see suspicious activity:**
1. Change your PIN immediately
2. Log out all devices
3. Contact support urgently
4. Review recent transactions
5. File dispute if needed

---

## 📋 Security Checklist

### Daily

```
☐ Check for suspicious transactions
☐ Verify transaction details before confirming
☐ Log out from shared devices
☐ Don't share sensitive information
```

### Weekly

```
☐ Review account activity
☐ Check for app updates
☐ Scan device for malware
☐ Review active devices
```

### Monthly

```
☐ Change PIN
☐ Review privacy settings
☐ Backup wallet (if not auto-backed up)
☐ Update recovery information
☐ Review connected services
```

### Yearly

```
☐ Full security audit
☐ Update all passwords
☐ Review data permissions
☐ Request data export (verify what's stored)
☐ Update emergency contacts
```

---

## 🆘 Incident Response

### If Your Account is Compromised

**Immediate steps:**

1. **Stop using the account immediately**
2. **Change your PIN** (if you still have access)
3. **Log out all devices:**
   - Settings → Security → "Log Out All Devices"
4. **Contact support urgently:**
   - Call: +254-XXX-XXXXX (24/7)
   - Email: security@wastefi.org
   - In-app: Support → "Report Security Issue"
5. **Document everything:**
   - Screenshot suspicious activity
   - Note dates and times
   - List unauthorized transactions
6. **File a police report** (for large losses)

### If You Lost Money

**Dispute process:**

1. Report immediately (within 48 hours)
2. Provide evidence:
   - Transaction details
   - Photos/screenshots
   - Witness statements
3. Investigation begins (2-5 days)
4. Decision communicated
5. Refund processed if approved

**Protection limits:**
- Fraud: Full refund if reported within 48 hours
- Scams: Depends on circumstances
- Lost device: No liability if reported promptly
- Stolen device: Covered if reported immediately

### Reporting Security Issues

**Found a vulnerability?**

**Bug Bounty Program:**
- Email: security@wastefi.org
- Include detailed description
- Provide steps to reproduce
- Don't exploit or disclose publicly
- Rewards up to $10,000

**Responsible Disclosure:**
1. Report privately to security team
2. Give us 90 days to fix
3. Coordinate public disclosure
4. Receive credit (if desired)

---

## 📚 Privacy Policy

Full privacy policy: https://wastefi.org/privacy

**Key points:**

- We collect minimal data necessary for service
- We don't sell your personal information
- We use industry-standard encryption
- You control your data
- We comply with data protection laws (GDPR, CCPA, etc.)
- We're transparent about our practices
- We notify you of breaches within 72 hours

**Contact our Data Protection Officer:**
- Email: privacy@wastefi.org
- Mail: WasteFi Privacy Team, [Address]

---

## 🌍 Regional Compliance

### Kenya (Data Protection Act 2019)

- Right to access personal data
- Right to correction
- Right to deletion
- Right to object to processing
- Right to data portability
- Complaints to ODPC (Office of the Data Protection Commissioner)

### Nigeria (NDPR)

- Consent-based processing
- Right to access and rectification
- Data breach notification
- Complaints to NITDA

### Ghana (Data Protection Act 2012)

- Fair processing requirements
- Right to access and correction
- Secure storage requirements
- Complaints to Data Protection Commission

### South Africa (POPIA)

- Lawful processing
- Data subject rights
- Cross-border transfer restrictions
- Complaints to Information Regulator

---

## 💡 Security Tips

### Do's ✅

- **Use strong PINs** (avoid 1234, 0000)
- **Enable 2FA** for extra security
- **Keep app updated** for latest security patches
- **Back up your wallet** recovery phrase
- **Verify transactions** before confirming
- **Use secure networks** (avoid public WiFi for transactions)
- **Monitor your account** regularly
- **Report suspicious activity** immediately
- **Read security alerts** from WasteFi
- **Educate yourself** on common scams

### Don'ts ❌

- **Never share your PIN** with anyone
- **Never share recovery phrase** with anyone
- **Never click suspicious links** in SMS/email
- **Never install unofficial apps** claiming to be WasteFi
- **Never use the same PIN** for multiple services
- **Never ignore security alerts** from WasteFi
- **Never conduct transactions on public WiFi** without VPN
- **Never root/jailbreak** your device (reduces security)
- **Never share screenshots** containing sensitive info
- **Never pay anyone** to register or verify your account

---

## 📞 Get Help

### Security Support

**24/7 Security Hotline:**
- Phone: +254-XXX-XXXXX (Kenya)
- WhatsApp: +254-XXX-XXXXX
- Email: security@wastefi.org
- In-app: Support → "Security Issue"

**Response Times:**
- Critical (account compromised): Immediate
- High (suspicious activity): Within 1 hour
- Medium (general security questions): Within 4 hours
- Low (security tips, education): Within 24 hours

### Resources

**Learn more:**
- Security FAQ: https://wastefi.org/security-faq
- Video tutorials: https://youtube.com/wastefi-security
- Blog: https://blog.wastefi.org/category/security
- Community: https://community.wastefi.org/security

---

## 🎓 Security Training

**Free courses:**

1. **Security Basics** (15 min)
   - Account protection
   - Recognizing scams
   - Safe transaction practices

2. **Advanced Security** (30 min)
   - Wallet management
   - Privacy controls
   - Incident response

3. **Scam Awareness** (20 min)
   - Common scams
   - Red flags
   - Real-world examples

**Access:** Settings → Help → Security Training

**Earn badges:**
- 🔰 Security Novice (complete basics)
- 🛡️ Security Pro (complete advanced)
- 🎯 Scam Spotter (complete awareness)
- 🏆 Security Champion (complete all + pass quiz)

---

**Your security is our priority. Stay safe, stay informed, and don't hesitate to reach out if you need help! 🔐**

---

*Last updated: September 15, 2024*
*Version: 1.0*
