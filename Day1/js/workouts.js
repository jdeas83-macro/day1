(() => {
const routines = {
 push: ['Bench press','Incline dumbbell press','Shoulder press','Cable fly','Triceps pushdown','Overhead triceps extension'],
 pull: ['Lat pulldown','Bent-over row','Seated cable row','Face pull','Barbell curl','Hammer curl'],
 legs: ['Squat','Deadlift','Leg press','Leg extension','Lying leg curl','Standing calf raise']
};
const $ = id => document.getElementById(id), S = TrainingStore, esc = S.escape;
let history, drafts;
function status(text) { $('workoutStatus').textContent=text; }
try { history=S.read('workouts',[]); drafts=S.read('drafts',{}); }
catch { status('Saved workout data could not be read. Logging is disabled to protect it.'); $('workoutForm').hidden=true; return; }
function blank() { return {date:S.today(),notes:'',sets:routines[$('routine').value].map(() => Array.from({length:3},()=>({weight:'',reps:''})))}; }
function collect() {
 return {date:$('workoutDate').value,notes:$('workoutNotes').value,sets:routines[$('routine').value].map((_,i)=>Array.from({length:3},(_,j)=>({weight:$(`w-${i}-${j}`).value,reps:$(`r-${i}-${j}`).value})))};
}
function saveDraft() {
 drafts[$('routine').value]=collect();
 try { S.write('drafts',drafts); status('Draft saved on this device.'); return true; }
 catch { status('Unable to save. Device storage may be full or unavailable. Keep this page open.'); return false; }
}
function render() {
 const key=$('routine').value, draft=drafts[key] || blank();
 const last=history.filter(x=>x.routine===key).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt))[0];
 $('workoutDate').value=draft.date; $('workoutNotes').value=draft.notes;
 $('exercises').innerHTML=routines[key].map((name,i)=>`<section class="card exercise"><h2>${name}</h2><p class="muted helper">${last ? 'Previous ('+esc(S.date(last.date))+'): '+last.exercises[i].sets.map((s,j)=>'Set '+(j+1)+': '+(s.reps===''?'—':esc(s.weight)+' kg × '+esc(s.reps))).join(' · ') : 'Your first session. Start with a weight you can control.'}</p><div class="set-grid"><span>Set</span><span>Weight (kg)</span><span>Reps</span>${[0,1,2].map(j=>`<label for="r-${i}-${j}">${j+1}</label><input aria-label="${name}, set ${j+1}, weight in kg" id="w-${i}-${j}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="kg" value="${esc(draft.sets[i][j].weight)}"><input aria-label="${name}, set ${j+1}, reps" id="r-${i}-${j}" type="number" inputmode="numeric" min="1" step="1" placeholder="reps" value="${esc(draft.sets[i][j].reps)}">`).join('')}</div></section>`).join('');
 status(drafts[key]?'Draft restored.':'Ready for a new session.');
}
function renderHistory() {
 $('workoutHistory').innerHTML=history.length ? [...history].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt)).map(x=>`<details class="history-item"><summary>${esc(S.date(x.date))} · ${esc(x.routine.toUpperCase())} · ${x.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.reps!=='').length,0)} sets</summary>${x.exercises.map(e=>`<p><b>${esc(e.name)}</b><br>${e.sets.map((s,j)=>'Set '+(j+1)+': '+(s.reps===''?'—':esc(s.weight)+' kg × '+esc(s.reps))).join(' · ')}</p>`).join('')}<p class="notes">${esc(x.notes)}</p><button type="button" class="secondary" data-delete="${esc(x.id)}">Delete session</button></details>`).join('') : '<p class="muted">Your completed workouts will appear here.</p>';
}
$('routine').addEventListener('change',render);
$('workoutForm').addEventListener('input',saveDraft);
$('workoutDate').addEventListener('input',saveDraft);
$('discardWorkout').addEventListener('click',()=>{
 if(!confirm('Discard this training day’s draft?'))return;
 const next={...drafts}; delete next[$('routine').value];
 try { S.write('drafts',next); drafts=next; render(); }catch {status('Draft could not be discarded.');}
});
$('workoutForm').addEventListener('submit',event=>{
 event.preventDefault(); if(!$('workoutDate').reportValidity())return;
 const draft=collect(); let count=0;
 for(const exercise of draft.sets)for(const set of exercise){
  if(set.weight==='' && set.reps==='')continue;
  if(set.weight==='' || set.reps===''){status('Enter both weight and reps for each started set, or leave both blank.');return;}
  if(!Number.isFinite(+set.weight)||+set.weight<0||!Number.isInteger(+set.reps)||+set.reps<1){status('Use a non-negative weight and a whole number of reps greater than zero.');return;} count++;
 }
 if(!count){status('Record at least one set before finishing.');return;}
 const item={id:S.id(),createdAt:new Date().toISOString(),date:draft.date,routine:$('routine').value,notes:draft.notes,exercises:routines[$('routine').value].map((name,i)=>({name,sets:draft.sets[i]}))};
 const next=[...history,item];
 try { S.write('workouts',next); history=next; }catch {status('Workout could not be saved. Your draft is still available.');return;}
 delete drafts[$('routine').value];
 try {S.write('drafts',drafts);}catch{renderHistory();status('Workout saved, but draft cleanup failed. Do not finish it again.');$('workoutForm').hidden=true;return;}
 render();renderHistory();status('Workout saved to history.');
});
$('workoutHistory').addEventListener('click',event=>{
 const id=event.target.dataset.delete; if(!id||!confirm('Delete this saved session?'))return;
 const next=history.filter(x=>x.id!==id);
 try {S.write('workouts',next);history=next;renderHistory();}catch{status('Session could not be deleted.');}
});
render();renderHistory();
})();
