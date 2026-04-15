import React, { useState } from 'react';
import { SESSIONS, DAYS, DAY_LABELS, QUESTIONS, SCALE_LABELS, SHORT_ANSWERS } from '../config';
import { submitEval } from '../sheets';
import './EvalForm.css';

const today = () => new Date().toISOString().split('T')[0];

const initialState = {
  date:     today(),
  day:      '',
  session:  '',
  q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
  overall:  0,
  takeaway: '',
  apply:    '',
  improve:  '',
};

export default function EvalForm() {
  const [form,     setForm]   = useState(initialState);
  const [status,   setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // When day changes, clear session
  const handleDayChange = val => setForm(f => ({ ...f, day: val, session: '' }));

  const sessionsForDay = form.day
    ? SESSIONS.filter(s => s.day === Number(form.day))
    : [];

  const selectedSession = SESSIONS.find(s => s.id === form.session);

  const ratingComplete = QUESTIONS.every(q => form[q.id] > 0) && form.overall > 0;
  const canSubmit = form.day && form.session && ratingComplete;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    try {
      await submitEval({
        ...form,
        sessionLabel: selectedSession?.label || form.session,
        instructor:   selectedSession?.instructor || '',
      });
      setStatus('success');
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  if (status === 'success') return (
    <SuccessScreen onAnother={() => { setForm(initialState); setStatus('idle'); }} />
  );

  return (
    <div className="ef-root">
      <header className="ef-header">
        <div className="ef-header-badge">CAPT ACADEMY</div>
        <div>
          <h1 className="ef-title">Session Evaluation</h1>
          <p className="ef-subtitle">Your feedback shapes the quality of this program for every future class</p>
        </div>
      </header>

      <main className="ef-main">

        {/* Section 1 — Session info */}
        <section className="ef-section">
          <div className="ef-section-label">01 — Session info</div>

          <div className="ef-field">
            <label className="ef-label">Date</label>
            <input
              className="ef-input"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>

          <div className="ef-field">
            <label className="ef-label">Academy day <span className="ef-req">*</span></label>
            <select className="ef-input" value={form.day} onChange={e => handleDayChange(e.target.value)}>
              <option value="">Select day…</option>
              {DAYS.map(d => (
                <option key={d} value={d}>{DAY_LABELS[d]}</option>
              ))}
            </select>
          </div>

          {form.day && (
            <div className="ef-field">
              <label className="ef-label">Session <span className="ef-req">*</span></label>
              <select className="ef-input" value={form.session} onChange={e => set('session', e.target.value)}>
                <option value="">Select session…</option>
                {sessionsForDay.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {selectedSession?.instructor && (
            <div className="ef-instructor-badge">
              Presenter: <strong>{selectedSession.instructor}</strong>
            </div>
          )}
        </section>

        {/* Section 2 — Likert ratings */}
        <section className="ef-section">
          <div className="ef-section-label">02 — Rate each statement</div>
          <div className="ef-scale-legend">
            <span>1 = Strongly disagree</span>
            <span>5 = Strongly agree</span>
          </div>

          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="ef-question">
              <div className="ef-q-text">
                <span className="ef-q-num">{String(idx + 1).padStart(2, '0')}</span>
                {q.label}
              </div>
              <div className="ef-scale">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`ef-scale-btn ${form[q.id] === n ? 'ef-scale-btn--active' : ''}`}
                    onClick={() => set(q.id, n)}
                    title={SCALE_LABELS[n]}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Section 3 — Overall */}
        <section className="ef-section">
          <div className="ef-section-label">03 — Overall session rating</div>
          <div className="ef-overall">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`ef-overall-btn ${form.overall === n ? 'ef-overall-btn--active' : ''}`}
                onClick={() => set('overall', n)}
              >
                <span className="ef-overall-num">{n}</span>
                <span className="ef-overall-star">{'★'.repeat(n)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 4 — Short answers */}
        <section className="ef-section">
          <div className="ef-section-label">04 — Reflection</div>
          {SHORT_ANSWERS.map((sa, i) => (
            <div key={sa.id} className="ef-field">
              <label className="ef-label">
                {sa.label}
                {i < 2 && <span className="ef-req"> *</span>}
              </label>
              <textarea
                className="ef-textarea"
                placeholder={sa.placeholder}
                value={form[sa.id]}
                onChange={e => set(sa.id, e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </section>

        {status === 'error' && (
          <div className="ef-error">Submission failed: {errorMsg}. Check your connection and try again.</div>
        )}

        <button
          className={`ef-submit ${!canSubmit ? 'ef-submit--disabled' : ''} ${status === 'submitting' ? 'ef-submit--loading' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit || status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit evaluation'}
        </button>

        {!canSubmit && (
          <p className="ef-hint">Select a session and complete all ratings to submit.</p>
        )}
      </main>

      <footer className="ef-footer">
        Responses are anonymous · Used to improve the Captain's Academy program
      </footer>
    </div>
  );
}

function SuccessScreen({ onAnother }) {
  return (
    <div className="ef-root ef-success-root">
      <div className="ef-success">
        <div className="ef-success-icon">✓</div>
        <h2 className="ef-success-title">Evaluation submitted</h2>
        <p className="ef-success-body">
          Your feedback has been recorded. It goes directly toward improving
          the Captain's Academy for the next class.
        </p>
        <button className="ef-submit" onClick={onAnother}>Submit another</button>
      </div>
    </div>
  );
}
