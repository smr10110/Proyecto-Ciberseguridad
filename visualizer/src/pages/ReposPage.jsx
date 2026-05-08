import { useMemo } from 'react'
import { GitBranch, ShieldAlert, Code2, Package, CheckCircle, XCircle } from 'lucide-react'

const SEV = { Critical: '#ff3d52', High: '#ff7340', Medium: '#ffc107', Low: '#22d48e' }

// ── Barra apilada de severidad ────────────────────────────────────────────────

function SevBar({ counts }) {
  const { Critical = 0, High = 0, Medium = 0, Low = 0 } = counts
  const total = Critical + High + Medium + Low
  if (total === 0) return <div className="h-1.5 rounded-sm bg-rim w-full" />
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-sm bg-rim">
      {[['Critical', '#ff3d52'], ['High', '#ff7340'], ['Medium', '#ffc107'], ['Low', '#22d48e']].map(([k, hex]) => {
        const v = counts[k] ?? 0
        return v > 0 ? (
          <div key={k} style={{ width: `${(v / total) * 100}%`, backgroundColor: hex }}
            title={`${k}: ${v}`} />
        ) : null
      })}
    </div>
  )
}

// ── Badge de herramienta ──────────────────────────────────────────────────────

function ToolBadge({ label, active, hex }) {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest uppercase"
      style={active
        ? { backgroundColor: `${hex}20`, border: `1px solid ${hex}40`, color: hex }
        : { backgroundColor: 'transparent', border: '1px solid #1a2035', color: '#2a3050' }
      }>
      {active
        ? <CheckCircle size={8} />
        : <XCircle size={8} />
      }
      {label}
    </span>
  )
}

// ── Repo Card ─────────────────────────────────────────────────────────────────

function RepoCard({ repo, vulns, codeql, deps, rank }) {
  const totalVulns = (vulns.Critical ?? 0) + (vulns.High ?? 0) + (vulns.Medium ?? 0) + (vulns.Low ?? 0)
  const totalCodeQL = (codeql.error ?? 0) + (codeql.warning ?? 0) + (codeql.note ?? 0)
  const hasGrype = totalVulns > 0 || vulns._exists
  const hasCodeQL = totalCodeQL > 0 || codeql._exists
  const hasSbom = deps > 0

  const topSev = vulns.Critical > 0 ? 'Critical'
    : vulns.High > 0 ? 'High'
    : vulns.Medium > 0 ? 'Medium'
    : vulns.Low > 0 ? 'Low'
    : null

  const accentHex = topSev ? SEV[topSev] : '#3a4462'

  return (
    <div className="bg-card border border-rim rounded-xl p-4 flex flex-col gap-3 hover:border-rim-hi transition-colors animate-fade-up"
      style={{ animationDelay: `${rank * 40}ms`, borderTop: `2px solid ${accentHex}` }}>

      {/* Nombre + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0"
            style={{ background: `${accentHex}18`, border: `1px solid ${accentHex}30` }}>
            <GitBranch size={11} style={{ color: accentHex }} />
          </div>
          <span className="text-[11px] font-bold text-ink truncate">{repo}</span>
        </div>
        <span className="text-[9px] text-ink-off tabular-nums shrink-0">#{rank + 1}</span>
      </div>

      {/* Tool badges */}
      <div className="flex gap-1.5 flex-wrap">
        <ToolBadge label="Grype"  active={hasGrype}  hex="#ff7340" />
        <ToolBadge label="CodeQL" active={hasCodeQL} hex="#a855f7" />
        <ToolBadge label="SBOM"   active={hasSbom}   hex="#22d48e" />
      </div>

      {/* Barra de severidad */}
      <SevBar counts={vulns} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-rim">
        <div className="text-center">
          <div className="text-sm font-bold tabular-nums" style={{ color: totalVulns > 0 ? '#ff7340' : '#2a3050' }}>
            {totalVulns}
          </div>
          <div className="micro mt-0.5">CVEs</div>
        </div>
        <div className="text-center border-x border-rim">
          <div className="text-sm font-bold tabular-nums" style={{ color: totalCodeQL > 0 ? '#a855f7' : '#2a3050' }}>
            {totalCodeQL}
          </div>
          <div className="micro mt-0.5">CodeQL</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold tabular-nums" style={{ color: deps > 0 ? '#22d48e' : '#2a3050' }}>
            {deps.toLocaleString()}
          </div>
          <div className="micro mt-0.5">Deps</div>
        </div>
      </div>

      {/* Desglose CVEs si hay */}
      {totalVulns > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[['Critical', '#ff3d52'], ['High', '#ff7340'], ['Medium', '#ffc107'], ['Low', '#22d48e']].map(([k, hex]) =>
            (vulns[k] ?? 0) > 0 ? (
              <span key={k} className="text-[9px] tabular-nums" style={{ color: hex }}>
                {vulns[k]} {k.toLowerCase()}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Desglose CodeQL si hay */}
      {totalCodeQL > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[['error', '#ff3d52'], ['warning', '#ffc107'], ['note', '#3d7fff']].map(([k, hex]) =>
            (codeql[k] ?? 0) > 0 ? (
              <span key={k} className="text-[9px] tabular-nums" style={{ color: hex }}>
                {codeql[k]} {k}
              </span>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}

// ── ReposPage ─────────────────────────────────────────────────────────────────

export default function ReposPage({ data }) {
  const { repos, repoVulnMap, repoCodeqlMap, allArtifacts } = data

  const depsByRepo = useMemo(() => {
    const map = {}
    for (const a of allArtifacts) {
      map[a.repo] = (map[a.repo] ?? 0) + 1
    }
    return map
  }, [allArtifacts])

  const repoList = useMemo(() => {
    return [...repos].sort((a, b) => {
      const scoreA = ((repoVulnMap[a]?.Critical ?? 0) * 4 + (repoVulnMap[a]?.High ?? 0) * 3
        + (repoVulnMap[a]?.Medium ?? 0) * 2 + (repoVulnMap[a]?.Low ?? 0))
      const scoreB = ((repoVulnMap[b]?.Critical ?? 0) * 4 + (repoVulnMap[b]?.High ?? 0) * 3
        + (repoVulnMap[b]?.Medium ?? 0) * 2 + (repoVulnMap[b]?.Low ?? 0))
      return scoreB - scoreA
    })
  }, [repos, repoVulnMap])

  const totalCVEs    = Object.values(repoVulnMap).reduce((s, r) => s + (r.Critical ?? 0) + (r.High ?? 0) + (r.Medium ?? 0) + (r.Low ?? 0), 0)
  const totalCodeQL  = Object.values(repoCodeqlMap).reduce((s, r) => s + (r.error ?? 0) + (r.warning ?? 0) + (r.note ?? 0), 0)
  const totalDeps    = allArtifacts.length

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="micro mb-1">Cobertura del análisis</div>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <GitBranch size={18} style={{ color: '#3d7fff' }} />
            Repositorios analizados
          </h1>
          <div className="flex gap-6 text-right">
            <div>
              <span className="text-lg font-bold tabular-nums" style={{ color: '#ff7340' }}>{totalCVEs.toLocaleString()}</span>
              <div className="micro">CVEs totales</div>
            </div>
            <div>
              <span className="text-lg font-bold tabular-nums" style={{ color: '#a855f7' }}>{totalCodeQL}</span>
              <div className="micro">CodeQL</div>
            </div>
            <div>
              <span className="text-lg font-bold tabular-nums" style={{ color: '#22d48e' }}>{totalDeps.toLocaleString()}</span>
              <div className="micro">dependencias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de repos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {repoList.map((repo, i) => (
          <RepoCard
            key={repo}
            repo={repo}
            rank={i}
            vulns={repoVulnMap[repo] ?? {}}
            codeql={repoCodeqlMap[repo] ?? {}}
            deps={depsByRepo[repo] ?? 0}
          />
        ))}
      </div>

    </div>
  )
}
