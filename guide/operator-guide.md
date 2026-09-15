# Collection Point Operator Guide

## Welcome, Collection Point Operators!

This guide will help you manage your WasteFi collection point efficiently and serve collectors professionally.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Daily Operations](#daily-operations)
3. [Quality Assessment](#quality-assessment)
4. [Payment Processing](#payment-processing)
5. [Inventory Management](#inventory-management)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You Need

**Equipment:**
- Digital scale (accurate to 0.1 kg)
- Smartphone or tablet with WasteFi app
- Internet connection (Wi-Fi or mobile data)
- Storage containers or bags
- Safety equipment (gloves, masks)

**Documentation:**
- Collection point license
- Business registration
- Operator identification

### Registration Process

1. **Apply Online**
   - Go to https://partners.wastefi.org
   - Fill out collection point application
   - Upload required documents
   - Submit for review (3-5 business days)

2. **Site Inspection**
   - WasteFi team visits your location
   - Checks space, equipment, safety
   - Takes photos for the app

3. **Training**
   - Complete 4-hour training session
   - Learn material identification
   - Practice using the system
   - Receive operator certification

4. **Account Setup**
   - Download WasteFi Operator app
   - Set up multi-signature wallet
   - Configure operating hours
   - Add accepted materials

### Collection Point Requirements

**Space:**
- Minimum 20 m² covered area
- Separate storage areas by material type
- Accessible to collectors
- Safe and secure

**Equipment:**
- Certified weighing scale
- Backup power (generator or UPS)
- Fire extinguisher
- First aid kit

**Compliance:**
- Business license
- Environmental permits
- Waste handling authorization
- Tax registration

---

## Daily Operations

### Opening Procedures

**Morning Checklist:**
```
☐ Arrive 15 minutes before opening
☐ Check scale calibration
☐ Test internet connection
☐ Check wallet balance
☐ Review pending transactions
☐ Prepare storage areas
☐ Put on safety equipment
☐ Open WasteFi operator app
☐ Set status to "Open"
```

### Processing Collectors

#### Step 1: Welcome the Collector

```
"Habari! Welcome to [Collection Point Name]"
```

- Greet warmly and professionally
- Check if they're registered on WasteFi
- Help new collectors register if needed

#### Step 2: Receive Materials

- Ask collector to show materials
- Visually inspect for contamination
- Separate by material type if mixed

#### Step 3: Weigh and Grade

```
For each material type:
1. Weigh on calibrated scale
2. Record weight
3. Assess quality (A, B, or C)
4. Note any issues
```

**Weight Recording Tips:**
- Zero the scale before each weighing
- Remove packaging weight
- Round to nearest 0.1 kg
- Double-check readings

#### Step 4: Calculate Payment

The app automatically calculates:
```
Base Amount = Weight × Market Price × Quality Multiplier
Platform Fee = Base Amount × 2%
Net Payment = Base Amount - Platform Fee
```

**Example:**
```
Material: PET Plastic
Weight: 5.5 kg
Quality: A (1.2× multiplier)
Base Price: $0.30/kg

Calculation:
5.5 × $0.30 × 1.2 = $1.98
Platform fee (2%): $0.04
Net to collector: $1.94
```

#### Step 5: Confirm with Collector

- Show payment amount on screen
- Explain calculation if asked
- Confirm collector accepts

#### Step 6: Process Payment

1. Collector enters phone number
2. Collector enters PIN
3. System processes payment
4. Payment confirmed (1-2 minutes)
5. Give collector receipt

### Throughout the Day

**Regular Tasks:**
- Process collectors as they arrive
- Sort and store materials properly
- Monitor inventory levels
- Check payment processing status
- Keep area clean and organized

**Every 2 Hours:**
- Check scale calibration
- Review transaction log
- Monitor wallet balance
- Report any issues

### Closing Procedures

**Evening Checklist:**
```
☐ Stop accepting new collectors (15 min before close)
☐ Complete pending transactions
☐ Reconcile daily totals
☐ Sort and secure all materials
☐ Take inventory count
☐ Clean work area
☐ Submit daily report
☐ Set status to "Closed"
☐ Secure premises
```

---

## Quality Assessment

### Quality Grading System

#### Grade A (+20% bonus)

**Criteria:**
- ✅ Clean and dry
- ✅ Labels removed
- ✅ No contamination
- ✅ Properly sorted
- ✅ No damage

**Examples:**
- PET bottles: rinsed, labels off, caps removed
- Aluminum cans: empty, rinsed, crushed
- Cardboard: clean, dry, flattened

#### Grade B (Standard price)

**Criteria:**
- ✅ Clean
- ⚠️ Some labels acceptable
- ✅ Sorted by type
- ⚠️ Minor contamination OK

**Examples:**
- PET bottles: rinsed, some labels on
- Aluminum: clean but not crushed
- Cardboard: mostly clean

#### Grade C (-20% penalty)

**Criteria:**
- ⚠️ Dirty or wet
- ⚠️ Mixed materials
- ⚠️ Significant contamination
- ⚠️ Damaged

**Examples:**
- PET bottles: not rinsed, labels on, dirty
- Aluminum: oily or food residue
- Cardboard: wet, stained, mixed with plastic

#### Grade X (Rejected)

**Not Acceptable:**
- ❌ Hazardous materials
- ❌ Medical waste
- ❌ Severely contaminated
- ❌ Non-recyclable items

### Visual Identification Guide

#### PET Plastic (Code 1)
```
Look for: Clear or colored bottles
Common items: Water bottles, soda bottles, juice containers
Resin code: Triangle with "1" inside
Test: Crunches when squeezed
```

#### HDPE Plastic (Code 2)
```
Look for: Opaque bottles and containers
Common items: Milk jugs, detergent bottles, shampoo bottles
Resin code: Triangle with "2" inside
Test: Stiff, doesn't crunch easily
```

#### Aluminum
```
Look for: Metallic, lightweight
Common items: Beverage cans, food cans
Test: Magnetic test (aluminum is NOT magnetic)
Weight: Very light for size
```

#### Cardboard
```
Look for: Brown corrugated or flat
Common items: Boxes, packaging
Test: Tears easily, shows layers
Smell: Earthy, paper smell
```

### When in Doubt

If you're unsure about a material:
1. Check the WasteFi app identification guide
2. Use the photo identification feature
3. Contact support via chat
4. Ask colleague or supervisor

**Better to ask than accept wrong materials!**

---

## Payment Processing

### Understanding the Payment Flow

```
1. Collector deposits material
2. You process transaction in app
3. Collector approves with PIN
4. Payment sent to Stellar blockchain
5. Converted to mobile money
6. Collector receives SMS confirmation
7. Funds in mobile money account (1-2 min)
```

### Multi-Signature Authorization

For security, collection point payments require multiple signatures:

**Required Signatures:** 2 of 3
- Primary operator
- Secondary operator
- Regional manager

**Process:**
1. Primary operator creates transaction
2. Transaction goes to "pending approval"
3. Secondary operator reviews and approves
4. Payment processes automatically

### Handling Payment Issues

#### Payment Delayed

**Collector:** "My payment hasn't arrived!"

**Actions:**
1. Check transaction status in app
2. Verify collector's phone number
3. Check mobile money network status
4. Wait 5 minutes (sometimes delayed)
5. If still not arrived:
   - Note transaction ID
   - Contact WasteFi support
   - Support will investigate and resolve

#### Collector Disputes Amount

**Collector:** "This amount seems wrong!"

**Actions:**
1. Show calculation on screen:
   ```
   Weight: X kg
   Material: [Type]
   Base price: $X/kg
   Quality grade: [A/B/C] (multiplier)
   Total: $X.XX
   ```
2. Explain quality assessment
3. Offer to re-weigh if questioned
4. If still disagrees:
   - Don't process payment
   - Let collector take materials elsewhere
   - Or adjust quality grade if appropriate

#### Insufficient Wallet Balance

**If wallet balance too low:**
1. Check balance in app
2. Contact regional manager
3. Request top-up
4. In emergency: use backup payment method
5. Ask collector to return later if necessary

---

## Inventory Management

### Storage Best Practices

**By Material Type:**
- Keep separate containers/areas
- Label clearly
- Stack safely (don't overload)
- Keep dry and covered
- First in, first out (FIFO)

**Storage Capacity:**
```
PET Plastic:     500 kg capacity
HDPE Plastic:    300 kg capacity  
Aluminum:        200 kg capacity
Cardboard:       400 kg capacity
```

### Tracking Inventory

**Daily:**
- Record all incoming materials
- Update totals in app
- Monitor capacity levels
- Flag when 80% full

**Weekly:**
- Full inventory count
- Reconcile with transaction records
- Report discrepancies
- Schedule pickups if needed

### Requesting Pickup

When storage reaches 80% capacity:

1. Go to app menu → "Request Pickup"
2. Select materials ready for pickup
3. Enter quantities
4. Choose pickup date/time
5. Submit request
6. Receive confirmation

**Pickup Process:**
1. Recycler arrives with truck
2. Weighs materials
3. You verify weight
4. Sign pickup slip
5. Recycler pays collection point
6. Update inventory in app

---

## Best Practices

### Customer Service Excellence

**Do:**
- ✅ Greet every collector warmly
- ✅ Be patient and helpful
- ✅ Explain processes clearly
- ✅ Help new collectors learn
- ✅ Maintain positive attitude
- ✅ Keep area clean and professional
- ✅ Respect all collectors equally

**Don't:**
- ❌ Rush collectors
- ❌ Be rude or dismissive
- ❌ Negotiate prices (they're standardized)
- ❌ Accept bribes or favors
- ❌ Discriminate
- ❌ Share personal information

### Quality Control

**Weekly Quality Audit:**
```
☐ Check scale accuracy (use test weights)
☐ Review grading consistency
☐ Inspect storage conditions
☐ Check material sorting
☐ Review rejection reasons
```

**Self-Assessment Questions:**
- Am I grading fairly and consistently?
- Are my weights accurate?
- Is my collection point clean?
- Are materials stored properly?
- Are collectors satisfied?

### Safety Procedures

**Personal Safety:**
- Always wear gloves when handling waste
- Use masks if materials are dusty
- Wash hands frequently
- Don't eat or drink near materials
- Keep first aid kit accessible

**Fire Safety:**
- Keep fire extinguisher maintained
- No smoking near materials
- Separate flammable materials
- Clear fire exits
- Know emergency procedures

**Security:**
- Lock storage when closed
- Don't keep large cash amounts
- Report suspicious activity
- Keep emergency contacts handy

### Building Collector Relationships

**Loyal collectors = successful business**

**Ways to Build Relationships:**
- Remember regular collectors' names
- Provide tips on quality improvement
- Be consistent and fair
- Communicate changes clearly
- Create community feeling
- Celebrate milestones (1000kg collected!)

### Maximizing Collection Point Success

**Marketing:**
- Keep signage visible and clean
- Share location on social media
- Encourage collectors to refer friends
- Offer bonus days (e.g., +5% on Saturdays)

**Operations:**
- Maintain fast service (target: 5 min per collector)
- Minimize downtime
- Keep accurate records
- Respond quickly to issues

**Community Impact:**
- Track total CO2 saved
- Share environmental impact
- Partner with local schools
- Organize clean-up events

---

## Troubleshooting

### Technical Issues

#### App Won't Load

```
1. Check internet connection
2. Force close and reopen app
3. Clear app cache
4. Restart device
5. Reinstall if needed
6. Contact support
```

#### Scale Not Working

```
1. Check power/battery
2. Calibrate with test weights
3. Check for damage
4. Use backup scale if available
5. Call equipment support
```

#### Payment Processing Slow

```
1. Check internet speed
2. Verify Stellar network status (app shows)
3. Check mobile money provider status
4. Wait 5 minutes
5. Contact support if issue persists
```

### Operational Issues

#### Too Many Collectors

**During busy times:**
- Set up queue system
- Give estimated wait times
- Ask collectors to pre-sort
- Call in additional operator if available
- Extend hours if possible

#### Running Out of Space

**Storage full:**
- Request emergency pickup
- Temporarily stop accepting full materials
- Update app status
- Redirect to nearby collection points
- Communicate clearly with collectors

#### Dispute with Collector

**If conflict arises:**
1. Stay calm and professional
2. Listen to collector's concern
3. Explain your position clearly
4. Show evidence (weight, photos)
5. Offer compromise if reasonable
6. If unresolved: offer formal dispute process
7. Document incident in app

### When to Contact Support

**Immediate (Phone):**
- Payment system down
- Security incident
- Equipment failure preventing operations
- Collector safety issue

**Same Day (Chat):**
- Payment disputes
- Material identification questions
- Technical glitches
- Inventory questions

**Next Day (Email):**
- Suggestions for improvement
- Non-urgent questions
- Reporting feedback
- Administrative issues

---

## Performance Metrics

Track your collection point's performance:

**Key Metrics:**
- **Daily Throughput:** Number of collectors served
- **Average Wait Time:** Target < 5 minutes
- **Quality Grade Distribution:** Aim for 60%+ Grade A
- **Customer Satisfaction:** Track ratings
- **Inventory Turnover:** Days to pickup
- **Revenue:** Total payments processed

**Monthly Goals:**
```
Collectors Served:    500+
Material Collected:   2,000+ kg
Grade A Rate:         60%+
Customer Rating:      4.5+ stars
Dispute Rate:         < 2%
```

---

## Training and Development

### Continuing Education

**Monthly Training Topics:**
- New material types
- Quality grading updates
- System improvements
- Best practices sharing
- Safety refreshers

**Resources:**
- Operator handbook (this guide)
- Video tutorials in app
- Monthly operator calls
- WhatsApp operator community
- Annual operator conference

### Certification Levels

**Bronze Operator** (0-3 months)
- Basic operations
- Standard materials
- Supervised

**Silver Operator** (3-12 months)
- Independent operations
- All materials
- Can train others

**Gold Operator** (12+ months)
- Advanced operations
- Mentor other operators
- Regional leader
- Higher commission rates

---

## Compensation

### Operator Earnings

**Base Commission:** 5% of transaction value

**Bonuses:**
- Volume bonus: +1% for 100+ collectors/week
- Quality bonus: +1% for 70%+ Grade A materials
- Customer rating: +1% for 4.8+ stars
- Referral bonus: $10 per new collection point referred

**Example Monthly Earnings:**
```
Collectors per day: 30
Average transaction: $3
Days per month: 26

Base: 30 × $3 × 26 × 5% = $117
Bonuses: +$35
Total: $152/month

(Plus material selling profit!)
```

---

## Contact Information

**Support Hotline:**
- Kenya: +254-700-WASTEFI
- Ghana: +233-50-WASTEFI
- Nigeria: +234-800-WASTEFI

**Email:** operators@wastefi.org

**WhatsApp Group:** Ask your regional manager

**Emergency:** emergency@wastefi.org

---

## Appendix: Quick Reference

### Material Codes
```
PET   - Clear plastic bottles (Code 1)
HDPE  - Opaque plastic bottles (Code 2)
PP    - Plastic containers (Code 5)
ALU   - Aluminum cans
STEEL - Steel/tin cans
CARD  - Cardboard boxes
PAPER - Paper and newspaper
GLASS - Glass bottles
```

### Quality Quick Check
```
A = Clean + Sorted + Dry + Labels off
B = Clean + Sorted
C = Accepted but needs work
X = Rejected
```

### Emergency Contacts
```
Fire:     999
Police:   911
Support:  [Your regional number]
```

---

**Thank you for being a WasteFi collection point operator! Together, we're building a cleaner, more sustainable future. 🌍💚**