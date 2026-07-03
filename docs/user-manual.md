# OrqoHire — User Manual

**Version:** 2.0  
**Platform:** Web (Next.js)  
**By:** Whitekraaft

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Login & Authentication](#3-login--authentication)
4. [Role Overview](#4-role-overview)
5. [Recruiter Portal](#5-recruiter-portal)
6. [Client SPOC Portal](#6-client-spoc-portal)
7. [Candidate Portal](#7-candidate-portal)
8. [Admin Portal](#8-admin-portal)
9. [Opportunity Hub (Public)](#9-opportunity-hub-public)
10. [Matching Engine](#10-matching-engine)
11. [Candidate Passport](#11-candidate-passport)
12. [Employer Verification](#12-employer-verification)
13. [Pipeline Management](#13-pipeline-management)
14. [Analytics Dashboard](#14-analytics-dashboard)
15. [FAQ & Troubleshooting](#15-faq--troubleshooting)

---

## 1. Introduction

**OrqoHire** is a recruitment intelligence platform that helps recruitment agencies manage the end-to-end hiring lifecycle. It connects **recruiters**, **client companies**, and **candidates** on a single platform with:

- Candidate sourcing & profile management
- AI-free smart matching (candidate ↔ job requirements)
- Pipeline tracking (Submitted → L1 → L2 → L3 → Test → Offered → Joined → Rejected)
- Candidate Passport system with employer verification
- Analytics dashboard with funnel metrics
- Public opportunity hub for job seekers

---

## 2. Getting Started

### Accessing the Platform

| Environment | URL |
|---|---|
| Production | https://orqohire.vercel.app |
| Local Dev | http://localhost:3000 |

### Browser Requirements

- Chrome 90+, Firefox 90+, Edge 90+, Safari 15+
- JavaScript enabled
- Cookies enabled (for authentication)

---

## 3. Login & Authentication

### Login

1. Navigate to `/login`
2. Enter your **email address** and **password**
3. Click **Sign In**
4. You will be redirected to your role-specific dashboard

### Registration (Candidates Only)

1. Navigate to `/register`
2. Fill in your details (name, email, phone, password)
3. Click **Create Account**
4. You can now log in and access the Candidate Portal

### Session

- Session lasts **8 hours** (access token)
- Auto-refresh via a **30-day refresh token**
- Logout via the **Sign Out** button in the navigation

---

## 4. Role Overview

| Role | Access | Main Features |
|---|---|---|
| **Super Admin** | Full system | Passport management, discovery queue, user overview |
| **Recruiter Manager** | Full platform | Dashboard, candidates, requirements, pipeline, analytics |
| **Recruiter** | Full platform | Dashboard, candidates, requirements, pipeline, analytics |
| **Client SPOC** | Client- scoped | Pipeline view, stage updates, feedback, open requirements |
| **Candidate** | Self-service | Browse jobs, apply, view applications, manage passport |

---

## 5. Recruiter Portal

Accessed after login as a recruiter.

### Dashboard (`/recruiter/dashboard`)

Key metrics at a glance:
- **Total Candidates** in the system
- **Active Requirements** (open positions)
- **Total Submissions** made
- **Pipeline Funnel** — conversion rates across stages (Submitted → L1 → L2 → L3 → Offered → Joined)
- **Submissions by Client** — horizontal bar chart
- **Candidates by Location** — distribution chart
- **Experience Distribution** — bands (0-2, 2-5, 5-8, 8-12, 12+ years)
- **Active Requirements** — summary table with priority badges

### Candidates (`/recruiter/candidates`)

- **Search & Filter** by name, skills, status, location
- **View** detailed candidate profiles
- **Add New Candidate** — fill in all relevant fields
- **Edit** candidate information
- **View Match Score** against any active requirement

### Requirements (`/recruiter/requirements`)

- **View** all job requirements with status (Active / On Hold / Closed)
- **Filter** by client, status, priority
- **Create New Requirement** — add job code, client, skills, experience, budget, etc.
- **Shortlist Candidates** — run the matching engine to find best-fit candidates
- **Close Requirement** when all positions are filled

### Pipeline (`/recruiter/pipeline`)

- **Kanban-style** stage view of all submissions
- **Submit Candidate** to a requirement (creates pipeline entry)
- **Drag or update stage** as candidate progresses
- **View** interview dates, results, feedback
- **Filter** by client, job code, status

### Analytics (`/recruiter/analytics`)

- Pipeline conversion funnel visualization
- Submission metrics by client
- Candidate distribution analytics
- Requirement status overview

### Shortlisting & Matching

1. Go to **Requirements** → select a requirement
2. Click **Shortlist Candidates**
3. The system runs the matching engine against all candidates
4. Results are scored (0–100) with bands:
   - **Excellent** (80+)
   - **Good** (60–79)
   - **Moderate** (40–59)
   - **Weak** (20–39)
   - **Poor** (0–19)
5. Click on a candidate to view the detailed score breakdown
6. Select candidates and submit them to the pipeline

---

## 6. Client SPOC Portal

### Dashboard (`/portal/dashboard`)

- **Pipeline Summary** — see all submissions for your company's requirements
- **Stage Updates** — update candidate stages with feedback
- **Open Requirements** — view your company's active job openings

### Pipeline Management

1. View all candidates in pipeline for your company
2. Update stage for each candidate (e.g., move from L1 → L2)
3. Add **feedback** and **interview results**
4. Drop candidates with a reason if rejected

### Client Feedback

- Record interviewer feedback at each stage
- Rate candidates and add notes
- Communicate decisions back to recruiters

---

## 7. Candidate Portal

### My Applications (`/candidate`)

- View all jobs you've applied to
- See current application stage (Submitted, L1, L2, etc.)
- Track progress in the pipeline

### Browse Opportunities (`/opportunities`)

- Public job listings page — no login required
- **Search** by keyword, location, skills
- **Filter** by category (Tech, HR, Finance, Construction, etc.)
- **Apply directly** by submitting your name, email, phone, and resume
- Your application creates a candidate profile and pipeline entry

### My Passport (`/passport`)

The Candidate Passport is your verified digital identity for recruiters.

#### Sections:
1. **Personal Information** — name, email, phone, address, links
2. **Skills & Experience** — total experience, relevant experience, primary/secondary skills
3. **Employment History** — add past jobs with company details
4. **Education** — highest degree, institution, graduation year

#### How to Build Your Passport:

1. Go to **My Passport**
2. Fill in **Personal Information**
3. Add your **Skills**
4. Add **Employment History** entries (click "Add Employment")
5. For each employment, provide the **official company email** (e.g., `you@company.com`)
6. Click **Verify Employment** — a verification link is sent to the employer
7. Once the employer confirms, your **trust score** increases by +10 per verified entry
8. Passport status auto-updates: DRAFT → PARTIAL → COMPLETE → VERIFIED

---

## 8. Admin Portal

### Overview (`/admin`)

Super Admin panel for system management.

### Passport Management

- View all candidate passports
- Review trust scores
- Manually adjust passport status if needed

### Discovery Queue (`/admin/discovery`)

The **learning queue** contains unknown skills/titles detected from new job descriptions.

| Occurrences | Status |
|---|---|
| < 50 | New |
| 50–199 | Review |
| 200+ | Auto-approved |

Admins can:
- **Approve** — add to the skill/role taxonomy
- **Reject** — discard the entry
- **Edit** — rename before approval

### User Overview

- View all registered users
- Monitor account activity

---

## 9. Opportunity Hub (Public)

Accessible at `/opportunities` without login.

### Features

- **Browse** all active job openings
- **Search** — type keywords, skills, or job titles
- **Category detection** — system auto-detects job categories (Tech, HR, Construction, etc.)
- **Apply** — fill in your details (name, email, phone, resume URL) and submit

### How to Apply

1. Find a job you're interested in
2. Click **Apply**
3. Enter: Full Name, Email, Phone, Resume Link (Google Drive / Dropbox URL)
4. Click **Submit Application**
5. You'll be notified that your application is received
6. Track progress by logging in and visiting **My Applications**

---

## 10. Matching Engine

OrqoHire uses a **fully rule-based, AI-free** matching engine. No LLMs or AI tokens are consumed.

### How Matching Works

```
JD/CV → Normalizer → Taxonomy Classifier → Eligibility Gate → Scoring Engine → Result
```

### Stage 1: Normalizer

Converts raw text to canonical forms:
- **Skills:** "reactjs" → "react", "nodejs" → "node.js"
- **Locations:** "bengaluru" → "bangalore", "mumbai" → "mumbai"
- **Titles:** "swe" → "software_engineer"

### Stage 2: Taxonomy Classifier

Classifies roles into a tree:
- **Family:** technology, hr, finance, construction, etc.
- **Subfamily:** engineering, operations, creative, etc.
- **Role:** software_engineer, data_analyst, etc.

### Stage 3: Eligibility Gate

Hard checks that can reject candidates:
- **Role compatibility** — does the candidate's role match the JD?
- **Mandatory skills** — candidate must have ≥60% of required skills
- **Experience floor** — candidate's experience ≥50% of minimum required
- **Location match** — candidate's location or relocation preference must align
- **Employment type** — must match

### Stage 4: Scoring Engine

Weighted scoring (total 100):

| Factor | Weight | What's Measured |
|---|---|---|
| Skills | 40 | Overlap of required skills |
| Experience | 25 | Fit within experience range |
| Good-to-Have | 15 | Nice-to-have skills match |
| Location | 10 | Current/preferred location |
| Notice Period | 5 | Within max allowed days |
| Budget | 5 | Expected CTC within budget |

Each score comes with a **detailed breakdown** and **human-readable explanation**.

---

## 11. Candidate Passport

The Passport is a **trust/verification system** that increases candidate credibility.

### Passport Statuses

| Status | Criteria |
|---|---|
| **DRAFT** | Profile created, minimal info filled |
| **PARTIAL** | Some sections completed |
| **COMPLETE** | All sections filled |
| **VERIFIED** | At least one employment verified by employer |

### Trust Score

- **Base:** 0
- **Profile completeness:** +auto based on filled sections
- **Per verified employment:** +10 points
- Displayed on the passport as a percentage

### Benefits of a Complete Passport

- Higher trust with recruiters
- Better matching visibility
- Preferred in shortlisting

---

## 12. Employer Verification

### How It Works

1. Candidate adds an employment entry with an **official company email** (e.g., `employee@company.com`)
2. Candidate clicks **Verify Employment**
3. System generates a **unique verification link** and sends it to the company email domain
4. The employer opens the link → `/verify/[token]`
5. Employer sees: Candidate Name, Designation, Start Date, End Date
6. Employer clicks **Confirm** or **Reject**
7. Result is recorded; candidate's trust score updates (+10 if confirmed)

### Employer Verification Page (`/verify/[token]`)

- **No login required** — anyone with the link can verify
- Shows employment details for confirmation
- Simple **Confirm** / **Reject** buttons
- Optional notes field for the employer

---

## 13. Pipeline Management

### Pipeline Stages

```
Submitted → L1 (First Round) → L2 (Second Round) → L3 (Final Round)
    → Test (Assessment) → Offered → Joined → Rejected
```

### Updating Stages

**Recruiters** and **Client SPOCs** can update pipeline stages.

### Stage Data Tracked

Each stage captures:
- **Date** of the interview/assessment
- **Result** (Pass/Fail/Score)
- **Interviewer** name
- **Client SPOC feedback** (free text)
- **Internal notes** (visible only to recruiters)

### Rejections & Dropouts

When a candidate is rejected or drops out:
- Record the **stage** at which they left
- Provide a **reason** for rejection/dropout
- This data feeds into analytics for process improvement

---

## 14. Analytics Dashboard

Available to **recruiters** and **recruiter managers**.

### Metrics

| Metric | Description |
|---|---|
| **Total Candidates** | All candidates in the system |
| **Active Requirements** | Open job positions |
| **Total Submissions** | Candidates submitted to pipelines |
| **Pipeline Funnel** | Conversion % from Submitted → Joined |
| **Submissions by Client** | Per-client submission counts |
| **Candidates by Location** | Geographic distribution |
| **Experience Bands** | Candidate count by experience range |
| **Active Requirements** | Summary with priority indicators |

### Funnel Visualization

Shows drop-off at each pipeline stage:
```
Submitted: 100
  ↓
L1: 65 (65%)
  ↓
L2: 40 (40%)
  ↓
L3: 25 (25%)
  ↓
Offered: 15 (15%)
  ↓
Joined: 10 (10%)
```

---

## 15. FAQ & Troubleshooting

### Login Issues

**Q: I forgot my password**  
A: Contact your system administrator to reset it (password reset is not self-service).

**Q: I can't log in**  
A: Ensure cookies are enabled. Clear your browser cache and try again. Check that you're using the correct URL.

### Profile & Applications

**Q: How do I update my profile?**  
A: Log in as a candidate, go to **My Passport**, and edit your information.

**Q: I applied but the status hasn't changed**  
A: The recruiter or client SPOC updates stages manually. Allow time for review.

### Matching

**Q: Why didn't I match with a job?**  
A: The eligibility gate checks several criteria. Common reasons: missing required skills, experience below minimum, or location mismatch. Check the score breakdown for details.

**Q: Can I improve my match score?**  
A: Yes — update your skills, complete your passport, and get employment verified. A higher trust score also helps.

### Passport & Verification

**Q: The employer didn't receive the verification email**  
A: Ensure the company email domain is correct. The verification link is generated and shown on screen — you can copy and send it manually.

**Q: Can I delete a verified employment?**  
A: No, verified employments are locked. Contact an admin if there's an error.

### Technical Issues

**Q: The page is not loading**  
A: Check your internet connection. Try a hard refresh (Ctrl+F5). If the issue persists, the server may be down.

**Q: Data seems outdated**  
A: The platform reads from Google Sheets. Changes are reflected in near real-time.

### Support

For further assistance, contact **Whitekraaft** support or your system administrator.
