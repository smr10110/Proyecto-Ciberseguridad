<<<<<<< HEAD
import { useState, useMemo } from 'react'
import { ShieldAlert, Search, CheckCircle, XCircle, HelpCircle } from 'lucide-react'

function SevBadge({ s }) {
  const key = (s || 'Unknown').toLowerCase()
  return <span className={`sev-badge sev-${key}`}>{s || 'Unknown'}</span>
}

function FixBadge({ state }) {
  if (state === 'fixed')     return <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#22d48e' }}><CheckCircle size={10} /> fixed</span>
  if (state === 'not-fixed') return <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#ff3d52' }}><XCircle    size={10} /> no fix</span>
  return                            <span className="inline-flex items-center gap-1 text-[10px] text-ink-off"><HelpCircle size={10} /> unknown</span>
}

const SELECT = "ctrl px-3 py-1.5"
const INPUT  = "ctrl pl-8 pr-3 py-1.5 w-full"

export default function VulnPage({ data }) {
  const { allVulns, repos } = data
  const [search, setSearch] = useState('')
  const [repoF, setRepoF]   = useState('all')
  const [sevF,  setSevF]    = useState('all')
  const [fixF,  setFixF]    = useState('all')
  const [page,  setPage]    = useState(1)
  const PAGE = 25

  const filtered = useMemo(() => {
    let list = allVulns
    if (repoF !== 'all') list = list.filter(v => v.repo === repoF)
    if (sevF  !== 'all') list = list.filter(v => v.severity === sevF)
    if (fixF  !== 'all') list = list.filter(v => v.fixState === fixF)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.pkg.toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allVulns, repoF, sevF, fixF, search])

  const totalPages = Math.ceil(filtered.length / PAGE)
  const visible = filtered.slice((page - 1) * PAGE, page * PAGE)
  const go = p => setPage(p)

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="micro mb-1">Análisis de vulnerabilidades</div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <ShieldAlert size={18} style={{ color: '#ff3d52' }} />
            CVEs detectados
          </h1>
          <span className="text-[11px] text-ink-dim">
            <span className="text-ink font-bold">{filtered.length.toLocaleString()}</span> resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-up bg-card border border-rim rounded-lg p-4" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-off" />
            <input
              type="text"
              placeholder="CVE-ID, paquete, descripción…"
              value={search}
              onChange={e => { setSearch(e.target.value); go(1) }}
              className={INPUT}
            />
          </div>
          <select value={repoF} onChange={e => { setRepoF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Todos los repos</option>
            {repos.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={sevF} onChange={e => { setSevF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Severidad</option>
            {['Critical','High','Medium','Low'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={fixF} onChange={e => { setFixF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Fix state</option>
            <option value="fixed">Fixed</option>
            <option value="not-fixed">Not fixed</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-up bg-card border border-rim rounded-lg overflow-hidden" style={{ animationDelay: '160ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rim text-[9px] uppercase tracking-[0.15em] text-ink-off">
                <th className="text-left px-4 py-3 font-medium">CVE</th>
                <th className="text-left px-4 py-3 font-medium">Sev</th>
                <th className="text-left px-4 py-3 font-medium">Paquete</th>
                <th className="text-left px-4 py-3 font-medium">Versión</th>
                <th className="text-left px-4 py-3 font-medium">Fix</th>
                <th className="text-left px-4 py-3 font-medium">Repo</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-ink-off py-14 micro">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                visible.map((v, i) => (
                  <tr key={i} className="trow">
                    <td className="px-4 py-2.5 font-semibold text-ink">{v.id}</td>
                    <td className="px-4 py-2.5"><SevBadge s={v.severity} /></td>
                    <td className="px-4 py-2.5 text-ink max-w-[130px] truncate">{v.pkg}</td>
                    <td className="px-4 py-2.5 text-ink-dim">{v.version}</td>
                    <td className="px-4 py-2.5"><FixBadge state={v.fixState} /></td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] bg-rim text-ink-dim px-2 py-0.5 rounded-sm">{v.repo}</span>
                    </td>
                  </tr>
                ))
              )}
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
=======
import { useState, useMemo } from 'react'
import { ShieldAlert, Search, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts'

// ── Paleta ────────────────────────────────────────────────────────────────────

const SEV_HEX = { Critical: '#ff3d52', High: '#ff7340', Medium: '#ffc107', Low: '#22d48e', Unknown: '#3a4462' }
const TT = {
  backgroundColor: '#0f1220', border: '1px solid #1a2035', borderRadius: 3,
  padding: '5px 10px', color: '#dde4f0', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
}

function SevBadge({ s }) {
  return <span className={`sev-badge sev-${(s || 'Unknown').toLowerCase()}`}>{s || 'Unknown'}</span>
}
function FixBadge({ state }) {
  if (state === 'fixed')     return <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#22d48e' }}><CheckCircle size={10} /> fixed</span>
  if (state === 'not-fixed') return <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#ff3d52' }}><XCircle    size={10} /> no fix</span>
  return                            <span className="inline-flex items-center gap-1 text-[10px] text-ink-off"><HelpCircle size={10} /> unknown</span>
}
function Sect({ label, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="micro">{label}</span>
      {right && <span className="text-[10px] text-ink-off">{right}</span>}
    </div>
  )
}

// ── 5.1 Distribución CVSS (barras + Critical destacado) ──────────────────────

function CvssDistChart({ stats }) {
  const SEV = ['Critical', 'High', 'Medium', 'Low']
  const data = SEV.map(s => ({ name: s, value: stats[s.toLowerCase()] ?? 0 }))
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #ff3d52' }}>
      <Sect label="5.1 Distribución CVSS" right={`${total} CVEs`} />
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="#1a2035" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TT} formatter={(v, n) => {
            const pct = total > 0 ? ((v / total) * 100).toFixed(1) : '0.0'
            return [`${v} (${pct}%)`, n]
          }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar isAnimationActive={false} dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={40}
            label={{ position: 'top', fontSize: 9, fill: '#8892b0', fontFamily: 'IBM Plex Mono',
              formatter: v => total > 0 ? `${((v / total) * 100).toFixed(0)}%` : '' }}>
            {data.map((d, i) => (
              <Cell key={i} fill={SEV_HEX[d.name] ?? '#3a4462'}
                stroke={d.name === 'Critical' ? '#ff1a35' : 'transparent'}
                strokeWidth={d.name === 'Critical' ? 2 : 0} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── 5.2 Vulns por repo ────────────────────────────────────────────────────────

function RepoVulnChart({ grypeByRepoArr }) {
  const data = grypeByRepoArr.slice(0, 10).map(r => ({
    repo: r.repo.length > 14 ? r.repo.slice(0, 12) + '…' : r.repo,
    total: r.total,
  }))
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #ff7340' }}>
      <Sect label="5.2 CVEs por repositorio" right="top 10" />
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="#1a2035" />
          <XAxis type="number" tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="repo" width={80} tick={{ fontSize: 9, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TT} formatter={v => [v, 'CVEs']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar  dataKey="total" radius={[0, 3, 3, 0]} maxBarSize={12}>
            {data.map((_, i) => (
              <Cell key={i} fill={`rgba(255,115,64,${0.35 + (data.length - i) / data.length * 0.55})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── 5.3 Paquetes más vulnerables ──────────────────────────────────────────────

function TopPackagesChart({ topPackages }) {
  const data = topPackages.slice(0, 10).map(p => ({
    pkg: p.pkg.length > 14 ? p.pkg.slice(0, 12) + '…' : p.pkg,
    count: p.count,
    hex: SEV_HEX[p.severity] ?? '#3a4462',
  }))
  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #ffc107' }}>
      <Sect label="5.3 Paquetes más vulnerables" right="top 10" />
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="#1a2035" />
          <XAxis type="number" tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="pkg" width={80} tick={{ fontSize: 9, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TT} formatter={v => [v, 'CVEs']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar isAnimationActive={false} dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={12}>
            {data.map((d, i) => <Cell key={i} fill={d.hex} fillOpacity={0.75} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── 5.4 Disponibilidad de parches ────────────────────────────────────────────

function FixAvailChart({ fixCounts, fixByRepo }) {
  const { con = 0, sin = 0 } = fixCounts ?? {}
  const total = con + sin
  const pieData = [
    { name: 'Con parche', value: con, hex: '#22d48e' },
    { name: 'Sin parche', value: sin, hex: '#ff3d52' },
  ].filter(d => d.value > 0)

  const topRepos = fixByRepo.slice(0, 6)

  return (
    <div className="bg-card border border-rim rounded-lg p-5" style={{ borderTop: '2px solid #22d48e' }}>
      <Sect label="5.4 Disponibilidad de parches" right={`${total} CVEs`} />
      <div className="flex items-center gap-4">
        {/* Mini pie */}
        <div className="relative shrink-0" style={{ width: 90, height: 90 }}>
          <ResponsiveContainer width={90} height={90}>
            <PieChart>
              <Pie  data={pieData.length ? pieData : [{ name: 'empty', value: 1, hex: '#1a2035' }]}
                cx={41} cy={41} innerRadius={26} outerRadius={40}
                paddingAngle={pieData.length > 1 ? 4 : 0}
                dataKey="value" startAngle={90} endAngle={-270}
                isAnimationActive={false} stroke="none">
                {(pieData.length ? pieData : [{ hex: '#1a2035' }]).map((e, i) => (
                  <Cell key={i} fill={e.hex} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={TT} formatter={(v, n) => [`${v} (${total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`, n]} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[13px] font-bold tabular-nums" style={{ color: '#22d48e' }}>
              {total > 0 ? Math.round((con / total) * 100) : 0}%
            </span>
            <span className="text-[8px] text-ink-off uppercase tracking-widest">fix</span>
          </div>
        </div>
        {/* Repos */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {topRepos.length === 0 ? (
            <p className="text-xs text-ink-dim italic">Sin datos</p>
          ) : topRepos.map((r, i) => {
            const t = r.con + r.sin || 1
            const pct = Math.round((r.con / t) * 100)
            return (
              <div key={i}>
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span className="text-ink truncate max-w-[80px]">{r.repo}</span>
                  <span className="text-ink-dim tabular-nums shrink-0 ml-1">{r.con}/{t}</span>
                </div>
                <div className="h-1.5 rounded-sm overflow-hidden bg-rim">
                  <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: '#22d48e', opacity: 0.75, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── VulnPage ──────────────────────────────────────────────────────────────────

const SELECT = "ctrl px-3 py-1.5"
const INPUT  = "ctrl pl-8 pr-3 py-1.5 w-full"

export default function VulnPage({ data }) {
  const { allVulns, repos, stats, grypeByRepoArr, topPackages, fixCounts, fixByRepo } = data
  const [search, setSearch] = useState('')
  const [repoF, setRepoF]   = useState('all')
  const [sevF,  setSevF]    = useState('all')
  const [fixF,  setFixF]    = useState('all')
  const [page,  setPage]    = useState(1)
  const PAGE = 25

  const filtered = useMemo(() => {
    let list = allVulns
    if (repoF !== 'all') list = list.filter(v => v.repo === repoF)
    if (sevF  !== 'all') list = list.filter(v => v.severity === sevF)
    if (fixF  !== 'all') list = list.filter(v => v.fixState === fixF)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.pkg.toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allVulns, repoF, sevF, fixF, search])

  const totalPages = Math.ceil(filtered.length / PAGE)
  const visible = filtered.slice((page - 1) * PAGE, page * PAGE)
  const go = p => setPage(p)

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="micro mb-1">Análisis de vulnerabilidades · Grype</div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <ShieldAlert size={18} style={{ color: '#ff3d52' }} />
            CVEs detectados
          </h1>
          <span className="text-[11px] text-ink-dim">
            <span className="text-ink font-bold">{allVulns.length.toLocaleString()}</span> vulnerabilidades · {stats.repos} repos
          </span>
        </div>
      </div>

      {/* Charts zone — 4 gráficas del analyzer */}
      <div className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" style={{ animationDelay: '80ms' }}>
        <CvssDistChart stats={stats} />
        <RepoVulnChart grypeByRepoArr={grypeByRepoArr} />
        <TopPackagesChart topPackages={topPackages} />
        <FixAvailChart fixCounts={fixCounts} fixByRepo={fixByRepo} />
      </div>

      {/* Filters */}
      <div className="animate-fade-up bg-card border border-rim rounded-lg p-4" style={{ animationDelay: '160ms' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-off" />
            <input
              type="text"
              placeholder="CVE-ID, paquete, descripción…"
              value={search}
              onChange={e => { setSearch(e.target.value); go(1) }}
              className={INPUT}
            />
          </div>
          <select value={repoF} onChange={e => { setRepoF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Todos los repos</option>
            {repos.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={sevF} onChange={e => { setSevF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Severidad</option>
            {['Critical','High','Medium','Low'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={fixF} onChange={e => { setFixF(e.target.value); go(1) }} className={SELECT}>
            <option value="all">Fix state</option>
            <option value="fixed">Fixed</option>
            <option value="not-fixed">Not fixed</option>
            <option value="unknown">Unknown</option>
          </select>
          <span className="flex items-center text-[11px] text-ink-dim">
            <span className="text-ink font-bold">{filtered.length.toLocaleString()}</span>&nbsp;resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-up bg-card border border-rim rounded-lg overflow-hidden" style={{ animationDelay: '240ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rim text-[9px] uppercase tracking-[0.15em] text-ink-off">
                <th className="text-left px-4 py-3 font-medium">CVE</th>
                <th className="text-left px-4 py-3 font-medium">Sev</th>
                <th className="text-left px-4 py-3 font-medium">Paquete</th>
                <th className="text-left px-4 py-3 font-medium">Versión</th>
                <th className="text-left px-4 py-3 font-medium">Fix</th>
                <th className="text-left px-4 py-3 font-medium">Repo</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-ink-off py-14 micro">Sin resultados</td></tr>
              ) : visible.map((v, i) => (
                <tr key={i} className="trow">
                  <td className="px-4 py-2.5 font-semibold text-ink">{v.id}</td>
                  <td className="px-4 py-2.5"><SevBadge s={v.severity} /></td>
                  <td className="px-4 py-2.5 text-ink max-w-[130px] truncate">{v.pkg}</td>
                  <td className="px-4 py-2.5 text-ink-dim">{v.version}</td>
                  <td className="px-4 py-2.5"><FixBadge state={v.fixState} /></td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] bg-rim text-ink-dim px-2 py-0.5 rounded-sm">{v.repo}</span>
                  </td>
                </tr>
              ))}
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
>>>>>>> main
