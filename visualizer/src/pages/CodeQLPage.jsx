import { useState, useMemo } from 'react'
import { Code2, Search, FileCode } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TT = {
  backgroundColor: '#0f1220', border: '1px solid #1a2035', borderRadius: 3,
  padding: '5px 10px', color: '#dde4f0', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
}
const SEV_HEX = { error: '#ff3d52', warning: '#ffc107', note: '#3d7fff' }

function Sect({ label, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="micro">{label}</span>
      {right && <span className="text-[10px] text-ink-off">{right}</span>}
    </div>
  )
}

// ── 3.1 Distribución por severidad ───────────────────────────────────────────

function SeverityChart({ severityCodeQL }) {
  const { error = 0, warning = 0, note = 0 } = severityCodeQL ?? {}
  const total = error + warning + note
  const data = [
    { name: 'error',   value: error,   hex: '#ff3d52' },
    { name: 'warning', value: warning, hex: '#ffc107' },
    { name: 'note',    value: note,    hex: '#3d7fff' },
  ]
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #ff3d52' }}>
      <Sect label="3.1 Severidad CodeQL" right={`${total} hallazgos`} />
      <div className="space-y-2.5">
        {data.map(({ name, value, hex }) => {
          const pct = total > 0 ? (value / total) * 100 : 0
          return (
            <div key={name}>
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: hex }} className="uppercase tracking-widest font-medium">{name}</span>
                <span className="text-ink font-bold tabular-nums">
                  {value.toLocaleString()}
                  <span className="text-ink-off font-normal ml-1.5">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-2.5 rounded-sm overflow-hidden bg-rim relative">
                <div className="h-full rounded-sm transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: hex }} />
                {name === 'error' && value > 0 && (
                  <div className="absolute inset-y-0 left-0 rounded-sm"
                    style={{ width: `${pct}%`, boxShadow: `0 0 6px ${hex}60` }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 3.2 Problemas por repo ────────────────────────────────────────────────────

function RepoCodeQLChart({ codeqlByRepoArr }) {
  const data = codeqlByRepoArr.slice(0, 10).map(r => ({
    repo: r.repo.length > 14 ? r.repo.slice(0, 12) + '…' : r.repo,
    total: r.total,
  }))
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #a855f7' }}>
      <Sect label="3.2 Hallazgos por repositorio" right="top 10" />
      {data.length === 0 ? (
        <p className="text-xs text-ink-dim italic mt-2">Sin datos CodeQL</p>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="#1a2035" />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="repo" width={80} tick={{ fontSize: 9, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} formatter={v => [v, 'Hallazgos']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar isAnimationActive={false} dataKey="total" radius={[0, 3, 3, 0]} maxBarSize={12}>
              {data.map((_, i) => (
                <Cell key={i} fill={`rgba(168,85,247,${0.35 + (data.length - i) / data.length * 0.55})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── 3.3 Reglas más frecuentes ─────────────────────────────────────────────────

function TopRulesChart({ topRules }) {
  const data = topRules.slice(0, 10).map(r => ({
    name: (r.rule_id || '').split('/').pop()?.slice(0, 20) ?? r.rule_id,
    count: r.count,
    hex: SEV_HEX[r.severity] ?? '#8892b0',
  }))
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #ffc107' }}>
      <Sect label="3.3 Reglas más frecuentes" right="top 10" />
      {data.length === 0 ? (
        <p className="text-xs text-ink-dim italic mt-2">Sin reglas</p>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="#1a2035" />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 8, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} formatter={v => [v, 'Ocurrencias']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar isAnimationActive={false} dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={12}>
              {data.map((d, i) => <Cell key={i} fill={d.hex} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── 3.4 Archivos más afectados ────────────────────────────────────────────────

function TopFilesChart({ topFiles }) {
  const data = topFiles.slice(0, 10).map(f => ({
    file: f.file.length > 22 ? '…' + f.file.slice(-20) : f.file,
    count: f.count,
  }))
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #3d7fff' }}>
      <Sect label="3.4 Archivos más afectados" right="top 10" />
      {data.length === 0 ? (
        <p className="text-xs text-ink-dim italic mt-2">Sin datos de ubicación</p>
      ) : (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="#1a2035" />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="file" width={100} tick={{ fontSize: 8, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} formatter={v => [v, 'Hallazgos']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar isAnimationActive={false} dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={12}>
              {data.map((_, i) => (
                <Cell key={i} fill={`rgba(61,127,255,${0.35 + (data.length - i) / data.length * 0.55})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── CodeQLPage ────────────────────────────────────────────────────────────────

const SELECT = "ctrl px-3 py-1.5"
const INPUT  = "ctrl pl-8 pr-3 py-1.5 w-full"

export default function CodeQLPage({ data }) {
  const { allFindings, repos, stats, severityCodeQL, codeqlByRepoArr, topRules, topFiles } = data
  const [search, setSearch] = useState('')
  const [repoF, setRepoF]   = useState('all')
  const [lvlF,  setLvlF]    = useState('all')
  const [page,  setPage]    = useState(1)
  const PAGE = 25

  const filtered = useMemo(() => {
    let list = allFindings
    if (repoF !== 'all') list = list.filter(f => f.repo === repoF)
    if (lvlF  !== 'all') list = list.filter(f => f.severity === lvlF)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        (f.rule_id || '').toLowerCase().includes(q) ||
        (f.name || '').toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => {
      const ORDER = { error: 0, warning: 1, note: 2 }
      return (ORDER[a.severity] ?? 3) - (ORDER[b.severity] ?? 3)
    })
  }, [allFindings, repoF, lvlF, search])

  const totalPages = Math.ceil(filtered.length / PAGE)
  const visible    = filtered.slice((page - 1) * PAGE, page * PAGE)
  const go = p => setPage(p)

  const errors   = severityCodeQL?.error   ?? 0
  const warnings = severityCodeQL?.warning ?? 0
  const notes    = severityCodeQL?.note    ?? 0

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="micro mb-1">Análisis estático · CodeQL</div>
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Code2 size={18} style={{ color: '#a855f7' }} />
            Hallazgos CodeQL
          </h1>
          <div className="flex gap-5 text-right shrink-0">
            <div>
              <div className="text-lg font-bold tabular-nums" style={{ color: '#ff3d52' }}>{errors.toLocaleString()}</div>
              <div className="micro">errores</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums" style={{ color: '#ffc107' }}>{warnings.toLocaleString()}</div>
              <div className="micro">warnings</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums" style={{ color: '#3d7fff' }}>{notes.toLocaleString()}</div>
              <div className="micro">notas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts zone — 4 gráficas del analyzer */}
      <div className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" style={{ animationDelay: '80ms' }}>
        <SeverityChart severityCodeQL={severityCodeQL} />
        <RepoCodeQLChart codeqlByRepoArr={codeqlByRepoArr} />
        <TopRulesChart topRules={topRules} />
        <TopFilesChart topFiles={topFiles} />
      </div>

      {/* Filters */}
      <div className="animate-fade-up bg-card border border-rim rounded-lg p-4" style={{ animationDelay: '160ms' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-off" />
            <input
              type="text"
              placeholder="Regla, descripción…"
              value={search}
              onChange={e => { setSearch(e.target.value); go(1) }}
              className={INPUT}
            />
          </div>
          <select value={repoF} onChange={e => { setRepoF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Todos los repos</option>
            {repos.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={lvlF} onChange={e => { setLvlF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Nivel</option>
            <option value="error">error</option>
            <option value="warning">warning</option>
            <option value="note">note</option>
          </select>
          <span className="flex items-center text-[11px] text-ink-dim">
            <span className="text-ink font-bold">{filtered.length.toLocaleString()}</span>&nbsp;hallazgo{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-up bg-card border border-rim rounded-lg overflow-hidden" style={{ animationDelay: '240ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rim text-[9px] uppercase tracking-[0.15em] text-ink-off">
                <th className="text-left px-4 py-3 font-medium">Nivel</th>
                <th className="text-left px-4 py-3 font-medium">Regla</th>
                <th className="text-left px-4 py-3 font-medium">Descripción</th>
                <th className="text-left px-4 py-3 font-medium">Archivo</th>
                <th className="text-left px-4 py-3 font-medium">Repo</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-ink-off py-14 micro">Sin hallazgos para los filtros actuales</td></tr>
              ) : visible.map((f, i) => {
                const loc  = f.locations?.[0]
                const file = loc?.file?.split('/').slice(-2).join('/') || '—'
                const line = loc?.startLine ? `:${loc.startLine}` : ''
                return (
                  <tr key={i} className="trow">
                    <td className="px-4 py-3 shrink-0">
                      <span className={`sev-badge sev-${f.severity ?? 'warning'}`}>{f.severity ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[11px]" style={{ color: '#a855f7' }}>{f.rule_id}</div>
                      <div className="text-[10px] text-ink-dim mt-0.5">{f.name || '—'}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-[11px] text-ink-dim line-clamp-2">{f.description || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-[10px] text-ink-dim">
                        <FileCode size={10} className="shrink-0 text-ink-off" />
                        <span className="truncate max-w-[140px]">{file}{line}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-rim text-ink-dim px-2 py-0.5 rounded-sm">{f.repo}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-rim">
            <span className="text-[10px] text-ink-dim">Página {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => go(Math.max(1, page - 1))} disabled={page === 1}
                className="px-3 py-1 text-[10px] border border-rim rounded text-ink-dim hover:text-ink hover:border-rim-hi disabled:opacity-30 transition-colors tracking-widest uppercase">
                Anterior
              </button>
              <button onClick={() => go(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-[10px] border border-rim rounded text-ink-dim hover:text-ink hover:border-rim-hi disabled:opacity-30 transition-colors tracking-widest uppercase">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
