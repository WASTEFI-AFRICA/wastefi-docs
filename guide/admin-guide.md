# Admin Dashboard Guide

## Overview

The WasteFi Admin Dashboard provides comprehensive tools for managing the platform, monitoring operations, and analyzing performance. This guide covers all administrative functions and workflows.

## Access & Login

### Dashboard URL

```
Production: https://admin.wastefi.org
Staging:    https://admin-staging.wastefi.org
```

### Login

1. Go to admin dashboard URL
2. Enter your admin email
3. Enter your password
4. Complete 2FA (if enabled)
5. Click "Login"

### User Roles

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **Super Admin** | Full access | All features |
| **Regional Manager** | Regional oversight | Assigned regions only |
| **Operations Manager** | Operations & support | Operations features |
| **Finance Manager** | Financial oversight | Finance & reports |
| **Support Agent** | Customer support | Read-only + support tools |
| **Auditor** | Compliance & review | Read-only all data |

---

## Dashboard Overview

### Home Screen

```
┌─────────────────────────────────────────────────────────┐
│  WasteFi Admin Dashboard                  [User Menu]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Key Metrics (Today)                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Active      │ │ Transactions│ │ Volume      │     │
│  │ Collectors  │ │   1,247     │ │  6,234 kg   │     │
│  │    3,456    │ └─────────────┘ └─────────────┘     │
│  └─────────────┘                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Revenue     │ │ CO2 Saved   │ │ Collection  │     │
│  │  $18,741    │ │  15,585 kg  │ │ Points: 45  │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                         │
│  Recent Activity                      [View All]        │
│  • New collector registered (2 min ago)                │
│  • Payment completed: $125.50 (5 min ago)              │
│  • Collection point opened (15 min ago)                │
│                                                         │
│  Alerts & Notifications                 [View All]      │
│  ⚠️  3 pending disputes                                 │
│  ℹ️  System maintenance scheduled                      │
│  ✓  Monthly report ready                               │
└─────────────────────────────────────────────────────────┘
```

### Navigation Menu

**Main Sections:**
- 📊 Dashboard (Home)
- 👥 Users
- 📍 Collection Points
- 💰 Transactions
- 💳 Payments
- 🌍 Impact
- ⚙️ Settings
- 📈 Analytics
- 🔔 Support
- 📄 Reports

---

## User Management

### Viewing Users

**Path:** Dashboard → Users

**Filters:**
- Role (Collector, Operator, Admin)
- Status (Active, Inactive, Suspended)
- Registration Date
- Location
- Activity Level

**Search:**
- By phone number
- By name
- By user ID

### User Details

Click any user to view:

```
User Profile
├── Basic Information
│   ├── Name
│   ├── Phone number
│   ├── Role
│   ├── Status
│   ├── Registration date
│   └── Last login
│
├── Wallet Information
│   ├── Stellar address
│   ├── Current balance
│   ├── Total earned
│   └── Payment method
│
├── Activity Stats
│   ├── Total transactions
│   ├── Total weight collected
│   ├── Total CO2 saved
│   └── Average quality grade
│
├── Transaction History
│   └── Last 100 transactions
│
└── Actions
    ├── Suspend/Activate
    ├── Reset PIN
    ├── Send notification
    └── View audit log
```

### User Actions

#### Suspend User

**When to use:** Suspicious activity, violations, fraud

**Steps:**
1. Go to user profile
2. Click "Suspend Account"
3. Select reason
4. Add notes
5. Confirm suspension
6. User receives notification

**Effect:**
- Cannot log in
- Cannot make transactions
- Wallet frozen
- Can appeal suspension

#### Activate Suspended User

**Steps:**
1. Review suspension reason
2. Verify issue resolved
3. Click "Activate Account"
4. Add resolution notes
5. Confirm activation
6. User receives notification

#### Reset User PIN

**When collector forgets PIN:**

1. Verify identity (phone number)
2. Go to user profile
3. Click "Reset PIN"
4. System sends OTP to user
5. User creates new PIN
6. Confirmation sent

#### Send Notification

**Bulk or individual messages:**

1. Select user(s)
2. Click "Send Notification"
3. Choose channel (SMS, Push, Email)
4. Compose message
5. Preview
6. Send or Schedule

---

## Collection Point Management

### View Collection Points

**Path:** Dashboard → Collection Points

**Map View:**
- See all points on map
- Color coded by status
- Click for details

**List View:**
- Sortable table
- Status filters
- Performance metrics

### Collection Point Details

```
Collection Point Profile
├── Basic Info
│   ├── Name
│   ├── Location
│   ├── Contact
│   ├── Operating hours
│   └── Status
│
├── Operators
│   ├── Primary operator
│   ├── Secondary operators
│   └── Permissions
│
├── Performance
│   ├── Daily throughput
│   ├── Customer rating
│   ├── Average wait time
│   └── Quality distribution
│
├── Inventory
│   ├── Current stock by material
│   ├── Capacity utilization
│   └── Last pickup date
│
├── Financial
│   ├── Wallet balance
│   ├── Commission earned
│   ├── Pending payments
│   └── Revenue trend
│
└── Actions
    ├── Edit details
    ├── Manage operators
    ├── Set special hours
    ├── Request pickup
    └── Suspend/Activate
```

### Add New Collection Point

**Steps:**
1. Click "Add Collection Point"
2. Fill in details:
   - Name
   - Address
   - GPS coordinates
   - Contact information
   - Operating hours
3. Upload photos
4. Add operators
5. Set accepted materials
6. Configure wallet
7. Review and submit
8. Site inspection scheduled

### Approve Collection Point

After site inspection:

1. Review inspection report
2. Check photos
3. Verify compliance
4. Approve or request changes
5. If approved:
   - Activate in system
   - Notify operators
   - Add to map
   - Start operations

### Manage Operators

**Add Operator:**
1. Go to collection point
2. Click "Add Operator"
3. Search for user
4. Assign role (Primary/Secondary)
5. Set permissions
6. Save

**Remove Operator:**
1. Select operator
2. Click "Remove"
3. Confirm
4. Operator loses access

### Schedule Maintenance

**Planned downtime:**

1. Select collection point
2. Click "Schedule Maintenance"
3. Set dates and hours
4. Add reason
5. System notifies:
   - Collectors (via app)
   - Nearby collection points
   - Redirect traffic

---

## Transaction Monitoring

### View Transactions

**Path:** Dashboard → Transactions

**Real-time Feed:**
- Live transaction stream
- Auto-refresh every 30 seconds
- Color-coded by status

**Filters:**
- Date range
- Status
- Material type
- Collection point
- Amount range
- Quality grade

### Transaction Details

Click any transaction:

```
Transaction #TXN-2024-091500123
├── Collector: John Doe (+254712345678)
├── Collection Point: Nairobi Central
├── Material: PET Plastic
├── Weight: 5.5 kg
├── Quality: Grade A
├── Gross Amount: $1.98
├── Platform Fee: $0.04
├── Net Amount: $1.94
├── Status: Completed
├── Stellar TX: 3389e9f0f1a6...
├── Created: 2024-09-15 10:30:00
├── Completed: 2024-09-15 10:31:30
└── CO2 Saved: 13.75 kg

Timeline:
10:30:00 - Created
10:30:15 - Authorized by operator
10:30:45 - Payment processing
10:31:15 - Stellar confirmed
10:31:30 - Mobile money sent
10:31:45 - Completed
```

### Handle Disputes

**Path:** Dashboard → Support → Disputes

**View Pending Disputes:**

```
Dispute #DIS-123
├── Transaction: TXN-2024-091500123
├── Reported by: John Doe
├── Reason: Weight incorrect
├── Description: "Scale showed 7kg not 5.5kg"
├── Evidence: [photo1.jpg, photo2.jpg]
├── Status: Under review
├── Created: 2024-09-15 11:00:00
└── SLA: Resolve within 48 hours
```

**Resolution Steps:**

1. Review dispute details
2. Check transaction data
3. View evidence (photos/videos)
4. Contact collection point
5. Contact collector if needed
6. Make decision:
   - **Approve dispute:** Adjust payment
   - **Deny dispute:** Explain reason
   - **Partial resolution:** Compromise
7. Add resolution notes
8. Close dispute
9. Parties notified

### Flag Suspicious Activity

**Automated Flags:**
- Multiple transactions same collector/point (possible collusion)
- Unusually high quality grades
- Repeated disputes
- Rapid transactions
- Weight inconsistencies

**Manual Review:**
1. Review flagged transactions
2. Check patterns
3. Investigate if needed
4. Take action:
   - Warning
   - Temporary suspension
   - Permanent ban
   - Report to authorities

---

## Payment Management

### Payment Overview

**Path:** Dashboard → Payments

**Summary:**
- Total processed today
- Success rate
- Average processing time
- Failed payments
- Pending refunds

### Payment Processing

**Monitor Status:**
- Pending
- Processing
- Completed
- Failed
- Refunded

**Failed Payments:**

When payment fails:

1. View failure reason
2. Check logs
3. Determine cause:
   - Insufficient funds
   - Network issue
   - Invalid phone number
   - Provider error
4. Retry or refund
5. Notify collector

### Refund Processing

**When refund needed:**

1. Go to transaction
2. Click "Issue Refund"
3. Select reason
4. Enter amount (partial or full)
5. Add notes
6. Confirm
7. Process refund
8. Notify user

### Wallet Management

**Platform Wallet:**
- View balance
- Top-up when low
- Set auto-top-up rules
- View transaction history
- Download statements

**Collection Point Wallets:**
- Monitor balances
- Top-up as needed
- Track commission payments
- Set balance alerts

### Payment Reconciliation

**Daily Reconciliation:**

1. Go to Finance → Reconciliation
2. Select date
3. System compares:
   - WasteFi database
   - Stellar ledger
   - Mobile money statements
4. Identify discrepancies
5. Investigate mismatches
6. Adjust if needed
7. Mark as reconciled

---

## Impact Tracking

### Environmental Dashboard

**Path:** Dashboard → Impact

**Metrics:**
- Total CO2 saved
- Materials diverted from landfills
- Equivalent impact (trees planted, miles not driven)
- Monthly trends
- Top contributors

### Carbon Credit Management

**Generate Carbon Credits:**

1. Go to Impact → Carbon Credits
2. Click "Generate Credits"
3. Select date range
4. System calculates:
   - Total CO2 saved
   - Verified transactions
   - Credit value
5. Review calculations
6. Submit for verification
7. Third-party verifies
8. Credits minted
9. Revenue distributed

**Track Credit Status:**
- Pending verification
- Verified
- Minted
- Sold
- Revenue distributed

### Impact Reporting

**Generate Reports:**

1. Select date range
2. Choose metrics
3. Select format (PDF, Excel, CSV)
4. Add filters if needed
5. Generate report
6. Download or email

**Report Types:**
- Monthly impact summary
- Collector impact certificates
- EPR compliance reports
- Carbon credit verification
- Environmental audit reports

---

## Analytics

### Dashboard Analytics

**Path:** Dashboard → Analytics

**Pre-built Reports:**
- User growth
- Transaction volume
- Revenue trends
- Material distribution
- Geographic analysis
- Quality trends
- Payment success rates
- Collection point performance

### Custom Reports

**Create Custom Report:**

1. Click "New Report"
2. Select data source
3. Choose metrics
4. Add dimensions
5. Apply filters
6. Select visualization
7. Save report
8. Schedule if needed

**Example Custom Reports:**
- Weekend vs weekday performance
- Seasonal material trends
- Operator performance comparison
- Collection point profitability
- Collector retention analysis

### Data Export

**Export Data:**

1. Select report or data view
2. Click "Export"
3. Choose format:
   - CSV (raw data)
   - Excel (formatted)
   - PDF (presentation)
   - JSON (API integration)
4. Apply filters
5. Download

---

## Settings

### Platform Settings

**Path:** Dashboard → Settings

#### General Settings
- Platform name
- Logo
- Contact information
- Support hours
- Terms & conditions
- Privacy policy

#### Material Settings
- Add/edit material types
- Set base prices
- Configure quality multipliers
- Update environmental data
- Set acceptance criteria

#### Payment Settings
- Platform fee percentage
- Minimum transaction amount
- Maximum transaction amount
- Payment methods
- Mobile money configurations

#### Regional Settings
- Countries/regions
- Currencies
- Languages
- Time zones
- Tax rates

### User & Access Control

**Manage Admin Users:**

1. Go to Settings → Admin Users
2. View all admin accounts
3. Add new admin:
   - Email
   - Role
   - Permissions
   - Regions (if regional)
4. Edit existing
5. Disable accounts

**Role Permissions:**

Customize what each role can do:
- View users
- Edit users
- Suspend users
- Manage collection points
- Process refunds
- Generate reports
- Change settings

### Security Settings

**Two-Factor Authentication:**
- Enforce 2FA for all admins
- Configure 2FA methods (SMS, Authenticator)
- Backup codes

**Session Management:**
- Session timeout
- Concurrent sessions
- Force logout all sessions

**Audit Logging:**
- All admin actions logged
- View audit log
- Export for compliance
- Retention period

### Notifications

**Configure Alerts:**

Set up alerts for:
- Low wallet balance
- High dispute rate
- Payment failures
- System errors
- Security incidents

**Alert Channels:**
- Email
- SMS
- Slack
- PagerDuty (for critical)

**Alert Rules:**
```
Example:
If payment_failure_rate > 10% in 1 hour
Then: Send email to finance@wastefi.org
      AND Slack #alerts channel
      AND SMS to on-call engineer
```

---

## Support Tools

### Support Tickets

**Path:** Dashboard → Support

**View Tickets:**
- Open
- In progress
- Pending user
- Resolved
- Closed

**Handle Ticket:**

1. Assign to yourself
2. Review details
3. Investigate issue
4. Respond to user
5. Take action if needed
6. Mark as resolved
7. Follow up if required

### Chat Support

**Live Chat:**

1. Monitor chat queue
2. Accept chat
3. View user details in sidebar
4. Chat with user
5. Take actions:
   - View user profile
   - Check transactions
   - Process refund
   - Send app link
6. Resolve and close
7. Rate interaction

### User Impersonation

**For support purposes:**

1. Find user
2. Click "Impersonate"
3. Confirm (requires 2FA)
4. See app as user sees it
5. Identify issues
6. Exit impersonation
7. All actions logged

**⚠️ Use responsibly!**

---

## Best Practices

### Daily Tasks

**Morning (9 AM):**
- Review overnight alerts
- Check system health
- Monitor payment processing
- Review pending approvals

**Midday (1 PM):**
- Check support queue
- Review active disputes
- Monitor transaction volume
- Check collection point status

**Evening (5 PM):**
- Review daily metrics
- Reconcile payments
- Address urgent issues
- Prepare for next day

### Weekly Tasks

- Full payment reconciliation
- Review performance reports
- Check collection point health
- Approve new applications
- Team meeting

### Monthly Tasks

- Generate carbon credits
- Send impact reports
- Review and adjust prices
- Performance reviews
- Strategic planning

### Security Best Practices

1. **Never share credentials**
2. **Always use 2FA**
3. **Log out when done**
4. **Don't access from public WiFi** (use VPN)
5. **Report suspicious activity immediately**
6. **Review audit logs regularly**
7. **Keep software updated**

---

## Troubleshooting

### Common Issues

#### Dashboard Won't Load

```
1. Check internet connection
2. Clear browser cache
3. Try different browser
4. Check system status page
5. Contact IT support
```

#### Can't Export Report

```
1. Check date range (max 1 year)
2. Reduce filters
3. Try different format
4. Check browser pop-up blocker
5. Try again in 5 minutes
```

#### Payment Stuck in Processing

```
1. Check Stellar network status
2. Check mobile money provider status
3. Wait 10 minutes
4. If still stuck:
   - Check transaction logs
   - Contact technical support
   - May need manual intervention
```

---

## Keyboard Shortcuts

Speed up your workflow:

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search |
| `Ctrl + /` | Show shortcuts |
| `G then D` | Go to Dashboard |
| `G then U` | Go to Users |
| `G then T` | Go to Transactions |
| `G then P` | Go to Collection Points |
| `?` | Help |
| `Esc` | Close modal |

---

## Mobile App

The admin dashboard is also available as a mobile app for on-the-go management:

**Features:**
- View key metrics
- Approve collection points
- Handle support tickets
- Monitor transactions
- Receive push alerts

**Download:**
- iOS: App Store
- Android: Google Play

---

## Support

**Admin Support:**
- Email: admin-support@wastefi.org
- Phone: +1-XXX-XXX-XXXX
- Slack: #admin-support
- Hours: 24/7

**Documentation:**
- Full admin docs: https://docs.wastefi.org/admin
- Video tutorials: https://youtube.com/wastefi-admin
- API docs: https://api.wastefi.org/docs

---

## Appendix: Admin Checklist

### New Admin Onboarding

```
☐ Account created
☐ 2FA enabled
☐ Role and permissions assigned
☐ Training completed
☐ Access to communication channels
☐ Emergency contacts shared
☐ Shadowed experienced admin
☐ First week review completed
```

### Monthly Admin Review

```
☐ Review performance metrics
☐ Check system health
☐ Review security incidents
☐ Update procedures if needed
☐ Team feedback session
☐ Training opportunities identified
```

---

**You have the power to keep WasteFi running smoothly! Use it wisely. 🚀**