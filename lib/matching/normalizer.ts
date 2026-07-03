// ── Normalizer Engine ─────────────────────────────────────────────────────────
// Converts raw text into canonical format — no AI needed

const TITLE_ALIASES: Record<string, string> = {
  'software developer': 'software_engineer',
  'software engineer': 'software_engineer',
  'swe': 'software_engineer',
  'sde': 'software_engineer',
  'programmer': 'software_engineer',
  'full stack developer': 'fullstack_engineer',
  'fullstack developer': 'fullstack_engineer',
  'frontend developer': 'frontend_engineer',
  'front end developer': 'frontend_engineer',
  'ui developer': 'frontend_engineer',
  'backend developer': 'backend_engineer',
  'back end developer': 'backend_engineer',
  'data scientist': 'data_scientist',
  'ml engineer': 'ml_engineer',
  'machine learning engineer': 'ml_engineer',
  'ai engineer': 'ai_engineer',
  'devops engineer': 'devops_engineer',
  'dev ops engineer': 'devops_engineer',
  'site reliability engineer': 'sre',
  'sre': 'sre',
  'cloud engineer': 'cloud_engineer',
  'talent acquisition': 'ta_specialist',
  'ta': 'ta_specialist',
  'recruiter': 'recruiter',
  'hr business partner': 'hrbp',
  'hrbp': 'hrbp',
  'human resources': 'hr_generalist',
  'hr manager': 'hr_manager',
  'project manager': 'project_manager',
  'pm': 'project_manager',
  'product manager': 'product_manager',
  'scrum master': 'scrum_master',
  'business analyst': 'business_analyst',
  'ba': 'business_analyst',
  'data analyst': 'data_analyst',
  'site engineer': 'site_engineer',
  'civil engineer': 'civil_engineer',
  'safety engineer': 'safety_engineer',
  'ehs engineer': 'ehs_engineer',
  'mep engineer': 'mep_engineer',
  'sales executive': 'sales_executive',
  'account manager': 'account_manager',
  'architect': 'architect',
}

const SKILL_ALIASES: Record<string, string> = {
  'reactjs': 'react',
  'react.js': 'react',
  'react js': 'react',
  'nodejs': 'node',
  'node.js': 'node',
  'node js': 'node',
  'js': 'javascript',
  'ecmascript': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'k8s': 'kubernetes',
  'postgres': 'postgresql',
  'pg': 'postgresql',
  'mongo': 'mongodb',
  'amazon web services': 'aws',
  'amazon aws': 'aws',
  'google cloud': 'gcp',
  'google cloud platform': 'gcp',
  'microsoft azure': 'azure',
  'ml': 'machine_learning',
  'deep learning': 'machine_learning',
  'artificial intelligence': 'ai',
  'dev ops': 'devops',
  'cicd': 'ci_cd',
  'continuous integration': 'ci_cd',
  'ci/cd': 'ci_cd',
  'mssql': 'sql_server',
  'mysql': 'mysql',
  'ms sql': 'sql_server',
  '.net': 'dotnet',
  'c#': 'csharp',
  'c++': 'cpp',
  'golang': 'go',
  'springboot': 'spring_boot',
  'spring boot': 'spring_boot',
  'rest api': 'rest_apis',
  'restful': 'rest_apis',
  'graphql': 'graphql',
  'docker': 'docker',
  'terraform': 'terraform',
  'ansible': 'ansible',
  'jenkins': 'jenkins',
  'git': 'git',
  'github': 'git',
  'gitlab': 'git',
  'pf': 'pf_esic',
  'esic': 'pf_esic',
  'pf/esic': 'pf_esic',
  'ppe': 'ppe_safety',
  'autocad': 'autocad',
  'staad pro': 'staad_pro',
}

const LOCATION_ALIASES: Record<string, string> = {
  'bengaluru': 'bangalore',
  'bombay': 'mumbai',
  'ncr': 'delhi',
  'new delhi': 'delhi',
  'delhi ncr': 'delhi',
  'gurugram': 'gurgaon',
  'pune': 'pune',
  'hyderabad': 'hyderabad',
  'hyd': 'hyderabad',
  'chennai': 'chennai',
  'madras': 'chennai',
  'calcutta': 'kolkata',
  'ahmedabad': 'ahmedabad',
  'indore': 'indore',
  'remote': 'remote',
  'work from home': 'remote',
  'wfh': 'remote',
  'hybrid': 'hybrid',
}

export function normalizeTitle(raw: string): string {
  const lower = raw.toLowerCase().trim()
  return TITLE_ALIASES[lower] || lower.replace(/\s+/g, '_')
}

export function normalizeSkill(raw: string): string {
  const lower = raw.toLowerCase().trim()
  return SKILL_ALIASES[lower] || lower.replace(/[\s\/\-\.]+/g, '_')
}

export function normalizeLocation(raw: string): string {
  const lower = raw.toLowerCase().trim()
  // Check each alias
  for (const [alias, canonical] of Object.entries(LOCATION_ALIASES)) {
    if (lower.includes(alias)) return canonical
  }
  return lower.split(',')[0].trim().replace(/\s+/g, '_')
}

export function normalizeSkills(skills: string[]): string[] {
  return skills.map(normalizeSkill).filter(Boolean)
}

export function extractSkillsFromText(text: string): string[] {
  const knownSkills = Object.keys(SKILL_ALIASES).concat(Object.values(SKILL_ALIASES))
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const skill of knownSkills) {
    if (lower.includes(skill.toLowerCase())) {
      found.add(normalizeSkill(skill))
    }
  }
  return Array.from(found)
}