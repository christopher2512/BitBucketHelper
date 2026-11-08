// Branch names that are considered protected / non-deletable.
// The Delete Branch screen filters these out so users can only target
// feature branches.

const PROTECTED_PATTERNS = [
  /^main$/i,
  /^master$/i,
  /^develop$/i,
  /^development$/i,
  /^dev$/i,
  /^release$/i,
  /^release\//i,
  /^releases$/i,
  /^hotfix$/i,
  /^hotfix\//i,
  /^prod$/i,
  /^production$/i,
  /^stag/i,
]

export function isProtectedBranch(branch) {
  if (!branch) return false
  const name = branch.trim()
  return PROTECTED_PATTERNS.some((p) => p.test(name))
}

// Returns only the feature (deletable) branches from a list.
export function filterFeatureBranches(branches) {
  return (branches || []).filter((b) => !isProtectedBranch(b))
}
