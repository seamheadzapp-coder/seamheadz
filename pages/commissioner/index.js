import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const COMMISSIONER_PASSWORD = 'seamheadz2026'

export default function CommissionerPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [teams, setTeams] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedContract, setSelectedContract] = useState('')
  const [targetTeam, setTargetTeam] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (authed) loadData()
  }, [authed])

  async function loadData() {
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase.from('contracts').select('*').eq('active', true).order('player'),
    ])
    setTeams(t || [])
    setContracts(c || [])
    setLoading(false)
  }

  function handleLogin() {
    if (password === COMMISSIONER_PASSWORD) {
      setAuthed(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  function getTeamContracts(teamId) {
    return contracts.filter(c => c.team_id === parseInt(teamId))
  }

  function getCurSalary(c) {
    return c.salaries[c.current_year - 1] || 0
  }

  function getContract() {
    return contracts.find(c => c.id === parseInt(selectedContract))
  }

  async function processDrop() {
    const contract = getContract()
    if (!contract) return
    setSaving(true)
    const remainingSalaries = contract.salaries.slice(contract.current_year - 1)
    const deadAmount = remainingSalaries.reduce((s, v) => s + v, 0)
    const team = teams.find(t => t.id === contract.team_id)

    await supabase.from('contracts').update({ active: false }).eq('id', contract.id)
    await supabase.from('dead_money').insert({
      team_id: contract.team_id,
      player: contract.player,
      amount: deadAmount,
      season: 2026
    })
    await supabase.from('teams').update({ dead_money: (team.dead_money || 0) + deadAmount }).eq('id', team.id)

    setMessage(`✓ Dropped ${contract.player}. $${deadAmount} added as dead money.`)
    setSaving(false)
    setAction(null)
    setSelectedTeam('')
    setSelectedContract('')
    await loadData()
  }

  async function processTrade() {
    const contract = getContract()
    if (!contract || !targetTeam) return
    setSaving(true)

    await supabase.from('contracts').update({ team_id: parseInt(targetTeam) }).eq('id', contract.id)
    const fromTeam = teams.find(t => t.id === contract.team_id)
    const toTeam = teams.find(t => t.id === parseInt(targetTeam))

    setMessage(`✓ Traded ${contract.player} from ${fromTeam.name} to ${toTeam.name}. Contract transferred.`)
    setSaving(false)
    setAction(null)
    setSelectedTeam('')
    setSelectedContract('')
    setTargetTeam('')
    await loadData()
  }

  async function processAdvance() {
    const contract = getContract()
    if (!contract) return
    setSaving(true)

    if (contract.current_year >= contract.salaries.length) {
      await supabase.from('contracts').update({ active: false }).eq('id', contract.id)
      setMessage(`✓ ${contract.player}'s contract has expired and been removed.`)
    } else {
      await supabase.from('contracts').update({ current_year: contract.current_year + 1 }).eq('id', contract.id)
      setMessage(`✓ ${contract.player} advanced to year ${contract.current_year + 1}. New salary: $${contract.salaries[contract.current_year]}.`)
    }

    setSaving(false)
    setAction(null)
    setSelectedTeam('')
    setSelectedContract('')
    await loadData()
  }

  const s = {
    page: { maxWidth: 860, margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' },
    logo: { fontSize: 24, fontWeight: 600, color: '#111' },
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: 16 },
    label: { fontSize: 12, color: '#6b7280', marginBottom: 6, display: 'block' },
    select: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginBottom: 12, background: '#fff' },
    btn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnDanger: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnBlue: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    actionBtn: { padding: '12px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer', marginRight: 12, marginBottom: 12, fontWeight: 500 },
    message: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#15803d' },
  }

  // Login screen
  if (!authed) return (
    <>
      <Head><title>Commissioner — Seamheadz</title></Head>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '2rem', width: 320 }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Seamhead<span style={{ color: '#16a34a' }}>z</span></div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Commissioner access</div>
          <label style={s.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${passwordError ? '#dc2626' : '#d1d5db'}`, fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }}
          />
          {passwordError && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>Incorrect password</div>}
          <button onClick={handleLogin} style={{ ...s.btnPrimary, width: '100%', marginRight: 0 }}>Sign in</button>
        </div>
      </div>
    </>
  )

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#6b7280' }}>Loading...</div>

  const selectedContractObj = getContract()

  return (
    <>
      <Head><title>Commissioner — Seamheadz</title></Head>
      <div style={s.page}>

        <div style={s.header}>
          <div style={s.logo}>Seamhead<span style={{ color: '#16a34a' }}>z</span> <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>Commissioner</span></div>
          <Link href="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 8 }}>← League overview</Link>
        </div>

        {message && (
          <div style={s.message}>
            {message}
            <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}>×</button>
          </div>
        )}

        {/* Action selector */}
        {!action && (
          <div style={s.card}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111' }}>What would you like to do?</div>
            <div>
              <button style={s.actionBtn} onClick={() => setAction('drop')}>🗑 Drop a player</button>
              <button style={s.actionBtn} onClick={() => setAction('trade')}>🔄 Trade a contract</button>
              <button style={s.actionBtn} onClick={() => setAction('advance')}>📅 Advance contract year</button>
            </div>
          </div>
        )}

        {/* Drop a player */}
        {action === 'drop' && (
          <div style={s.card}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111' }}>🗑 Drop a contracted player</div>
            <label style={s.label}>Select team</label>
            <select style={s.select} value={selectedTeam} onChange={e => { setSelectedTeam(e.target.value); setSelectedContract('') }}>
              <option value="">— choose team —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTeam && (
              <>
                <label style={s.label}>Select player to drop</label>
                <select style={s.select} value={selectedContract} onChange={e => setSelectedContract(e.target.value)}>
                  <option value="">— choose player —</option>
                  {getTeamContracts(selectedTeam).map(c => (
                    <option key={c.id} value={c.id}>{c.player} (${getCurSalary(c)}/yr, {c.salaries.length - c.current_year + 1} yr remaining)</option>
                  ))}
                </select>
              </>
            )}
            {selectedContractObj && (
              <div style={{ background: '#fef2f2', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#dc2626' }}>
                ⚠ Dropping {selectedContractObj.player} will create ${selectedContractObj.salaries.slice(selectedContractObj.current_year - 1).reduce((s,v) => s+v, 0)} in dead money.
              </div>
            )}
            <button style={s.btnDanger} onClick={processDrop} disabled={!selectedContract || saving}>
              {saving ? 'Processing...' : 'Confirm drop'}
            </button>
            <button style={s.btn} onClick={() => { setAction(null); setSelectedTeam(''); setSelectedContract('') }}>Cancel</button>
          </div>
        )}

        {/* Trade a contract */}
        {action === 'trade' && (
          <div style={s.card}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111' }}>🔄 Trade a contracted player</div>
            <label style={s.label}>Select team trading away</label>
            <select style={s.select} value={selectedTeam} onChange={e => { setSelectedTeam(e.target.value); setSelectedContract(''); setTargetTeam('') }}>
              <option value="">— choose team —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTeam && (
              <>
                <label style={s.label}>Select player being traded</label>
                <select style={s.select} value={selectedContract} onChange={e => setSelectedContract(e.target.value)}>
                  <option value="">— choose player —</option>
                  {getTeamContracts(selectedTeam).map(c => (
                    <option key={c.id} value={c.id}>{c.player} (${getCurSalary(c)}/yr)</option>
                  ))}
                </select>
              </>
            )}
            {selectedContract && (
              <>
                <label style={s.label}>Trade to</label>
                <select style={s.select} value={targetTeam} onChange={e => setTargetTeam(e.target.value)}>
                  <option value="">— choose receiving team —</option>
                  {teams.filter(t => t.id !== parseInt(selectedTeam)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </>
            )}
            <button style={s.btnBlue} onClick={processTrade} disabled={!selectedContract || !targetTeam || saving}>
              {saving ? 'Processing...' : 'Confirm trade'}
            </button>
            <button style={s.btn} onClick={() => { setAction(null); setSelectedTeam(''); setSelectedContract(''); setTargetTeam('') }}>Cancel</button>
          </div>
        )}

        {/* Advance contract year */}
        {action === 'advance' && (
          <div style={s.card}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111' }}>📅 Advance contract year</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Use this at the end of season to move contracts to their next year, or expire them.</div>
            <label style={s.label}>Select team</label>
            <select style={s.select} value={selectedTeam} onChange={e => { setSelectedTeam(e.target.value); setSelectedContract('') }}>
              <option value="">— choose team —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTeam && (
              <>
                <label style={s.label}>Select player</label>
                <select style={s.select} value={selectedContract} onChange={e => setSelectedContract(e.target.value)}>
                  <option value="">— choose player —</option>
                  {getTeamContracts(selectedTeam).map(c => (
                    <option key={c.id} value={c.id}>{c.player} — currently Yr{c.current_year} of {c.salaries.length}</option>
                  ))}
                </select>
              </>
            )}
            {selectedContractObj && (
              <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#1d4ed8' }}>
                {selectedContractObj.current_year >= selectedContractObj.salaries.length
                  ? `${selectedContractObj.player}'s contract will expire and be removed.`
                  : `${selectedContractObj.player} will move to Yr${selectedContractObj.current_year + 1} at $${selectedContractObj.salaries[selectedContractObj.current_year]}.`
                }
              </div>
            )}
            <button style={s.btnPrimary} onClick={processAdvance} disabled={!selectedContract || saving}>
              {saving ? 'Processing...' : 'Confirm'}
            </button>
            <button style={s.btn} onClick={() => { setAction(null); setSelectedTeam(''); setSelectedContract('') }}>Cancel</button>
          </div>
        )}

        {/* Current contracts overview */}
        <div style={s.card}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#111' }}>All active contracts</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Team', 'Player', 'Yr', 'Current salary', 'Remaining'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '5px 8px', color: '#9ca3af', fontWeight: 400, borderBottom: '1px solid #f3f4f6', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => {
                const team = teams.find(t => t.id === c.team_id)
                const rem = c.salaries.length - c.current_year + 1
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '7px 8px', color: '#6b7280', fontSize: 12 }}>{team?.name}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 500, color: '#111' }}>{c.player}</td>
                    <td style={{ padding: '7px 8px', color: '#6b7280' }}>{c.current_year}/{c.salaries.length}</td>
                    <td style={{ padding: '7px 8px', color: '#16a34a', fontWeight: 600 }}>${getCurSalary(c)}</td>
                    <td style={{ padding: '7px 8px', color: '#6b7280' }}>{rem} yr{rem !== 1 ? 's' : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
