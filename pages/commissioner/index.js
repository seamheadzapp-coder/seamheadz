import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const COMMISSIONER_PASSWORD = 'seamheadz2026'
const LEAGUE_KEY = '469.l.26713'

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
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(false)
  const [yahooConnected, setYahooConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')

  useEffect(() => {
    if (authed) {
      loadData()
      // Check if coming back from Yahoo auth
      if (window.location.search.includes('yahoo=connected')) {
        setYahooConnected(true)
        loadTransactions()
      } else {
        loadTransactions()
      }
    }
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

  async function loadTransactions() {
    setTxLoading(true)
    try {
      const res = await fetch(`/api/yahoo/transactions?leagueKey=${LEAGUE_KEY}`)
      if (res.status === 401) {
        setYahooConnected(false)
        setTxLoading(false)
        return
      }
      const data = await res.json()
      setTransactions(data.transactions || [])
      setYahooConnected(true)
    } catch (e) {
      setYahooConnected(false)
    }
    setTxLoading(false)
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

  // Check if a player name matches any active contract
  function findContract(playerName) {
    if (!playerName) return null
    const clean = playerName.toLowerCase().replace(/[^a-z\s]/g, '').trim()
    return contracts.find(c => {
      const cName = c.player.toLowerCase().replace(/[^a-z\s]/g, '').trim()
      return cName === clean || cName.includes(clean) || clean.includes(cName)
    })
  }

  function formatDate(timestamp) {
    if (!timestamp) return ''
    const d = new Date(parseInt(timestamp) * 1000)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

    setMessage(`✓ Traded ${contract.player} from ${fromTeam.name} to ${toTeam.name}.`)
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
      setMessage(`✓ ${contract.player}'s contract expired and was removed.`)
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

  // Quick drop from transactions panel
  async function quickDrop(contract) {
    if (!confirm(`Drop ${contract.player}? This will create dead money.`)) return
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

    setMessage(`✓ Dropped ${contract.player}. $${deadAmount} dead money added to ${team.name}.`)
    setSaving(false)
    await loadData()
  }

  const s = {
    page: { maxWidth: 900, margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' },
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: 16 },
    label: { fontSize: 12, color: '#6b7280', marginBottom: 6, display: 'block' },
    select: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginBottom: 12, background: '#fff' },
    btn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnDanger: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnBlue: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 8 },
    btnSmall: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 500 },
    actionBtn: { padding: '12px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer', marginRight: 12, marginBottom: 12, fontWeight: 500 },
    message: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#15803d' },
    tab: (active) => ({ padding: '7px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: active ? '#f3f4f6' : '#fff', fontWeight: active ? 500 : 400, fontSize: 13, color: active ? '#111' : '#6b7280', cursor: 'pointer', marginRight: 8 }),
  }

  if (!authed) return (
    <>
      <Head><title>Commissioner — Seamheadz</title></Head>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '2rem', width: 320 }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Seamhead<span style={{ color: '#16a34a' }}>z</span></div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Commissioner access</div>
          <label style={s.label}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter password"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${passwordError ? '#dc2626' : '#d1d5db'}`, fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
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
          <div style={{ fontSize: 22, fontWeight: 600, color: '#111' }}>
            Seamhead<span style={{ color: '#16a34a' }}>z</span> <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>Commissioner</span>
          </div>
          <Link href="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 8 }}>← League overview</Link>
        </div>

        {message && (
          <div style={s.message}>
            {message}
            <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}>×</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ marginBottom: 16 }}>
          <button style={s.tab(activeTab === 'transactions')} onClick={() => setActiveTab('transactions')}>Yahoo transactions</button>
          <button style={s.tab(activeTab === 'tools')} onClick={() => setActiveTab('tools')}>Contract tools</button>
          <button style={s.tab(activeTab === 'all')} onClick={() => setActiveTab('all')}>All contracts</button>
        </div>

        {/* Yahoo Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Recent Yahoo transactions</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!yahooConnected && (
                  <a href="/api/auth/yahoo" style={{ ...s.btnBlue, textDecoration: 'none', display: 'inline-block' }}>Connect Yahoo</a>
                )}
                <button onClick={loadTransactions} style={s.btn}>↻ Refresh</button>
              </div>
            </div>

            {txLoading && <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 13 }}>Loading transactions...</div>}

            {!txLoading && !yahooConnected && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>Connect your Yahoo account to see recent transactions</div>
                <a href="/api/auth/yahoo" style={{ ...s.btnBlue, textDecoration: 'none', display: 'inline-block' }}>Connect Yahoo account</a>
              </div>
            )}

            {!txLoading && yahooConnected && transactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 13 }}>No recent transactions found.</div>
            )}

            {!txLoading && transactions.map(tx => {
              // Check if any player in this transaction has a contract
              const contractedPlayers = tx.players.map(p => ({
                ...p,
                contract: findContract(p.name)
              })).filter(p => p.contract)

              const hasContract = contractedPlayers.length > 0
              const isDrop = tx.type === 'drop' || tx.players.some(p => !p.type || p.type === 'drop')

              return (
                <div key={tx.id} style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                  background: hasContract ? '#fffbeb' : 'transparent',
                  margin: hasContract ? '0 -1.25rem',
                  padding: hasContract ? '12px 1.25rem' : '12px 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 4,
                          background: tx.type === 'trade' ? '#eff6ff' : tx.type === 'drop' ? '#fef2f2' : '#f0fdf4',
                          color: tx.type === 'trade' ? '#1d4ed8' : tx.type === 'drop' ? '#dc2626' : '#16a34a',
                        }}>{tx.type.toUpperCase()}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(tx.timestamp)}</span>
                        {hasContract && <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706', background: '#fffbeb', border: '1px solid #fcd34d', padding: '2px 7px', borderRadius: 4 }}>⚠ CONTRACT PLAYER</span>}
                      </div>
                      {tx.players.map((p, i) => (
                        <div key={i} style={{ fontSize: 13, color: '#111', marginBottom: 3 }}>
                          <span style={{ fontWeight: p.type === 'add' ? 600 : 400 }}>{p.name}</span>
                          {p.type === 'add' && p.destTeam && <span style={{ color: '#16a34a', fontSize: 12 }}> → {p.destTeam}</span>}
                          {(!p.type || p.type === 'drop') && <span style={{ color: '#dc2626', fontSize: 12 }}> dropped</span>}
                          {findContract(p.name) && (
                            <span style={{ fontSize: 11, color: '#d97706', marginLeft: 6 }}>
                              (contract: ${getCurSalary(findContract(p.name))}/yr)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {hasContract && (
                      <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {contractedPlayers.map((p, i) => (
                          <div key={i}>
                            {(tx.type === 'drop' || !p.type) && (
                              <button style={s.btnSmall} onClick={() => quickDrop(p.contract)} disabled={saving}>
                                Process drop
                              </button>
                            )}
                            {tx.type === 'trade' && (
                              <button style={{ ...s.btnSmall, background: '#2563eb' }}
                                onClick={() => { setActiveTab('tools'); setAction('trade'); }}>
                                Process trade
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Contract Tools Tab */}
        {activeTab === 'tools' && (
          <>
            {!action && (
              <div style={s.card}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111' }}>What would you like to do?</div>
                <button style={s.actionBtn} onClick={() => setAction('drop')}>🗑 Drop a player</button>
                <button style={s.actionBtn} onClick={() => setAction('trade')}>🔄 Trade a contract</button>
                <button style={s.actionBtn} onClick={() => setAction('advance')}>📅 Advance contract year</button>
              </div>
            )}

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
                    ⚠ Dropping {selectedContractObj.player} will create ${selectedContractObj.salaries.slice(selectedContractObj.current_year - 1).reduce((s, v) => s + v, 0)} in dead money.
                  </div>
                )}
                <button style={s.btnDanger} onClick={processDrop} disabled={!selectedContract || saving}>{saving ? 'Processing...' : 'Confirm drop'}</button>
                <button style={s.btn} onClick={() => { setAction(null); setSelectedTeam(''); setSelectedContract('') }}>Cancel</button>
              </div>
            )}

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
                <button style={s.btnBlue} onClick={processTrade} disabled={!selectedContract || !targetTeam || saving}>{saving ? 'Processing...' : 'Confirm trade'}</button>
                <button style={s.btn} onClick={() => { setAction(null); setSelectedTeam(''); setSelectedContract(''); setTargetTeam('') }}>Cancel</button>
              </div>
            )}

            {action === 'advance' && (
              <div style={s.card}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111' }}>📅 Advance contract year</div>
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
                        <option key={c.id} value={c.id}>{c.player} — Yr{c.current_year} of {c.salaries.length}</option>
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
                <button style={s.btnPrimary} onClick={processAdvance} disabled={!selectedContract || saving}>{saving ? 'Processing...' : 'Confirm'}</button>
                <button style={s.btn} onClick={() => { setAction(null); setSelectedTeam(''); setSelectedContract('') }}>Cancel</button>
              </div>
            )}
          </>
        )}

        {/* All Contracts Tab */}
        {activeTab === 'all' && (
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
        )}

      </div>
    </>
  )
}
