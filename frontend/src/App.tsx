import { useEffect, useState } from 'react'
import { apiFetch } from './api/client'

type Standup = {
  id: number
  user: string
  update: string
  blockers: string
  date: string
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f8f9ff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    background: '#6366f1',
    padding: '1.25rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #eef0ff',
  },
  formTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e1b4b',
    marginBottom: '1rem',
    marginTop: 0,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '1rem',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fafafa',
  },
  submitBtn: {
    width: '100%',
    padding: '11px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '0.75rem',
    marginTop: '1.5rem',
  },
  standupCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef0ff',
  },
  standupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e1b4b',
    background: '#eef0ff',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  date: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  updateText: {
    fontSize: '14px',
    color: '#374151',
    margin: '6px 0',
    lineHeight: '1.5',
  },
  blockerTag: {
    display: 'inline-block',
    fontSize: '12px',
    color: '#dc2626',
    background: '#fef2f2',
    padding: '2px 10px',
    borderRadius: '20px',
    marginTop: '4px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #f3f4f6',
  },
  deleteBtn: {
    fontSize: '12px',
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#9ca3af',
    fontSize: '14px',
  },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '12px',
    padding: '3px 10px',
    borderRadius: '20px',
  }
}

function App() {
  const [standups, setStandups] = useState<Standup[]>([])
  const [form, setForm] = useState({ user: '', update: '', blockers: '' })
  const [loading, setLoading] = useState(false)

  const loadStandups = async () => {
    const res = await apiFetch<{ data: Standup[] }>('/standups')
    setStandups(res.data)
  }

  useEffect(() => { loadStandups() }, [])

  const handleSubmit = async () => {
    if (!form.user || !form.update) return
    setLoading(true)
    await apiFetch('/standups', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    setForm({ user: '', update: '', blockers: '' })
    await loadStandups()
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    await apiFetch(`/standups/${id}`, { method: 'DELETE' })
    await loadStandups()
  }

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>DevBoard 🚀</h1>
          <p style={{ ...styles.headerSub, margin: 0 }}>Async standup tracker</p>
        </div>
        <span style={styles.badge}>{standups.length} standups</span>
      </div>

      <div style={styles.container}>
        {/* Form */}
        <div style={styles.card}>
          <p style={styles.formTitle}>Post your standup</p>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              placeholder="Your name"
              value={form.user}
              onChange={e => setForm({ ...form, user: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="What did you work on today?"
              value={form.update}
              onChange={e => setForm({ ...form, update: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Any blockers? (optional)"
              value={form.blockers}
              onChange={e => setForm({ ...form, blockers: e.target.value })}
            />
          </div>
          <button
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Standup'}
          </button>
        </div>

        {/* Standup list */}
        <p style={styles.sectionTitle}>Recent standups</p>

        {standups.length === 0 ? (
          <div style={styles.emptyState}>
            No standups yet. Post your first one above!
          </div>
        ) : (
          standups.map(s => (
            <div key={s.id} style={styles.standupCard}>
              <div style={styles.standupHeader}>
                <span style={styles.userName}>{s.user}</span>
                <span style={styles.date}>{s.date}</span>
              </div>
              <p style={styles.updateText}>{s.update}</p>
              {s.blockers && s.blockers !== 'none' && (
                <span style={styles.blockerTag}>⚠️ {s.blockers}</span>
              )}
              <div style={styles.cardFooter}>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(s.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App