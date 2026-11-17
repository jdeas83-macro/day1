(() => {
const $=id=>document.getElementById(id), S=TrainingStore, esc=S.escape;
let entries, editing=null;
const fields=['cardioDate','activity','duration','burned','distance','cardioNotes'];
function status(text){$('cardioStatus').textContent=text;}
try{entries=S.read('cardio',[]);}catch{status('Saved cardio data could not be read. Logging is disabled to protect it.');$('saveCardio').disabled=true;return;}
function reset(){ $('cardioForm').reset();$('cardioDate').value=S.today();editing=null;$('cardioFormTitle').textContent='Log an activity';$('saveCardio').textContent='Save cardio';$('cancelCardio').hidden=true; }
function draft(){return Object.fromEntries(fields.map(id=>[id,$(id).value]));}
function saveDraft(){try{S.write('cardioDraft',{...draft(),editing});status('Draft saved on this device.');}catch{status('Draft could not be saved. Keep this page open.');}}
function render(){
 const today=entries.filter(x=>x.date===S.today());
 $('cardioCalories').textContent=today.reduce((n,x)=>n+x.calories,0).toLocaleString('en-AU');
 $('cardioMinutes').textContent=Number(today.reduce((n,x)=>n+x.minutes,0).toFixed(1));
 $('cardioHistory').innerHTML=entries.length?[...entries].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt)).map(x=>`<article class="history-item"><h3>${esc(x.activity)} · ${esc(S.date(x.date))}</h3><p>${x.minutes} min · ${x.calories} kcal${x.distance!==null?' · '+x.distance+' km':''}</p><p class="notes">${esc(x.notes)}</p><div class="two-col"><button class="secondary" data-edit="${esc(x.id)}">Edit</button><button class="secondary" data-delete="${esc(x.id)}">Delete</button></div></article>`).join(''):'<p class="muted">Your cardio sessions will appear here.</p>';
}
reset();
try { const saved=S.read('cardioDraft',{}); if(saved.cardioDate){fields.forEach(id=>$(id).value=saved[id]??'');editing=entries.some(x=>x.id===saved.editing)?saved.editing:null;if(editing){$('cardioFormTitle').textContent='Edit activity';$('saveCardio').textContent='Save changes';$('cancelCardio').hidden=false;}status('Draft restored.');}}catch{status('Cardio draft could not be restored.');}
$('cardioForm').addEventListener('input',saveDraft);
$('cardioForm').addEventListener('submit',event=>{
 event.preventDefault();const minutes=+$('duration').value,calories=+$('burned').value,distance=$('distance').value===''?null:+$('distance').value;
 if(!Number.isFinite(minutes)||minutes<=0||!Number.isInteger(calories)||calories<0||(distance!==null&&(!Number.isFinite(distance)||distance<0))){status('Check your minutes, calories and distance.');return;}
 const item={id:editing||S.id(),createdAt:entries.find(x=>x.id===editing)?.createdAt||new Date().toISOString(),date:$('cardioDate').value,activity:$('activity').value,minutes,calories,distance,notes:$('cardioNotes').value};
 const next=editing?entries.map(x=>x.id===editing?item:x):[...entries,item];
 try{S.write('cardio',next);entries=next;}catch{status('Activity could not be saved. Keep this page open and try again.');return;}
 try{S.write('cardioDraft',{});}catch{render();status('Activity saved, but draft cleanup failed. Reload before logging another activity.');$('saveCardio').disabled=true;return;}
 reset();render();status('Cardio saved.');
});
$('cancelCardio').addEventListener('click',()=>{reset();saveDraft();status('Edit cancelled.');});
$('cardioHistory').addEventListener('click',event=>{
 const id=event.target.dataset.edit||event.target.dataset.delete;if(!id)return;
 if(event.target.dataset.delete){if(!confirm('Delete this cardio session?'))return;const next=entries.filter(x=>x.id!==id);try{S.write('cardio',next);entries=next;if(editing===id){reset();saveDraft();}render();}catch{status('Activity could not be deleted.');}return;}
 const x=entries.find(x=>x.id===id);editing=id;
 const values=[x.date,x.activity,x.minutes,x.calories,x.distance??'',x.notes];fields.forEach((id,i)=>$(id).value=values[i]);
 $('cardioFormTitle').textContent='Edit activity';$('saveCardio').textContent='Save changes';$('cancelCardio').hidden=false;saveDraft();$('cardioForm').scrollIntoView({behavior:'smooth'});
});
render();
})();
