import React, { useState, useEffect, useMemo } from 'react';
import { QUESTIONS, SESSIONS, DAYS, DAY_LABELS, ADMIN_PASSWORD } from '../config';
import { fetchResponses } from '../sheets';
import './Admin.css';

const Q_KEYS = {
  q1: 'Q1_Objectives',
  q2: 'Q2_Relevance',
  q3: 'Q3_Presenter',
  q4: 'Q4_Confidence',
  q5: 'Q5_Recommend',
};

function toNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed,  setAuthed]  = useState(false);
  const [pw,      setPw]      = useState('');
  const [pwError, setPwError] = useState(false);

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); }
    else { setPwError(true); setTimeout(() => setPwError(false), 1200); }
  };

  if (!authed) return (
    <div className="ad-login">
      <div className="ad-login-box">
        <div className="ad-header-badge">CAPT ACADEMY · ADMIN</div>
        <h1 className="ad-login-title">Session eval dashboard</h1>
        <input
          className={`ad-input ${pwError ? 'ad-input--error' : ''}`}
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          autoFocus
        />
        <button className="ad-btn-primary" onClick={tryLogin}>Enter</button>
        {pwError && <p className="ad-error-msg">Incorrect password</p>}
      </div>
    </div>
  );

  return <Dashboard />;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [responses,   setResponses]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filterDay,   setFilterDay]   = useState('All');
  const [filterSession, setFilterSession] = useState('All');
  const [tab,         setTab]         = useState('overview');

  useEffect(() => {
    fetchResponses()
      .then(data => { setResponses(data); setLoading(false); })
      .catch(e   => { setError(e.message); setLoading(false); });
  }, []);

  // When day filter changes, reset session filter
  const handleDayFilter = val => { setFilterDay(val); setFilterSession('All'); };

  const sessionsForFilter = filterDay === 'All'
    ? SESSIONS
    : SESSIONS.filter(s => s.day === Number(filterDay));

  const filtered = useMemo(() => {
    return responses.filter(r => {
      const dayMatch     = filterDay     === 'All' || String(r['Day']) === String(filterDay);
      const sessionMatch = filterSession === 'All' || (r['Session'] === filterSession || r['sessionLabel'] === filterSession);
      return dayMatch && sessionMatch;
    });
  }, [responses, filterDay, filterSession]);

  const avgOf = (rows, key) => {
    const vals = rows.map(r => toNum(r[key])).filter(v => v > 0);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const overallAvg = avgOf(filtered, 'Overall');

  const sessionBreakdown = useMemo(() => {
    const map = {};
    responses.forEach(r => {
      const s = r['sessionLabel'] || r['Session'] || 'Unknown';
      if (!map[s]) map[s] = { count: 0, total: 0, n: 0, day: r['Day'] };
      map[s].count++;
      const ov = toNum(r['Overall']);
      if (ov > 0) { map[s].total += ov; map[s].n++; }
    });
    return Object.entries(map).map(([session, d]) => ({
      session,
      day:   d.day,
      count: d.count,
      avg:   d.n ? (d.total / d.n).toFixed(1) : '—',
    })).sort((a, b) => Number(a.day) - Number(b.day));
  }, [responses]);

  const takeaways = filtered.filter(r => r['Takeaway'] && r['Takeaway'].toString().trim());
  const applies   = filtered.filter(r => r['Apply']    && r['Apply'].toString().trim());
  const improves  = filtered.filter(r => r['Improve']  && r['Improve'].toString().trim());

  if (loading) return (
    <div className="ad-loading"><div className="ad-spinner" /><span>Loading from Google Sheets…</span></div>
  );
  if (error) return <div className="ad-error">Error: {error}</div>;
  if (!responses.length) return (
    <div className="ad-loading"><span>No responses yet. Submit the form to see data here.</span></div>
  );

  return (
    <div className="ad-root">
      <header className="ad-header">
        <div>
          <div className="ad-header-badge">CAPT ACADEMY · ADMIN</div>
          <h1 className="ad-title">Session eval dashboard</h1>
          <p className="ad-subtitle">{responses.length} total responses · {filtered.length} shown</p>
        </div>
        <div className="ad-filters">
          <select className="ad-filter" value={filterDay} onChange={e => handleDayFilter(e.target.value)}>
            <option value="All">All days</option>
            {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
          </select>
          <select className="ad-filter" value={filterSession} onChange={e => setFilterSession(e.target.value)}>
            <option value="All">All sessions</option>
            {sessionsForFilter.map(s => (
              <option key={s.id} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="ad-tabs">
        {['overview', 'responses', 'reflection'].map(t => (
          <button
            key={t}
            className={`ad-tab ${tab === t ? 'ad-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview'   ? 'Overview' :
             t === 'responses'  ? `Responses (${filtered.length})` :
                                  'Reflection'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="ad-kpi-row">
            <KPI label="Overall avg"      value={overallAvg ? `${overallAvg}/5` : '—'} highlight />
            <KPI label="Total responses"  value={responses.length} />
            <KPI label="Sessions covered" value={sessionBreakdown.length} />
            <KPI label="With reflection"  value={takeaways.length} />
          </div>

          <section className="ad-section">
            <div className="ad-section-label">Question averages</div>
            <div className="ad-q-list">
              {QUESTIONS.map((q, i) => {
                const a   = toNum(avgOf(filtered, Q_KEYS[q.id]));
                const pct = (a / 5) * 100;
                return (
                  <div key={q.id} className="ad-q-row">
                    <span className="ad-q-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ad-q-label">{q.short}</span>
                    <div className="ad-bar-track">
                      <div className="ad-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="ad-q-score">{a ? a.toFixed(1) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="ad-section">
            <div className="ad-section-label">By session</div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Session</th>
                    <th>Responses</th>
                    <th>Overall avg</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionBreakdown.map(row => (
                    <tr key={row.session}>
                      <td className="ad-mono">Day {row.day}</td>
                      <td>{row.session}</td>
                      <td>{row.count}</td>
                      <td>
                        <span className={`ad-score-badge ${toNum(row.avg) >= 4 ? 'ad-score-badge--good' : toNum(row.avg) >= 3 ? 'ad-score-badge--mid' : 'ad-score-badge--low'}`}>
                          {row.avg}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {improves.length > 0 && (
            <section className="ad-section">
              <div className="ad-section-label">Improvement suggestions ({improves.length})</div>
              <div className="ad-comments">
                {improves.slice(0, 10).map((r, i) => (
                  <div key={i} className="ad-comment">
                    <div className="ad-comment-meta">
                      {r['sessionLabel'] || r['Session']} · Day {r['Day']} · {r['Date'] || '—'}
                    </div>
                    <div className="ad-comment-text">"{r['Improve']}"</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── RESPONSES ── */}
      {tab === 'responses' && (
        <section className="ad-section">
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--responses">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Session</th>
                  <th>Overall</th>
                  {QUESTIONS.map((q, i) => <th key={q.id}>Q{i + 1}</th>)}
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map((r, i) => (
                  <tr key={i}>
                    <td className="ad-mono">{r['Date'] || '—'}</td>
                    <td className="ad-mono">Day {r['Day']}</td>
                    <td>{r['sessionLabel'] || r['Session'] || '—'}</td>
                    <td>
                      <span className={`ad-score-badge ${toNum(r['Overall']) >= 4 ? 'ad-score-badge--good' : toNum(r['Overall']) >= 3 ? 'ad-score-badge--mid' : 'ad-score-badge--low'}`}>
                        {r['Overall'] || '—'}
                      </span>
                    </td>
                    {QUESTIONS.map(q => (
                      <td key={q.id} className="ad-mono">{r[Q_KEYS[q.id]] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── REFLECTION ── */}
      {tab === 'reflection' && (
        <>
          {takeaways.length > 0 && (
            <section className="ad-section">
              <div className="ad-section-label">Biggest takeaways ({takeaways.length})</div>
              <div className="ad-comments">
                {takeaways.map((r, i) => (
                  <div key={i} className="ad-comment ad-comment--blue">
                    <div className="ad-comment-meta">
                      {r['sessionLabel'] || r['Session']} · Day {r['Day']}
                    </div>
                    <div className="ad-comment-text">"{r['Takeaway']}"</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {applies.length > 0 && (
            <section className="ad-section">
              <div className="ad-section-label">How they'll apply it ({applies.length})</div>
              <div className="ad-comments">
                {applies.map((r, i) => (
                  <div key={i} className="ad-comment ad-comment--green">
                    <div className="ad-comment-meta">
                      {r['sessionLabel'] || r['Session']} · Day {r['Day']}
                    </div>
                    <div className="ad-comment-text">"{r['Apply']}"</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {improves.length > 0 && (
            <section className="ad-section">
              <div className="ad-section-label">Improvement suggestions ({improves.length})</div>
              <div className="ad-comments">
                {improves.map((r, i) => (
                  <div key={i} className="ad-comment">
                    <div className="ad-comment-meta">
                      {r['sessionLabel'] || r['Session']} · Day {r['Day']}
                    </div>
                    <div className="ad-comment-text">"{r['Improve']}"</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {takeaways.length === 0 && applies.length === 0 && improves.length === 0 && (
            <div className="ad-loading"><span>No reflection responses yet.</span></div>
          )}
        </>
      )}
    </div>
  );
}

function KPI({ label, value, highlight }) {
  return (
    <div className={`ad-kpi ${highlight ? 'ad-kpi--highlight' : ''}`}>
      <div className="ad-kpi-value">{value}</div>
      <div className="ad-kpi-label">{label}</div>
    </div>
  );
}
