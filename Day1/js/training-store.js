/* Separate keys preserve existing MacroTrack nutrition data. */
const TrainingStore = (() => {
  const keys = {workouts:'day1_workouts_v1', drafts:'day1_workout_drafts_v1', cardio:'day1_cardio_v1', cardioDraft:'day1_cardio_draft_v1'};
  function read(type, fallback) {
    const raw = localStorage.getItem(keys[type]);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (value === null || typeof value !== 'object' || Array.isArray(value) !== Array.isArray(fallback)) throw new Error('Stored data needs recovery');
    return value;
  }
  function write(type, value) { localStorage.setItem(keys[type], JSON.stringify(value)); }
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function id() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  function escape(value) { const el = document.createElement('span'); el.textContent = String(value ?? ''); return el.innerHTML; }
  function date(value) { return new Date(value+'T12:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}); }
  return {read, write, today, id, escape, date};
})();
