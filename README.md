# PRIME v2 — ObraTech AI SDLC README

**System Name:** Project and Research Information Management Environment  
**Short Name:** PRIME v2  
**Project Folder:** `primev2/`  
**Primary Deployment Platform:** Coolify  
**Status:** Planning and Architecture Preparation  
**Coding Status:** **Active development (Phases 6–10 + Phase 21 integration).** Phases 0–4 approved; MVP implementation in progress.

**Who may implement:** All developers on the team — junior, mid-level, senior, and AI-assisted — following [AGENTS.md](AGENTS.md) and phase gates. The SDLC is not limited to junior developers or interns.

---

## Developers: start here (after git pull)

| Document | Purpose |
|----------|---------|
| **[DEVELOPERS.md](DEVELOPERS.md)** | Quick start — run locally, test, daily workflow |
| **[docs/agents/AI-DEVELOPMENT-PLAN.md](docs/agents/AI-DEVELOPMENT-PLAN.md)** | AI / Cursor canonical plan — phase order and gates |
| **[docs/agents/DEVELOPER-EXECUTION-PLAN.md](docs/agents/DEVELOPER-EXECUTION-PLAN.md)** | What to build next, phase by phase |
| **[docs/agents/TEST-MATRIX.md](docs/agents/TEST-MATRIX.md)** | Pass/Fail checklist for every role and feature |
| **[docs/deployment/DEV-TEST-ACCOUNTS.md](docs/deployment/DEV-TEST-ACCOUNTS.md)** | Login credentials for all 8 roles |

---

## 1. Purpose of This README

This README is the primary Software Development Life Cycle guide for PRIME v2.

It is written for:

- Prompt developers and AI-assisted developers
- Software developers at all experience levels
- Project managers
- System architects
- Quality assurance testers
- DevOps personnel
- Security reviewers
- Product owners and approving officials

This document explains:

- The business problem
- The proposed solution
- The MVP
- User roles and permissions
- The end-to-end workflow
- User stories
- Architecture direction
- Data and file management
- Form conversion rules
- AI agent responsibilities
- Development phases
- Security requirements
- Testing strategy
- Deployment plan
- Production-readiness requirements
- Approval gates
- Rules that must be followed before coding

---

# 2. ObraTech AI SDLC Framework

PRIME v2 must follow the ObraTech AI SDLC Framework in this order:

1. Understand the business story and problem
2. Generate and approve the Project Brief
3. Define and approve the MVP
4. Define user roles and permissions
5. Create user stories and acceptance criteria
6. Define the documentation structure
7. Assign AI development agents
8. Create the development phases
9. Prepare security, testing, deployment, and production-readiness plans
10. Approve the architecture
11. Begin implementation
12. Test and validate
13. Deploy to staging
14. Perform user acceptance testing
15. Deploy to production
16. Monitor, support, improve, and maintain

> **Mandatory Rule:** No source-code implementation should begin until the MVP, workflow, permissions, and architecture have been formally approved.

---

# 3. Business Story

The organization currently receives project and research proposals using Microsoft Word, Microsoft Excel, PDF, and printed forms.

Applicants manually download, complete, revise, email, print, or resubmit these documents. Internal reviewers then add comments through different files, email messages, printed notes, or meetings.

This creates the following problems:

- Multiple versions of the same proposal
- Unclear ownership of the latest file
- Difficult tracking of revisions
- Comments scattered across documents and email
- No reliable audit trail
- Delays in routing proposals
- Manual consolidation of RTEC comments
- Difficulty identifying the current reviewer
- Inconsistent approval processes
- Repetitive encoding of applicant and project data
- Errors in budget calculations
- Difficulty generating reports
- Difficulty searching historical proposals
- Risk of unauthorized access to confidential proposal data
- Difficulty monitoring proposal status
- Limited visibility for management

PRIME v2 will replace the manual document-driven process with a controlled, web-based proposal submission, review, versioning, routing, and approval system.

---

# 4. Project Vision

PRIME v2 will provide one secure environment where:

- Applicants submit proposals online
- Existing Word, Excel, and PDF forms are converted into web forms
- Proposals are automatically routed to the correct Project Focal
- Reviewers add structured comments
- Every revision creates a new version
- RTEC members perform independent reviews
- The RTEC Head consolidates comments
- Budget and Accounting perform financial review
- The Regional Director makes the final decision
- The system preserves a complete audit history
- Authorized users can monitor proposal progress
- Approved proposals can be exported to official document formats

---

# 5. Project Objectives

PRIME v2 must:

1. Convert existing proposal forms into online web forms.
2. Provide secure applicant and staff authentication.
3. Route proposals according to proposal type and assigned focal.
4. Support version-controlled proposal revisions.
5. Record who edited, reviewed, commented, returned, endorsed, or approved a proposal.
6. Allow RTEC members to submit individual reviews.
7. Allow only the RTEC Head to consolidate and finalize RTEC comments.
8. Support Budget, Accounting, and RD review stages.
9. Preserve original source templates.
10. Generate official PDF and, where needed, Excel outputs.
11. Provide notifications and status tracking.
12. Provide administrative user, role, form, and workflow management.
13. Support secure deployment using Coolify.
14. Provide backup, recovery, monitoring, and audit capabilities.

---

# 6. Scope

## 6.1 In Scope for the MVP

- Applicant Google login
- Staff email-and-password login
- Admin-created staff accounts
- Role-based access control
- Proposal type selection
- Dynamic web forms
- Word, Excel, and PDF source-form conversion
- Draft saving
- Autosave
- Proposal submission
- Field-level comments
- Section-level comments
- General comments
- Proposal versioning
- Workflow routing
- Project Focal review
- RTEC member review
- RTEC Head consolidation
- Budget review
- Accounting review
- RD approval
- Email and in-app notifications
- Attachments stored in MinIO
- Audit logs
- PDF export
- Admin dashboard
- Proposal status dashboard
- Development seed users
- Staging deployment through Coolify
- Backup and recovery procedures

## 6.2 Out of Scope for the Initial MVP

These may be added after the MVP is stable:

- Digital signatures with legal certification
- AI-generated proposal writing
- AI scoring of proposals
- Automatic plagiarism detection
- Full grant disbursement
- Procurement management
- Project implementation monitoring
- Mobile application
- Offline-first support
- Public proposal search portal
- Advanced analytics
- SMS integration
- External accounting system integration
- National government platform integration

---

# 7. Authentication Rules

## 7.1 Applicant Login

Applicants use:

- Google Sign-In only

Applicant rules:

- The first successful Google login creates an applicant account.
- An applicant cannot assign themselves an internal role.
- An applicant can only access their own proposals unless formally added as a collaborator in a future feature.
- Applicant accounts must be marked as `APPLICANT`.
- Google login must not be available for internal staff access.

## 7.2 Staff Login

Internal users use:

- Email address
- Password

Staff accounts are created by the System Administrator.

Staff users include:

- Project Focal
- RTEC Member
- RTEC Head
- Budget Officer
- Accountant
- Regional Director
- System Administrator
- Other future internal roles

Staff account rules:

- The Admin creates the account.
- The Admin assigns the role.
- The user receives an activation link or temporary credential.
- The user changes their password on first login.
- Password reset must be available.
- Deactivated staff cannot log in.
- Historical actions remain visible after deactivation.
- Staff cannot use Google login for internal access.

---

# 8. User Roles

## 8.1 Applicant

The Applicant can:

- Sign in using Google
- Create a proposal
- Select a proposal type
- Fill out forms online
- Save drafts
- Upload attachments
- Submit proposals
- View official comments
- Revise returned proposals
- Resubmit proposals
- View proposal status
- Download generated outputs
- Withdraw a proposal before final approval, subject to policy

The Applicant cannot:

- View other applicants' proposals
- See private RTEC member comments
- Approve their own proposal
- Change workflow assignments
- Assign internal roles

## 8.2 System Administrator

The Administrator can:

- Create staff users
- Edit user profiles
- Assign one or more roles
- Assign users to offices, programs, or committees
- Activate or deactivate accounts
- Reset passwords
- Resend activation links
- Create proposal types
- Register source forms
- Manage form versions
- Configure routing
- Assign Project Focals
- Create RTEC groups
- Assign RTEC Members
- Assign an RTEC Head
- Reassign pending tasks
- View audit logs
- Manage system settings
- Manage controlled lists
- Manage notifications
- View system health information

The Administrator must not alter proposal content unless explicitly granted a content-management permission and all changes are logged.

## 8.3 Project Focal

The Project Focal can:

- View proposals assigned to their program
- Review completeness
- Add comments
- Return a proposal to the Applicant
- Endorse a proposal to RTEC
- Receive consolidated RTEC findings
- Return a proposal to the Applicant after RTEC review
- Endorse a proposal to Budget
- View proposal history
- View official workflow comments
- Monitor assigned proposals

The Project Focal may be categorized as:

- GIA Focal
- CEST Focal
- SSCP Focal
- Future program focal

## 8.4 RTEC Member

The RTEC Member can:

- View assigned proposals
- Review technical sections
- Add private comments
- Add ratings or recommendations
- Save a review as draft
- Submit a final individual review
- View their own submitted review
- Revise a review only when reopened by the RTEC Head

The RTEC Member cannot:

- Finalize the committee decision
- See comments from other RTEC members unless policy later allows it
- Directly return the proposal to the Applicant
- Endorse the proposal to Budget
- Approve the proposal

## 8.5 RTEC Head

The RTEC Head can:

- View all assigned RTEC member reviews
- View private member comments
- Consolidate comments
- Create the official RTEC assessment
- Set the official RTEC recommendation
- Return a review to an RTEC member for clarification
- Submit the final RTEC result to the Project Focal
- Close the RTEC review stage

Only the RTEC Head can issue the final consolidated RTEC recommendation.

## 8.6 Budget Officer

The Budget Officer can:

- Review line-item budgets
- Review cost computations
- Add comments to budget fields
- Add general budget findings
- Return the proposal to the Project Focal
- Endorse the proposal to Accounting
- View prior official comments
- Confirm budget compliance

The Budget Officer cannot approve the proposal on behalf of the RD.

## 8.7 Accountant

The Accountant can:

- Review financial classifications
- Review accounting-related details
- Review required financial attachments
- Add comments
- Return the proposal to Budget or the Project Focal, according to approved policy
- Endorse the proposal to the RD
- Confirm accounting compliance

## 8.8 Regional Director

The Regional Director can:

- View the complete proposal
- View official recommendations
- View workflow history
- Add final comments
- Approve
- Return for revision
- Defer
- Reject

Only the RD can issue final approval in the MVP.

---

# 9. Development Seed Users

The development and staging environments must include test accounts.

| Test Account | Role | Purpose |
|---|---|---|
| applicant1 | Applicant | Create and submit proposal |
| focal1 | Project Focal | Initial review and endorsement |
| rtec.member1 | RTEC Member | Individual technical review |
| rtec.member2 | RTEC Member | Multi-review testing |
| rtec.member3 | RTEC Member | Consolidation testing |
| rtec.head1 | RTEC Head | Final RTEC consolidation |
| budget1 | Budget Officer | Budget review |
| accountant1 | Accountant | Accounting review |
| rd1 | Regional Director | Final decision |
| admin1 | System Administrator | User, role, form, and workflow management |

Rules:

- Development credentials must not be reused in production.
- Seed passwords must be stored securely.
- Production deployment must remove or disable development test accounts.
- Test users must use clearly labeled non-production email addresses.

---

# 10. Main Workflow

```text
Applicant
   ↓
Project Focal
   ↓
RTEC Members
   ↓
RTEC Head
   ↓
Project Focal
   ↓
Budget Officer
   ↓
Accountant
   ↓
Regional Director
```

## 10.1 Applicant Stage

1. Applicant signs in with Google.
2. Applicant selects the proposal type.
3. The system loads the correct web form.
4. Applicant completes required sections.
5. Applicant uploads attachments.
6. Applicant saves as draft.
7. Applicant submits the proposal.
8. The system locks the submitted version.
9. The system routes the proposal to the assigned Project Focal.

## 10.2 Project Focal Stage

The Project Focal can:

- Return to Applicant
- Request revision
- Endorse to RTEC
- Reject as incomplete, subject to policy
- Add official comments

## 10.3 RTEC Review Stage

1. The proposal is assigned to the selected RTEC group.
2. RTEC members review independently.
3. Each member submits their review.
4. The RTEC Head sees all member reviews.
5. The RTEC Head consolidates comments.
6. The RTEC Head creates the official recommendation.
7. The RTEC Head returns the result to the Project Focal.

## 10.4 Post-RTEC Focal Stage

The Project Focal can:

- Return to Applicant for revision
- Return to RTEC when re-review is needed
- Endorse to Budget
- Close the proposal when not recommended, subject to policy

## 10.5 Budget Stage

The Budget Officer can:

- Add budget findings
- Return to Project Focal
- Endorse to Accounting

## 10.6 Accounting Stage

The Accountant can:

- Add accounting findings
- Return to Budget
- Return to Project Focal, subject to policy
- Endorse to RD

## 10.7 Regional Director Stage

The RD can:

- Approve
- Return for revision
- Defer
- Reject

---

# 11. Proposal Statuses

The following statuses are recommended:

1. `DRAFT`
2. `SUBMITTED_TO_FOCAL`
3. `UNDER_FOCAL_REVIEW`
4. `RETURNED_TO_APPLICANT`
5. `RESUBMITTED_TO_FOCAL`
6. `ENDORSED_TO_RTEC`
7. `UNDER_RTEC_REVIEW`
8. `RTEC_MEMBER_REVIEWS_COMPLETE`
9. `UNDER_RTEC_HEAD_CONSOLIDATION`
10. `RETURNED_TO_FOCAL_BY_RTEC`
11. `FOR_APPLICANT_REVISION_AFTER_RTEC`
12. `ENDORSED_TO_BUDGET`
13. `UNDER_BUDGET_REVIEW`
14. `RETURNED_BY_BUDGET`
15. `ENDORSED_TO_ACCOUNTING`
16. `UNDER_ACCOUNTING_REVIEW`
17. `RETURNED_BY_ACCOUNTING`
18. `ENDORSED_TO_RD`
19. `UNDER_RD_REVIEW`
20. `APPROVED`
21. `DEFERRED`
22. `REJECTED`
23. `WITHDRAWN`
24. `CLOSED`

Every status transition must record:

- Proposal ID
- Previous status
- New status
- User ID
- Role used
- Date and time
- Comment
- Workflow action
- Proposal version
- Request IP or session reference where appropriate

---

# 12. Proposal Versioning Rules

Versioning is mandatory.

## 12.1 Version Creation

A new proposal version is created when:

- The Applicant submits a draft
- The Applicant resubmits after revision
- An authorized internal user directly edits approved fields
- A major system migration changes stored structure
- A formal amendment is submitted after approval, in a future phase

## 12.2 Version Requirements

Each version must store:

- Version number
- Proposal ID
- Created by
- Created date
- Submission date
- Source version
- Form schema version
- Complete structured form data snapshot
- Attachment references
- Change summary
- Status at creation

## 12.3 Change Tracking

The system should support:

- Field-by-field change history
- Previous value
- New value
- Changed by
- Changed date
- Reason for change
- Comparison between versions

Submitted versions must never be overwritten.

---

# 13. Commenting Rules

The system supports:

- Field-level comments
- Section-level comments
- General comments
- Private RTEC comments
- Official consolidated comments
- Resolved comments
- Reopened comments

Each comment must store:

- Author
- Author role
- Proposal version
- Form section
- Field reference
- Comment type
- Visibility
- Date and time
- Status
- Parent comment, when replying
- Resolution status

Recommended visibility types:

- `APPLICANT_VISIBLE`
- `FOCAL_AND_INTERNAL`
- `RTEC_PRIVATE`
- `RTEC_HEAD_ONLY`
- `OFFICIAL_WORKFLOW`
- `ADMIN_AUDIT_ONLY`

---

# 14. Form Sources and Folder Structure

The project will contain original forms under:

```text
primev2/
└── docs/
    └── forms/
        ├── word/
        ├── excel/
        ├── pdf/
        └── converted-form-specs/
```

Place original files here:

```text
primev2/docs/forms/word/
primev2/docs/forms/excel/
primev2/docs/forms/pdf/
```

Converted specifications go here:

```text
primev2/docs/forms/converted-form-specs/
```

Recommended complete documentation structure:

```text
primev2/
├── README.md
├── docs/
│   ├── project-brief/
│   ├── requirements/
│   ├── workflows/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── frontend/
│   ├── security/
│   ├── testing/
│   ├── deployment/
│   ├── user-manual/
│   ├── admin-manual/
│   └── forms/
│       ├── word/
│       ├── excel/
│       ├── pdf/
│       └── converted-form-specs/
```

Original source forms must not be modified.

---

# 15. Form Conversion Process

## 15.1 General Rule

The original Word, Excel, or PDF file is a source reference.

The main editing experience will be a web form.

```text
Original Word, Excel, or PDF
            ↓
Form Analysis
            ↓
Form Specification
            ↓
Approved Web Form Design
            ↓
Dynamic Web Form
            ↓
Structured Database Record
            ↓
Generated PDF or Excel Output
```

## 15.2 Word Conversion

Word forms may contain:

- Text input
- Long-text sections
- Checkboxes
- Radio options
- Tables
- Repeating rows
- Signatory blocks
- Instructions
- Attachments
- Certification statements

The conversion specification must identify:

- Field name
- Field code
- Section
- Input type
- Required status
- Validation rule
- Editable roles
- Commentable roles
- Output location
- Data type
- Help text

## 15.3 Excel Conversion

Excel forms may contain:

- Line-item budgets
- Quantity
- Unit cost
- Total cost
- Subtotals
- Grand totals
- Formulas
- Work plans
- Timelines
- Repeating rows
- Drop-down values

Excel formulas must be documented before implementation.

Example:

```text
Total Cost = Quantity × Unit Cost
Grand Total = Sum of all line totals
```

The web form must preserve:

- Automatic calculations
- Numeric validation
- Currency formatting
- Add-row and remove-row behavior
- Formula accuracy
- Locked calculated fields
- Budget limits
- Validation messages

## 15.4 PDF Conversion

PDF forms may contain:

- Fixed labels
- Fillable fields
- Static instructions
- Tables
- Checkboxes
- Signature areas
- Official layout

The PDF must be used as the visual reference.

The system should later generate an official PDF using the approved data and layout.

## 15.5 Form Specification Template

Every converted form must have a specification containing:

- Form ID
- Form title
- Program
- Source filename
- Source version
- Source type
- Owner
- Assigned Project Focal
- Sections
- Fields
- Field types
- Required fields
- Validation rules
- Calculations
- Role permissions
- Comment permissions
- Workflow
- Attachment requirements
- Output requirements
- Approval date
- Approved by

---

# 16. MVP Definition

The MVP is complete only when the following end-to-end scenario works:

1. Admin creates internal users.
2. Applicant signs in through Google.
3. Applicant selects a proposal type.
4. Applicant completes a converted web form.
5. Applicant uploads required attachments.
6. Applicant submits.
7. Project Focal reviews and comments.
8. Applicant revises and resubmits.
9. Project Focal endorses to RTEC.
10. Multiple RTEC members submit independent reviews.
11. RTEC Head consolidates reviews.
12. Project Focal receives the consolidated result.
13. Project Focal endorses to Budget.
14. Budget reviews and endorses to Accounting.
15. Accounting reviews and endorses to RD.
16. RD approves or returns the proposal.
17. The Applicant sees the final official result.
18. The complete history is visible to authorized users.
19. The proposal can be exported to PDF.
20. Backups can be restored successfully.

---

# 17. Core User Stories

## 17.1 Applicant

**US-APP-001**  
As an Applicant, I want to sign in with Google so that I can access the system without creating another password.

Acceptance criteria:

- Google login is visible on the Applicant login page.
- Successful first login creates an Applicant account.
- Applicant role is assigned automatically.
- Applicant cannot access staff pages.

**US-APP-002**  
As an Applicant, I want to choose a proposal type so that the correct form is displayed.

Acceptance criteria:

- Only active proposal types are shown.
- The selected form version is recorded.
- The assigned Project Focal is determined automatically.

**US-APP-003**  
As an Applicant, I want to save a draft so that I can continue later.

Acceptance criteria:

- Draft is saved without formal submission.
- Draft remains editable.
- Autosave status is visible.
- Draft is accessible only to the Applicant and authorized support roles.

**US-APP-004**  
As an Applicant, I want to view official comments so that I know what to revise.

Acceptance criteria:

- Applicant sees only applicant-visible comments.
- Comments are linked to fields or sections.
- Resolved and unresolved comments are distinguishable.

## 17.2 Administrator

**US-ADM-001**  
As an Admin, I want to create staff accounts so that internal users can access assigned duties.

Acceptance criteria:

- Admin can enter name and email.
- Admin can assign one or more roles.
- Admin can assign program, office, or committee.
- Activation is logged.

**US-ADM-002**  
As an Admin, I want to deactivate a user so that former staff cannot access the system.

Acceptance criteria:

- Deactivated users cannot log in.
- Historical actions remain visible.
- Pending tasks can be reassigned.

## 17.3 Project Focal

**US-FOC-001**  
As a Project Focal, I want to receive proposals assigned to my program so that I can review the correct submissions.

Acceptance criteria:

- Only assigned proposals are visible.
- Proposal routing is based on active configuration.
- Unauthorized program access is denied.

**US-FOC-002**  
As a Project Focal, I want to return a proposal with comments so that the Applicant can revise it.

Acceptance criteria:

- At least one official comment is required.
- The status changes to returned.
- Applicant receives a notification.
- Resubmission creates a new version.

## 17.4 RTEC Member

**US-RTM-001**  
As an RTEC Member, I want to submit an independent review so that the RTEC Head can consolidate committee findings.

Acceptance criteria:

- Member sees only assigned proposals.
- Member review can be saved as draft.
- Submitted review is locked.
- Review is visible to the RTEC Head.

## 17.5 RTEC Head

**US-RTH-001**  
As an RTEC Head, I want to consolidate all member reviews so that one official RTEC assessment is produced.

Acceptance criteria:

- All member reviews are visible.
- The Head can draft consolidated comments.
- Only the Head can submit the final RTEC recommendation.
- Final output is routed to the Project Focal.

## 17.6 Budget Officer

**US-BUD-001**  
As a Budget Officer, I want to review budget calculations so that only compliant budgets proceed.

Acceptance criteria:

- Budget fields are clearly identified.
- Automatic totals are recalculated.
- Budget findings are recorded.
- Endorsement to Accounting is logged.

## 17.7 Accountant

**US-ACC-001**  
As an Accountant, I want to review accounting classifications so that the proposal meets accounting requirements.

Acceptance criteria:

- Accounting comments are saved.
- Return or endorsement action is logged.
- Only authorized accounting users can perform the action.

## 17.8 Regional Director

**US-RD-001**  
As the Regional Director, I want to review all official recommendations so that I can make the final decision.

Acceptance criteria:

- The RD sees the full official workflow history.
- The RD can approve, return, defer, or reject.
- The action is final unless formally reopened by policy.
- The Applicant receives a notification.

---

# 18. Non-Functional Requirements

## 18.1 Security

- Role-based access control
- Principle of least privilege
- Secure password hashing
- HTTPS only
- Secure sessions
- Session expiration
- Login rate limiting
- Audit logging
- File validation
- Malware scanning when available
- Input validation
- SQL injection protection
- Cross-site scripting protection
- CSRF protection where applicable
- Secure headers
- Environment secrets management
- No credentials committed to Git

## 18.2 Performance

Initial targets:

- Standard page load under 3 seconds on stable broadband
- Form autosave response under 2 seconds
- Standard API response under 1 second where practical
- Large form load under 5 seconds
- Attachment upload progress visible
- Pagination for large data lists

## 18.3 Availability

Initial target:

- 99% monthly availability for production, excluding approved maintenance
- Automated restart after service failure
- Health checks
- Backup verification
- Recovery documentation

## 18.4 Accessibility

- Keyboard-accessible forms
- Proper labels
- Visible validation messages
- Color-independent status indicators
- Sufficient contrast
- Responsive design
- Clear focus states

## 18.5 Maintainability

- TypeScript strict mode
- Modular architecture
- Documented APIs
- Database migrations
- Reusable form components
- Automated tests
- Code review
- Linting and formatting
- Clear naming conventions

---

# 19. Proposed Technology Stack

## Frontend

- React
- Vite
- TypeScript

## Backend

- Fastify
- TypeScript

## Database

- PostgreSQL

## File Storage

- MinIO

## Deployment

- Docker
- Coolify

## Recommended Supporting Tools

Subject to architecture approval:

- Zod for validation
- Prisma, Drizzle, or another approved data-access layer
- React Hook Form
- TanStack Query
- OAuth library compatible with Google
- PDF generation library
- Background job mechanism
- SMTP or approved email provider
- Testing tools for unit, integration, and end-to-end tests

No supporting library should be finalized until the Architect and Security agents review it.

---

# 20. Architecture Direction

## 20.1 Current Deployment Requirement

The current requirement is that PRIME v2 should run as one deployable application in Coolify.

This must be clarified during architecture approval:

### Option A — Recommended

One Coolify project using multiple containers/services:

- Frontend service
- Backend service
- PostgreSQL service
- MinIO service

Advantages:

- Easier maintenance
- Easier backups
- Easier restarts
- Better security separation
- Better scaling
- Lower risk of data loss

### Option B — Literal Single Container

Frontend, backend, PostgreSQL, and MinIO all run inside one container.

Risks:

- Difficult backup and restore
- Difficult process supervision
- Larger failure impact
- Harder upgrades
- Harder monitoring
- Poor separation of responsibilities
- Increased data-loss risk

> **Architecture Recommendation:** Use one Coolify project or one Docker Compose stack with separate services. Treat it as one system deployment, but not one literal container.

The final decision must be recorded in:

```text
docs/architecture/ADR-001-deployment-container-strategy.md
```

## 20.2 Logical Architecture

```text
Browser
   ↓
React Frontend
   ↓
Fastify API
   ├── PostgreSQL
   ├── MinIO
   ├── Authentication
   ├── Workflow Engine
   ├── Notification Service
   └── PDF/Document Generator
```

---

# 21. High-Level Data Model

Recommended entities:

- users
- applicant_profiles
- staff_profiles
- roles
- permissions
- user_roles
- offices
- programs
- proposal_types
- form_templates
- form_template_versions
- form_sections
- form_fields
- form_rules
- form_calculations
- proposals
- proposal_versions
- proposal_field_values
- proposal_attachments
- proposal_assignments
- workflow_definitions
- workflow_steps
- workflow_transitions
- proposal_workflow_history
- comments
- comment_threads
- rtec_groups
- rtec_memberships
- rtec_reviews
- rtec_review_items
- rtec_consolidations
- budget_reviews
- accounting_reviews
- rd_decisions
- notifications
- email_logs
- audit_logs
- system_settings
- user_invitations
- password_reset_tokens

The Database Agent must convert this into an approved ERD before implementation.

---

# 22. API Domain Areas

The backend should be organized by domain:

- Authentication
- Users
- Roles and permissions
- Programs
- Proposal types
- Form templates
- Form versions
- Proposals
- Proposal versions
- Comments
- Workflow
- RTEC
- Budget review
- Accounting review
- RD decision
- Attachments
- Notifications
- Audit logs
- Reports
- System administration

API endpoints must not be implemented before:

- User stories are approved
- Permission matrix is approved
- Data model is approved
- API contract is reviewed

---

# 23. AI Development Agents

## 23.1 Product Manager Agent

Responsibilities:

- Maintain business requirements
- Maintain MVP scope
- Write user stories
- Define acceptance criteria
- Prevent scope creep
- Prepare stakeholder decisions
- Maintain backlog priorities

Deliverables:

- Project Brief
- MVP specification
- Product backlog
- User stories
- Acceptance criteria
- Change-request log

## 23.2 Architect Agent

Responsibilities:

- Design system architecture
- Select architectural patterns
- Define module boundaries
- Review deployment strategy
- Document technical decisions
- Review scalability and maintainability

Deliverables:

- Architecture diagram
- ADRs
- Module design
- Integration design
- Deployment architecture
- Technical standards

## 23.3 Database Agent

Responsibilities:

- Design PostgreSQL schema
- Define relationships
- Define migrations
- Define indexes
- Define versioning structures
- Define backup strategy
- Review data retention

Deliverables:

- ERD
- Data dictionary
- Migration plan
- Index plan
- Backup and restore plan

## 23.4 Frontend Agent

Responsibilities:

- Design React application structure
- Implement role-based dashboards
- Implement dynamic forms
- Implement comments
- Implement validation
- Implement responsive and accessible UI
- Implement proposal comparison

Deliverables:

- UI architecture
- Component map
- Form rendering plan
- State-management plan
- Frontend test plan

## 23.5 Backend Agent

Responsibilities:

- Implement Fastify APIs
- Implement business rules
- Implement workflow transitions
- Implement authorization
- Implement form data storage
- Implement notifications
- Implement PDF generation

Deliverables:

- API contracts
- Service modules
- Validation rules
- Workflow services
- Integration tests

## 23.6 Security Agent

Responsibilities:

- Threat modeling
- Authentication review
- Authorization review
- File-upload review
- Secrets management
- Security testing
- Dependency review
- Incident-response planning

Deliverables:

- Threat model
- Security checklist
- Security test cases
- Risk register
- Remediation plan

## 23.7 QA Agent

Responsibilities:

- Create test strategy
- Create test cases
- Perform regression testing
- Validate role permissions
- Test workflow transitions
- Test form calculations
- Test accessibility
- Support UAT

Deliverables:

- Test plan
- Test cases
- Defect log
- Regression report
- UAT report

## 23.8 DevOps Agent

Responsibilities:

- Create Docker configuration
- Configure Coolify
- Configure domain and HTTPS
- Configure environment variables
- Configure backups
- Configure monitoring
- Configure logs
- Prepare rollback procedures

Deliverables:

- Deployment guide
- Environment checklist
- Backup scripts
- Restore procedure
- Monitoring plan
- Rollback plan

## 23.9 Refactor Agent

Responsibilities:

- Review code quality
- Remove duplication
- Improve naming
- Reduce complexity
- Improve tests
- Improve performance
- Confirm no behavior changes

Deliverables:

- Refactor report
- Technical-debt log
- Approved refactor pull requests

## 23.10 Production Readiness Agent

Responsibilities:

- Validate launch readiness
- Validate backup restoration
- Validate monitoring
- Validate security
- Validate documentation
- Validate support processes
- Validate rollback

Deliverables:

- Production-readiness checklist
- Go-live recommendation
- Outstanding-risk report
- Hypercare plan

---

# 24. Development Phases

## Phase 0 — Project Initialization

Objective:

Create the official planning structure before coding.

Tasks:

- Create repository
- Create `primev2/docs`
- Create form folders
- Add this README
- Add issue templates
- Add decision-log template
- Add change-request template
- Inventory all source forms
- Identify stakeholders
- Identify approval authorities

Deliverables:

- Repository structure
- Source-form inventory
- Stakeholder list
- Initial risk register
- Initial backlog

Approval Gate:

- Project owner confirms project name, scope, and stakeholders

No coding allowed.

---

## Phase 1 — Business Analysis and Project Brief

Objective:

Document the exact business process.

Tasks:

- Interview process owners
- Document current manual workflow
- Document proposed workflow
- Confirm proposal types
- Confirm routing rules
- Confirm return paths
- Confirm RTEC confidentiality rules
- Confirm RD decision rules
- Confirm Budget and Accounting responsibilities
- Confirm record-retention requirements
- Confirm official output formats

Deliverables:

- Project Brief
- Business process map
- Problem statement
- Objectives
- Scope
- Assumptions
- Constraints
- Stakeholder matrix
- Risk register

Approval Gate:

- Business owner approves Project Brief

No coding allowed.

---

## Phase 2 — MVP, Roles, and User Stories

Objective:

Define exactly what the first release must do.

Tasks:

- Finalize MVP
- Finalize roles
- Finalize permission matrix
- Finalize workflow statuses
- Write user stories
- Write acceptance criteria
- Prioritize backlog
- Define out-of-scope items
- Define success metrics

Deliverables:

- MVP specification
- Role-permission matrix
- User-story backlog
- Acceptance criteria
- Definition of Ready
- Definition of Done

Approval Gate:

- Product owner approves MVP
- Security owner approves permissions
- Process owner approves workflow

No coding allowed.

---

## Phase 3 — Form Inventory and Conversion Specifications

Objective:

Convert source forms into approved web-form specifications.

Tasks:

- List all Word forms
- List all Excel forms
- List all PDF forms
- Identify duplicate fields
- Identify common sections
- Identify calculations
- Identify required attachments
- Define field types
- Define validations
- Define comment permissions
- Define output formats
- Create specifications

Deliverables:

- Form inventory
- One specification per form
- Formula catalog
- Validation catalog
- Common-field catalog
- Output-layout requirements

Approval Gate:

- Form owner approves each specification

No form implementation before approval.

---

## Phase 4 — Architecture and Data Design

Objective:

Approve the technical design.

Tasks:

- Finalize deployment strategy
- Finalize frontend structure
- Finalize backend structure
- Finalize data model
- Finalize MinIO structure
- Finalize authentication
- Finalize workflow engine
- Finalize audit model
- Finalize notification architecture
- Finalize PDF generation method
- Finalize backup and restore approach
- Create ADRs

Deliverables:

- Architecture document
- ERD
- Data dictionary
- API contract draft
- Security architecture
- Deployment architecture
- Backup design
- ADRs

Approval Gate:

- Product owner approves architecture impact
- Architect approves technical design
- Security Agent approves security design
- DevOps Agent approves deployment design

Coding may begin only after this gate.

---

## Phase 5 — UX and Prototype

Objective:

Validate the user experience before full implementation.

Required screens:

- Public landing page
- Applicant Google login
- Staff login
- Applicant dashboard
- Create proposal
- Dynamic form
- Drafts
- Submitted proposals
- Proposal detail
- Comment panel
- Version history
- Project Focal dashboard
- RTEC Member dashboard
- RTEC Head dashboard
- Budget dashboard
- Accounting dashboard
- RD dashboard
- Admin user management
- Admin role management
- Admin form management
- Admin workflow management
- Audit log viewer

Deliverables:

- Wireframes
- Clickable prototype
- Screen specifications
- Validation behavior
- Empty states
- Error states
- Mobile and desktop behavior

Approval Gate:

- Selected users approve prototype
- Accessibility review completed

---

## Phase 6 — Foundation Implementation

Objective:

Build the technical foundation.

Tasks:

- Set up repository
- Set up testing framework
- Set up CI checks
- Set up Docker development environment

Deliverables:
- Set up TypeScript standards
- Set up frontend shell
- Set up Fastify server
- Set up PostgreSQL connection
- Set up MinIO connection
- Set up migrations
- Set up logging
- Set up error handling
- Set up environment configuration

- Running local environment
- Health endpoint
- Database migration pipeline
- Storage connectivity
- CI validation
- Basic application shell

Exit Criteria:

- All foundation tests pass
- No secrets committed
- Development setup documented

---

## Phase 7 — Authentication and User Administration

Objective:

Implement secure access and role management.

Tasks:

- Applicant Google login
- Staff email/password login
- Password hashing
- First-login password change
- Password reset
- User activation/deactivation
- Role assignment
- Program assignment
- RTEC assignment
- User audit logs
- Seed test users

Deliverables:

- Authentication module
- User-management module
- Role-permission module
- Development seed data

Exit Criteria:

- Applicant cannot access staff routes
- Staff cannot use Applicant Google login for internal access
- Deactivated user cannot log in
- Role tests pass

---

## Phase 8 — Dynamic Forms and Proposal Drafts

Objective:

Allow Applicants to complete forms online.

Tasks:

- Form-template renderer
- Text fields
- Numeric fields
- Date fields
- Select fields
- Checkboxes
- Radio fields
- Tables
- Repeating rows
- Budget calculations
- Validation
- Draft saving
- Autosave
- Attachments
- Proposal type selection

Deliverables:

- Dynamic form engine
- Draft proposal module
- Attachment module
- Calculation engine

Exit Criteria:

- Approved MVP forms render correctly
- Calculations match source Excel forms
- Drafts persist correctly
- Autosave handles interruptions

---

## Phase 9 — Submission, Versioning, and Comments

Objective:

Implement formal submission and controlled revision.

Tasks:

- Submit proposal
- Lock submitted version
- Create version snapshot
- Field comments
- Section comments
- General comments
- Comment visibility
- Resolve and reopen comments
- Return to Applicant
- Resubmission
- Version comparison
- Change history

Deliverables:

- Submission module
- Versioning module
- Commenting module
- Comparison view

Exit Criteria:

- Submitted versions cannot be overwritten
- Applicant sees only allowed comments
- Resubmission creates a new version
- Audit logs are complete

---

## Phase 10 — Workflow and Project Focal Review

Objective:

Implement routing and focal review.

Tasks:

- Automatic Project Focal assignment
- Proposal queue
- Review actions
- Return to Applicant
- Endorse to RTEC
- Notifications
- Workflow history
- Reassignment handling

Deliverables:

- Workflow engine
- Focal dashboard
- Transition validation
- Notification events

Exit Criteria:

- Invalid transitions are blocked
- Correct focal receives proposal
- Every action is logged

---

## Phase 11 — RTEC Review and Consolidation

Objective:

Implement committee review.

Tasks:

- RTEC group management
- Member assignment
- Independent reviews
- Draft review
- Submit review
- Private comments
- RTEC Head dashboard
- Consolidation
- Final RTEC recommendation
- Return to Project Focal

Deliverables:

- RTEC Member module
- RTEC Head module
- Consolidation module
- Official RTEC output

Exit Criteria:

- Members cannot see unauthorized reviews
- Only Head can finalize
- Consolidated result is immutable after submission unless formally reopened

---

## Phase 12 — Budget, Accounting, and RD Review

Objective:

Complete the approval chain.

Tasks:

- Budget queue
- Budget comments
- Budget endorsement
- Accounting queue
- Accounting comments
- Accounting endorsement
- RD queue
- Final decisions
- Final notifications
- Final audit history

Deliverables:

- Budget module
- Accounting module
- RD module
- Decision record

Exit Criteria:

- Only authorized roles can act
- Final approval is recorded
- Applicant receives official result
- Completed proposal becomes read-only

---

## Phase 13 — Document Generation and Reporting

Objective:

Generate official outputs and basic reports.

Tasks:

- PDF generation
- Approved template layouts
- Proposal cover sheet
- RTEC assessment output
- Budget output
- Approval output
- Proposal-status report
- User activity report
- Audit export

Deliverables:

- PDF outputs
- Basic reports
- Export controls

Exit Criteria:

- Generated output matches approved template
- Calculations and text match stored data
- Unauthorized users cannot generate restricted documents

---

## Phase 14 — Security Hardening

Objective:

Prepare for controlled testing and deployment.

Tasks:

- Threat-model review
- Authorization review
- Input validation review
- File-upload review
- Rate limiting
- Secure headers
- Session-security review
- Dependency scan
- Secret scan
- Audit-log review
- Backup encryption review
- Penetration test or structured security test

Deliverables:

- Security test report
- Remediation list
- Approved risk exceptions

Exit Criteria:

- No unresolved critical vulnerability
- No unresolved high-risk authorization issue
- Security owner approves staging release

---

## Phase 15 — Quality Assurance

Objective:

Verify that the MVP meets requirements.

Testing types:

- Unit testing
- Integration testing
- API testing
- End-to-end testing
- Role-permission testing
- Workflow testing
- Form calculation testing
- Versioning testing
- File-upload testing
- Notification testing
- Browser testing
- Responsive testing
- Accessibility testing
- Performance testing
- Backup and restore testing
- Regression testing

Deliverables:

- Test execution report
- Defect log
- Regression report
- Release candidate

Exit Criteria:

- All critical tests pass
- No open blocker defect
- No open critical defect
- Accepted workaround for remaining minor issues

---

## Phase 16 — Staging Deployment

Objective:

Deploy a production-like environment using Coolify.

Tasks:

- Create staging project
- Configure domain
- Configure HTTPS
- Configure environment variables
- Configure PostgreSQL
- Configure MinIO
- Configure email
- Configure backups
- Configure logs
- Configure monitoring
- Deploy release candidate
- Run smoke tests

Deliverables:

- Staging environment
- Deployment guide
- Smoke-test report
- Rollback procedure

Exit Criteria:

- Staging is stable
- Backup succeeds
- Restore succeeds
- Health checks pass

---

## Phase 17 — User Acceptance Testing

Objective:

Allow actual representatives to validate the system.

UAT participants:

- Applicant representative
- Project Focal
- RTEC Member
- RTEC Head
- Budget Officer
- Accountant
- Regional Director representative
- System Administrator

UAT scenarios:

- New proposal
- Returned proposal
- Resubmission
- RTEC review
- Consolidation
- Budget review
- Accounting review
- RD approval
- PDF generation
- User administration
- Account deactivation
- Reassignment
- Backup restoration

Deliverables:

- UAT script
- UAT findings
- Signed acceptance or conditional acceptance
- Final change list

Exit Criteria:

- Product owner approves production release

---

## Phase 18 — Production Readiness

Objective:

Confirm that the system is safe to launch.

Checklist:

- Production domain ready
- HTTPS valid
- Production secrets configured
- Test users removed or disabled
- Admin account secured
- Backup schedule active
- Restore tested
- Monitoring active
- Logs available
- Email verified
- Error tracking active
- Security review approved
- UAT approved
- User manual complete
- Admin manual complete
- Support contacts defined
- Incident procedure defined
- Rollback tested
- Maintenance schedule defined

Deliverables:

- Production-readiness report
- Go-live approval
- Rollback plan
- Hypercare plan

---

## Phase 19 — Production Deployment

Objective:

Launch PRIME v2.

Tasks:

- Freeze release
- Tag version
- Create pre-deployment backup
- Deploy through Coolify
- Run migrations
- Run smoke tests
- Verify login
- Verify proposal submission
- Verify storage
- Verify notifications
- Verify workflow
- Verify PDF generation
- Monitor logs

Deliverables:

- Production release
- Deployment record
- Smoke-test result

Exit Criteria:

- System is stable
- Critical functions work
- Go-live authority confirms release

---

## Phase 20 — Hypercare and Continuous Improvement

Objective:

Stabilize and improve the production system.

Tasks:

- Monitor daily
- Review errors
- Review performance
- Review user feedback
- Fix priority defects
- Track enhancement requests
- Review backup reports
- Review security alerts
- Schedule release cycles
- Maintain documentation

Deliverables:

- Hypercare report
- Enhancement backlog
- Maintenance schedule
- Version roadmap

---

## Phase 21 — MVP Integration, Fillable Forms, and Deploy Readiness

Objective:

Complete the integrated MVP so the team can deploy, test every role, and use fillable forms end-to-end.

Tasks:

- Seed one dev test account per role (`@dev.local`)
- Document local login and deployment steps
- Wire remaining UI features to APIs (queues, admin, notifications, profile)
- Convert all 21 web form specs into fillable `FormTemplate` versions
- Run staging deployment smoke tests (login, proposal, workflow, storage)
- Confirm any developer can run the stack and validate features

Deliverables:

- [docs/deployment/DEV-TEST-ACCOUNTS.md](docs/deployment/DEV-TEST-ACCOUNTS.md)
- [docs/agents/PHASE-21-MVP-COMPLETION.md](docs/agents/PHASE-21-MVP-COMPLETION.md)
- Fillable forms for GIA, CEST, SSCP (minimum); all 21 forms (target)
- Staging deploy checklist executed

Approval Gate:

- All role test accounts work locally
- At least one full proposal path tested (applicant → focal)
- QA sign-off on integration release

Coding allowed. See [PHASE-21-MVP-COMPLETION.md](docs/agents/PHASE-21-MVP-COMPLETION.md).

---

# 25. Security Plan

## 25.1 Authentication

- Google OAuth for Applicants only
- Email and password for internal staff
- Strong password policy
- Password hashing
- Secure reset tokens
- Expiring activation links
- Session timeout
- Forced logout after deactivation
- Rate limiting

## 25.2 Authorization

Permissions should be action-based:

- View proposal
- Edit draft
- Submit proposal
- Comment
- View private comment
- Return proposal
- Endorse proposal
- Assign reviewer
- Consolidate RTEC review
- Approve proposal
- Manage users
- Manage forms
- View audit logs

Never rely on frontend visibility alone. Every backend request must verify authorization.

## 25.3 File Security

- Allow approved file types only
- Enforce size limits
- Generate safe object keys
- Prevent executable file delivery
- Use signed or controlled download URLs
- Log uploads and downloads where required
- Scan uploads when feasible
- Do not expose MinIO admin credentials to the browser

## 25.4 Data Protection

- HTTPS
- Secure environment variables
- Restricted database access
- Restricted MinIO access
- Backup protection
- Sensitive-data minimization
- Audit logging
- Access review
- Retention policy

## 25.5 Security Review Gates

Security review is required before:

- Staging deployment
- Production deployment
- Major authentication changes
- Major permission changes
- New external integrations

---

# 26. Testing Plan

## 26.1 Unit Tests

Test:

- Validation
- Calculations
- Permission helpers
- Workflow transition rules
- Version-number generation
- Comment visibility
- Status mapping

## 26.2 Integration Tests

Test:

- Database operations
- MinIO upload/download
- Google login callback
- Staff login
- Email notifications
- Proposal submission
- Workflow transition
- PDF generation

## 26.3 End-to-End Tests

Test the complete workflow from Applicant to RD.

## 26.4 Permission Tests

For every endpoint:

- Authorized role succeeds
- Unauthorized role is denied
- Inactive user is denied
- Applicant cannot access another Applicant's proposal
- RTEC Member cannot finalize consolidation
- Project Focal cannot approve as RD
- Admin cannot silently alter proposal data

## 26.5 Form Tests

For every form:

- Required fields
- Optional fields
- Data types
- Character limits
- Numeric limits
- Date rules
- Repeating rows
- Formula correctness
- Export correctness

## 26.6 Backup and Recovery Tests

Test:

- PostgreSQL backup
- PostgreSQL restore
- MinIO backup
- MinIO restore
- Full environment recovery
- Recovery documentation

---

# 27. Deployment Plan

## 27.1 Environments

- Local development
- Shared development
- Staging
- Production

Each environment must have separate:

- Database
- MinIO bucket or instance
- Google OAuth configuration
- Email settings
- Secrets
- Domain
- Logs

## 27.2 Coolify Requirements

- Project created
- Repository connected
- Docker or Compose configuration
- Health checks
- Domain
- HTTPS
- Environment variables
- Persistent storage
- PostgreSQL backup
- MinIO backup
- Restart policy
- Log access
- Deployment rollback

## 27.3 Environment Variables

Expected categories:

- Application URL
- Frontend URL
- API URL
- Database URL
- MinIO endpoint
- MinIO access key
- MinIO secret key
- MinIO bucket
- Google client ID
- Google client secret
- Session secret
- Email host
- Email port
- Email username
- Email password
- Email sender
- Logging level

Never place real secrets in README files or Git.

---

# 28. Backup and Recovery Plan

## PostgreSQL

- Daily automated backup
- Weekly full backup retention
- Monthly archival backup, subject to policy
- Restore test before production launch
- Restore test at scheduled intervals

## MinIO

- Daily object backup or replication
- Versioning where appropriate
- Retention policy
- Restore verification

## Configuration

Back up:

- Deployment configuration
- Environment-variable inventory without exposing secrets
- Form specifications
- Database migrations
- Docker configuration
- Coolify settings documentation

## Recovery Targets

Initial recommended targets:

- Recovery Point Objective: 24 hours or better
- Recovery Time Objective: 8 hours or better

Final targets require business approval.

---

# 29. Production-Readiness Plan

Production launch requires:

- Approved Project Brief
- Approved MVP
- Approved architecture
- Approved form specifications
- Approved security review
- Passed QA
- Passed UAT
- Successful backup and restore test
- Completed deployment guide
- Completed user manual
- Completed admin manual
- Monitoring enabled
- Error logging enabled
- Support process ready
- Rollback plan ready
- Production owner identified
- Data-retention policy approved

---

# 30. Definition of Ready

A feature is ready for development only when:

- Business purpose is clear
- User role is identified
- User story is written
- Acceptance criteria are written
- UI behavior is defined
- Permission rules are defined
- Data requirements are defined
- Error cases are defined
- Dependencies are identified
- Security impact is reviewed
- Test cases are identified
- Product owner prioritizes it

---

# 31. Definition of Done

A feature is done only when:

- Code is complete
- Code review is complete
- Unit tests pass
- Integration tests pass
- Permission tests pass
- Acceptance criteria pass
- Documentation is updated
- No critical security issue exists
- No blocker defect exists
- Logging is included
- Error handling is included
- Database migration is included where needed
- Deployment impact is documented
- Product owner accepts the feature

---

# 32. Developer Working Rules

Applies to **all developers** (any experience level), not only junior staff or interns.

1. Read this README before making changes.
2. Do not start coding from a vague request.
3. Identify the user role.
4. Identify the user story.
5. Identify the acceptance criteria.
6. Identify affected workflow states.
7. Identify permission changes.
8. Identify database changes.
9. Identify API changes.
10. Identify UI changes.
11. Identify security risks.
12. Identify tests.
13. Update documentation.
14. Ask the Product Manager Agent to confirm scope.
15. Ask the Architect Agent to confirm design.
16. Ask the Security Agent to confirm access rules.
17. Ask the QA Agent to define tests.
18. Implement only after approval.

---

# 33. Standard AI Task Prompt Template

Use this template when assigning a task to an AI development agent:

```text
Project: PRIME v2

Business Goal:
[Explain the business value.]

User Role:
[Applicant / Project Focal / RTEC Member / RTEC Head / Budget Officer / Accountant / RD / Admin]

User Story:
As a [role], I want [action], so that [benefit].

Acceptance Criteria:
1.
2.
3.

Current Workflow Status:
[State before action]

Expected Workflow Status:
[State after action]

Permissions:
- Can view:
- Can edit:
- Can comment:
- Can return:
- Can endorse:
- Can approve:

Affected Modules:
- Frontend:
- Backend:
- Database:
- Storage:
- Notifications:
- Audit:

Security Requirements:
[List access and validation requirements.]

Testing Requirements:
[List unit, integration, and end-to-end tests.]

Documentation to Update:
[List files.]

Constraints:
- Do not change unrelated modules.
- Do not bypass role checks.
- Do not overwrite submitted proposal versions.
- Do not expose private RTEC comments.
- Do not commit secrets.
```

---

# 34. Coding and Repository Standards

These standards should be finalized by the Architect Agent:

- TypeScript strict mode
- Clear module boundaries
- Consistent naming
- Small focused functions
- No duplicated business rules
- Centralized permission checks
- Centralized workflow rules
- Database migrations
- Structured logging
- No secrets in source code
- Environment validation
- Input validation
- API error format
- Test naming standard
- Pull-request review
- Conventional commit messages, if adopted
- Release tagging

---

# 35. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Incomplete form inventory | High | Complete inventory before form coding |
| Workflow ambiguity | High | Obtain signed workflow approval |
| Incorrect role permissions | Critical | Permission matrix and authorization tests |
| Single-container deployment failure | High | Prefer one stack with separate services |
| Data loss | Critical | Automated backups and tested restore |
| Incorrect Excel formulas | High | Formula catalog and calculation tests |
| Unauthorized RTEC visibility | High | Comment visibility rules and tests |
| Scope creep | High | Approved MVP and change-control process |
| Poor user adoption | High | Prototype, training, and UAT |
| Source forms change during development | Medium | Version source forms and specifications |
| Email failure | Medium | In-app notifications and retry logging |
| Large attachment storage growth | Medium | File limits, quotas, and retention policy |
| Dependency vulnerability | High | Security scanning and update process |

---

# 36. Success Metrics

Initial suggested metrics:

- Percentage of proposals submitted online
- Average time from submission to focal review
- Average RTEC review duration
- Average total approval duration
- Number of returned proposals
- Number of revision cycles
- Number of overdue reviews
- Percentage of successful notifications
- Number of unauthorized-access incidents
- Backup success rate
- Restore-test success rate
- User satisfaction
- Reduction in emailed Word and Excel files

---

# 37. Required Approval Documents

Before coding begins, the following must be approved:

- `docs/project-brief/PRIME-v2-Project-Brief.md`
- `docs/requirements/PRIME-v2-MVP.md`
- `docs/requirements/PRIME-v2-Roles-and-Permissions.md`
- `docs/workflows/PRIME-v2-Workflow.md`
- `docs/architecture/PRIME-v2-Architecture.md`
- `docs/database/PRIME-v2-ERD.md`
- `docs/security/PRIME-v2-Security-Plan.md`
- Form specifications under `docs/forms/converted-form-specs/`

---

# 38. Immediate Next Actions

1. Create the `primev2` repository.
2. Save this file as `primev2/README.md`.
3. Create `primev2/docs/forms/word`.
4. Create `primev2/docs/forms/excel`.
5. Create `primev2/docs/forms/pdf`.
6. Place all original forms in the correct folders.
7. Create a complete form inventory.
8. Approve the Project Brief.

> **Documentation map:** See [docs/README.md](docs/README.md), [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md), [AGENTS.md](AGENTS.md), and [docs/forms/FORM-INVENTORY.md](docs/forms/FORM-INVENTORY.md) for folder navigation, agent workflow, and the form catalog.

9. Approve the MVP.
10. Approve the role-permission matrix.
11. Approve the workflow.
12. Approve the architecture.
13. Begin development only after approvals.

---

# 39. Current Approved Understanding

The current agreed direction is:

- System name: Project and Research Information Management Environment
- Short name: PRIME v2
- Applicants use Google Sign-In only
- Internal staff use email and password
- Admin creates staff users
- Admin assigns roles
- Main staff roles:
  - Project Focal
  - RTEC Member
  - RTEC Head
  - Budget Officer
  - Accountant
  - Regional Director
  - System Administrator
- Source forms may be Word, Excel, or PDF
- Source forms are stored under `primev2/docs/forms`
- Forms are converted into web forms
- Proposals use version control
- RTEC members review independently
- RTEC Head consolidates reviews
- Project Focal manages routing
- Budget and Accounting review financial matters
- RD makes the final decision
- Technology direction:
  - React
  - Vite
  - TypeScript
  - Fastify
  - PostgreSQL
  - MinIO
  - Docker
  - Coolify
- Preferred deployment:
  - One Coolify project
  - Separate application, database, and storage services
- Coding must not begin until MVP and architecture approval

---

# 40. Final Development Rule

> Build PRIME v2 as a controlled workflow system, not merely as an online form.

Every feature must preserve:

- Correct ownership
- Correct routing
- Correct permissions
- Complete version history
- Complete audit history
- Confidential review rules
- Secure file handling
- Recoverable data
- Clear accountability
