// ── Eligibility Gate ──────────────────────────────────────────────────────────
// Hard reject before scoring — highest ROI, zero cost

import { normalizeSkill, normalizeLocation } from './normalizer'
import { classifyRole, areSameFamilyRoles, getMandatorySkills } from './taxonomy'
import type { Candidate, Requirement } from '@/types'

export interface GateResult {
  passed:  boolean
  reasons: string[]
  gates:   {
    roleFamily:      { passed: boolean; reason: string }
    mandatorySkills: { passed: boolean; reason: string; missing: string[] }
    experience:      { passed: boolean; reason: string }
    location:        { passed: boolean; reason: string }
    employmentType:  { passed: boolean; reason: string }
  }
}

export function runEligibilityGate(candidate: Candidate, requirement: Requirement): GateResult {
  const reasons: string[] = []
  const gates = {
    roleFamily:      { passed: true, reason: '' },
    mandatorySkills: { passed: true, reason: '', missing: [] as string[] },
    experience:      { passed: true, reason: '' },
    location:        { passed: true, reason: '' },
    employmentType:  { passed: true, reason: '' },
  }

  // Gate 1 — Role Family
  const candRole = candidate.currentDesignation
  const jdRole   = requirement.designation
  if (candRole && jdRole) {
    const sameFamily = areSameFamilyRoles(candRole, jdRole)
    const candNode   = classifyRole(candRole)
    const jdNode     = classifyRole(jdRole)
    if (candNode && jdNode && !sameFamily) {
      // Check if candidate role is in excluded list for JD role
      if (jdNode.excluded.includes(candNode.role)) {
        gates.roleFamily.passed = false
        gates.roleFamily.reason = `Role mismatch: ${candRole} is excluded for ${jdRole}`
        reasons.push(gates.roleFamily.reason)
      }
    }
  }

  // Gate 2 — Mandatory Skills
  const mandatorySkills = getMandatorySkills(requirement.designation)
  const reqMandatory    = requirement.requiredSkills.slice(0, 3) // First 3 required skills are mandatory
  const allMandatory    = [...new Set([...mandatorySkills, ...reqMandatory])]

  if (allMandatory.length > 0) {
    const candSkills = [...candidate.primarySkills, ...candidate.secondarySkills].map(s => normalizeSkill(s))
    const missing    = allMandatory.filter(ms => {
      const normMs = normalizeSkill(ms)
      return !candSkills.some(cs => cs.includes(normMs) || normMs.includes(cs))
    })
    // Reject only if more than 60% of mandatory skills missing
    const missingPct = missing.length / allMandatory.length
    if (missingPct > 0.6 && missing.length >= 2) {
      gates.mandatorySkills.passed  = false
      gates.mandatorySkills.missing = missing
      gates.mandatorySkills.reason  = `Missing ${missing.length} mandatory skills: ${missing.slice(0,3).join(', ')}`
      reasons.push(gates.mandatorySkills.reason)
    }
  }

  // Gate 3 — Experience (hard floor only — 50% below minimum)
  const hardFloor = requirement.minExperience * 0.5
  if (candidate.relevantExperience < hardFloor) {
    gates.experience.passed = false
    gates.experience.reason = `Experience too low: ${candidate.relevantExperience}yr vs minimum ${requirement.minExperience}yr`
    reasons.push(gates.experience.reason)
  }

  // Gate 4 — Location (only hard reject if no relocation flexibility)
  const jdLocation  = normalizeLocation(requirement.location)
  const candLocation = normalizeLocation(candidate.locationCurrent)
  const candPreferred = candidate.locationPreferred.map(l => normalizeLocation(l))

  if (jdLocation !== 'remote' && jdLocation !== 'hybrid') {
    const locationMatch = candLocation.includes(jdLocation) ||
      jdLocation.includes(candLocation) ||
      candPreferred.some(p => p.includes(jdLocation) || jdLocation.includes(p)) ||
      candidate.openToRelocate === 'Yes'
    if (!locationMatch && candidate.openToRelocate === 'No') {
      gates.location.passed = false
      gates.location.reason = `Location mismatch: ${candidate.locationCurrent} vs ${requirement.location} (not open to relocate)`
      reasons.push(gates.location.reason)
    }
  }

  // Gate 5 — Employment Type
  if (requirement.employmentType !== 'Full-time' && candidate.employmentType !== requirement.employmentType) {
    gates.employmentType.passed = false
    gates.employmentType.reason = `Employment type mismatch: candidate prefers ${candidate.employmentType}, JD requires ${requirement.employmentType}`
    reasons.push(gates.employmentType.reason)
  }

  const passed = Object.values(gates).every(g => g.passed)
  return { passed, reasons, gates }
}