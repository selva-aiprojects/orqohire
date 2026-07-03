// ── Role Taxonomy Engine ──────────────────────────────────────────────────────
// Family → Subfamily → Role classification — no AI needed

export interface RoleNode {
  family:    string
  subfamily: string
  role:      string
  aliases:   string[]
  related:   string[]
  excluded:  string[]
  mandatorySkills: string[]
  preferredIndustry?: string[]
}

export const ROLE_TAXONOMY: RoleNode[] = [
  // ── Technology ──────────────────────────────────────────────────────────────
  {
    family: 'technology', subfamily: 'engineering', role: 'software_engineer',
    aliases: ['developer','programmer','swe','sde','software developer'],
    related: ['fullstack_engineer','backend_engineer','frontend_engineer'],
    excluded: ['data_scientist','devops_engineer','sre'],
    mandatorySkills: [],
    preferredIndustry: ['technology','product','startup','consulting'],
  },
  {
    family: 'technology', subfamily: 'engineering', role: 'fullstack_engineer',
    aliases: ['full stack developer','fullstack developer','full-stack engineer'],
    related: ['frontend_engineer','backend_engineer','software_engineer'],
    excluded: ['data_scientist','devops_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','product','startup'],
  },
  {
    family: 'technology', subfamily: 'engineering', role: 'frontend_engineer',
    aliases: ['ui developer','frontend developer','front end developer','ui engineer'],
    related: ['fullstack_engineer','software_engineer'],
    excluded: ['backend_engineer','devops_engineer','data_scientist'],
    mandatorySkills: ['javascript'],
    preferredIndustry: ['technology','product'],
  },
  {
    family: 'technology', subfamily: 'engineering', role: 'backend_engineer',
    aliases: ['backend developer','back end developer','server side developer'],
    related: ['fullstack_engineer','software_engineer'],
    excluded: ['frontend_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','product','fintech'],
  },
  {
    family: 'technology', subfamily: 'platform', role: 'devops_engineer',
    aliases: ['dev ops engineer','infrastructure engineer','platform engineer'],
    related: ['sre','cloud_engineer'],
    excluded: ['software_engineer','data_scientist'],
    mandatorySkills: ['docker'],
    preferredIndustry: ['technology','product'],
  },
  {
    family: 'technology', subfamily: 'platform', role: 'sre',
    aliases: ['site reliability engineer','reliability engineer'],
    related: ['devops_engineer','cloud_engineer'],
    excluded: ['software_engineer'],
    mandatorySkills: ['kubernetes'],
    preferredIndustry: ['technology','product'],
  },
  {
    family: 'technology', subfamily: 'platform', role: 'cloud_engineer',
    aliases: ['cloud architect','aws engineer','gcp engineer','azure engineer'],
    related: ['devops_engineer','sre'],
    excluded: ['software_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','consulting'],
  },
  {
    family: 'technology', subfamily: 'data', role: 'data_scientist',
    aliases: ['data science','ml engineer','machine learning engineer'],
    related: ['data_analyst','ai_engineer'],
    excluded: ['software_engineer','devops_engineer'],
    mandatorySkills: ['python'],
    preferredIndustry: ['technology','fintech','healthcare'],
  },
  {
    family: 'technology', subfamily: 'data', role: 'data_analyst',
    aliases: ['business intelligence analyst','bi analyst','data analytics'],
    related: ['data_scientist','business_analyst'],
    excluded: ['software_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','consulting','finance'],
  },
  {
    family: 'technology', subfamily: 'data', role: 'ai_engineer',
    aliases: ['artificial intelligence engineer','gen ai engineer','llm engineer'],
    related: ['data_scientist','ml_engineer'],
    excluded: ['software_engineer','devops_engineer'],
    mandatorySkills: ['python'],
    preferredIndustry: ['technology','product'],
  },

  // ── Human Resources ──────────────────────────────────────────────────────────
  {
    family: 'human_resources', subfamily: 'talent', role: 'recruiter',
    aliases: ['technical recruiter','it recruiter','staffing consultant','hr recruiter'],
    related: ['ta_specialist','hr_generalist'],
    excluded: ['hrbp','hr_manager'],
    mandatorySkills: [],
    preferredIndustry: ['staffing','technology','consulting'],
  },
  {
    family: 'human_resources', subfamily: 'talent', role: 'ta_specialist',
    aliases: ['talent acquisition specialist','talent acquisition manager','ta manager'],
    related: ['recruiter','hr_manager'],
    excluded: ['hrbp'],
    mandatorySkills: [],
    preferredIndustry: ['technology','product','enterprise'],
  },
  {
    family: 'human_resources', subfamily: 'operations', role: 'hrbp',
    aliases: ['hr business partner','human resources business partner'],
    related: ['hr_manager','hr_generalist'],
    excluded: ['recruiter','ta_specialist'],
    mandatorySkills: ['pf_esic'],
    preferredIndustry: ['manufacturing','enterprise','consulting'],
  },
  {
    family: 'human_resources', subfamily: 'operations', role: 'hr_manager',
    aliases: ['hr head','human resources manager','head of hr'],
    related: ['hrbp','ta_specialist'],
    excluded: ['recruiter'],
    mandatorySkills: [],
    preferredIndustry: ['manufacturing','enterprise'],
  },
  {
    family: 'human_resources', subfamily: 'operations', role: 'hr_generalist',
    aliases: ['hr executive','hr officer','human resources executive'],
    related: ['recruiter','hrbp'],
    excluded: [],
    mandatorySkills: [],
    preferredIndustry: ['manufacturing','sme','startup'],
  },

  // ── Construction & Infrastructure ────────────────────────────────────────────
  {
    family: 'construction', subfamily: 'civil', role: 'site_engineer',
    aliases: ['civil site engineer','construction engineer','project engineer civil'],
    related: ['civil_engineer','project_manager'],
    excluded: ['safety_engineer','mep_engineer','software_engineer'],
    mandatorySkills: ['autocad'],
    preferredIndustry: ['construction','infrastructure','real_estate'],
  },
  {
    family: 'construction', subfamily: 'civil', role: 'civil_engineer',
    aliases: ['structural engineer','design engineer civil'],
    related: ['site_engineer','architect'],
    excluded: ['safety_engineer','mep_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['construction','infrastructure'],
  },
  {
    family: 'construction', subfamily: 'design', role: 'architect',
    aliases: ['architecture','senior architect','principal architect'],
    related: ['civil_engineer','site_engineer'],
    excluded: ['software_engineer'],
    mandatorySkills: ['autocad'],
    preferredIndustry: ['construction','real_estate','design'],
  },

  // ── Safety & EHS ─────────────────────────────────────────────────────────────
  {
    family: 'safety', subfamily: 'ehs', role: 'safety_engineer',
    aliases: ['ehs engineer','health safety engineer','hse engineer','safety officer'],
    related: ['ehs_engineer'],
    excluded: ['civil_engineer','software_engineer'],
    mandatorySkills: ['ppe_safety'],
    preferredIndustry: ['construction','manufacturing','oil_gas'],
  },
  {
    family: 'safety', subfamily: 'ehs', role: 'ehs_engineer',
    aliases: ['environment health safety','ehs manager','safety manager'],
    related: ['safety_engineer'],
    excluded: ['software_engineer'],
    mandatorySkills: ['ppe_safety'],
    preferredIndustry: ['manufacturing','construction','chemical'],
  },

  // ── Engineering ──────────────────────────────────────────────────────────────
  {
    family: 'engineering', subfamily: 'mep', role: 'mep_engineer',
    aliases: ['mechanical electrical plumbing','mep coordinator','services engineer'],
    related: ['site_engineer'],
    excluded: ['software_engineer','civil_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['construction','infrastructure'],
  },

  // ── Sales & Business ─────────────────────────────────────────────────────────
  {
    family: 'sales', subfamily: 'field', role: 'sales_executive',
    aliases: ['business development executive','sales officer','sales rep'],
    related: ['account_manager'],
    excluded: ['software_engineer','data_scientist'],
    mandatorySkills: [],
    preferredIndustry: ['retail','manufacturing','fmcg'],
  },
  {
    family: 'sales', subfamily: 'enterprise', role: 'account_manager',
    aliases: ['key account manager','client relationship manager','crm'],
    related: ['sales_executive'],
    excluded: ['software_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','consulting','staffing'],
  },

  // ── Project Management ───────────────────────────────────────────────────────
  {
    family: 'management', subfamily: 'project', role: 'project_manager',
    aliases: ['pm','delivery manager','programme manager','engagement manager'],
    related: ['scrum_master','product_manager'],
    excluded: ['software_engineer','data_scientist'],
    mandatorySkills: [],
    preferredIndustry: ['technology','construction','consulting'],
  },
  {
    family: 'management', subfamily: 'product', role: 'product_manager',
    aliases: ['product owner','po','senior product manager'],
    related: ['project_manager','business_analyst'],
    excluded: ['software_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','product','startup'],
  },
  {
    family: 'management', subfamily: 'agile', role: 'scrum_master',
    aliases: ['agile coach','scrum coach','agile master'],
    related: ['project_manager','product_manager'],
    excluded: ['software_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','product'],
  },

  // ── Business Analysis ─────────────────────────────────────────────────────────
  {
    family: 'analysis', subfamily: 'business', role: 'business_analyst',
    aliases: ['ba','business systems analyst','functional analyst','requirements analyst'],
    related: ['data_analyst','product_manager'],
    excluded: ['data_scientist','software_engineer'],
    mandatorySkills: [],
    preferredIndustry: ['technology','consulting','finance'],
  },
]

export function classifyRole(title: string): RoleNode | null {
  const normalized = title.toLowerCase().trim()
  // Direct role match
  let match = ROLE_TAXONOMY.find(r =>
    r.role === normalized.replace(/\s+/g,'_') ||
    r.aliases.some(a => normalized.includes(a.toLowerCase()))
  )
  if (match) return match
  // Partial match
  match = ROLE_TAXONOMY.find(r =>
    normalized.includes(r.role.replace(/_/g,' ')) ||
    r.aliases.some(a => a.toLowerCase().split(' ').some(w => normalized.includes(w) && w.length > 4))
  )
  return match || null
}

export function getRoleFamily(title: string): string | null {
  const node = classifyRole(title)
  return node ? node.family : null
}

export function areSameFamilyRoles(title1: string, title2: string): boolean {
  const f1 = getRoleFamily(title1)
  const f2 = getRoleFamily(title2)
  if (!f1 || !f2) return false
  return f1 === f2
}

export function getMandatorySkills(title: string): string[] {
  const node = classifyRole(title)
  return node ? node.mandatorySkills : []
}

export function getRelatedRoles(title: string): string[] {
  const node = classifyRole(title)
  return node ? node.related : []
}

export function getExcludedRoles(title: string): string[] {
  const node = classifyRole(title)
  return node ? node.excluded : []
}