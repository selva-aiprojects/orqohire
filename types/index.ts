export type CandidateStatus = 'Active' | 'Passive' | 'Placed' | 'Blacklisted'
export type EmploymentType = 'Full-time' | 'Contract' | 'Freelance' | 'Intern'
export type RequirementStatus = 'Active' | 'On Hold' | 'Closed'
export type PipelineStage = 'Submitted' | 'L1' | 'L2' | 'L3' | 'Test' | 'Offered' | 'Joined' | 'Rejected'
export type Priority = 'High' | 'Medium' | 'Low'
export type UserRole = 'super_admin' | 'recruiter_manager' | 'recruiter' | 'client_spoc' | 'candidate'

export interface Candidate {
  id: string
  fullName: string
  email: string
  phone: string
  currentDesignation: string
  currentCompany: string
  totalExperience: number
  relevantExperience: number
  primarySkills: string[]
  secondarySkills: string[]
  resumeLink: string
  locationCurrent: string
  locationPreferred: string[]
  openToRelocate: 'Yes' | 'No' | 'Negotiable'
  noticePeriodText: string
  noticePeriodDays: number
  employmentType: EmploymentType
  currentCTC: number
  expectedCTC: number
  availabilityDate?: string
  education?: string
  linkedinUrl?: string
  source: string
  status: CandidateStatus
  registeredOn: string
  lastUpdated: string
  recruiterNotes?: string
}

export interface Requirement {
  jobCode: string
  clientName: string
  designation: string
  department?: string
  jobDescription: string
  requiredSkills: string[]
  goodToHaveSkills: string[]
  minExperience: number
  maxExperience?: number
  location: string
  employmentType: EmploymentType
  budgetMin: number
  budgetMax: number
  noticePeriodMax: number
  vacancies: number
  priority: Priority
  status: RequirementStatus
  tat?: number
  accountManager: string
  clientSpoc?: string
  raisedOn: string
  activatedOn?: string
  closedOn?: string
  filledCount: number
}

export interface PipelineEntry {
  id: string
  jobCode: string
  candidateId: string
  candidateName: string
  clientName: string
  submissionDate: string
  currentStage: PipelineStage
  l1Date?: string
  l1Result?: string
  l1Interviewer?: string
  l2Date?: string
  l2Result?: string
  l2Interviewer?: string
  l3Date?: string
  l3Result?: string
  l3Interviewer?: string
  testDate?: string
  testScore?: string
  offerDate?: string
  ctcOffered?: number
  joiningDate?: string
  dropoutReason?: string
  assignedRecruiter: string
  clientSpocFeedback?: string
  internalNotes?: string
}

export interface MatchScore {
  candidateId: string
  jobCode: string
  totalScore: number
  band: 'Excellent' | 'Good' | 'Moderate' | 'Weak' | 'Poor'
  breakdown: {
    skills: { score: number; matched: string[]; missing: string[] }
    experience: { score: number; actual: number; gap: number }
    goodToHave: { score: number; matched: string[]; total: number }
    location: { score: number; match: string }
    noticePeriod: { score: number; candidateDays: number; clientMax: number; gap: number }
    budget: { score: number; expected: number; budgetMax: number; overBy: number }
  }
  explanation: string[]
  computedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  clientName?: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  total?: number
}