import { ShieldAlert, Flame, Code2, Database, Wrench, AlertTriangle } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Customized,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts'

// ── Constantes ────────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180
const TT = {
  backgroundColor: '#0f1220', border: '1px solid #1a2035', borderRadius: 3,
  padding: '6px 12px', color: '#dde4f0', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
}
const SEV = {
  Critical: '#ff3d52', High: '#ff7340', Medium: '#ffc107', Low: '#22d48e',
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, Icon, hex, delay = 0 }) {
  return (
    <div
      className="animate-fade-up bg-card border border-rim rounded-xl p-5 flex items-center gap-4 hover:border-rim-hi transition-all duration-200"
      style={{ animationDelay: `${delay}ms`, borderTop: `2px solid ${hex}` }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${hex}1e`, border: `1px solid ${hex}45` }}>
        <Icon size={22} style={{ color: hex }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[2rem] font-bold tabular-nums leading-none tracking-tight" style={{ color: hex }}>
          {value}
        </div>
        <div className="text-[10px] text-ink tracking-[0.15em] uppercase mt-1.5">{label}</div>
        {sub && <div className="text-[9px] text-ink-dim mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  )
}

// ── Alert strip ───────────────────────────────────────────────────────────────

function CriticalStrip({ vulns }) {
  if (!vulns?.length) return null
  return (
    <div className="shrink-0 animate-fade-up bg-card border rounded-xl overflow-hidden"
      style={{ borderColor: 'rgba(255,61,82,0.3)', borderLeft: '3px solid #ff3d52' }}>
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(255,61,82,0.06)' }}>
        <AlertTriangle size={11} style={{ color: '#ff3d52' }} />
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#ff3d52' }}>
          Critical sin parche — acción urgente
        </span>
        <span className="ml-auto text-[9px] text-ink-off">{vulns.length} CVEs</span>
      </div>
      <div className="flex divide-x" style={{ borderColor: 'rgba(255,61,82,0.12)' }}>
        {vulns.map((v, i) => {
          const s = v.cvssScore ?? 0
          const bg = s >= 9 ? '#ff3d52' : s >= 7 ? '#ff7340' : '#fbc02d'
          return (
            <div key={i} className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0">
              <span className="inline-flex items-center justify-center w-10 h-5 rounded text-[10px] font-bold tabular-nums shrink-0"
                style={{ backgroundColor: bg, color: '#fff' }}>{s.toFixed(1)}</span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-ink truncate">{v.id}</div>
                <div className="text-[9px] text-ink-dim truncate">{v.pkg}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Donut CVEs ────────────────────────────────────────────────────────────────

function renderOuterLabel({ cx, cy, midAngle, outerRadius, name, value, percent }) {
  if (!value) return null
  const radius = outerRadius + 38
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const anchor = x > cx ? 'start' : 'end'
  const color = SEV[name] ?? '#8892b0'
  return (
    <g key={name}>
      <text x={x} y={y - 7} textAnchor={anchor} fill={color}
        style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fontWeight: 700, letterSpacing: '0.12em' }}>
        {name.toUpperCase()}
      </text>
      <text x={x} y={y + 7} textAnchor={anchor} fill={color}
        style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', opacity: 0.85 }}>
        {value.toLocaleString()} · {(percent * 100).toFixed(1)}%
      </text>
    </g>
  )
}

function CvssDonut({ stats }) {
  const rows = [
    { name: 'Critical', value: stats.critical, hex: SEV.Critical },
    { name: 'High',     value: stats.high,     hex: SEV.High     },
    { name: 'Medium',   value: stats.medium,   hex: SEV.Medium   },
    { name: 'Low',      value: stats.low,      hex: SEV.Low      },
  ]
  const total = stats.totalVulns
  const data  = rows.filter(d => d.value > 0)
  const empty = data.length === 0

  return (
    <div className="bg-card border border-rim rounded-xl p-4 flex flex-col h-full"
      style={{ borderTop: `2px solid ${SEV.Critical}` }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <span className="micro">Detalle distribución CVEs — Grype</span>
        <span className="text-[10px] text-ink-off">{total} CVEs</span>
      </div>

      {/* Donut — flex-1 con absolute trick para Recharts */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 22, right: 62, bottom: 4, left: 62 }}>
              <Pie isAnimationActive={false}
                data={empty ? [{ name: 'empty', value: 1 }] : data}
                cx="50%" cy="44%"
                innerRadius="36%" outerRadius="58%"
                paddingAngle={data.length > 1 ? 3 : 0}
                dataKey="value"
                startAngle={90} endAngle={-270}
                
                stroke="none"
                label={empty ? false : renderOuterLabel}
                labelLine={{ stroke: '#3a4462', strokeWidth: 1, strokeDasharray: '3 2' }}
              >
                {(empty ? [{ hex: '#1a2035' }] : data).map((e, i) => (
                  <Cell key={i} fill={e.hex ?? '#1a2035'} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={TT} formatter={(v, n) => [`${v} CVEs`, n]} cursor={false} />
              {/* Centro: SVG text siempre en el hueco exacto del donut */}
              <Customized component={({ width, height }) => {
                const cx = width / 2
                const cy = 22 + (height - 26) * 0.44
                const fontSize = total >= 10000 ? 18 : total >= 1000 ? 20 : 24
                return (
                  <g>
                    <text x={cx} y={cy - 6} textAnchor="middle"
                      fill="#dde4f0" fontWeight={700} fontFamily="IBM Plex Mono"
                      fontSize={fontSize}>
                      {total.toLocaleString()}
                    </text>
                    <text x={cx} y={cy + 11} textAnchor="middle"
                      fill="#4a5580" fontFamily="IBM Plex Mono"
                      fontSize={9} letterSpacing="3">
                      CVEs
                    </text>
                  </g>
                )
              }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla breakdown */}
      <div className="shrink-0 mt-3 pt-3 border-t border-rim space-y-1.5">
        {rows.map(({ name, value, hex }) => {
          const pct = total > 0 ? (value / total * 100).toFixed(1) : '0.0'
          return (
            <div key={name} className="flex items-center text-[11px]">
              <span className="w-20 font-bold tracking-[0.12em] uppercase text-[9px]" style={{ color: hex }}>
                {name}
              </span>
              <span className="flex-1 font-bold tabular-nums" style={{ color: hex }}>
                {value.toLocaleString()}
              </span>
              <span className="text-ink-dim tabular-nums text-[10px]">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── CodeQL Severidad ──────────────────────────────────────────────────────────

function CodeQLSevBars({ severityCodeQL }) {
  const { error = 0, warning = 0, note = 0 } = severityCodeQL ?? {}
  const total = error + warning + note
  const data = [
    { name: 'ERROR',   value: error,   hex: '#ff3d52' },
    { name: 'WARNING', value: warning, hex: '#ffc107' },
    { name: 'NOTE',    value: note,    hex: '#3d7fff' },
  ]

  return (
    <div className="bg-card border border-rim rounded-xl p-4 flex flex-col h-full"
      style={{ borderTop: '2px solid #a855f7' }}>

      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="micro">Severidad CodeQL</span>
        <span className="text-[10px] text-ink-off">{total} hallazgos</span>
      </div>

      <div className="flex-1 flex flex-col justify-evenly min-h-0 py-2">
        {data.map(({ name, value, hex }) => {
          const pct = total > 0 ? (value / total) * 100 : 0
          return (
            <div key={name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.12em]" style={{ color: hex }}>{name}</span>
                <span className="text-[11px] font-bold tabular-nums text-ink">
                  {value.toLocaleString()}
                  <span className="text-ink-off font-normal text-[10px] ml-2">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-4 rounded overflow-hidden bg-rim relative">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: hex,
                    boxShadow: name === 'ERROR' && value > 0 ? `0 0 12px ${hex}60` : 'none',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Repos más afectados ───────────────────────────────────────────────────────

function TopReposBar({ grypeByRepoArr, codeqlByRepoArr }) {
  const map = {}
  for (const r of grypeByRepoArr) map[r.repo] = (map[r.repo] ?? 0) + r.total
  for (const r of codeqlByRepoArr) map[r.repo] = (map[r.repo] ?? 0) + r.total

  const data = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([repo, total]) => ({
      repo: repo.length > 20 ? repo.slice(0, 18) + '…' : repo,
      total,
    }))

  return (
    <div className="bg-card border border-rim rounded-xl p-4 flex flex-col h-full"
      style={{ borderTop: '2px solid #22d48e' }}>

      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="micro">Repos más afectados</span>
        <span className="text-[10px] text-ink-off">CVEs + CodeQL</span>
      </div>

      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          {data.length === 0 ? (
            <p className="text-xs text-ink-dim italic pt-4">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 52, bottom: 4, left: 0 }}
                barCategoryGap="32%" barSize={26}
              >
                <CartesianGrid horizontal={false} stroke="#1a2035" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="repo" width={108}
                  tick={{ fontSize: 9, fill: '#8892b0', fontFamily: 'IBM Plex Mono' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={v => [v.toLocaleString(), 'Problemas']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar isAnimationActive={false} dataKey="total" radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="total"
                    position="right"
                    style={{ fontSize: 9, fill: '#4a5580', fontFamily: 'IBM Plex Mono' }}
                    formatter={v => v.toLocaleString()}
                  />
                  {data.map((_, i) => (
                    <Cell key={i} fill={`rgba(34,212,142,${0.9 - i * 0.12})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ data }) {
  const { stats, criticalUnfixed, severityCodeQL, grypeByRepoArr, codeqlByRepoArr, fixCounts } = data

  const KPIS = [
    { label: 'Total CVEs',    value: stats.totalVulns.toLocaleString(),   sub: `${stats.repos} repositorios`,               Icon: ShieldAlert, hex: SEV.Critical, delay: 0   },
    { label: 'Critical',      value: stats.critical.toLocaleString(),     sub: `${stats.high} High · ${stats.medium} Med`,  Icon: Flame,       hex: SEV.High,     delay: 50  },
    { label: 'CodeQL Errors', value: stats.codeqlErrors.toLocaleString(), sub: `${stats.codeqlFindings} hallazgos totales`, Icon: Code2,       hex: '#a855f7',    delay: 100 },
    { label: 'Repositorios',  value: stats.repos,                         sub: 'Grype + CodeQL + Syft',                     Icon: Database,    hex: '#3d7fff',    delay: 150 },
    { label: '% Con parche',  value: `${stats.fixPct}%`,                  sub: `${fixCounts?.con ?? 0} CVEs corregibles`,   Icon: Wrench,      hex: SEV.Low,      delay: 200 },
  ]

  return (
    <div className="flex flex-col h-full p-5 gap-4 max-w-screen-xl mx-auto w-full box-border">

      {/* Header */}
      <div className="animate-fade-up shrink-0 flex items-baseline justify-between">
        <div>
          <div className="micro mb-0.5">Panel de control</div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Security Overview</h1>
        </div>
        <p className="text-[10px] text-ink-dim">
          {stats.repos} repositorio{stats.repos !== 1 ? 's' : ''} · Grype + CodeQL + Syft
        </p>
      </div>

      {/* KPI row */}
      <div className="shrink-0 grid grid-cols-5 gap-3">
        {KPIS.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Alert (condicional) */}
      <CriticalStrip vulns={criticalUnfixed} />

      {/* 3 Charts — altura fija para evitar espacio vacío */}
      <div className="grid grid-cols-3 gap-4" style={{ height: '400px' }}>
        <CvssDonut stats={stats} />
        <CodeQLSevBars severityCodeQL={severityCodeQL} />
        <TopReposBar grypeByRepoArr={grypeByRepoArr} codeqlByRepoArr={codeqlByRepoArr} />
      </div>

    </div>
  )
}
