import { runEligibilityGate } from './gate'
import { classifyRole, areSameFamilyRoles } from './taxonomy'
import { normalizeSkill } from './normalizer'
import type { Candidate, Requirement, MatchScore } from '@/types'

const DEFAULT_WEIGHTS = {
  skills: 40, experience: 25, goodToHave: 15,
  location: 10, noticePeriod: 5, budget: 5,
}

const SYNONYMS: Record<string, string[]> = {
  'react':          ['reactjs', 'react.js', 'react js'],
  'node':           ['nodejs', 'node.js', 'node js'],
  'javascript':     ['js', 'ecmascript'],
  'typescript':     ['ts'],
  'python':         ['py'],
  'kubernetes':     ['k8s'],
  'postgresql':     ['postgres', 'pg'],
  'mongodb':        ['mongo'],
  'aws':            ['amazon web services', 'amazon aws'],
  'machine learning': ['ml', 'deep learning'],
  'devops':         ['dev ops'],
  'ci/cd':          ['cicd', 'continuous integration'],
}

function normalise(skill: string): string {
  const s = skill.toLowerCase().trim()
  for (const [canonical, variants] of Object.entries(SYNONYMS)) {
    if (s === canonical || variants.includes(s)) return canonical
  }
  return s
}

function matchSkills(required: string[], candidateSkills: string[]) {
  const normCand = candidateSkills.map(normalise)
  const matched: string[] = []
  const missing: string[] = []
  for (const req of required) {
    const norm = normalise(req)
    const found = normCand.some(c => c.includes(norm) || norm.includes(c))
    if (found) matched.push(req)
    else missing.push(req)
  }
  return { matched, missing }
}

function scoreSkills(required: string[], candidateSkills: string[], weight: number) {
  const { matched, missing } = matchSkills(required, candidateSkills)
  const score = required.length === 0
    ? weight
    : (matched.length / required.length) * weight
  return { score: Math.round(score * 10) / 10, matched, missing }
}

function scoreExperience(actual: number, min: number, max: number | undefined, weight: number) {
  const effectiveMax = max ?? min * 2.5
  let score: number
  if (actual >= min && actual <= effectiveMax) {
    score = weight
  } else {
    const gap = actual < min ? min - actual : actual - effectiveMax
    score = Math.max(0, weight - gap * 4)
  }
  const gap = actual < min ? actual - min : actual > effectiveMax ? actual - effectiveMax : 0
  return { score: Math.round(score * 10) / 10, actual, gap }
}

function scoreLocation(
  current: string, preferred: string[],
  openToRelocate: string, required: string, weight: number
) {
  const req = required.toLowerCase()
  if (req === 'remote') return { score: weight, match: 'Remote — open to all' }
  const cur = current.toLowerCase()
  if (cur.includes(req) || req.includes(cur.split(',')[0].trim()))
    return { score: weight, match: 'Exact city match' }
  if (preferred.some(p => p.toLowerCase().includes(req)))
    return { score: weight * 0.8, match: 'Listed as preferred location' }
  if (openToRelocate === 'Yes')
    return { score: weight * 0.6, match: 'Open to relocate' }
  if (openToRelocate === 'Negotiable')
    return { score: weight * 0.4, match: 'Relocation negotiable' }
  return { score: 0, match: 'Location mismatch' }
}

function scoreNoticePeriod(candidateDays: number, clientMax: number, weight: number) {
  const gap = candidateDays - clientMax
  let score: number
  if (gap <= 0)       score = weight
  else if (gap <= 7)  score = weight * 0.6
  else if (gap <= 14) score = weight * 0.2
  else                score = 0
  return { score: Math.round(score * 10) / 10, candidateDays, clientMax, gap: Math.max(0, gap) }
}

function scoreBudget(expected: number, budgetMax: number, weight: number) {
  const overBy = expected - budgetMax
  const pct = budgetMax > 0 ? (overBy / budgetMax) * 100 : 0
  let score: number
  if (pct <= 0)       score = weight
  else if (pct <= 5)  score = weight * 0.8
  else if (pct <= 10) score = weight * 0.4
  else if (pct <= 15) score = weight * 0.2
  else                score = 0
  return { score: Math.round(score * 10) / 10, expected, budgetMax, overBy: Math.max(0, overBy) }
}

function getBand(score: number): MatchScore['band'] {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Moderate'
  if (score >= 40) return 'Weak'
  return 'Poor'
}

function buildExplanation(b: MatchScore['breakdown'], total: number): string[] {
  return [
    `Overall Score: ${total}/100 — ${getBand(total)}`,
    `Skills: ${b.skills.matched.length} matched${b.skills.missing.length ? ` | Missing: ${b.skills.missing.slice(0, 4).join(', ')}` : ' (all present)'}`,
    `Experience: ${b.experience.actual}yr${b.experience.gap !== 0 ? ` (${Math.abs(b.experience.gap).toFixed(1)}yr ${b.experience.gap < 0 ? 'below min' : 'above max'})` : ' — within range'}`,
    `Good-to-Have: ${b.goodToHave.matched.length} of ${b.goodToHave.total} matched`,
    `Location: ${b.location.match}`,
    `Notice Period: ${b.noticePeriod.candidateDays}d${b.noticePeriod.gap > 0 ? ` — ${b.noticePeriod.gap}d over client window` : ' — within window'}`,
    `Budget: ₹${b.budget.expected}LPA${b.budget.overBy > 0 ? ` — ₹${b.budget.overBy.toFixed(1)}L over budget` : ' — within budget'}`,
  ]
}

export function computeMatch(
  candidate: Candidate,
  requirement: Requirement,
  weights = DEFAULT_WEIGHTS
): MatchScore {
  const allSkills = [...candidate.primarySkills, ...candidate.secondarySkills]

  const skills      = scoreSkills(requirement.requiredSkills, allSkills, weights.skills)
  const experience  = scoreExperience(candidate.relevantExperience, requirement.minExperience, requirement.maxExperience, weights.experience)
  const goodToHave  = { ...scoreSkills(requirement.goodToHaveSkills, allSkills, weights.goodToHave), total: requirement.goodToHaveSkills.length }
  const location    = scoreLocation(candidate.locationCurrent, candidate.locationPreferred, candidate.openToRelocate, requirement.location, weights.location)
  const noticePeriod = scoreNoticePeriod(candidate.noticePeriodDays, requirement.noticePeriodMax, weights.noticePeriod)
  const budget      = scoreBudget(candidate.expectedCTC, requirement.budgetMax, weights.budget)

  const total = Math.min(100, Math.round(
    skills.score + experience.score + goodToHave.score +
    location.score + noticePeriod.score + budget.score
  ))

  const breakdown = { skills, experience, goodToHave, location, noticePeriod, budget }

  return {
    candidateId: candidate.id,
    jobCode:     requirement.jobCode,
    totalScore:  total,
    band:        getBand(total),
    breakdown,
    explanation: buildExplanation(breakdown, total),
    computedAt:  new Date().toISOString(),
  }
}

export function shortlistCandidates(
  candidates: Candidate[],
  requirement: Requirement,
  weights = DEFAULT_WEIGHTS,
  limit = 20
): (MatchScore & { gateResult?: ReturnType<typeof runEligibilityGate> })[] {
  return candidates
    .filter(c => c.status === 'Active' || c.status === 'Passive')
    .map(c => {
      const gateResult = runEligibilityGate(c, requirement)
      if (!gateResult.passed) return null
      const score = computeMatch(c, requirement, weights)
      return { ...score, gateResult }
    })
    .filter(Boolean)
    .sort((a, b) => b!.totalScore - a!.totalScore)
    .slice(0, limit) as any[]
}