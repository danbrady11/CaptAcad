const SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;

export async function submitEval(formData) {
  if (!SCRIPT_URL || SCRIPT_URL === 'your_apps_script_web_app_url_here') {
    console.log('[DEV] CaptAcad eval submission:', formData);
    await new Promise(r => setTimeout(r, 800));
    return { success: true, dev: true };
  }
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(formData),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.result !== 'success') throw new Error(json.error || 'Unknown error');
  return { success: true };
}

export async function fetchResponses() {
  if (!SCRIPT_URL || SCRIPT_URL === 'your_apps_script_web_app_url_here') {
    return getMockData();
  }
  const res = await fetch(`${SCRIPT_URL}?action=get`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

function getMockData() {
  const sessions = [
    'Duty to Act / Report, MP308',
    'Disciplinary Process, PAFs',
    'Ethical Decision Making & Current Trends',
    'Leading the Fire Company',
    'Peer Support',
    'Management Perspective',
  ];
  const data = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - i * 2 * 24 * 60 * 60 * 1000);
    data.push({
      Timestamp:    d.toISOString(),
      Date:         d.toISOString().split('T')[0],
      Session:      sessions[i % sessions.length],
      Day:          String((i % 4) + 1),
      Q1_Objectives: Math.floor(Math.random() * 2) + 4,
      Q2_Relevance:  Math.floor(Math.random() * 2) + 3,
      Q3_Presenter:  Math.floor(Math.random() * 2) + 4,
      Q4_Confidence: Math.floor(Math.random() * 2) + 3,
      Q5_Recommend:  Math.floor(Math.random() * 2) + 4,
      Overall:       Math.floor(Math.random() * 2) + 4,
      Takeaway:      i % 3 === 0 ? 'Importance of documentation before discipline conversations.' : '',
      Apply:         i % 3 === 0 ? 'Will brief my crew on MP308 at next shift briefing.' : '',
      Improve:       i % 5 === 0 ? 'More scenario-based examples would help.' : '',
    });
  }
  return data;
}
