# PRIME v2 Wireframes and Screen Specifications

**Purpose:** Define the UX layout, navigation structure, and state behaviors for all Phase 5 required screens.

**Approval Gate:** Selected users and accessibility review required before prototype implementation.

**Architecture:** Right-side navigation (RightNav) for all authenticated roles; public pages use minimal header.

---

## 1. Layout Architecture

### 1.1 Authenticated App Shell

All authenticated users (Applicant, Project Focal, RTEC Member, RTEC Head, Budget Officer, Accountant, RD, Admin) use the same shell structure:

```text
┌─────────────────────────────────────────────────┬──────────────┐
│                                                 │              │
│              Main Content Area                  │   RightNav   │
│        (Forms, Dashboards, Details)             │   (vertical) │
│                                                 │              │
│                                                 │              │
└─────────────────────────────────────────────────┴──────────────┘
```

**Responsibilities:**
- `AppShell` — Provides page frame, renders `RightNav`, manages navigation state
- `RightNav` — Role-based menu items, user profile, logout link (desktop view)
- `RightNavDrawer` — Collapsible sheet for mobile/tablet view (slides from right edge)
- `PageHeader` — Page title, breadcrumbs, in-page actions (not primary navigation)

### 1.2 Public Pages (Unauthenticated)

Public landing, login pages use a minimal header (no RightNav):

```text
┌────────────────────────────────────────────────┐
│  PRIME v2 Logo    Minimal Header               │
├────────────────────────────────────────────────┤
│                                                │
│       Main Content (Login Form, Info)          │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 2. Responsive Breakpoints and Behavior

| Breakpoint | Width | Right Nav | Behavior |
|---|---|---|---|
| **Mobile** | < 768px | Collapsed (hidden) | Menu icon triggers RightNavDrawer from right edge; drawer overlays content; focus trap enabled |
| **Tablet** | 768px–1023px | Icon rail | Narrow icon-only panel on right; labels appear on hover/tap; 60–80px width |
| **Desktop** | ≥ 1024px | Full sidebar | Full sidebar visible with labels and icons; ~280–320px width; no drawer needed |

**Touch Target Rules (all breakpoints):** Minimum 44px tap targets (buttons, nav items); adequate spacing between interactive elements.

---

## 3. Right Navigation (RightNav) Component

### 3.1 Menu Items by Role

#### Applicant Menu
- Dashboard (home icon)
- Create Proposal
- My Proposals (with substatus filters: Draft, Submitted, Under Review, Returned, Approved, Rejected)
- Settings
- Logout

#### Project Focal Menu
- Dashboard
- Assigned Proposals (status: awaiting review, reviewed)
- Reports
- Settings
- Logout

#### RTEC Member Menu
- Dashboard
- Assigned Proposals (status: awaiting review, submitted)
- Settings
- Logout

#### RTEC Head Menu
- Dashboard
- Reviews to Consolidate
- Consolidated Reviews
- Reports
- Settings
- Logout

#### Budget Officer Menu
- Dashboard
- Queue (proposals awaiting budget review)
- Reports
- Settings
- Logout

#### Accountant Menu
- Dashboard
- Queue (proposals awaiting accounting review)
- Reports
- Settings
- Logout

#### Regional Director Menu
- Dashboard
- Queue (proposals for final decision)
- Decision History
- Reports
- Settings
- Logout

#### System Administrator Menu
- Dashboard
- User Management
- Role Management
- Form Management
- Workflow Management
- Audit Logs
- System Settings
- Settings
- Logout

### 3.2 RightNav Visual Elements

**Desktop (≥ 1024px):**
- Vertical sidebar on right edge
- Icon + label for each menu item
- Current page highlighted (strong color/bold)
- User profile card at top or bottom (name, avatar, role)
- Logout link at bottom

**Tablet (768px–1023px):**
- Narrow icon rail (60–80px)
- Labels appear on hover (tooltip) or tap (popover)
- Collapsed user profile (avatar only, expandable)
- Can be optionally expanded to full width on landscape

**Mobile (< 768px):**
- Hidden by default
- Menu icon (hamburger/three-line icon) in top-right corner of AppShell
- Tapping menu icon opens `RightNavDrawer` sliding from right edge
- Drawer overlays main content (semi-transparent backdrop)
- Focus trap while drawer is open
- Close button (X or back) in drawer header
- Full labels visible in drawer

---

## 4. Public Pages

### 4.1 Landing Page (Unauthenticated)

**Purpose:** Welcome, explain system, provide login/signup links.

**Layout:**
```
┌──────────────────────────────────────┐
│ PRIME v2 Logo | Navbar (Login link)  │
├──────────────────────────────────────┤
│                                      │
│  Hero Section                        │
│  "Submit and Track Proposals Online" │
│                                      │
│  Call-to-Action Buttons:             │
│  - "Sign In as Applicant (Google)"   │
│  - "Staff Login"                     │
│                                      │
├──────────────────────────────────────┤
│ Benefits, Features, FAQ               │
├──────────────────────────────────────┤
│ Footer (Contact, About, Links)        │
└──────────────────────────────────────┘
```

**Key Elements:**
- Clear CTA buttons: "Sign in with Google" and "Staff Login"
- Explanation of system roles
- Brief feature overview
- No RightNav

**States:**
- Empty/Initial: All sections visible
- Hover: CTA buttons highlight
- Mobile: Single-column layout, reduced hero height

### 4.2 Applicant Login Page

**Purpose:** Google OAuth flow.

**Layout:**
```
┌──────────────────────────────────────┐
│ PRIME v2 Logo | "Back to Home"       │
├──────────────────────────────────────┤
│                                      │
│  "Applicant Login"                   │
│                                      │
│  [Google Sign-In Button]             │
│                                      │
│  "Using your Google account"         │
│  (explanation of OAuth)              │
│                                      │
│  [Link to Staff Login if misclicked] │
│                                      │
└──────────────────────────────────────┘
```

**Interaction:**
- Google Sign-In button triggers OAuth flow
- On success, create user record and redirect to Applicant Dashboard
- On failure, show error message

### 4.3 Staff Login Page

**Purpose:** Email + password authentication.

**Layout:**
```
┌──────────────────────────────────────┐
│ PRIME v2 Logo | "Back to Home"       │
├──────────────────────────────────────┤
│                                      │
│  "Staff Login"                       │
│                                      │
│  [Email field]                       │
│  [Password field]                    │
│  [Remember me checkbox] (optional)   │
│                                      │
│  [Login Button]                      │
│                                      │
│  [Forgot Password Link]              │
│  [Sign up as Applicant]              │
│                                      │
└──────────────────────────────────────┘
```

**Validation:**
- Email required, valid format
- Password required, non-empty
- On submit, validate credentials
- On success, redirect to role-appropriate dashboard
- On failure, show error message (generic for security)

**States:**
- Empty: Form empty, login button disabled
- Loading: Button shows spinner, form disabled
- Error: Red error message below email/password fields
- Success: Redirect (no visible state)

---

## 5. Applicant Screens

### 5.1 Applicant Dashboard

**Purpose:** Overview of applicant's proposals and quick actions.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "My Dashboard"           │              │
│ Breadcrumb: Home > Dashboard         │              │
│                                      │              │
│ Quick Actions:                       │  RightNav    │
│ [+ Create New Proposal]              │              │
│                                      │              │
│ Proposal Summary Cards:              │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Draft Count: 2                   │ │              │
│ │ Under Review: 1                  │ │              │
│ │ Approved: 3                      │ │              │
│ │ Rejected: 0                      │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Filter Tabs:                         │              │
│ [All] [Draft] [Submitted] [Review]   │              │
│ [Approved] [Rejected]                │              │
│                                      │              │
│ Proposal List:                       │              │
│ ┌──────────────────────────────────┐ │              │
│ │ [Proposal Type] - [Title]        │ │              │
│ │ Status: [Badge] | Last updated:  │ │              │
│ │ [X hours ago]                    │ │              │
│ │ [View] [Edit] [Delete Draft]     │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Summary cards showing counts by status
- Filterable proposal list
- Search/sort capability
- "Create New Proposal" button
- Each proposal item shows: type, title, status, last update, action links

**States:**
- **Empty:** "No proposals yet. [Create New Proposal]"
- **Loading:** Skeleton cards, loading spinner
- **Error:** "Failed to load proposals. [Retry]"
- **Data:** Show list with counts, filters functional
- **Mobile:** Single-column layout, summary as stacked cards, list items compact

### 5.2 Create Proposal (Type Selection)

**Purpose:** Let applicant choose which proposal type to submit.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Create New Proposal"    │              │
│ Breadcrumb: Dashboard > Create       │              │
│                                      │  RightNav    │
│ "Select the type of proposal you     │              │
│  want to submit:"                    │              │
│                                      │              │
│ Active Proposal Types:               │              │
│ ┌──────────────────────────────────┐ │              │
│ │ 🎓 GIA Proposal                  │ │              │
│ │ Description of GIA program...    │ │              │
│ │ [Select] [Learn More]            │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ 🔬 CEST Proposal                 │ │              │
│ │ Description of CEST program...   │ │              │
│ │ [Select] [Learn More]            │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ 🌍 SSCP Proposal                 │ │              │
│ │ Description of SSCP program...   │ │              │
│ │ [Select] [Learn More]            │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ [Cancel]                             │              │
└──────────────────────────────────────┴──────────────┘
```

**Interaction:**
- Clicking "Select" navigates to the dynamic form with that proposal type
- "Learn More" opens a modal with form instructions/requirements
- "Cancel" returns to dashboard

**States:**
- **Empty/Initial:** All types visible
- **Loading:** Types loading (skeleton cards)
- **Error:** "Failed to load proposal types. [Retry]"
- **Mobile:** Single-column card layout

### 5.3 Dynamic Form (Fill Proposal)

**Purpose:** Display role-specific form fields for the selected proposal type.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "[Proposal Type] - Form" │              │
│ Breadcrumb: Dashboard > Create >     │              │
│ [Type]                               │  RightNav    │
│                                      │              │
│ Form Metadata:                       │              │
│ Status: Draft | Last saved: [time]   │              │
│ [Autosave indicator: "Saving..."]    │              │
│                                      │              │
│ Form Sections (Tabbed or Accordion): │              │
│ ├─ [Section 1: Organization Info]   │              │
│ │  ┌──────────────────────────────┐ │              │
│ │  │ [Field label] *              │ │              │
│ │  │ [Input field]                │ │              │
│ │  │ [Help text, if applicable]   │ │              │
│ │  │                              │ │              │
│ │  │ [Field label]                │ │              │
│ │  │ [Input field]                │ │              │
│ │  └──────────────────────────────┘ │              │
│ │                                    │              │
│ ├─ [Section 2: Project Details]     │              │
│ │  ┌──────────────────────────────┐ │              │
│ │  │ [Field label] *              │ │              │
│ │  │ [Textarea]                   │ │              │
│ │  │ [Validation message]         │ │              │
│ │  │ (if error)                   │ │              │
│ │  │                              │ │              │
│ │  │ [Budget Table]               │ │              │
│ │  │ ┌─────────────────────────┐  │ │              │
│ │  │ │ Line | Qty | Unit | Total│  │ │              │
│ │  │ │ Item 1|  2 | 500 | 1000  │  │ │              │
│ │  │ │ Item 2|  5 | 200 | 1000  │  │ │              │
│ │  │ │ [Add Row] [Remove Row]  │  │ │              │
│ │  │ │ Grand Total: 2000        │  │ │              │
│ │  │ └─────────────────────────┘  │ │              │
│ │  └──────────────────────────────┘ │              │
│ │                                    │              │
│ ├─ [Section 3: Attachments]         │              │
│ │  ┌──────────────────────────────┐ │              │
│ │  │ Supporting Documents         │ │              │
│ │  │ [Drag files here or browse]  │ │              │
│ │  │                              │ │              │
│ │  │ Uploaded:                    │ │              │
│ │  │ • proposal.pdf (2.3 MB)      │ │              │
│ │  │   [View] [Download] [Remove] │ │              │
│ │  │                              │ │              │
│ │  │ • budget.xlsx (512 KB)       │ │              │
│ │  │   [View] [Download] [Remove] │ │              │
│ │  └──────────────────────────────┘ │              │
│ │                                    │              │
│ └─ [Section N: Review & Submit]     │              │
│    [Continue to Review]              │              │
│                                      │              │
│ Form Actions:                        │              │
│ [Save as Draft] [Cancel] [Next/Prev] │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Form organized by sections (tabs or accordion)
- Field-level labels, validation messages, help text
- Real-time autosave with visual indicator
- Field types: text, textarea, date, select, checkbox, radio, repeating rows (tables)
- File upload with drag-and-drop
- Budget calculations (if applicable) auto-compute
- Progress indicator showing form completion
- Save as Draft and Submit buttons

**Field Types:**
- **Text Input:** label, placeholder, required indicator, error state
- **Textarea:** label, character count, required indicator
- **Date Picker:** label, calendar picker or text input
- **Select:** label, dropdown, search option
- **Checkbox/Radio:** label, visual indicator for selection
- **Table/Repeating Rows:** add row, remove row, auto-calculations
- **File Upload:** drag zone, progress bar, file list with remove

**States:**
- **Empty:** All fields empty, Save button disabled
- **Editing:** Fields being filled, autosave indicator visible
- **Autosave (success):** "Saved" checkmark message briefly shown
- **Autosave (error):** "Failed to save. [Retry]" in red
- **Validation Error:** Red error message below field, field border red
- **Loading:** Form sections loading (skeleton forms)
- **Mobile:** Full-width form, sections stacked vertically, buttons full-width

### 5.4 Proposal Review & Submit

**Purpose:** Final review before submission; no editing allowed here.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Review Proposal"        │              │
│ Breadcrumb: Dashboard > Create >     │              │
│ [Type] > Review                      │  RightNav    │
│                                      │              │
│ ⚠️  "Please review your information  │              │
│ before submitting. Once submitted,   │              │
│ you will not be able to edit it."    │              │
│                                      │              │
│ Sections (read-only):                │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Organization: XYZ Corp           │ │              │
│ │ Contact: John Doe                │ │              │
│ │ [Edit This Section]              │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Project: "AI Research Initiative"│ │              │
│ │ Duration: Jan 2024 - Dec 2025    │ │              │
│ │ Budget: $50,000                  │ │              │
│ │ [Edit This Section]              │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Attachments: 2 files             │ │              │
│ │ • proposal.pdf (2.3 MB)          │ │              │
│ │ • budget.xlsx (512 KB)           │ │              │
│ │ [Edit This Section]              │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Confirmation:                        │              │
│ ☐ I certify that the information   │              │
│   above is accurate and complete.   │              │
│                                      │              │
│ [Cancel] [Back to Edit] [Submit]    │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Interaction:**
- All fields are read-only (locked)
- "Edit This Section" links navigate back to that form section
- Checkbox must be checked to enable Submit button
- Clicking Submit locks the proposal version and routes it to Project Focal

**States:**
- **Loading:** Sections loading (skeleton cards)
- **Data Loaded:** Sections visible, Submit disabled until checkbox checked
- **Submitting:** Button shows spinner, form disabled
- **Success:** Navigate to Submitted Proposals screen with confirmation message
- **Error:** "Failed to submit proposal. [Retry]"

### 5.5 Applicant Proposal Detail & Comments

**Purpose:** View submitted proposal, see reviewer comments, track status.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "[Proposal Title]"       │              │
│ Breadcrumb: Dashboard > Proposals >  │              │
│ [Title]                              │  RightNav    │
│                                      │              │
│ Status Banner:                       │              │
│ Status: Under Review | Updated: [T]  │              │
│ Assigned to: John Doe (Project Focal)│              │
│                                      │              │
│ Tabs/Sections:                       │              │
│ [Details] [Comments] [Version History]              │
│                                      │              │
│ ─── Details Tab ───                  │              │
│ View-only proposal data (as review). │              │
│                                      │              │
│ ─── Comments Tab ───                 │              │
│ Comments Panel (right-side or card): │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Filter: [All] [Resolved] [Open]  │ │              │
│ │                                  │ │              │
│ │ Comment Thread:                  │ │              │
│ │ ┌────────────────────────────┐   │ │              │
│ │ │ John Doe (Project Focal)   │   │ │              │
│ │ │ Field: Organization Name   │   │ │              │
│ │ │ "Please expand on why..."  │   │ │              │
│ │ │ Posted: 2 hours ago        │   │ │              │
│ │ │                            │   │ │              │
│ │ │ [Reply] [Mark Resolved]    │   │ │              │
│ │ │                            │   │ │              │
│ │ │ └─ Your Reply:             │   │ │              │
│ │ │    "We expanded on..."     │   │ │              │
│ │ │    Posted: 30 min ago      │   │ │              │
│ │ └────────────────────────────┘   │ │              │
│ │                                  │ │              │
│ │ Comment Thread (Resolved):       │ │              │
│ │ ┌────────────────────────────┐   │ │              │
│ │ │ Jane Smith (RTEC Member)   │   │ │              │
│ │ │ "Background section..."    │   │ │              │
│ │ │ ✓ Resolved                 │   │ │              │
│ │ └────────────────────────────┘   │ │              │
│ │                                  │ │              │
│ │ [Show All Comments]              │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ─── Version History Tab ───          │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Version 3 (Current)              │ │              │
│ │ Submitted: [Date] by You         │ │              │
│ │ [View Changes] [Export]          │ │              │
│ │                                  │ │              │
│ │ Version 2 (Returned by Focal)    │ │              │
│ │ Submitted: [Date] by You         │ │              │
│ │ Returned: [Date] for revision    │ │              │
│ │ [View] [Compare with v3]         │ │              │
│ │                                  │ │              │
│ │ Version 1 (Initial Submission)   │ │              │
│ │ Submitted: [Date] by You         │ │              │
│ │ [View] [Compare with v3]         │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Actions (if proposal is Returned):   │              │
│ [Edit Proposal] [Resubmit]           │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Status banner showing current state and current reviewer
- Tabs for Details, Comments, and Version History
- Comments shown with author, role, timestamp, field reference
- Reply capability for applicant comments
- Mark resolved / reopen resolution status
- Version list with dates, action links
- Compare versions option
- Edit/Resubmit buttons only if proposal is Returned

**States:**
- **Loading:** Skeleton for details, comments, versions
- **Data Loaded:** All tabs visible and functional
- **No Comments:** "No comments yet" message
- **Comments Loading:** Spinner in comments section
- **Mobile:** Tabs stacked vertically, comments in card, single-column

---

## 6. Project Focal Screens

### 6.1 Project Focal Dashboard

**Purpose:** Overview of assigned proposals and quick actions.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Focal Dashboard"        │              │
│ Breadcrumb: Home > Dashboard         │              │
│                                      │  RightNav    │
│ Summary:                             │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Total Assigned: 12               │ │              │
│ │ Awaiting Review: 5               │ │              │
│ │ Under RTEC Review: 3             │ │              │
│ │ Ready to Endorse to Budget: 2    │ │              │
│ │ Approved: 2                      │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Filter Tabs:                         │              │
│ [All] [Awaiting Review] [RTEC]       │              │
│ [Budget] [Accounting] [RD]           │              │
│                                      │              │
│ Proposal Queue:                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ [Proposal Type] - [Title]        │ │              │
│ │ Applicant: Jane Doe              │ │              │
│ │ Status: Awaiting Review          │ │              │
│ │ Submitted: [Date]                │ │              │
│ │ Days in queue: 3                 │ │              │
│ │ [View] [Review] [Details]        │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Summary counts by status
- Filterable queue of proposals
- Search and sort capability
- Each proposal shows: type, title, applicant, status, submission date, days in queue, actions
- "Review" action opens the detailed review screen

**States:**
- **Empty:** "No proposals assigned to you yet."
- **Loading:** Skeleton cards
- **Data Loaded:** Show summary and queue
- **Mobile:** Single-column, summary stacked, queue items compact

### 6.2 Project Focal Review Screen

**Purpose:** Review proposal, add comments, and decide on action (return, endorse to RTEC, etc.).

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "[Proposal Title]"       │              │
│ Breadcrumb: Dashboard > Queue >      │              │
│ [Title]                              │  RightNav    │
│                                      │              │
│ Status: Awaiting Focal Review        │              │
│ Assigned to: You (John Doe)          │              │
│                                      │              │
│ Two-Column Layout:                   │              │
│ ┌───────────────────────┬──────────┐ │              │
│ │ Proposal Details      │ Comments │ │              │
│ │ (scrollable)          │ Panel    │ │              │
│ │                       │ (right)  │ │              │
│ │ Section 1:            │          │ │              │
│ │ Organization: XYZ     │ ┌──────┐ │ │              │
│ │ Contact: Jane Doe     │ │      │ │ │              │
│ │                       │ │ Open │ │ │              │
│ │ Section 2:            │ │ Comm │ │ │              │
│ │ Project Title: ...    │ │ents: │ │ │              │
│ │ Duration: Jan-Dec     │ │ 3    │ │ │              │
│ │                       │ │      │ │ │              │
│ │ Section 3:            │ │ ┌──┐ │ │ │              │
│ │ Budget: $50,000       │ │ │C1│ │ │ │              │
│ │ [Budget Table]        │ │ │C2│ │ │ │              │
│ │                       │ │ │C3│ │ │ │              │
│ │ Section 4:            │ │ └──┘ │ │ │              │
│ │ Attachments: 2        │ │      │ │ │              │
│ │                       │ │ [Add]│ │ │              │
│ │                       │ │ Comm │ │ │              │
│ │                       │ │      │ │ │              │
│ │                       │ │ [Dra │ │ │              │
│ │                       │ │  ft] │ │ │              │
│ │                       │ └──────┘ │ │              │
│ └───────────────────────┴──────────┘ │              │
│                                      │              │
│ Review Actions:                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ [Return to Applicant]            │ │              │
│ │ "Request revision before..."     │ │              │
│ │ Requires: At least 1 comment     │ │              │
│ │                                  │ │              │
│ │ [Endorse to RTEC]                │ │              │
│ │ (Submit without further review)  │ │              │
│ │ Requires: No open comments       │ │              │
│ │                                  │ │              │
│ │ [Save Review] (Draft)            │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ [Cancel] [Back]                      │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Left: Read-only proposal details (non-editable)
- Right: Comments panel (add, edit, resolve comments)
- Field-level comment capability (select field + add comment)
- General comments section
- Focal review actions: Return (requires comment), Endorse to RTEC, Save Draft

**Comment Panel:**
- List of open comments
- Resolved comments can be filtered/hidden
- Reply capability
- Mark as resolved
- Comment type: field-specific or general
- Visibility locked (applicant-visible only)

**States:**
- **Loading:** Skeleton for details and comments
- **Data Loaded:** Details and comments visible
- **Adding Comment:** Text area appears, Save/Cancel buttons
- **Submitting Action:** Button shows spinner, form disabled
- **Success:** Toast/banner, navigate back to queue
- **Error:** Error message below action
- **Mobile:** Single-column, comments in card below proposal details

---

## 7. RTEC Member Screens

### 7.1 RTEC Member Dashboard

**Purpose:** View assigned proposals for independent review.

**Layout:** (Similar to Focal Dashboard)
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "RTEC Member Dashboard"  │              │
│ Breadcrumb: Home > Dashboard         │              │
│                                      │  RightNav    │
│ Summary:                             │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Total Assigned: 8                │ │              │
│ │ Awaiting Review: 4               │ │              │
│ │ Submitted: 4                     │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Filter Tabs:                         │              │
│ [All] [Awaiting Review] [Submitted]  │              │
│                                      │              │
│ Proposal List:                       │              │
│ ┌──────────────────────────────────┐ │              │
│ │ [Proposal Type] - [Title]        │ │              │
│ │ Applicant: Jane Doe              │ │              │
│ │ Status: Awaiting Review          │ │              │
│ │ Assigned: [Date]                 │ │              │
│ │ [View] [Submit Review]           │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

### 7.2 RTEC Member Review Screen

**Purpose:** Submit independent technical review and rating.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "[Proposal Title] Review"│              │
│ Breadcrumb: Dashboard > Proposals >  │              │
│ [Title] > Review                     │  RightNav    │
│                                      │              │
│ Status: Your Review Awaiting         │              │
│                                      │              │
│ Two-Column Layout:                   │              │
│ ┌───────────────────────┬──────────┐ │              │
│ │ Proposal Details      │ Your     │ │              │
│ │ (read-only)           │ Private  │ │              │
│ │                       │ Comments │ │              │
│ │ Section 1:            │ Panel    │ │              │
│ │ Organization...       │          │ │              │
│ │                       │ ┌──────┐ │ │              │
│ │ Section 2:            │ │      │ │ │              │
│ │ Project Details...    │ │Priva │ │ │              │
│ │                       │ │te    │ │ │              │
│ │ Section 3:            │ │ Comm │ │ │              │
│ │ Budget...             │ │      │ │ │              │
│ │                       │ │ ┌──┐ │ │ │              │
│ │ Section 4:            │ │ │C1│ │ │ │              │
│ │ Background...         │ │ └──┘ │ │ │              │
│ │                       │ │      │ │ │              │
│ │                       │ │ [Add]│ │ │              │
│ │                       │ │      │ │ │              │
│ │                       │ │ [Dra │ │ │              │
│ │                       │ │  ft] │ │ │              │
│ │                       │ └──────┘ │ │              │
│ └───────────────────────┴──────────┘ │              │
│                                      │              │
│ Your Review Form:                    │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Overall Rating:                  │ │              │
│ │ ☆ ☆ ☆ ☆ ☆  (5-star scale)       │ │              │
│ │                                  │ │              │
│ │ Technical Recommendation:         │ │              │
│ │ ○ Highly Recommended             │ │              │
│ │ ○ Recommended                    │ │              │
│ │ ○ Acceptable with revisions      │ │              │
│ │ ○ Not Recommended                │ │              │
│ │                                  │ │              │
│ │ Summary Comments:                │ │              │
│ │ [Textarea]                       │ │              │
│ │ (visible to RTEC Head only)      │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Review Actions:                      │              │
│ [Save as Draft] [Submit Review]      │              │
│ [Cancel]                             │              │
│                                      │              │
│ ⚠️  Once submitted, you cannot edit  │              │
│ your review unless the RTEC Head     │              │
│ reopens it for clarification.        │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Proposal details (read-only, non-editable)
- Private comments panel (visible only to member and RTEC Head)
- Field-level private comments
- Rating scale (5-star or other)
- Recommendation selector (radio buttons)
- Summary comments textarea
- Save as Draft or Submit buttons
- Warning about immutability after submission

**States:**
- **Loading:** Skeleton for details
- **Editing:** Form editable, Save Draft button active
- **Draft Saved:** "Draft saved" toast message
- **Submitting:** Button shows spinner, form disabled
- **Success:** Toast "Review submitted", navigate back to dashboard
- **Error:** Error message
- **Already Submitted:** Show view-only review, "Review submitted [date]"
- **Mobile:** Single-column, form below details

---

## 8. RTEC Head Screens

### 8.1 RTEC Head Dashboard

**Purpose:** Overview of member reviews to consolidate.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "RTEC Head Dashboard"    │              │
│ Breadcrumb: Home > Dashboard         │              │
│                                      │  RightNav    │
│ Summary:                             │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Proposals to Consolidate: 2      │ │              │
│ │ All Member Reviews Submitted: 1  │ │              │
│ │ Consolidations Complete: 5       │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Filter Tabs:                         │              │
│ [All] [Reviews In] [Consolidated]    │              │
│                                      │              │
│ Consolidation Queue:                 │              │
│ ┌──────────────────────────────────┐ │              │
│ │ [Proposal Type] - [Title]        │ │              │
│ │ Applicant: Jane Doe              │ │              │
│ │ Members Reviewed: 3/3            │ │              │
│ │ Status: Ready to Consolidate     │ │              │
│ │ [View] [Consolidate]             │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

### 8.2 RTEC Head Consolidation Screen

**Purpose:** Review all member reviews and create official RTEC recommendation.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "[Proposal Title]        │              │
│ Consolidation"                       │              │
│ Breadcrumb: Dashboard > Queue >      │              │
│ [Title] > Consolidate                │  RightNav    │
│                                      │              │
│ Status: Under RTEC Consolidation     │              │
│                                      │              │
│ Proposal Summary:                    │              │
│ (Read-only overview)                 │              │
│                                      │              │
│ Member Reviews (Tabbed/Accordion):   │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Dr. Smith (Member 1)             │ │              │
│ │ Rating: ★★★★☆ (4/5)             │ │              │
│ │ Recommendation: Recommended      │ │              │
│ │ Summary:                         │ │              │
│ │ "Strong project with...proposal" │ │              │
│ │ [View Full Review]               │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Prof. Jones (Member 2)           │ │              │
│ │ Rating: ★★★★★ (5/5)             │ │              │
│ │ Recommendation: Highly Recomm.   │ │              │
│ │ Summary:                         │ │              │
│ │ "Excellent research approach..." │ │              │
│ │ [View Full Review]               │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Dr. Lee (Member 3)               │ │              │
│ │ Rating: ★★★☆☆ (3/5)             │ │              │
│ │ Recommendation: Acceptable w/Rev │ │              │
│ │ Summary:                         │ │              │
│ │ "Needs clarification on budget..." │ │              │
│ │ [View Full Review]               │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Your Consolidated Assessment:        │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Overall RTEC Recommendation:     │ │              │
│ │ ○ Highly Recommended             │ │              │
│ │ ○ Recommended                    │ │              │
│ │ ○ Acceptable with Revisions      │ │              │
│ │ ○ Not Recommended                │ │              │
│ │                                  │ │              │
│ │ Key Findings Summary:            │ │              │
│ │ [Textarea] (visible to Focal &   │ │              │
│ │ applicant)                       │ │              │
│ │                                  │ │              │
│ │ Private RTEC Notes:              │ │              │
│ │ [Textarea] (RTEC Head only)      │ │              │
│ │                                  │ │              │
│ │ Required Clarifications:         │ │              │
│ │ (Checkboxes for common issues)   │ │              │
│ │ ☐ Budget needs revision          │ │              │
│ │ ☐ Timeline needs clarification   │ │              │
│ │ ☐ Methodology requires adjustment│ │              │
│ │ ☐ Other: [text field]           │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Actions:                             │              │
│ [Save Draft] [Request Clarification] │              │
│ [Return to Member] [Submit]          │              │
│                                      │              │
│ ⚠️  Once submitted, the consolidated │              │
│ assessment is sent to the Project    │              │
│ Focal and is final unless you reopen │              │
│ it.                                  │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Key Elements:**
- Summary of all member reviews (ratings, recommendations, comments)
- Click to view full individual review details
- Consolidated assessment form (recommendation, key findings, private notes)
- Checkboxes for required clarifications
- Actions: Save Draft, Request Clarification from member, Return member to review, Submit
- Warning about finality of submission

**States:**
- **Loading:** Skeleton for proposal and reviews
- **Data Loaded:** Reviews and form visible
- **Editing:** Form editable
- **Draft Saved:** Toast "Draft saved"
- **Requesting Clarification:** Modal to select member and message
- **Submitting:** Button spinner, form disabled
- **Success:** Toast "Consolidation submitted", navigate back
- **Error:** Error message
- **Mobile:** Single-column, reviews stacked, form below

---

## 9. Budget Officer, Accountant, and RD Screens

### 9.1 Budget Officer Dashboard & Review Screen

**Purpose:** Review budget and financial items.

**Layout:** (Similar pattern to Project Focal and RTEC Member)

**Dashboard:**
- Summary: Total in queue, reviewed, endorsed
- Queue of proposals awaiting budget review
- Filter by status

**Review Screen:**
- Read-only proposal details (emphasize budget section)
- Field-level comments on budget items
- Budget findings form
- Actions: Return to Focal, Endorse to Accounting, Save Draft

### 9.2 Accountant Dashboard & Review Screen

**Purpose:** Review accounting classifications and financial compliance.

**Similar layout to Budget Officer, with accounting-specific focus.**

### 9.3 Regional Director Dashboard & Decision Screen

**Purpose:** Make final approval decision.

**Dashboard:**
- Summary: Total in queue, approved, rejected, deferred
- Queue of proposals awaiting RD decision
- Filter by status

**Decision Screen:**
- Proposal details (read-only)
- Official workflow history (all prior reviewers' comments)
- Final decision form (radio buttons: Approve, Return for Revision, Defer, Reject)
- Final comments (optional)
- Actions: Approve, Return, Defer, Reject, Save Draft

**States:**
- **Loading:** Skeleton
- **Data Loaded:** Details and form visible
- **Submitting:** Spinner, form disabled
- **Success:** Toast, navigate back
- **Error:** Error message

---

## 10. Admin Screens

### 10.1 Admin Dashboard

**Purpose:** System overview and quick access to admin tools.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Admin Dashboard"        │              │
│ Breadcrumb: Home > Admin             │              │
│                                      │  RightNav    │
│ System Health:                       │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Users Online: 12                 │ │              │
│ │ Proposals in System: 247         │ │              │
│ │ Database Status: ✓ Healthy       │ │              │
│ │ Storage Status: ✓ Healthy        │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Quick Actions:                       │              │
│ [+ Add User] [+ Form] [View Logs]    │              │
│                                      │              │
│ Recent Activity:                     │              │
│ ┌──────────────────────────────────┐ │              │
│ │ User "Jane Doe" created          │ │              │
│ │ 5 minutes ago                    │ │              │
│ │                                  │ │              │
│ │ Form "SSCP-2024" published       │ │              │
│ │ 2 hours ago                      │ │              │
│ │                                  │ │              │
│ │ User "John Smith" deactivated    │ │              │
│ │ 1 day ago                        │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

### 10.2 Admin User Management

**Purpose:** Create, edit, activate, deactivate users.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "User Management"        │              │
│ Breadcrumb: Admin > Users            │              │
│                                      │  RightNav    │
│ [+ Add New User]                     │              │
│                                      │              │
│ Filter/Search:                       │              │
│ [Search by name/email] [Status: All] │              │
│ [Role: All] [Sort by: Name]          │              │
│                                      │              │
│ User List:                           │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Name: Jane Doe                   │ │              │
│ │ Email: jane@org.com              │ │              │
│ │ Role(s): Project Focal           │ │              │
│ │ Program: GIA                     │ │              │
│ │ Status: Active (since Jan 2024)  │ │              │
│ │ Last Login: 2 hours ago          │ │              │
│ │ [Edit] [Deactivate] [Reset Pwd]  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Name: John Smith                 │ │              │
│ │ Email: john@org.com              │ │              │
│ │ Role(s): RTEC Member, RTEC Head  │ │              │
│ │ Program: GIA, CEST               │ │              │
│ │ Status: Active (since Feb 2024)  │ │              │
│ │ Last Login: Never                │ │              │
│ │ [Edit] [Deactivate] [Reset Pwd]  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Name: Former Staff               │ │              │
│ │ Email: former@org.com            │ │              │
│ │ Role(s): Budget Officer          │ │              │
│ │ Program: CEST                    │ │              │
│ │ Status: Inactive (since Dec 2023)│ │              │
│ │ [Reactivate] [Edit] [Delete]     │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Add/Edit User Modal:**
```
┌──────────────────────────────────────┐
│ Add New User                         │
├──────────────────────────────────────┤
│ [First Name] *                       │
│ [Last Name] *                        │
│ [Email] * (unique check)             │
│                                      │
│ Role(s) (select multiple) *          │
│ ☐ Project Focal                      │
│ ☐ RTEC Member                        │
│ ☐ RTEC Head                          │
│ ☐ Budget Officer                     │
│ ☐ Accountant                         │
│ ☐ Regional Director                  │
│ ☐ System Administrator               │
│                                      │
│ Program/Office Assignment *          │
│ [Select: GIA, CEST, SSCP, etc.]      │
│                                      │
│ Send activation link to email?       │
│ ○ Yes (recommended)                  │
│ ○ No (admin provides temp password)  │
│                                      │
│ [Cancel] [Create User]               │
└──────────────────────────────────────┘
```

**States:**
- **Empty:** List empty, "No users yet" or show message
- **Loading:** Skeleton list
- **Data Loaded:** User list visible
- **Searching/Filtering:** Results updated
- **Creating User:** Modal open, form validation
- **User Created:** Toast "User created", list updated
- **Error:** Error message in modal or inline
- **Mobile:** Single-column, compact user cards, actions in menu

### 10.3 Admin Form Management

**Purpose:** Manage proposal form templates and versions.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Form Management"        │              │
│ Breadcrumb: Admin > Forms            │              │
│                                      │  RightNav    │
│ [+ Upload New Form] [+ Create Form]  │              │
│                                      │              │
│ Active Forms:                        │              │
│ ┌──────────────────────────────────┐ │              │
│ │ GIA Proposal v2024.1             │ │              │
│ │ Status: Published                │ │              │
│ │ Sections: 5                      │ │              │
│ │ Fields: 24                       │ │              │
│ │ Created: Jan 2024 | Updated: Jun │ │              │
│ │ [View] [Edit] [Publish v2]       │ │              │
│ │ [Deprecate] [Download]           │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ CEST Proposal v2024.1            │ │              │
│ │ Status: Published                │ │              │
│ │ Sections: 4                      │ │              │
│ │ Fields: 18                       │ │              │
│ │ [View] [Edit] [Publish v2]       │ │              │
│ │ [Deprecate] [Download]           │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ Deprecated Forms:                    │              │
│ ┌──────────────────────────────────┐ │              │
│ │ GIA Proposal v2023.1             │ │              │
│ │ Status: Deprecated               │ │              │
│ │ [View] [Archive]                 │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Form Edit Screen:**
- Visual form builder or JSON editor
- Sections and fields management
- Field validation rules
- Required/optional toggles
- Help text
- Comment permission overrides
- Publish/Draft actions

**States:**
- **Loading:** Skeleton list
- **Data Loaded:** Form list visible
- **Editing:** Form builder/editor visible
- **Publishing:** Confirmation modal, button spinner
- **Success:** Toast "Form published"
- **Mobile:** Single-column, form cards stacked

### 10.4 Admin Workflow Management

**Purpose:** Configure routing, assign Project Focals, manage RTEC groups.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Workflow Management"    │              │
│ Breadcrumb: Admin > Workflow         │              │
│                                      │  RightNav    │
│ Sections:                            │              │
│ [Routing] [Focals] [RTEC Groups]     │              │
│                                      │              │
│ ─── Routing Tab ───                  │              │
│ Proposal Type → Project Focal        │              │
│ ┌──────────────────────────────────┐ │              │
│ │ GIA Proposal → John Doe (Focal)  │ │              │
│ │ [Edit] [Change Focal]            │ │              │
│ │                                  │ │              │
│ │ CEST Proposal → Jane Smith       │ │              │
│ │ (Focal)                          │ │              │
│ │ [Edit] [Change Focal]            │ │              │
│ │                                  │ │              │
│ │ SSCP Proposal → Dr. Lee (Focal)  │ │              │
│ │ [Edit] [Change Focal]            │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ─── Focals Tab ───                   │              │
│ [List of all Project Focals,         │              │
│  assigned proposals count,           │              │
│  active/inactive status]             │              │
│                                      │              │
│ ─── RTEC Groups Tab ───              │              │
│ ┌──────────────────────────────────┐ │              │
│ │ GIA RTEC Committee               │ │              │
│ │ Members: 3                       │ │              │
│ │ Dr. Smith, Prof. Jones, Dr. Lee  │ │              │
│ │ [Edit Members] [View History]    │ │              │
│ │                                  │ │              │
│ │ CEST RTEC Committee              │ │              │
│ │ Members: 2                       │ │              │
│ │ Dr. Brown, Prof. Green           │ │              │
│ │ [Edit Members] [View History]    │ │              │
│ │                                  │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**States:**
- **Loading:** Skeleton for tabs
- **Data Loaded:** Routing, Focals, RTEC groups visible
- **Editing:** Modal or inline form for changes
- **Saving:** Button spinner
- **Success:** Toast "Changes saved"
- **Mobile:** Tabs stacked, single-column layout

### 10.5 Admin Audit Log Viewer

**Purpose:** View complete system audit trail.

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ PageHeader: "Audit Logs"             │              │
│ Breadcrumb: Admin > Audit Logs       │              │
│                                      │  RightNav    │
│ Filters:                             │              │
│ [Date Range] [User] [Action Type]    │              │
│ [Proposal ID] [Sort by: Newest]      │              │
│                                      │              │
│ [Export CSV] [Download Full Log]     │              │
│                                      │              │
│ Audit Events:                        │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Jun 1, 2024 13:45:32             │ │              │
│ │ Action: Proposal Submitted       │ │              │
│ │ User: Jane Doe (Applicant)       │ │              │
│ │ Proposal ID: PROP-2024-001       │ │              │
│ │ IP: 192.168.1.1                 │ │              │
│ │ [View Details]                   │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Jun 1, 2024 13:30:00             │ │              │
│ │ Action: Comment Added            │ │              │
│ │ User: John Doe (Project Focal)   │ │              │
│ │ Proposal ID: PROP-2024-001       │ │              │
│ │ IP: 192.168.1.5                 │ │              │
│ │ [View Details]                   │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ ┌──────────────────────────────────┐ │              │
│ │ Jun 1, 2024 10:15:22             │ │              │
│ │ Action: User Deactivated         │ │              │
│ │ User: Admin (System Administrator)
│ │ Target: Former Staff             │ │              │
│ │ [View Details]                   │ │              │
│ └──────────────────────────────────┘ │              │
│                                      │              │
│ [Pagination]                         │              │
│                                      │              │
└──────────────────────────────────────┴──────────────┘
```

**Audit Detail Modal:**
```
┌──────────────────────────────────────┐
│ Audit Event Details                  │
├──────────────────────────────────────┤
│ Timestamp: Jun 1, 2024 13:45:32      │
│ Action: Proposal Submitted           │
│ User: Jane Doe (jdoe@org.com)        │
│ Role: Applicant                      │
│ Proposal ID: PROP-2024-001           │
│ Proposal Title: "AI Research Project"│
│ Previous Status: DRAFT               │
│ New Status: SUBMITTED_TO_FOCAL       │
│ Changes Made:                        │
│ • proposal_status: DRAFT →           │
│   SUBMITTED_TO_FOCAL                 │
│ • submitted_at: 2024-06-01 13:45:32 │
│                                      │
│ IP Address: 192.168.1.1              │
│ User Agent: Mozilla/5.0...           │
│                                      │
│ [Close]                              │
└──────────────────────────────────────┘
```

**States:**
- **Loading:** Skeleton list
- **Data Loaded:** Audit events visible
- **Filtering/Searching:** Results updated
- **Exporting:** Button spinner, then download
- **Mobile:** Single-column, compact event cards

---

## 11. State Management and Error Handling

### 11.1 Empty States

Every data view should have a clear empty state:

```
┌──────────────────────────────────────┐
│                                      │
│  📭                                  │
│  "No proposals yet"                  │
│                                      │
│  [Create New Proposal]               │
│                                      │
│  "Once you submit a proposal, it     │
│  will appear here."                  │
│                                      │
└──────────────────────────────────────┘
```

**Rules:**
- Icon (relevant to the data type)
- Clear message
- CTA button if applicable
- Explanation text (optional)
- Mobile: Same layout, slightly smaller

### 11.2 Loading States

Use skeleton screens or subtle spinners:

```
┌──────────────────────────────────────┐
│ ▓▓▓▓▓▓ (skeleton)                    │
│ ▓▓▓▓▓▓▓▓▓▓                           │
│ ▓▓▓▓                                 │
│                                      │
│ ▓▓▓▓▓▓▓▓                             │
│ ▓▓▓▓▓▓▓▓▓▓                           │
│ ▓▓▓▓                                 │
│                                      │
└──────────────────────────────────────┘
```

OR:

```
⟳ Loading...
```

**Rules:**
- Skeleton screens for complex layouts
- Spinner for simple data
- Never show "Loading..." for more than 5 seconds without progress indication
- Mobile: Same approach, adjusted width

### 11.3 Error States

Show user-friendly error messages:

```
┌──────────────────────────────────────┐
│ ⚠️  Something went wrong              │
│                                      │
│ Failed to load proposals.             │
│                                      │
│ [Retry] [Contact Support]            │
│                                      │
│ Error code: ERR_NETWORK_TIMEOUT      │
│ (details for IT support)             │
│                                      │
└──────────────────────────────────────┘
```

**Rules:**
- Clear error message (avoid technical jargon for users)
- Retry button
- Contact support link
- Error code for support (in smaller text)
- Mobile: Same layout, full-width buttons

### 11.4 Validation States

Show field-level validation:

```
[Email Address] *
[john@example.com____]

❌ Invalid email format
(Appears below field in red)
```

OR (on submit):

```
Oops! Please fix the following:
• Email Address: Invalid format
• Phone Number: Required
• Budget Total: Must be positive
```

---

## 12. Mobile-Specific Behaviors

### 12.1 Navigation (Mobile < 768px)

- RightNav is hidden by default
- Hamburger menu icon (☰) in top-right of AppShell
- Tapping icon opens RightNavDrawer (slides from right edge)
- Drawer overlays content with semi-transparent backdrop
- Close button (X) in drawer header
- Focus trap (focus stays within drawer while open)
- Clicking backdrop closes drawer

### 12.2 Forms on Mobile

- Single-column layout
- Full-width form fields
- Sections can be accordion (collapsed by default, expand on tap)
- Buttons full-width
- Date picker: native mobile date input
- File upload: native mobile file picker

### 12.3 Tables on Mobile

- Horizontal scroll OR
- Card layout (each row becomes a card)
- Actions in menu (three-dot icon) per row

### 12.4 Touch Targets

- Minimum 44px × 44px (iOS/Android standard)
- Adequate spacing between touch targets (8px minimum)
- No hover states on touch devices (use active/pressed states)

---

## 13. Accessibility Requirements

### 13.1 Keyboard Navigation

- Tab order follows visual flow (left to right, top to bottom)
- Focus visible (outline, color change, or background)
- Enter/Space to activate buttons
- Arrow keys for select menus, radio buttons
- Escape to close modals, drawers
- RightNav drawer: focus trap, close on Escape

### 13.2 Screen Reader Support

- All images have alt text
- Form labels associated with inputs (via `<label>` or `aria-label`)
- Form validation messages linked to fields (`aria-describedby`)
- Page regions marked (header, main, nav) with landmarks
- Page title updates when content changes
- Live regions for status updates (e.g., autosave, comments)

### 13.3 Color Contrast

- Text on background: 4.5:1 contrast ratio (WCAG AA)
- UI controls: 3:1 contrast ratio
- Never use color alone to convey status (e.g., red for error) — use icon + text

### 13.4 Responsive Text

- Base font size: 16px (mobile) to 18px (desktop) minimum
- Line height: 1.5 minimum
- No tiny type in small viewports

---

## 14. Component Library Reference

The following components should be created and reused across all screens:

| Component | Purpose | States |
|---|---|---|
| Button | Call-to-action, submit, cancel | default, hover, active, disabled, loading |
| Input | Text entry | default, focus, error, disabled |
| Select | Dropdown choice | default, open, selected, disabled |
| Modal | Dialog box | visible, closed, loading |
| Toast | Notification | success, error, info, warning |
| Badge | Status indicator | success, warning, error, info, neutral |
| Card | Container | default, hover, selected |
| Tabs | Section switcher | active, inactive |
| Accordion | Collapsible section | expanded, collapsed |
| Spinner | Loading indicator | spinning |
| Skeleton | Placeholder | shimmer animation |
| PageHeader | Page title + breadcrumbs | default |
| RightNav | Main navigation | desktop, tablet, mobile |
| RightNavDrawer | Mobile navigation overlay | open, closed |

---

## 15. Approval and Next Steps

### 15.1 This Document

This wireframe document is approved when:
- Selected users (Applicant, Focal, RTEC Member, RTEC Head, Budget, Accounting, RD, Admin) review and confirm layouts match their workflows
- Accessibility review confirms WCAG AA compliance
- Mobile behavior validated on actual devices (375px, 768px, 1280px)

### 15.2 Next Phase (Phase 6)

After approval:
1. Optionally scaffold frontend/ with Vite+React+TS placeholder pages
   - AppShell with RightNav
   - Route structure
   - No real API calls yet
2. Create interactive prototype (clickable mockups)
3. Conduct usability testing with selected users

### 15.3 Scaffold Instructions (If Approved)

If architecture approval allows, scaffold only:
```
frontend/
├── src/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── RightNav.tsx
│   │   ├── RightNavDrawer.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Landing.tsx
│   │   │   ├── ApplicantLogin.tsx
│   │   │   └── StaffLogin.tsx
│   │   ├── applicant/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreateProposal.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── ProposalDetail.tsx
│   │   │   └── ...
│   │   ├── focal/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ReviewScreen.tsx
│   │   │   └── ...
│   │   ├── rtec/
│   │   │   └── ...
│   │   ├── budget/
│   │   │   └── ...
│   │   ├── accounting/
│   │   │   └── ...
│   │   ├── rd/
│   │   │   └── ...
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── UserManagement.tsx
│   │       ├── FormManagement.tsx
│   │       ├── WorkflowManagement.tsx
│   │       └── AuditLogs.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProposal.ts
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

- **No API calls** — use mock data or localStorage
- **No authentication logic** — stub with hardcoded role switching for testing
- **No database** — test data only
- **Purpose:** Validate layouts, navigation flow, responsive behavior

---

## 16. Design System Standards

**To be finalized by Frontend Agent during Phase 6:**

- Color palette (primary, secondary, error, warning, success, neutral)
- Typography (fonts, sizes, weights, line heights)
- Spacing scale (8px, 16px, 24px, 32px, etc.)
- Border radius (0px, 4px, 8px, 12px)
- Shadow depth levels
- Z-index scale
- Responsive grid (e.g., 12-column grid)
- Breakpoints (375px mobile, 768px tablet, 1024px desktop, 1280px wide)

---

**Document Status:** Phase 5 Deliverable (Wireframes created; awaiting approval)

**Last Updated:** 2026-07-01

**Next Gate:** Selected user approval + accessibility review before Phase 6 scaffold
