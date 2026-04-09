import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const LIMIT = 6

export default function Home() {
  const [teams, setTeams] = useState([])
  const [contracts, setContracts] = useState([])
  const [deadMoney, setDeadMoney] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: c }, { data: d }] = await Promise.all([
        supabase.from('teams').select('*').order('id'),
        supabase.from('contracts').select('*').eq('active', true),
        supabase.from('dead_money').select('*'),
      ])
      setTeams(t || [])
      setContracts(c || [])
      setDeadMoney(d || [])
      setLoading(false)
    }
    load()
  }, [])

  function getTeamContracts(teamId) {
    return contracts.filter(c => c.team_id === teamId)
  }

  function getCurSalary(c) {
    return c.salaries[c.current_year - 1] || 0
  }

  function getTotalCap(teamId) {
    return getTeamContracts(teamId).reduce((s, c) => s + getCurSalary(c), 0)
  }

  function getTeamDeadMoney(teamId) {
    return deadMoney.filter(d => d.team_id === teamId).reduce((s, d) => s + d.amount, 0)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui', color:'#6b7280' }}>
      Loading Seamheadz...
    </div>
  )

  const totalDeadMoney = teams.reduce((s, t) => s + getTeamDeadMoney(t.id), 0)

  return (
    <>
      <Head>
        <title>Seamheadz — Contract Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ maxWidth:980, margin:'0 auto', padding:'1rem', fontFamily:'system-ui, sans-serif' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:24, fontWeight:600, color:'#111' }}>
            Seamhead<span style={{ color:'#16a34a' }}>z</span>
          </div>
          <div style={{ fontSize:12, background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:8, padding:'4px 10px', color:'#6b7280' }}>
            2026 Season · {LIMIT} contract slots
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {['overview','budgets','dead money'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding:'6px 14px', borderRadius:8, border:'1px solid #e5e7eb',
                background: activeTab===tab ? '#f3f4f6' : '#fff',
                fontWeight: activeTab===tab ? 500 : 400,
                fontSize:13, color: activeTab===tab ? '#111' : '#6b7280',
                cursor:'pointer', textTransform:'capitalize'
              }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px, 1fr))', gap:12 }}>
            {teams.map(team => {
              const used = getTeamContracts(team.id).length
              const over = used > LIMIT, near = used === LIMIT
              const cap = getTotalCap(team.id)
              const dead = getTeamDeadMoney(team.id)
              const pct = Math.min(used / LIMIT, 1)
              const barColor = over ? '#dc2626' : near ? '#d97706' : '#16a34a'
              const badgeBg = over ? '#fef2f2' : near ? '#fffbeb' : '#f0fdf4'
              const badgeColor = over ? '#dc2626' : near ? '#d97706' : '#16a34a'
              const badgeText = over ? `${used}/${LIMIT} OVER` : near ? `${used}/${LIMIT} full` : `${used}/${LIMIT} slots`
              return (
                <Link key={team.id} href={`/team/${team.id}`} style={{ textDecoration:'none' }}>
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'1rem', cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#9ca3af'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{team.name}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:8 }}>{team.mgr}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:badgeBg, color:badgeColor, fontWeight:500 }}>{badgeText}</span>
                      <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'#eff6ff', color:'#1d4ed8', fontWeight:500 }}>${cap} cap</span>
                      {dead > 0 && <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'#fef2f2', color:'#dc2626', fontWeight:500 }}>${dead} dead</span>}
                    </div>
                    <div style={{ height:4, background:'#f3f4f6', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.round(pct*100)}%`, background:barColor, borderRadius:2 }} />
                    </div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>{used} contracts · ${team.budget} draft budget</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {activeTab === 'budgets' && (
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'1.25rem' }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:'1rem', color:'#111' }}>2026 draft budgets</div>
            {[...teams].sort((a,b) => b.budget - a.budget).map(team => {
              const dead = getTeamDeadMoney(team.id)
              const eff = team.budget - dead
              const max = Math.max(...teams.map(t => t.budget))
              return (
                <div key={team.id} style={{ marginBottom:14, cursor:'pointer' }} onClick={() => window.location.href=`/team/${team.id}`}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:'#111' }}>{team.name} <span style={{ fontWeight:400, color:'#9ca3af', fontSize:11 }}>({team.mgr})</span></span>
                    <span style={{ fontSize:12, color:'#6b7280' }}>${team.budget} · ${dead} dead · <strong style={{ color: eff<100 ? '#dc2626' : '#111' }}>${eff} effective</strong></span>
                  </div>
                  <div style={{ height:4, background:'#f3f4f6', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.round((team.budget/max)*100)}%`, background:'#16a34a', borderRadius:2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'dead money' && (
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'1.25rem' }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:'1rem', color:'#111' }}>Dead money — 2026</div>
            {teams.filter(t => getTeamDeadMoney(t.id) > 0)
              .sort((a,b) => getTeamDeadMoney(b.id) - getTeamDeadMoney(a.id))
              .map(team => (
              <div key={team.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid #f3f4f6', color:'#111' }}>
                <span>{team.name} <span style={{ fontSize:11, color:'#9ca3af' }}>({team.mgr})</span></span>
                <span style={{ color:'#dc2626', fontWeight:500 }}>-${getTeamDeadMoney(team.id)}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, paddingTop:8, borderTop:'1px solid #e5e7eb', fontSize:13, fontWeight:600, color:'#111' }}>
              <span>Total</span>
              <span style={{ color:'#dc2626' }}>-${totalDeadMoney}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
