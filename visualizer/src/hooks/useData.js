import { useState, useEffect, useCallback } from 'react'

const RESULTS = '/results'
const REFRESH_MS = 30_000

const SEV_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 }

async function fetchJSON(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status} — ${url}`)
  return r.json()
}

async function loadData() {
  // Descubrir repos leyendo results/ directamente (sin consolidated-report)
  const repos = await fetchJSON(`${RESULTS}/_index`)

  const [grypeRaw, codeqlRaw, sbomRaw] = await Promise.all([
    Promise.all(
      repos.map(async repo => {
        try {
          const d = await fetchJSON(`${RESULTS}/${repo}-grype.json`)
          return (d.matches || []).map(m => {
            const cvssArr = m.vulnerability?.cvss ?? []
            const cvssScore = cvssArr.reduce((max, c) => Math.max(max, c.metrics?.baseScore ?? 0), 0)
            return {
              repo,
              id: m.vulnerability?.id ?? 'N/A',
              severity: m.vulnerability?.severity ?? 'Unknown',
              pkg: m.artifact?.name ?? 'unknown',
              version: m.artifact?.version ?? '?',
              pkgType: m.artifact?.type ?? '?',
              fixState: m.vulnerability?.fix?.state ?? 'unknown',
              fixVersions: m.vulnerability?.fix?.versions ?? [],
              description: m.vulnerability?.description ?? '',
              cvssScore,
            }
          })
        } catch {
          return []
        }
      })
    ),
    Promise.all(
      repos.map(async repo => {
        try {
          const d = await fetchJSON(`${RESULTS}/${repo}-codeql.json`)
          return (d.findings || []).map(f => ({ ...f, repo }))
        } catch {
          return []
        }
      })
    ),
    Promise.all(
      repos.map(async repo => {
        try {
          const d = await fetchJSON(`${RESULTS}/${repo}-sbom.json`)
          return { repo, artifacts: d.artifacts || [] }
        } catch {
          return { repo, artifacts: [] }
        }
      })
    ),
  ])

  const allVulns = grypeRaw
    .flat()
    .sort((a, b) => (SEV_RANK[b.severity] ?? 0) - (SEV_RANK[a.severity] ?? 0))

  const allFindings = codeqlRaw.flat()
  const allArtifacts = sbomRaw.flatMap(s => s.artifacts.map(a => ({ ...a, repo: s.repo })))

  // Severity counts per repo
  const repoVulnMap = {}
  for (const v of allVulns) {
    if (!repoVulnMap[v.repo]) repoVulnMap[v.repo] = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    repoVulnMap[v.repo][v.severity] = (repoVulnMap[v.repo][v.severity] ?? 0) + 1
  }

  // CodeQL findings per repo
  const repoCodeqlMap = {}
  for (const f of allFindings) {
    if (!repoCodeqlMap[f.repo]) repoCodeqlMap[f.repo] = { error: 0, warning: 0, note: 0 }
    const lvl = f.severity ?? 'warning'
    repoCodeqlMap[f.repo][lvl] = (repoCodeqlMap[f.repo][lvl] ?? 0) + 1
  }

  // SBOM type distribution
  const typeMap = {}
  for (const a of allArtifacts) {
    const t = a.type ?? 'unknown'
    typeMap[t] = (typeMap[t] ?? 0) + 1
  }

  // Top repeated packages (by CVE count)
  const pkgVulnCount = {}
  for (const v of allVulns) {
    const key = `${v.pkg}@${v.version}`
    pkgVulnCount[key] = (pkgVulnCount[key] ?? 0) + 1
  }
  const topPackages = Object.entries(pkgVulnCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => {
      const [pkg, version] = key.split('@')
      const worst = allVulns.find(v => v.pkg === pkg && v.version === version)
      return { pkg, version, count, severity: worst?.severity ?? 'Unknown', repo: worst?.repo ?? '' }
    })

  // CodeQL top rules
  const ruleCount = {}
  for (const f of allFindings) {
    ruleCount[f.rule_id] = (ruleCount[f.rule_id] ?? 0) + 1
  }
  const topRules = Object.entries(ruleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([rule_id, count]) => {
      const ex = allFindings.find(f => f.rule_id === rule_id)
      return { rule_id, count, name: ex?.name ?? rule_id, severity: ex?.severity ?? 'warning' }
    })

  // Top high-priority vulns by CVSS score (deduplicated by CVE id)
  const vulnById = {}
  for (const v of allVulns) {
    if (!vulnById[v.id] || v.cvssScore > vulnById[v.id].cvssScore) {
      vulnById[v.id] = v
    }
  }
  const topHighPriorityVulns = Object.values(vulnById)
    .filter(v => v.cvssScore > 0)
    .sort((a, b) => b.cvssScore - a.cvssScore)
    .slice(0, 7)

  const fixableCount = allVulns.filter(v => v.fixState === 'fixed').length
  const fixPct = allVulns.length > 0 ? Math.round((fixableCount / allVulns.length) * 100) : 0

  // Fix availability counts (for pie chart)
  const fixCounts = { con: fixableCount, sin: allVulns.length - fixableCount }

  // Fix availability by repo (for 5.4 chart)
  const fixByRepoMap = {}
  for (const v of allVulns) {
    if (!fixByRepoMap[v.repo]) fixByRepoMap[v.repo] = { con: 0, sin: 0 }
    if (v.fixState === 'fixed') fixByRepoMap[v.repo].con++
    else fixByRepoMap[v.repo].sin++
  }
  const fixByRepo = Object.entries(fixByRepoMap)
    .map(([repo, { con, sin }]) => ({ repo, con, sin, total: con + sin }))
    .sort((a, b) => b.con - a.con)

  // Grype by repo as sorted array (for 5.2 chart)
  const grypeByRepoArr = Object.entries(repoVulnMap)
    .map(([repo, counts]) => ({
      repo,
      total: (counts.Critical ?? 0) + (counts.High ?? 0) + (counts.Medium ?? 0) + (counts.Low ?? 0),
      ...counts,
    }))
    .sort((a, b) => b.total - a.total)

  // CodeQL by repo as sorted array (for 3.2 chart)
  const codeqlByRepoArr = Object.entries(repoCodeqlMap)
    .map(([repo, counts]) => ({
      repo,
      total: (counts.error ?? 0) + (counts.warning ?? 0) + (counts.note ?? 0),
      ...counts,
    }))
    .sort((a, b) => b.total - a.total)

  // CodeQL severity totals (for 3.1 chart)
  const severityCodeQL = {
    error:   allFindings.filter(f => f.severity === 'error').length,
    warning: allFindings.filter(f => f.severity === 'warning').length,
    note:    allFindings.filter(f => f.severity === 'note').length,
  }

  // Top 10 files most affected by CodeQL (for 3.4 chart)
  const fileCount = {}
  for (const f of allFindings) {
    const loc = f.locations?.[0]
    if (loc?.file) {
      const short = loc.file.split('/').slice(-2).join('/')
      fileCount[short] = (fileCount[short] ?? 0) + 1
    }
  }
  const topFiles = Object.entries(fileCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([file, count]) => ({ file, count }))

  // Top critical unfixed CVEs for dashboard alert
  const criticalUnfixed = Object.values(vulnById)
    .filter(v => v.severity === 'Critical' && v.fixState !== 'fixed' && v.cvssScore > 0)
    .sort((a, b) => b.cvssScore - a.cvssScore)
    .slice(0, 5)

  return {
    repos,
    allVulns,
    allFindings,
    allArtifacts,
    sbomRaw,
    repoVulnMap,
    repoCodeqlMap,
    typeMap,
    topPackages,
    topRules,
    topHighPriorityVulns,
    fixPct,
    fixCounts,
    fixByRepo,
    grypeByRepoArr,
    codeqlByRepoArr,
    severityCodeQL,
    topFiles,
    criticalUnfixed,
    stats: {
      repos: repos.length,
      totalVulns: allVulns.length,
      critical: allVulns.filter(v => v.severity === 'Critical').length,
      high: allVulns.filter(v => v.severity === 'High').length,
      medium: allVulns.filter(v => v.severity === 'Medium').length,
      low: allVulns.filter(v => v.severity === 'Low').length,
      codeqlFindings: allFindings.length,
      codeqlErrors: allFindings.filter(f => f.severity === 'error').length,
      totalDeps: allArtifacts.length,
      fixPct,
    },
  }
}

export function useData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const reload = useCallback(async () => {
    try {
      const d = await loadData()
      setData(d)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
    const id = setInterval(reload, REFRESH_MS)
    return () => clearInterval(id)
  }, [reload])

  return { data, loading, error, lastUpdated, reload }
}
