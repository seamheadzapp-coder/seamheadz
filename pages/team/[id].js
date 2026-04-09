import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { teams, getSlotLimit, getTotalCap, getCurSalary, getYearsRemaining, CURRENT_YEAR } from '../../lib/leagueData'

const LIMIT = getSlotLimit(CURRENT_YEAR)

export default function TeamPage() {
  const router = useRouter()
  const { id } = router.query
  const team = teams.find(t => t.id === parseInt(id))

  if (!team) return (
    <div style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontFamily:'system-ui' }}>
      Loading...
    </div>
  )

  const used = team.contracts.length
  const cap = getTotalCap(team)
  const over = used > LIMIT

  return (
    <>
      <Head>
        <title>{team.name} — Seamheadz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ maxWidth:980, margin:'0 auto', padding:'1rem', fontFamily:'system-ui, sans-serif' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:24, fontWeight:600, color:'#111' }}>
            Seamhead<span style={{ color:'#16a34a' }}>z</span>
          </div>
          <Link href="/" style={{ fontSize:13, color:'#6b7280', textDecoration:'none', padding:'6px 14px', border:'1px solid #e5e7eb', borderRadius:8 }}>
            ← League overview
          </Link>
        </div>

        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'1.25rem' }}>

          {/* Team header */}
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ fontSize:22, fontWeight:600, color:'#111' }}>{team.name}</div>
            <div style={{ fontSize:13, color:'#9ca3af', marginTop:2 }}>{team.mgr}</div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:'1.25rem' }}>
            {[
              { label:'Contracts', value:`${used}/${LIMIT}`, danger: over },
              { label:'2026 cap hit', value:`$${cap}` },
              { label:'Draft budget', value:`$${team.budget}` },
              { label:'Dead money', value:`$${team.deadMoney}`, danger: team.deadMoney > 0 },
            ].map(s => (
              <div key={s.label} style={{ background:'#f9fafb', borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:600, color: s.danger ? '#dc2626' : '#111' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Over-limit warning */}
          {over && (
            <div style={{ background:'#fef2f2', borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:12, color:'#dc2626' }}>
              ⚠ {used} contracts — over the {LIMIT}-slot limit. Cannot sign new contracts until at or below {LIMIT}.
            </div>
          )}

          {/* Contracts table */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['Player','Salary schedule','2026 salary','Remaining'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'5px 8px', color:'#9ca3af', fontWeight:400, borderBottom:'1px solid #f3f4f6', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {team.contracts.map((c, i) => {
                  const curSal = getCurSalary(c)
                  const rem = getYearsRemaining(c)
                  return (
                    <tr key={i} style={{ borderBottom: i < team.contracts.length-1 ? '1px solid #f9fafb' : 'none' }}>
                      <td style={{ padding:'8px 8px', fontWeight:500, color:'#111' }}>{c.player}</td>
                      <td style={{ padding:'8px 8px' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          {c.sals.map((sal, idx) => {
                            const yr = idx + 1
                            const isCur = yr === c.curYr
                            const isPast = yr < c.curYr
                            return (
                              <div key={yr} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
                                <span style={{ width:24, fontSize:10, color:'#9ca3af' }}>Yr{yr}</span>
                                <span style={{
                                  width:6, height:6, borderRadius:'50%', flexShrink:0,
                                  background: isCur ? '#16a34a' : isPast ? '#d1d5db' : '#e5e7eb'
                                }} />
                                <span style={{
                                  color: isCur ? '#16a34a' : isPast ? '#9ca3af' : '#6b7280',
                                  fontWeight: isCur ? 600 : 400,
                                  textDecoration: isPast ? 'line-through' : 'none'
                                }}>${sal}{isCur ? ' ←' : ''}</span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td style={{ padding:'8px 8px', fontWeight:600, color:'#16a34a' }}>${curSal}</td>
                      <td style={{ padding:'8px 8px', color:'#6b7280' }}>{rem} yr{rem !== 1 ? 's' : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Dead money section */}
          {(team.deadPlayers?.length > 0 || team.deadMoney > 0) && (
            <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid #f3f4f6' }}>
              <div style={{ fontSize:11, fontWeight:500, color:'#9ca3af', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                Dead money — dropped players
              </div>
              {team.deadPlayers?.length > 0 ? (
                team.deadPlayers.map((d, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'5px 0', borderBottom:'1px solid #f9fafb', color:'#111' }}>
                    <span>{d.player}</span>
                    <span style={{ color:'#dc2626', fontWeight:500 }}>-${d.amount}</span>
                  </div>
                ))
              ) : (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'5px 0', color:'#111' }}>
                  <span>Prior season obligations</span>
                  <span style={{ color:'#dc2626', fontWeight:500 }}>-${team.deadMoney}</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const paths = teams.map(t => ({ params: { id: String(t.id) } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  return { props: {} }
}
