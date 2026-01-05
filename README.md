# EquiProfile

**Professional Equine Management Platform**

EquiProfile is a comprehensive, cloud-based platform designed to centralize and streamline the management of horses, stables, and equestrian operations. Built for horse owners, trainers, stable managers, and veterinary professionals, EquiProfile combines intelligent automation, secure data management, and collaborative tools to support the modern equestrian industry.

---

## Project Overview

### What is EquiProfile?

EquiProfile is an AI-assisted equine management and stable intelligence platform that provides a unified system for tracking health records, managing training schedules, monitoring costs, and facilitating team collaboration across equestrian operations of any scale.

### Core Problems Solved

**For Individual Horse Owners:**
- Fragmented records across paper, spreadsheets, and multiple apps
- Missed vaccinations, deworming, and farrier appointments
- Difficulty tracking feed costs and veterinary expenses
- No centralized system for sharing horse information with trainers and vets

**For Professional Stables:**
- Inefficient communication between stable staff, trainers, and owners
- Manual scheduling and reminder systems prone to human error
- Limited visibility into per-horse costs and operational expenses
- Compliance challenges with health and safety documentation
- Difficulty scaling operations as the business grows

**For Trainers and Veterinary Professionals:**
- Inconsistent access to complete horse health histories
- Time wasted requesting basic information from owners
- Lack of structured performance and training data
- Inefficient collaboration with multiple stakeholders

### Who is EquiProfile For?

- **Individual Horse Owners** managing one or more horses
- **Professional Stables** requiring multi-user collaboration and role-based access
- **Trainers** needing structured performance tracking and client communication
- **Stable Managers** coordinating operations across teams and facilities
- **Veterinary Professionals** requiring comprehensive health history access
- **Competition Riders** tracking results, goals, and performance analytics

---

## Key Features Overview

### Horse Management
Complete digital profiles for each horse including breed, pedigree, registration, microchip, physical characteristics, discipline, competition level, and comprehensive notes.

### Medical & Health Records
Centralized tracking of veterinary visits, vaccinations, deworming schedules, dental care, farrier appointments, injuries, medications, and medical document storage with automated due-date reminders.

### Feeding & Supplement Management
Structured feeding plans with meal timing, quantities, brands, and special instructions. Cost tracking for feed and supplements with monthly expense summaries.

### Training & Performance Tracking
Detailed training session logs including session type, duration, exercises, performance ratings, trainer notes, and weather conditions. Competition results tracking with placement, scores, and analytics.

### Scheduling & Event Management
Calendar-based system for all horse-related events including training sessions, vet appointments, competitions, and recurring tasks. Configurable reminder system with notification support.

### Document Vault
Secure cloud storage for registration papers, insurance documents, veterinary reports, competition results, and legal documentation. Organized by category with tagging and search capabilities.

### Stable & Team Collaboration
Multi-user stable accounts with role-based permissions (Owner, Admin, Trainer, Member, Viewer). Invitation system for adding team members with granular access control.

### Financial Tracking
Per-horse and stable-level expense tracking including feed costs, veterinary bills, farrier services, competition fees, and training expenses. Exportable financial summaries.

### Shareable Profiles
Generate secure, shareable links for horse profiles with privacy controls. Useful for sales listings, sponsor presentations, trainer collaboration, and competition records.

### AI-Assisted Insights
Intelligent weather analysis for riding conditions. AI-generated summaries and recommendations based on horse health data, training patterns, and historical performance.

### Weather Intelligence
Real-time weather data integration with AI-powered riding condition analysis. Safety recommendations based on temperature, wind, precipitation, UV index, and visibility.

### Admin Access & Unlock System
EquiProfile implements a two-factor admin security system to protect sensitive administrative functions.

**Admin Unlock Flow:**
1. User must have `admin` role assigned in the database
2. Admin must explicitly unlock admin mode via AI Chat by typing `show admin`
3. System prompts for admin unlock password (default: `ashmor12@` - **CHANGE IN PRODUCTION**)
4. Once unlocked, admin session is active for 30 minutes
5. Admin panel becomes visible in sidebar with full administrative capabilities

**Why This Design?**
- Role-based access prevents unauthorized users from seeing admin features
- Session-based unlock adds a second authentication factor
- Time-limited sessions (30 minutes) reduce risk of unauthorized access
- AI Chat integration hides admin unlock from UI, preventing casual discovery
- Password-protected unlock ensures only authorized personnel can access admin functions

**Admin Capabilities:**
- ✅ View all users and their subscription details
- ✅ Suspend/unsuspend user accounts
- ✅ Change user roles and permissions
- ✅ View system statistics and health metrics
- ✅ Access activity logs and audit trails
- ✅ Manage system settings and configuration
- ✅ Create and manage API keys for integrations
- ✅ Monitor environment health and configuration status
- ✅ Access backup logs

**Security Best Practices:**
1. **Change default password immediately** - Set strong `ADMIN_UNLOCK_PASSWORD` in environment variables
2. Rotate password regularly (recommended every 90 days)
3. Monitor admin activity logs for suspicious access patterns
4. Revoke admin sessions if device is lost or compromised
5. Use strong passwords (16+ characters, mixed case, numbers, symbols)

---

## API Key Management

EquiProfile provides secure API key generation and management for third-party integrations and custom applications.

**Features:**
- **Secure Generation**: API keys use bcrypt hashing (cost factor 10) with unique prefixes
- **One-Time Display**: Full key shown only once during creation for maximum security
- **Rate Limiting**: Configurable request limits per key (default: 100/hour)
- **Revocation**: Instant key deactivation with audit trail
- **Rotation**: Generate new key while maintaining the same API key ID
- **Activity Tracking**: Last used timestamp and usage monitoring
- **Expiration Dates**: Optional automatic key expiration

**Key Format:** `ep_Xy9z_abc123...` (prefix + unique identifier)

**Access:** Admin Panel → API Keys tab (requires unlocked admin session)

---

## Detailed Feature Breakdown

### A) User Accounts & Authentication

EquiProfile uses secure OAuth-based authentication, eliminating the need for password management while ensuring enterprise-grade security.

**Authentication Flow:**
- Users authenticate via trusted OAuth providers (Google, Microsoft, etc.)
- Session management with secure, HTTP-only cookies
- Automatic session expiration and renewal
- Multi-device support with synchronized sessions

**User Profiles:**
- Personal information including name, email, phone, and location
- Profile photo uploads
- Communication preferences
- Activity history and audit logs

**Subscription Awareness:**
- 7-day free trial for all new accounts
- Automatic trial status tracking with expiration notifications
- Seamless upgrade flow to paid subscriptions
- Subscription status displayed throughout the platform

### B) Stable & Team Management

EquiProfile supports collaborative management through stable accounts that enable multiple users to work together while maintaining appropriate access controls.

**Creating a Stable:**
- Named stable/team entity with description and location
- Optional logo upload for branding
- Designated owner with full administrative rights
- Association of horses to stable for team access

**Inviting Team Members:**
- Email-based invitation system
- Pre-assigned roles before acceptance
- Invitation expiration (7 days) for security
- Resend and revoke capabilities
- Invitation tracking (pending, accepted, declined, expired)

**Roles and Permissions:**

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | Stable creator | Full access: manage members, edit horses, delete stable |
| **Admin** | Stable administrator | Manage members, edit all horses, manage documents |
| **Trainer** | Professional trainer | View all horses, edit training sessions, view health records |
| **Member** | Stable staff | View assigned horses, add training logs, view documents |
| **Viewer** | Read-only access | View horses and records, no editing capabilities |

**Collaboration Model:**
- Role-based access ensures appropriate visibility
- Activity logs track all changes with user attribution
- Team members see only horses within their stable
- Owners can transfer horses between personal and stable accounts

### C) Horse Management

Each horse in EquiProfile has a comprehensive digital profile that serves as the central hub for all related information.

**Basic Information:**
- Name, breed, age, and date of birth
- Physical characteristics: height (hands), weight (kg), color
- Gender: stallion, mare, gelding
- Registration number and microchip number
- Discipline: dressage, show jumping, eventing, racing, pleasure, etc.
- Competition level: beginner, intermediate, advanced, professional
- Profile photo with crop and resize capabilities

**Health Summary Dashboard:**
- Next vaccination due date with countdown
- Last deworming date and schedule
- Upcoming veterinary appointments
- Recent health alerts or issues
- Medical history at a glance

**Feeding Plan Overview:**
- Current feeding schedule by meal time
- Active supplements and medications
- Special dietary instructions
- Estimated monthly feed costs

**Training Records:**
- Recent training session history
- Performance trends and analytics
- Upcoming scheduled sessions
- Training goals and progress tracking

**Notes and Attachments:**
- Free-form notes field for general information
- Behavioral observations
- Special handling instructions
- Owner preferences
- Document attachments linked to horse profile

**Horse Lifecycle Management:**
- Active/inactive status toggle
- Soft deletion (preserves historical data)
- Horse transfer between users or stables
- Ownership history tracking

### D) Medical & Health Records

EquiProfile provides comprehensive health tracking with structured data entry and intelligent reminder systems.

**Record Types:**

**Veterinary Visits:**
- Date of visit
- Veterinarian name, clinic, and contact information
- Reason for visit and diagnosis
- Treatment provided
- Prescribed medications
- Cost of visit
- Follow-up requirements
- Next appointment date
- Attached documents (lab results, x-rays, reports)

**Vaccinations:**
- Vaccine name and type (influenza, tetanus, etc.)
- Date administered
- Batch number for traceability
- Administering veterinarian
- Next due date (automatic calculation)
- Booster schedule
- Adverse reactions (if any)
- Cost and invoice documentation
- Compliance tracking for competition requirements

**Deworming:**
- Product name and active ingredient
- Date administered
- Dosage based on horse weight
- Weight at time of treatment (for dosage accuracy)
- Next due date (typically 8-12 weeks)
- Fecal egg count results (if available)
- Rotation schedule tracking
- Cost tracking

**Dental Care:**
- Dental examination date
- Dental professional information
- Findings and treatment
- Next examination due date
- Cost and documentation

**Farrier Services:**
- Shoeing/trimming date
- Farrier contact information
- Work performed (front shoes, hind shoes, trim only)
- Special shoes or corrective work
- Next appointment date (typically 6-8 weeks)
- Cost per visit
- Hoof health notes

**Injuries and Illnesses:**
- Date of onset
- Description of injury or illness
- Treatment protocol
- Recovery timeline
- Veterinary oversight
- Return to work date
- Long-term implications

**Medication Tracking:**
- Medication name and purpose
- Dosage and frequency
- Start and end dates
- Prescribing veterinarian
- Administration instructions
- Withdrawal periods for competition
- Side effects or concerns

**Due-Date Tracking and Reminders:**
- Automatic calculation of next due dates based on typical schedules
- Dashboard alerts for upcoming deadlines
- Configurable reminder notifications (7, 14, 30 days in advance)
- Color-coded status indicators (due soon, overdue, up to date)
- Email and push notification support

**Medical Passport:**
- Printable summary of complete vaccination and deworming history
- Required for travel, competition, and facility compliance
- Export to PDF with professional formatting
- Shareable with veterinarians and competition organizers

### E) Feeding & Supplements

EquiProfile enables precise feeding management with cost tracking and nutritional monitoring.

**Daily Feeding Plans:**

For each horse, define multiple meal times throughout the day:

| Meal Time | Feed Type | Brand | Quantity | Unit | Instructions |
|-----------|-----------|-------|----------|------|--------------|
| Morning | Hay | Timothy | 2 | flakes | Feed before grain |
| Morning | Grain | Triple Crown | 1.5 | scoops | Mix with warm water |
| Midday | Supplements | MSM | 1 | scoop | Joint support |
| Evening | Hay | Timothy | 2 | flakes | Free choice |
| Evening | Grain | Triple Crown | 2 | scoops | Higher evening ration |

**Feeding Schedule Features:**
- Multiple meals per day (morning, midday, evening, night)
- Support for various feed types: hay, grain, pellets, supplements, treats
- Quantity tracking with flexible units (kg, lbs, scoops, flakes, cups)
- Brand/product names for consistency
- Special instructions per meal (temperature, mixing, timing)
- Frequency settings (daily, twice daily, as needed)
- Active/inactive toggles for seasonal changes

**Supplement Management:**
- Separate tracking for vitamins, minerals, joint supplements
- Dosage and administration instructions
- Purpose and expected outcomes
- Start and end dates
- Cost per container and cost per dose

**Cost Tracking:**

**Feed Cost Entry:**
- Date of purchase
- Feed type and brand
- Quantity purchased
- Cost per unit
- Total cost
- Supplier information
- Expected duration

**Monthly Expense Summaries:**
- Automatic calculation of monthly feed costs per horse
- Stable-level summaries for multiple horses
- Cost trends over time
- Budget vs. actual comparisons
- Exportable reports for accounting

**Nutritional Notes:**
- Dietary restrictions or allergies
- Weight management goals
- Body condition score tracking
- Ration adjustments based on workload
- Seasonal feeding changes

### F) Scheduling & Reminders

EquiProfile provides a comprehensive calendar system for managing all horse-related events and appointments.

**Event Types:**

**Training Sessions:**
- Scheduled training appointments
- Trainer assignments
- Session type and focus areas
- Duration and intensity
- Location (arena, field, cross-country)

**Veterinary Appointments:**
- Routine check-ups
- Vaccination appointments
- Dental examinations
- Lameness evaluations
- Follow-up visits

**Farrier Appointments:**
- Scheduled shoeing/trimming
- Corrective work sessions
- Emergency calls

**Physiotherapy/Bodywork:**
- Massage therapy
- Chiropractic adjustments
- Acupuncture
- Other complementary therapies

**Competition Events:**
- Show entries
- Competition dates
- Travel arrangements
- Results entry after event

**General Events:**
- Lessons
- Clinics
- Trail rides
- Team meetings
- Facility maintenance

**Event Details:**
- Title and description
- Start and end date/time
- All-day event toggle
- Location with address
- Associated horse(s)
- Team member assignments
- Color coding for visual organization
- Completion status tracking

**Recurring Events:**

Support for repeating schedules using iCal-compatible recurrence rules:
- Daily, weekly, monthly, yearly patterns
- Custom intervals (every 6 weeks for farrier)
- End date or occurrence count
- Exception handling for holidays or conflicts

**Reminder System:**

**Notification Types:**
- Email notifications
- Push notifications (browser and mobile)
- SMS notifications (future enhancement)

**Reminder Timing:**
- Same day (morning of event)
- 1 day in advance
- 3 days in advance
- 7 days in advance
- 14 days in advance
- Custom timing per event

**Reminder Management:**
- User preferences for notification methods
- Per-event reminder configuration
- Snooze and dismiss options
- Delivery status tracking
- Sent/failed audit logs

### G) Document Vault

Secure, cloud-based document storage with intelligent organization and retrieval.

**Supported Document Types:**
- PDFs
- Images (JPEG, PNG)
- Scanned documents
- Veterinary reports
- X-rays and diagnostic images
- Insurance policies
- Registration papers
- Competition results
- Bills and invoices

**Storage Architecture:**
- AWS S3 secure cloud storage
- Encrypted at rest and in transit
- Redundant storage for reliability
- Pre-signed URLs for secure access
- Automatic thumbnail generation for images

**Document Organization:**

**Category System:**
- Health: Veterinary reports, lab results, x-rays
- Registration: Breed papers, microchip certificates
- Insurance: Policies, claims, coverage documents
- Competition: Entry confirmations, results, qualifications
- Other: General documents and files

**Tagging System:**
- Multiple tags per document
- Custom tag creation
- Tag-based filtering
- Tag clouds for quick navigation
- Auto-tagging suggestions

**Metadata:**
- Upload date and time
- Uploaded by (user attribution)
- File size and type
- Associated horse
- Associated health record (if applicable)
- Description field
- Last modified date

**Search Capabilities:**
- Full-text search in document names
- Description field search
- Category filtering
- Tag filtering
- Date range filtering
- Horse-specific filtering
- Combined filter searches

**Document Actions:**
- View online (in-browser PDF/image viewer)
- Download original file
- Share via secure link
- Delete (with confirmation)
- Replace with updated version
- Print directly from viewer

**Access Control:**
- Documents inherit horse-level permissions
- Stable team members see documents for their stable's horses
- Individual owners see only their horse documents
- Shareable links can be public or private
- Link expiration options

### H) Performance & Competition Tracking

EquiProfile provides structured tracking of competition results, goals, and performance analytics.

**Competition Records:**

**Basic Information:**
- Competition name and venue
- Date of competition
- Discipline (dressage, show jumping, eventing, etc.)
- Level/height (novice, preliminary, 1.20m, etc.)
- Class or division name
- Entry fee cost

**Results:**
- Placement (1st, 2nd, 3rd, etc.)
- Score or percentage
- Penalties (if applicable)
- Time (for timed events)
- Qualifying status
- Prize money or winnings

**Performance Notes:**
- Detailed description of performance
- What went well
- Areas for improvement
- Horse behavior and temperament
- Course or test analysis
- Judge comments
- Trainer feedback

**Documentation:**
- Test sheets or score sheets
- Photos from competition
- Video links
- Prize ribbons or certificates

**Goals and Objectives:**

**Goal Setting:**
- Define specific, measurable goals per horse
- Timeline for achieving goals
- Current progress tracking
- Milestones and checkpoints

**Goal Categories:**
- Competition goals (qualify for championships, move up a level)
- Training goals (master flying changes, improve collection)
- Health goals (maintain soundness, improve fitness)
- Financial goals (break even, earn back costs)

**Progress Tracking:**
- Regular progress updates
- Visual progress indicators
- Achievement celebration
- Goal adjustment based on reality

**Performance Analytics:**

**Competition Statistics:**
- Total competitions entered
- Total placings (1st, 2nd, 3rd, etc.)
- Average score or percentage
- Success rate by venue
- Success rate by discipline
- Seasonal performance trends

**Cost vs. Earnings:**
- Total entry fees paid
- Total prize money earned
- Net profit/loss
- Return on investment analysis

**Performance Trends:**
- Score improvements over time
- Consistency analysis
- Peak performance periods
- Comparison against goals

**Comparative Analysis:**
- Performance at different venues
- Performance with different riders
- Performance in different conditions
- Historical performance comparisons

### I) Financial Tracking

EquiProfile provides comprehensive expense tracking to help owners and stable managers understand the true cost of horse ownership.

**Expense Categories:**

**Feed and Supplements:**
- Daily feed costs (hay, grain, pellets)
- Supplement costs
- Treat and reward costs
- Feed storage and delivery fees

**Veterinary Care:**
- Routine check-ups
- Vaccinations
- Deworming
- Dental care
- Emergency visits
- Medications and prescriptions
- Diagnostic testing (x-rays, ultrasound, blood work)
- Surgical procedures

**Farrier Services:**
- Regular shoeing/trimming
- Corrective shoeing
- Emergency calls
- Hoof care products

**Training and Lessons:**
- Professional training fees
- Lesson costs
- Clinic and seminar fees
- Trainer travel expenses

**Competition Costs:**
- Entry fees
- Stabling at shows
- Braiding services
- Travel expenses (fuel, tolls)
- Accommodation for rider/groom
- Show-specific equipment or attire

**Boarding and Facilities:**
- Monthly board or stable fees
- Arena rental
- Turnout or paddock fees
- Additional services (blanketing, feeding)

**Insurance:**
- Mortality insurance
- Liability insurance
- Major medical insurance
- Loss of use insurance

**Equipment and Tack:**
- Saddles and bridles
- Blankets and sheets
- Boots and wraps
- Grooming supplies
- Replacement or repair costs

**Per-Horse Tracking:**
- All expenses tagged to specific horse
- Monthly expense totals
- Category breakdowns
- Cost trends over time
- Comparison against budget

**Stable-Level Summaries:**
- Aggregate costs across all horses
- Average cost per horse
- Category distribution
- Monthly and annual totals
- Cost allocation by owner (for shared stables)

**Financial Reports:**

**Monthly Summary:**
- Total expenses by category
- Comparison to previous month
- Year-to-date totals
- Budget vs. actual variance

**Annual Report:**
- Complete yearly expenses
- Category distribution pie chart
- Month-by-month breakdown
- Competition earnings offset
- Tax-ready summaries

**Export Options:**
- CSV export for Excel or accounting software
- PDF formatted reports
- QuickBooks-compatible formats
- Custom date range exports

### J) Shareable Horse Profiles

EquiProfile enables users to generate secure, shareable links for horse profiles with configurable privacy settings.

**Share Link Types:**

**Horse Profile:**
- Complete horse information
- Health summary (configurable visibility)
- Training and performance highlights
- Competition results
- Photo gallery

**Medical Passport:**
- Vaccination history
- Deworming records
- Veterinary contact information
- Required for travel or competitions

**Stable Profile:**
- Overview of all horses in stable
- Stable information and branding
- Team introduction
- Facility details

**Link Configuration:**

**Privacy Controls:**
- Public: accessible to anyone with the link
- Private: requires authentication or access code
- Expiration date (optional)
- View-only access (no data editing)

**Visibility Settings:**

Configure which sections are visible to link recipients:
- Basic information (always visible)
- Health records (toggle)
- Training records (toggle)
- Financial information (toggle)
- Documents (toggle)
- Contact information (toggle)

**Link Analytics:**
- View count tracking
- Last viewed date
- Unique visitor count (IP-based)
- Geographic distribution of views (optional)

**Use Cases:**

**Horse Sales:**
- Share complete profile with potential buyers
- Professional presentation of horse's history
- Controlled disclosure of sensitive information
- Easy updates as horse's career progresses

**Sponsor Presentations:**
- Showcase competition results
- Demonstrate training progress
- Build sponsor confidence with transparent tracking
- Regular updates without manual reports

**Trainer Collaboration:**
- Share profile with new trainers
- Provide comprehensive background
- Enable informed training program design
- Maintain access as long as needed

**Veterinary Coordination:**
- Provide complete medical history to new vet
- Enable emergency access in crisis situations
- Facilitate specialist consultations
- Ensure continuity of care

**Insurance Applications:**
- Provide documented history for underwriting
- Demonstrate proper care and management
- Support claims with comprehensive records
- Streamline application process

**Link Management:**
- Dashboard view of all active share links
- Easy link revocation
- Link regeneration (new URL, old becomes invalid)
- Usage monitoring and alerts
- Bulk link management for stables

### K) AI-Assisted Insights

EquiProfile incorporates artificial intelligence to provide actionable insights and decision support.

**Weather Intelligence:**

**Real-Time Weather Data:**
- Integration with weather APIs for current conditions
- Location-based forecasts
- Extended 7-day outlook
- Severe weather alerts

**Riding Condition Analysis:**

AI analyzes multiple weather factors to generate riding recommendations:
- Temperature (too hot, too cold, ideal)
- Humidity (heat index, risk of dehydration)
- Wind speed (unsafe, challenging, calm)
- Precipitation (heavy rain, light rain, dry)
- UV index (sun protection needs)
- Visibility (fog, clarity)
- Ground conditions (frozen, muddy, firm)

**Safety Recommendations:**
- Excellent: ideal conditions for all activities
- Good: safe with minor considerations
- Fair: proceed with caution
- Poor: avoid strenuous work
- Not Recommended: unsafe conditions, stay inside

**AI Analysis Text:**
Natural language summary of conditions:
> "Temperature is 18°C with light winds and clear skies. Excellent conditions for flatwork and jumping. UV index is moderate, consider sun protection for extended rides. Ground is firm and ideal for work."

**Health Data Interpretation:**

**Vaccination Compliance:**
- AI identifies horses with overdue vaccinations
- Suggests optimal scheduling for multiple horses
- Alerts to competition qualification requirements
- Identifies patterns of missed appointments

**Weight and Condition Monitoring:**
- Tracks weight changes over time
- Correlates with feeding adjustments
- Alerts to significant changes requiring attention
- Suggests ration modifications

**Training Patterns:**
- Identifies training frequency trends
- Suggests rest days based on intensity
- Recognizes overtraining indicators
- Recommends variety in session types

**Cost Optimization:**

**Feed Cost Analysis:**
- Compares costs across different brands
- Identifies more economical alternatives
- Suggests bulk purchase opportunities
- Tracks price trends over time

**Veterinary Spend:**
- Highlights unusual expense spikes
- Identifies preventive care opportunities
- Suggests budget allocations
- Compares costs against regional averages

**Competition ROI:**
- Calculates cost per competition
- Analyzes entry fees vs. winnings
- Suggests optimal competition level
- Identifies most cost-effective venues

**AI Usage Limits:**

AI features are subject to usage limits based on subscription tier to manage API costs:

| Feature | Trial | Pro | Stable |
|---------|-------|-----|--------|
| Weather Analysis | 10/day | 50/day | Unlimited |
| Health Insights | 5/month | 20/month | 50/month |
| Cost Analysis | Not available | 10/month | 30/month |

Limits reset monthly and are tracked per account.

### L) Offline-First & Mobile Support

EquiProfile is designed as a Progressive Web App (PWA) to ensure reliability and accessibility across all devices.

**Progressive Web App Features:**

**Installation:**
- Install to home screen on mobile devices
- Standalone app experience (no browser chrome)
- Native-like interface and navigation
- App icon and splash screen

**Offline Capabilities:**

**Data Entry:**
- Record training sessions without internet
- Add health records offline
- Create feeding plan updates offline
- Capture notes and observations offline

**Local Storage:**
- Recently viewed horses cached
- Recent records available offline
- Documents downloaded for offline view
- Forms and templates cached

**Automatic Synchronization:**
- Data syncs when connection restored
- Conflict resolution for simultaneous edits
- Sync status indicators
- Manual sync trigger option

**Mobile-Optimized Interface:**

**Touch-Friendly Design:**
- Large tap targets for fingers
- Swipe gestures for navigation
- Pull-to-refresh functionality
- Bottom navigation for thumb reach

**Responsive Layouts:**
- Adapts to phone, tablet, and desktop screens
- Optimized for portrait and landscape
- Readable text sizes on all devices
- Appropriate information density per device

**Camera Integration:**
- Direct photo capture for horse profiles
- Document scanning via camera
- Image compression for faster uploads
- Batch upload support

**Performance Optimization:**

**Fast Initial Load:**
- Code splitting for faster first paint
- Lazy loading of heavy components
- Image optimization and compression
- Minimal bundle size

**Smooth Interactions:**
- 60fps animations
- Instant feedback on user actions
- Optimistic UI updates
- Background processing for heavy tasks

**Data Efficiency:**
- Pagination for large lists
- Incremental loading
- Request caching
- Minimal API calls

**Cross-Device Synchronization:**
- Real-time updates across devices
- Session continuity
- Notification syncing
- Consistent experience everywhere

---

## Subscription Plans & Access Control

EquiProfile uses a freemium model with three subscription tiers, each designed for specific user needs.

### Free Trial (7 Days)

**Access:**
- Full platform access for 7 days
- All features unlocked during trial
- Up to 3 horses
- Single user account
- 1GB document storage

**Purpose:**
- Evaluate platform fit
- Test all features
- Import existing data
- Make informed subscription decision

**Trial Expiration:**
- Clear notifications 3 days before expiry
- 1-day warning notification
- Automatic downgrade to read-only access after expiry
- Data preserved for 30 days
- Easy upgrade flow to restore full access

### Pro Plan (£7.99/month or £79.90/year)

**Designed for:** Individual horse owners managing 1-5 horses personally.

**Features:**
- Unlimited horses (recommended limit: 5 for optimal experience)
- Complete health record tracking
- Training and competition logs
- Feeding plan management
- Document vault (10GB storage)
- AI weather analysis (50 requests/day)
- Email reminders
- Mobile app access
- Export reports

**Limitations:**
- Single user account (no team collaboration)
- No stable/team features
- Standard AI usage limits
- Email support only

**Billing:**
- Monthly: £7.99/month (cancel anytime)
- Yearly: £79.90/year (2 months free, 17% savings)
- Automatic renewal
- Secure payment via Stripe

### Stable Plan (£24.99/month or £249.90/year)

**Designed for:** Professional stables, trainers, and multi-user operations.

**Features:**
- All Pro features included
- Unlimited horses
- Unlimited team members
- Role-based access control
- Stable/team management
- Shared calendars and reminders
- 100GB document storage
- Advanced AI insights (unlimited weather, 50 health insights/month)
- Priority email support
- Phone support (business hours)
- Dedicated account manager (annual plans)

**Team Collaboration:**
- Owner, Admin, Trainer, Member, Viewer roles
- Granular permissions
- Team activity logs
- Shared document access
- Collaborative scheduling

**Billing:**
- Monthly: £24.99/month (cancel anytime)
- Yearly: £249.90/year (2 months free, 17% savings)
- Invoicing available for businesses
- Multi-stable discounts available

### Feature Access Control

**Server-Side Enforcement:**

All feature access is enforced at the API level to ensure security:

```
Subscription Check Middleware:
1. Identify authenticated user
2. Query current subscription status
3. Check trial expiration date
4. Verify feature access for requested operation
5. Return error if access denied
6. Proceed with request if authorized
```

**Protected Operations:**
- Creating/editing horses (trial/expired users blocked)
- Adding health records (requires active subscription)
- Uploading documents (requires active subscription)
- AI analysis requests (counted against daily/monthly limits)
- Team invitations (Stable plan only)
- Advanced reports (Stable plan only)

**Grace Period:**
- 3-day grace period after payment failure
- Read-only access during grace period
- Renewal reminders sent daily
- Data preserved for 30 days after cancellation

**Upgrade Flow:**
- One-click upgrade from any page
- Prorated billing for plan changes
- Immediate feature access after payment
- Automatic data migration (no re-entry required)

---

## Technology Stack

EquiProfile is built with modern, production-grade technologies optimized for performance, security, and maintainability.

### Frontend

**Core Framework:**
- **Vite** - Build tool for fast development and optimized production builds
- **React 19** - User interface library with latest features
- **TypeScript** - Type safety and enhanced developer experience
- **Wouter** - Lightweight client-side routing

**UI & Styling:**
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Framer Motion** - Animation library for smooth interactions
- **Lucide React** - Icon library with 1000+ consistent icons

**State Management & Data Fetching:**
- **tRPC** - End-to-end type-safe API client
- **TanStack Query** - Powerful async state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation for type safety

**Additional Libraries:**
- **date-fns** - Date manipulation and formatting
- **Recharts** - Composable charting library
- **Embla Carousel** - Touch-friendly carousel
- **Sonner** - Toast notifications

### Backend

**Core Framework:**
- **Node.js 22** - JavaScript runtime
- **Express** - Web application framework
- **tRPC** - Type-safe API layer
- **TypeScript** - Full-stack type safety

**Security:**
- **Helmet** - Security headers middleware
- **express-rate-limit** - Rate limiting and DDoS protection
- **jose** - JWT handling for authentication
- **cookie** - Secure cookie management

**Data & Storage:**
- **Drizzle ORM** - Type-safe database ORM
- **MySQL 8.0** - Relational database
- **AWS S3** - Cloud object storage for documents
- **@aws-sdk/client-s3** - S3 integration

**Payment Processing:**
- **Stripe** - Payment gateway and subscription management
- **Webhook signature verification** - Security for payment events

**AI & External Services:**
- **OpenAI API** - AI-powered insights and analysis
- **Weather API** - Real-time weather data integration
- **OAuth Providers** - Third-party authentication

**Development Tools:**
- **tsx** - TypeScript execution for development
- **dotenv** - Environment variable management
- **nanoid** - Unique ID generation
- **superjson** - Enhanced JSON serialization

### Database

**MySQL 8.0 with Drizzle ORM:**

**Schema Design:**
- Normalized relational structure
- Foreign key constraints
- Indexed columns for performance
- Soft deletes for data preservation

**Core Tables:**
- `users` - User accounts and subscriptions
- `horses` - Horse profiles
- `healthRecords` - Medical history
- `trainingSessions` - Training logs
- `feedingPlans` - Feeding schedules
- `documents` - Document metadata
- `weatherLogs` - Weather cache
- `stables` - Team accounts
- `stableMembers` - Team membership
- `events` - Calendar events
- `vaccinations` - Vaccine tracking
- `dewormings` - Deworming records
- `competitions` - Competition results
- `stripeEvents` - Payment event logs

**Migration System:**
- Version-controlled schema changes
- Drizzle Kit migration generation
- Safe forward-only migrations
- Automated deployment integration

### Payment Processing

**Stripe Integration:**
- Checkout Sessions for new subscriptions
- Customer Portal for subscription management
- Webhook event processing
- Subscription lifecycle management
- Payment method updates
- Invoice generation
- Failed payment handling
- Dunning management

**Security:**
- Webhook signature verification
- Idempotency key handling
- PCI DSS compliance (no card storage)
- Secure API key management

### Hosting & Infrastructure

**Webdock VPS:**
- 2 CPU cores
- 8GB RAM
- 50GB SSD storage
- Ubuntu 22.04 LTS
- Europe/London timezone

**Reverse Proxy:**
- **Nginx** - Load balancing and SSL termination
- HTTP/2 support
- Gzip compression
- Static file caching
- Request size limits

**Process Management:**
- **PM2** - Process supervision and monitoring
- Automatic restarts on failure
- Log management
- Cluster mode for multi-core utilization
- Zero-downtime deployments

**SSL/TLS:**
- **Certbot** - Let's Encrypt certificate management
- Automatic renewal
- A+ SSL Labs rating
- HTTPS enforcement

**Database:**
- MySQL running on same VPS
- Daily automated backups
- 30-day backup retention
- Point-in-time recovery capability

**Monitoring:**
- PM2 monitoring dashboard
- Health check endpoint
- Request logging
- Error tracking
- Performance metrics

---

## Security & Reliability

EquiProfile implements multiple layers of security to protect user data and ensure platform reliability.

### Authentication

**OAuth 2.0 Implementation:**
- Third-party authentication (Google, Microsoft, GitHub)
- No password storage or management
- Secure token handling
- Session expiration and renewal
- Multi-device session support

**Session Management:**
- HTTP-only secure cookies
- SameSite=Strict protection
- 7-day session lifetime
- Automatic renewal on activity
- Logout clears all sessions

### Role-Based Access Control (RBAC)

**User Roles:**
- System Admin (platform management)
- Stable Owner (full stable access)
- Stable Admin (member management)
- Trainer (horse and training access)
- Member (limited horse access)
- Viewer (read-only access)

**Permission System:**
- Server-side permission checks on every request
- Middleware enforcement before data access
- Row-level security in database queries
- Audit logging of permission checks

**Data Isolation:**
- Users see only their own horses
- Stable members see only stable horses
- Shared horses have explicit permissions
- Document access tied to horse permissions

### Secure Payments

**Stripe Security:**
- PCI DSS Level 1 compliance
- No credit card data stored on servers
- Tokenized payment methods
- 3D Secure authentication support
- Fraud detection and prevention

**Webhook Security:**
- Signature verification on all events
- Idempotency key tracking
- Replay attack prevention
- IP whitelisting (optional)
- Event audit logging

### Environment Separation

**Development Environment:**
- Localhost execution
- Test database
- Mock payment gateway
- Debug logging enabled
- CORS disabled

**Production Environment:**
- VPS deployment
- Production database
- Live Stripe keys
- Error-only logging
- CORS enforced
- Rate limiting active

**Environment Variables:**
- Sensitive data in .env files
- Never committed to version control
- Different values per environment
- Secure secret storage
- Regular credential rotation

### Backups and Stability

**Automated Backups:**
- Daily database backups at 2 AM
- 30-day retention policy
- Compressed and encrypted
- Stored locally and in S3 (optional)
- Automated backup verification

**Backup Contents:**
- Complete database dump
- Uploaded documents (S3 native redundancy)
- Configuration files
- Nginx configuration

**Disaster Recovery:**
- Point-in-time recovery capability
- 15-minute RPO (Recovery Point Objective)
- 1-hour RTO (Recovery Time Objective)
- Documented recovery procedures
- Regular recovery testing

**High Availability:**
- PM2 automatic restart on crash
- Database connection pooling
- Graceful shutdown handling
- Zero-downtime deployment capability
- Health check monitoring

**Data Integrity:**
- Foreign key constraints
- Transaction support
- Referential integrity
- Soft deletes (no data loss)
- Audit trails for changes

---

## 🔐 Admin Access

### Unlocking Admin Mode

Admin features are hidden by default and require a two-step unlock process for security:

1. **Navigate to AI Chat** (`/ai-chat`)
2. **Type**: `show admin`
3. **Enter admin password** when prompted
4. **Admin mode unlocks** for 30 minutes

**Default Password:** `ashmor12@`

**Change Password:**
```bash
# In .env file
ADMIN_UNLOCK_PASSWORD=your_secure_password_here
```

**Security Features:**
- ✅ Rate limiting: 5 attempts, then 15-minute lockout
- ✅ Session-based: Auto-expires after 30 minutes
- ✅ All attempts logged
- ✅ No plaintext passwords in logs
- ✅ Server-side session validation

### Admin Features

Once unlocked, you can access:

- **User Management** - View, suspend, delete, reset password
- **System Settings** - Maintenance mode, feature flags
- **Activity Logs** - Security audit trail
- **Health Metrics** - System performance monitoring
- **Subscription Monitoring** - Track overdue accounts
- **Backup Management** - Database backup logs

---

## Deployment Overview

EquiProfile supports plug-and-play deployment with minimal configuration. Use feature flags to control which features are enabled.

### Quick Deployment (Minimal Configuration)

**Required Environment Variables:**
```env
DATABASE_URL=mysql://user:pass@host:3306/database
JWT_SECRET=your_secret_here
ADMIN_UNLOCK_PASSWORD=your_password_here
ENABLE_STRIPE=false
ENABLE_UPLOADS=false
```

**Deployment Commands:**
```bash
# Using pnpm (recommended)
pnpm install
pnpm db:push
pnpm build
pm2 start ecosystem.config.js --env production

# Validate environment before deploying
./scripts/preflight.sh
```

### Feature Flags

Control which features are enabled via environment variables:

**`ENABLE_STRIPE`** (default: `false`)
- When `true`: Enables billing, subscriptions, and payment processing
- Requires: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**`ENABLE_UPLOADS`** (default: `false`)
- When `true`: Enables document uploads and file storage
- Requires: `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`

**Benefits:**
- ✅ Deploy without payment processor initially
- ✅ Deploy without file storage initially
- ✅ Enable features incrementally as needed
- ✅ Simpler initial configuration
- ✅ Faster time to deployment

### Deployment Guides

- **Full Guide:** See [DEPLOYMENT_PLUG_AND_PLAY.md](docs/reports/DEPLOYMENT_PLUG_AND_PLAY.md)
- **Audit Report:** See [AUDIT_REPORT.md](docs/reports/AUDIT_REPORT.md)
- **Legacy Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
Node.js/Express (Port 3000)
    ↓
MySQL Database (Port 3306)
    ↓
AWS S3 (Document Storage)
```

### Deployment Components

**Nginx Reverse Proxy:**
- Receives all HTTP/HTTPS traffic
- Terminates SSL/TLS connections
- Forwards requests to Node.js application
- Serves static assets with caching
- Enforces request size limits (50MB for document uploads)
- Rate limiting at proxy level

**Node.js Application:**
- Express server running on port 3000
- PM2 process manager for supervision
- Cluster mode for multi-core usage
- Automatic restart on failure
- Log rotation and management

**MySQL Database:**
- Dedicated database server on same VPS
- Connection pooling for efficiency
- Automated daily backups
- Query optimization and indexing

**Environment Variables:**
- Stored in `.env` file on server
- Loaded at application startup
- Contains sensitive credentials
- Different values per environment
- Never exposed to client

**Critical Environment Variables:**

EquiProfile uses feature flags to control which environment variables are required. The application will **refuse to start** in production mode if critical variables are missing.

**Always Required (Core):**
- `DATABASE_URL` - MySQL connection string (format: `mysql://user:pass@host:port/database`)
- `JWT_SECRET` - Session token signing key (generate with: `openssl rand -base64 32`)
- `ADMIN_UNLOCK_PASSWORD` - Admin mode unlock password (**NOT** default `ashmor12@`)

**Required if `ENABLE_STRIPE=true`:**
- `STRIPE_SECRET_KEY` - Stripe API key for payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification key

**Required if `ENABLE_UPLOADS=true`:**
- `BUILT_IN_FORGE_API_URL` - Storage API endpoint
- `BUILT_IN_FORGE_API_KEY` - Storage API authentication key
**Optional (Features may be degraded without these):**
- `OPENAI_API_KEY` - AI service access for chat and insights
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email notifications
- `BASE_URL` - Application base URL (for emails and links)
- `COOKIE_DOMAIN`, `COOKIE_SECURE` - Cookie configuration
- `OWNER_OPEN_ID` - Owner account identifier for auto-admin assignment

**Production Validation:**
The application performs startup validation in production mode:
1. ✅ Checks all critical environment variables are present
2. ✅ Validates feature flags and required credentials
3. ✅ Validates `ADMIN_UNLOCK_PASSWORD` is not the default value
4. ✅ Exits with clear error message if validation fails
5. ✅ Prevents insecure deployment configurations

**Generating Secure Values:**
```bash
# Generate JWT secret (64 characters)
openssl rand -base64 48

# Generate admin unlock password (strong)
openssl rand -base64 24

# Generate webhook secret
openssl rand -base64 32
```

**Environment Health Check:**
Admins can monitor environment configuration status via:
- Admin Panel → System tab
- Shows all variables with Set/Missing status
- Indicates Critical vs. Optional priority
- Auto-refreshes every 30 seconds

### Webhook Handling

**Stripe Webhooks:**
- Endpoint: `POST /api/webhooks/stripe`
- Raw body parsing required for signature verification
- Webhook secret validates authenticity
- Idempotency prevents duplicate processing
- Event types handled:
  - `checkout.session.completed` - New subscription
  - `customer.subscription.updated` - Subscription change
  - `customer.subscription.deleted` - Cancellation
  - `invoice.payment_succeeded` - Successful payment
  - `invoice.payment_failed` - Payment failure

**Webhook Security:**
1. Receive POST request from Stripe
2. Extract signature from headers
3. Verify signature using webhook secret
4. Check idempotency (event already processed?)
5. Process event and update database
6. Return 200 OK to acknowledge receipt

### Deployment Process

**Initial Deployment:**
1. Provision VPS and configure firewall
2. Install Node.js, MySQL, Nginx
3. Clone repository to `/var/www/equiprofile`
4. Install dependencies: `pnpm install`
5. Create `.env` file with production values
6. Run database migrations: `pnpm db:push`
7. Build application: `pnpm build`
8. Configure Nginx virtual host
9. Obtain SSL certificate via Certbot
10. Start application with PM2
11. Configure automated backups
12. Set up Stripe webhook endpoint

**Updates and Maintenance:**
1. Pull latest code: `git pull origin main`
2. Install new dependencies: `pnpm install`
3. Run migrations if needed: `pnpm db:push`
4. Build application: `pnpm build`
5. Restart application: `pm2 restart equiprofile`
6. Verify health check passes

**Zero-Downtime Updates:**
1. PM2 cluster mode runs multiple instances
2. New code deployed to cluster
3. Instances restarted one at a time
4. Old instances serve traffic during restart
5. New instances take over when ready

### Post-Deployment Setup

**1. Create First Admin User:**
```bash
# Connect to MySQL
mysql -u root -p

# Update user role to admin
USE equiprofile;
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
exit;
```

**2. Test Admin Unlock:**
- Login to the application
- Navigate to `/ai-chat`
- Type "show admin"
- Enter password (default: `ashmor12@`)
- Verify admin panel access at `/admin`

**3. Change Admin Password:**
```bash
# Edit .env file
nano /var/www/equiprofile/.env

# Update this line:
ADMIN_UNLOCK_PASSWORD=your_secure_password_here

# Restart application
pm2 restart equiprofile
```

**4. Configure Backups:**
```bash
# Make backup script executable
chmod +x /var/www/equiprofile/scripts/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /var/www/equiprofile/scripts/backup.sh
```

**5. Verify System Health:**
- Check application logs: `pm2 logs equiprofile`
- Test health endpoint: `curl https://yourdomain.com/api/health`
- Verify database connectivity
- Test S3 file uploads
- Confirm Stripe webhook delivery

---

## Development Workflow

### Prerequisites

- **Node.js 22+** - JavaScript runtime
- **pnpm 10+** - Package manager
- **MySQL 8.0+** - Database server
- **Git** - Version control

### Local Setup

**1. Clone Repository:**

```bash
git clone https://github.com/your-org/equiprofile.git
cd equiprofile
```

**2. Install Dependencies:**

```bash
pnpm install
```

This installs both server and client dependencies in a single command.

**3. Configure Environment:**

Create `.env` file in project root:

```env
DATABASE_URL=mysql://root:password@localhost:3306/equiprofile_dev
JWT_SECRET=dev_secret_change_in_production
NODE_ENV=development
PORT=3000

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
STRIPE_MONTHLY_PRICE_ID=price_test_xxxxx
STRIPE_YEARLY_PRICE_ID=price_test_xxxxx

# Optional for full functionality
OPENAI_API_KEY=sk-xxxxx
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=equiprofile-dev
```

Create `client/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_ENV=development
```

**4. Setup Database:**

Create development database:

```bash
mysql -u root -p
CREATE DATABASE equiprofile_dev;
```

Run migrations:

```bash
pnpm db:push
```

### Development Commands

**Start Development Server:**

```bash
pnpm dev
```

This starts:
- Vite development server with hot reload
- Express API server with auto-restart
- Available at `http://localhost:3000`

**Type Checking:**

```bash
pnpm check
```

Runs TypeScript compiler without emitting files. Checks for type errors across entire codebase.

**Run Tests:**

```bash
pnpm test
```

Executes Vitest test suite with all unit tests.

**Format Code:**

```bash
pnpm format
```

Runs Prettier to format all files according to project standards.

**Build for Production:**

```bash
pnpm build
```

Creates optimized production build:
- Client: `dist/` directory with optimized assets
- Server: `dist/` directory with compiled server code

**Start Production Build:**

```bash
pnpm start
```

Runs production build locally. Requires successful `pnpm build` first.

### Database Migrations

**Generate Migration:**

After modifying `drizzle/schema.ts`:

```bash
pnpm db:push
```

This:
1. Generates migration SQL files
2. Applies migrations to database
3. Updates schema types

**Migration Files:**

Located in `drizzle/` directory:
- `schema.ts` - Source of truth for schema
- `relations.ts` - Foreign key relationships
- `0000_*.sql` - Generated migration files

### Working with tRPC

**Adding a New Endpoint:**

1. Define procedure in `server/routers.ts`:

```typescript
myNewEndpoint: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ ctx, input }) => {
    return db.getMyData(input.id);
  })
```

2. TypeScript automatically generates client types
3. Use in client:

```typescript
const { data } = trpc.myNewEndpoint.useQuery({ id: 1 });
```

**Type Safety:**
- Server types flow to client automatically
- Input validation via Zod schemas
- Compile-time errors for mismatched types
- IntelliSense support in IDE

### Testing Workflow

**Unit Tests:**

Create test file alongside source:
- `server/myFeature.test.ts` for server code
- `client/src/myComponent.test.tsx` for components

Run specific test file:

```bash
pnpm test myFeature.test.ts
```

**Manual Testing:**

1. Start development server
2. Use browser DevTools
3. Check Network tab for API calls
4. Verify React DevTools components
5. Test responsive design

### Debugging

**Server Debugging:**
- Console logs appear in terminal
- Request logging shows all API calls
- PM2 logs in production: `pm2 logs equiprofile`

**Client Debugging:**
- Browser DevTools Console
- React DevTools for component inspection
- Network tab for API request/response

**Database Debugging:**

Query database directly:

```bash
mysql -u root -p equiprofile_dev
SELECT * FROM horses;
```

---

## Folder Structure Overview

### Project Root

```
equiprofile/
├── client/              Client application (React/Vite)
├── server/              Backend API (Node.js/Express/tRPC)
├── drizzle/             Database schema and migrations
├── docs/                Documentation and reports
├── scripts/             Utility scripts (backup, deployment)
├── dist/                Production build output (generated)
├── node_modules/        Dependencies (generated)
├── .env                 Environment variables (not committed)
├── .gitignore          Git ignore patterns
├── package.json        Project dependencies and scripts
├── pnpm-lock.yaml      Dependency lock file
├── tsconfig.json       TypeScript configuration
├── vite.config.ts      Vite build configuration
└── README.md           This file
```

### client/

Frontend React application built with Vite.

```
client/
├── src/
│   ├── pages/           Page components (Home, Dashboard, Horses, etc.)
│   ├── components/      Reusable UI components
│   │   └── ui/          shadcn/ui components
│   ├── _core/           Core utilities and hooks
│   │   └── hooks/       Custom React hooks
│   ├── App.tsx          Root application component
│   └── main.tsx         Entry point
├── public/              Static assets (images, icons)
│   └── images/          Image assets
├── index.html           HTML template
├── .env                 Client environment variables
└── .env.example         Example environment variables
```

**Key Directories:**

- **pages/** - One file per route (Home.tsx, Dashboard.tsx, Horses.tsx)
- **components/ui/** - Reusable UI primitives (Button, Dialog, Input, etc.)
- **_core/hooks/** - Custom hooks (useAuth, useTrpc, useLocalStorage)

### server/

Backend API server with tRPC endpoints.

```
server/
├── _core/               Core server infrastructure
│   ├── index.ts         Express server and startup
│   ├── trpc.ts          tRPC initialization and middleware
│   ├── context.ts       Request context creation
│   ├── oauth.ts         OAuth authentication routes
│   ├── env.ts           Environment variable validation
│   └── types/           TypeScript type definitions
├── routers.ts           tRPC API routes
├── db.ts                Database query functions
├── storage.ts           S3 storage integration
├── stripe.ts            Stripe payment integration
└── *.test.ts            Unit tests
```

**Key Files:**

- **routers.ts** - All tRPC endpoints organized by feature
- **db.ts** - Database abstraction layer with typed queries
- **_core/index.ts** - Express setup, middleware, webhook handlers

### drizzle/

Database schema and migration system.

```
drizzle/
├── schema.ts            Database schema definition (source of truth)
├── relations.ts         Foreign key relationships
├── 0000_*.sql           Generated migration files
└── meta/                Migration metadata
```

**Schema Definition:**

All tables defined in `schema.ts` using Drizzle ORM syntax. Running `pnpm db:push` generates SQL migrations and applies them.

### docs/

Comprehensive documentation.

```
docs/
└── reports/
    ├── AUDIT.md                     Production audit report
    ├── CHANGELOG.md                 Version history
    ├── DEPLOYMENT_CHECKLIST.md      Deployment guide
    ├── SECURITY.md                  Security documentation
    └── STRIPE_INTEGRATION.md        Payment integration guide
```

### scripts/

Utility scripts for operations.

```
scripts/
└── backup.sh            Automated database backup script
```

Run with cron for daily backups:

```cron
0 2 * * * /var/www/equiprofile/scripts/backup.sh
```

### dist/

Production build output (not committed to Git).

```
dist/
├── index.js             Compiled server code
└── client/              Optimized client assets
    ├── assets/          Hashed static files
    └── index.html       Entry HTML
```

Generated by `pnpm build` command.

---

## Roadmap & Future Enhancements

The following features are under consideration for future releases. This roadmap is subject to change based on user feedback and business priorities.

### Q1 2026 - UI Modernization

- Modern, premium landing page redesign
- Enhanced pricing page with feature comparison
- Improved dashboard with quick actions
- Mobile-optimized responsive design
- Dark mode support
- Accessibility improvements (WCAG 2.1 AA compliance)

### Q2 2026 - Collaboration Features

- Stable management UI implementation
- Team invitation and onboarding flow
- Shared calendar with team events
- In-app messaging between team members
- Activity feed for stable updates
- Role-based dashboard views

### Q3 2026 - Enhanced Features

- Competition results visualization with charts
- Medical passport printable view with QR codes
- Feed cost optimization recommendations
- Training program templates
- Automated report generation
- CSV export for all data types

### Q4 2026 - Mobile App

- Native iOS app (Swift/SwiftUI)
- Native Android app (Kotlin/Jetpack Compose)
- Push notification support
- Camera integration for photo capture
- Offline-first architecture
- App Store and Google Play distribution

### 2027 - Advanced Features

- Multi-language support (French, German, Spanish)
- Advanced analytics dashboard
- Breeding management module
- Lesson scheduling for trainers
- Client portal for owners
- Integration API for third-party tools
- White-label solution for large stables

### Continuous Improvements

- Performance optimization
- Security enhancements
- Bug fixes and stability
- User experience refinements
- Infrastructure scaling
- Regular dependency updates

**Note:** This roadmap is indicative and not a commitment. Features may be added, removed, or rescheduled based on user needs, technical feasibility, and business priorities.

---

## License & Legal

### License

This software is proprietary and confidential. All rights reserved.

Copyright © 2026 EquiProfile Ltd. Unauthorized copying, distribution, or modification of this software is strictly prohibited.

### Data Ownership

**User Data:**
- All data entered by users remains the property of the user
- EquiProfile does not claim ownership of user-generated content
- Users retain full rights to export their data at any time
- Account deletion removes all personal data within 30 days

**Platform Data:**
- Usage analytics and aggregated statistics are property of EquiProfile
- No personally identifiable information is included in analytics
- Aggregated data may be used for platform improvement

### Terms of Service

By using EquiProfile, users agree to:
- Provide accurate information during registration
- Use the platform for lawful purposes only
- Not attempt to circumvent security measures
- Not share account credentials
- Comply with subscription payment terms
- Accept reasonable use policies for AI features

Full Terms of Service available at: https://equiprofile.online/terms

### Privacy Policy

EquiProfile is committed to protecting user privacy:
- Personal data processed in accordance with GDPR
- No selling of user data to third parties
- Transparent data collection and usage
- User rights to access, modify, and delete data
- Secure data storage and transmission
- Cookie usage for essential functionality only

Full Privacy Policy available at: https://equiprofile.online/privacy

### Support & Contact

**Technical Support:**
- Email: support@equiprofile.online
- Response time: 24-48 hours (business days)
- Priority support for Stable plan subscribers

**Business Inquiries:**
- Email: hello@equiprofile.online

**Security Issues:**
- Email: security@equiprofile.online
- Responsible disclosure appreciated

**Documentation:**
- Online: https://docs.equiprofile.online
- In-app help center

---

## 🎨 Design System

EquiProfile features a modern, accessible design system built with premium colors and consistent spacing.

### Color Palette

The application uses a vibrant, modern color scheme:

- **Primary**: Vibrant Blue (`oklch(0.55 0.25 250)`) - Professional & trustworthy
- **Secondary**: Purple (`oklch(0.55 0.20 280)`) - Premium & modern  
- **Accent**: Teal (`oklch(0.55 0.20 190)`) - Fresh & energetic
- **Success**: Green - Positive actions
- **Warning**: Amber - Caution states
- **Danger**: Red - Critical alerts

**NO BROWN COLORS** - The design explicitly avoids brown tones for a fresh, modern aesthetic.

### Design Tokens

All design decisions are centralized in `client/src/lib/design-system.ts`:

- Typography scale with proper hierarchy
- Spacing system based on 4px grid
- Border radius tokens for consistent roundness
- Shadow system for depth and elevation
- Transition timing for smooth animations
- Z-index layers for proper stacking

### Typography

- **Sans Serif**: Inter - Body text and UI elements
- **Serif**: Playfair Display - Headings and emphasis
- Font sizes range from 12px to 128px with proper line heights
- Responsive scaling on smaller screens

### Accessibility

- WCAG AA contrast ratios for all text
- Focus indicators on interactive elements
- Keyboard navigation support
- Screen reader optimizations
- Skip-to-content links
- Semantic HTML throughout

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19.2 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS 4 with custom design tokens
- **UI Components**: Radix UI primitives + shadcn/ui
- **Animations**: Framer Motion for smooth transitions
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)
- **API Client**: tRPC for end-to-end type safety
- **Internationalization**: i18next + react-i18next
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API**: tRPC for type-safe APIs
- **Database**: MySQL with Drizzle ORM
- **Authentication**: OAuth + JWT sessions
- **File Storage**: AWS S3 or local filesystem
- **Payment Processing**: Stripe
- **Email**: SendGrid (or similar service)

### DevOps & Build

- **Build Tool**: Vite 7 (Lightning fast)
- **Package Manager**: npm with legacy peer deps
- **Process Manager**: systemd (production)
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Version Control**: Git + GitHub

---

## 🚀 Development

### Prerequisites

- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or pnpm
- Git

### Local Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/amarktainetwork-blip/Equiprofile.online.git
   cd Equiprofile.online
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment**:
   ```bash
   # Copy environment files
   cp .env.example .env
   cp client/.env.example client/.env
   
   # Edit with your local settings
   nano .env
   nano client/.env
   ```

4. **Set up database**:
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE equiprofile_dev;
   EXIT;
   
   # Run migrations
   npm run db:push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:5173`

### Development Scripts

```bash
# Start dev server (frontend + backend)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run check

# Format code
npm run format

# Run tests
npm run test

# Database migrations
npm run db:push
```

### Project Structure

```
Equiprofile.online/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   │   ├── images/          # Image assets
│   │   └── icons/           # Icon assets
│   ├── src/
│   │   ├── _core/           # Core utilities and hooks
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base UI components (shadcn)
│   │   │   ├── MarketingNav.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── ScrollReveal.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── auth/       # Auth pages (Login, Register)
│   │   │   ├── Home.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── ... (other app pages)
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   │   ├── design-system.ts
│   │   │   ├── env.ts
│   │   │   └── trpc.ts
│   │   ├── i18n/            # Internationalization
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   └── .env.example         # Frontend env template
├── server/                   # Backend Node.js application
│   ├── _core/               # Core server utilities
│   ├── db.ts                # Database operations
│   ├── routers.ts           # tRPC routers
│   └── storage.ts           # File storage
├── shared/                   # Shared types and constants
├── scripts/                  # Deployment and utility scripts
├── DEPLOY.md                # Deployment documentation
├── README.md                # This file
└── .env.example             # Backend env template
```

### Environment Variables

See [Environment Configuration](#environment-configuration) in DEPLOY.md for complete list.

Key development variables:

**Backend** (`.env`):
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing key
- `NODE_ENV=development`

**Frontend** (`client/.env`):
- `VITE_API_BASE_URL` - Leave empty for same-origin
- `VITE_ENV=development`

---

## 📦 Build & Deploy

See **[DEPLOY.md](./DEPLOY.md)** for comprehensive deployment instructions including:

- Server setup and configuration
- Database setup
- Nginx configuration
- SSL certificate setup
- Process management with systemd
- Automated deployment scripts
- Troubleshooting guide

### Quick Deploy

```bash
# Build application
npm install --legacy-peer-deps
npm run build

# Output:
# - dist/public/ - Frontend static files
# - dist/index.js - Backend server
```

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Test coverage:
- Unit tests for utilities and helpers
- Integration tests for API endpoints
- Component tests for React components

---

## 🐛 Troubleshooting

### Common Issues

**Build fails with peer dependency errors**:
```bash
npm install --legacy-peer-deps
```

**Blank page after deployment**:
- Check browser console (F12)
- Verify Nginx configuration
- Check that environment variables are set

**API calls fail**:
- Ensure backend is running
- Check CORS configuration
- Verify API base URL

**Database connection errors**:
- Check DATABASE_URL format
- Verify MySQL is running
- Confirm database exists

See [DEPLOY.md](./DEPLOY.md) for more troubleshooting tips.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📧 Contact & Support

**Customer Support:**
- Email: support@equiprofile.online
- Response time: 24-48 hours (business days)
- Priority support for Stable plan subscribers

**Business Inquiries:**
- Email: hello@equiprofile.online

**Security Issues:**
- Email: security@equiprofile.online
- Responsible disclosure appreciated

**Documentation:**
- Online: https://docs.equiprofile.online
- In-app help center

---

**EquiProfile** - Professional equine management for the modern equestrian.
