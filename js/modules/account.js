window.accounts = JSON.parse(localStorage.getItem('farm_accounts') || '[]');

function isTimeDanger(targetTime, targetTs) {
  if (!targetTime) return false;
  const now = new Date();
  if (targetTs) {
    const diffMins = (targetTs - now.getTime()) / 60000;
    return diffMins >= -60 && diffMins <= 30;
  }
  const [h, m] = targetTime.split(':').map(Number);
  let diff = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
  if (diff < -720) diff += 1440; 
  if (diff > 720) diff -= 1440;  
  return diff >= -60 && diff <= 30;
}

window.lpTimer = null;
window.lpFired = false; 

function startTouch(e, index, field) {
  window.lpFired = false; 
  window.lpTimer = setTimeout(() => {
    window.lpFired = true; 
    if (field === 'blessing') {
      window.accounts[index].blessing = 0;
      saveAccs();
      if (e && e.target) { e.target.value = 0; e.target.blur(); }
      const row = document.getElementById('accountListBody').children[index];
      if (row) {
        const isDone = window.accounts[index].taskDone && (parseInt(window.accounts[index].blessing) === 0);
        if (isDone) row.classList.add('name-completed');
        else row.classList.remove('name-completed');
      }
      if (navigator.vibrate) navigator.vibrate(50); 
    }
  }, 600);
}

function cancelTouch() {
  if (window.lpTimer) { clearTimeout(window.lpTimer); window.lpTimer = null; }
}

function preventClickIfLongPress(e) {
  if (window.lpFired) { e.preventDefault(); e.stopPropagation(); return false; }
}

function updateSyncDropdowns() {
  const selects = document.querySelectorAll('.acc-sync-select');
  const optionsHtml = '<option value="">选择账号进行同步...</option>' + window.accounts.map(a => `<option value="${a.id}">${a.name || '未命名'}</option>`).join('');
  selects.forEach(s => { const oldVal = s.value; s.innerHTML = optionsHtml; s.value = oldVal; });
}

function renderAccountManager() {
  const listBody = document.getElementById('accountListBody');
  if (!listBody) return;
  document.getElementById('accountCount').innerText = `${window.accounts.length} Accounts`;
  listBody.innerHTML = '';
  updateSyncDropdowns();
  window.accounts.forEach((acc, index) => {
    const isDone = acc.taskDone && (parseInt(acc.blessing) === 0);
    const row = document.createElement('div');
    row.className = `acc-tr ${isDone ? 'name-completed' : ''}`;
    row.innerHTML = `
  <div class="acc-td"><input value="${acc.area || ''}" oninput="updateAccField(${index}, 'area', this.value)" placeholder="-"></div>
  <div class="acc-td name-td"><input class="name-input" value="${acc.name || ''}" oninput="updateAccField(${index}, 'name', this.value)" placeholder="未命名"></div>
  <div class="acc-td">
    <input type="number" style="color:#07c160;font-weight:bold" value="${acc.blessing}" 
      oninput="updateAccField(${index}, 'blessing', this.value)" 
      ontouchstart="startTouch(event, ${index}, 'blessing')" 
      ontouchmove="cancelTouch()" ontouchend="cancelTouch()" 
      onmousedown="startTouch(event, ${index}, 'blessing')" 
      onmouseup="cancelTouch()" onmouseleave="cancelTouch()" 
      onclick="return preventClickIfLongPress(event)" oncontextmenu="return false;">
  </div>
  <div class="acc-td"><div class="custom-cb ${acc.taskDone ? 'checked' : ''}" onclick="toggleAccTask(${index})">✓</div></div>
  <div class="acc-td fruit-td ${acc.fruit ? 'has-fruit' : ''}">
    <input value="${acc.fruit || ''}" oninput="updateAccField(${index}, 'fruit', this.value)" placeholder="作物">
  </div>
  <div class="acc-td" style="position: relative; width: 100%; height: 100%;">
    <div class="time-display ${isTimeDanger(acc.water1, acc.water1_ts) ? 'danger' : ''}">${acc.water1 || '--:--'}</div>
    <input type="time" class="acc-time-overlay" value="${acc.water1 || ''}" oninput="updateAccField(${index}, 'water1', this.value, this)">
    ${acc.water1 ? `<div class="invisible-clear-layer" onclick="updateAccField(${index}, 'water1', ''); event.stopPropagation();"></div>` : ''}
  </div>
  <div class="acc-td" style="position: relative; width: 100%; height: 100%;">
    <div class="time-display ${isTimeDanger(acc.water2, acc.water2_ts) ? 'danger' : ''}">${acc.water2 || '--:--'}</div>
    <input type="time" class="acc-time-overlay" value="${acc.water2 || ''}" oninput="updateAccField(${index}, 'water2', this.value, this)">
    ${acc.water2 ? `<div class="invisible-clear-layer" onclick="updateAccField(${index}, 'water2', ''); event.stopPropagation();"></div>` : ''}
  </div>
  <div class="acc-td" style="position: relative; width: 100%; height: 100%;">
    <div class="time-display ${isTimeDanger(acc.harvest, acc.harvest_ts) ? 'danger' : ''}">${acc.harvest || '--:--'}</div>
    <input type="time" class="acc-time-overlay" value="${acc.harvest || ''}" oninput="updateAccField(${index}, 'harvest', this.value, this)">
    ${acc.harvest ? `<div class="invisible-clear-layer" onclick="updateAccField(${index}, 'harvest', ''); event.stopPropagation();"></div>` : ''}
  </div>
  <div class="acc-td"><button class="small-btn" onclick="resetAccRow(${index})">↺</button></div>
  <div class="acc-td" style="flex-direction:column;gap:2px"><button class="small-btn" style="height:15px;font-size:8px" onclick="moveAcc(${index},-1)">▲</button><button class="small-btn" style="height:15px;font-size:8px" onclick="moveAcc(${index},1)">▼</button></div>
  <div class="acc-td"><button class="small-btn" style="color:red" onclick="deleteAcc(${index})">✕</button></div>
`;
    listBody.appendChild(row);
  });
}

function syncTimelineToAccount() {
  const accId = document.getElementById('timelineSyncSelect').value;
  if (!accId || !window.currentTimelineData) return; 
  const acc = window.accounts.find(a => a.id == accId);
  const d = window.currentTimelineData;
  const parseTs = (str) => {
    if (!str) return null;
    const match = str.match(/(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
    if (!match) return null;
    const now = new Date();
    return new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]), parseInt(match[3]), parseInt(match[4])).getTime();
  };
  acc.water1 = d.t2 ? d.t2.split(' ')[1] : ''; acc.water1_ts = parseTs(d.t2);
  acc.water2 = d.t3 ? d.t3.split(' ')[1] : ''; acc.water2_ts = parseTs(d.t3);
  acc.harvest = d.t4 ? d.t4.split(' ')[1] : ''; acc.harvest_ts = parseTs(d.t4);
  saveAccs(); renderAccountManager();
  document.getElementById('timelineSyncSelect').value = "";
}

function syncCalcToAccount() {
  const accId = document.getElementById('calcSyncSelect').value;
  if (!accId || !window.currentHarvestData) return; 
  const acc = window.accounts.find(a => a.id == accId);
  const times = window.currentHarvestData.match(/(\d{2}:\d{2})/g);
  if (times && times.length > 0) {
    acc.harvest = times[times.length - 1] || '';
    acc.water2 = times.length >= 2 ? times[times.length - 2] : '';
    acc.water1 = times.length >= 3 ? times[times.length - 3] : '';
    if (acc.harvest) {
      const [h, m] = acc.harvest.split(':');
      const target = new Date();
      target.setHours(parseInt(h), parseInt(m), 0, 0);
      if (window.currentHarvestData.includes("明天")) target.setDate(target.getDate() + 1);
      acc.harvest_ts = target.getTime();
    }
    acc.water1_ts = null; acc.water2_ts = null;
    saveAccs(); renderAccountManager();
    document.getElementById('calcSyncSelect').value = "";
  }
}

function addNewAccount() { window.accounts.push({ id: Date.now(), name: '', area: '', blessing: 10, taskDone: false, fruit: '', water1: '', water2: '', harvest: '' }); saveAccs(); renderAccountManager(); }
function deleteAcc(i) { if (confirm("确定删除？")) { window.accounts.splice(i, 1); saveAccs(); renderAccountManager(); } }

function updateAccField(i, f, v, el) {
  window.accounts[i][f] = v;
  if (f.startsWith('water') || f === 'harvest') {
    window.accounts[i][f + '_ts'] = null;
    saveAccs();
    if (el) {
      const td = el.parentElement;
      const displayDiv = td.querySelector('.time-display');
      if (displayDiv) displayDiv.innerText = v || '--:--';
      let layer = td.querySelector('.invisible-clear-layer');
      if (v && !layer) {
        td.insertAdjacentHTML('beforeend', `<div class="invisible-clear-layer" onclick="updateAccField(${i}, '${f}', ''); event.stopPropagation();"></div>`);
      } else if (!v && layer) { layer.remove(); }
    } else { renderAccountManager(); }
    return;
  }
  saveAccs();
  const row = document.getElementById('accountListBody').children[i];
  if (!row) return;
  if (f === 'name') updateSyncDropdowns();
  if (f === 'blessing') {
    const isDone = window.accounts[i].taskDone && (parseInt(window.accounts[i].blessing) === 0);
    if (isDone) row.classList.add('name-completed');
    else row.classList.remove('name-completed');
  }
  if (f === 'fruit') {
    const fruitTd = row.querySelector('.fruit-td');
    if (v.trim() !== '') fruitTd.classList.add('has-fruit');
    else fruitTd.classList.remove('has-fruit');
  }
}

function toggleAccTask(i) { window.accounts[i].taskDone = !window.accounts[i].taskDone; saveAccs(); renderAccountManager(); }
function resetDailyAll() { window.accounts.forEach(a => { a.blessing = 10; a.taskDone = false }); saveAccs(); renderAccountManager(); }
function resetAccRow(i) { window.accounts[i].water1 = ''; window.accounts[i].water2 = ''; window.accounts[i].harvest = ''; saveAccs(); renderAccountManager(); }
function moveAcc(i, d) { const t = i + d; if (t >= 0 && t < window.accounts.length) { [window.accounts[i], window.accounts[t]] = [window.accounts[t], window.accounts[i]]; saveAccs(); renderAccountManager(); } }
function saveAccs() { localStorage.setItem('farm_accounts', JSON.stringify(window.accounts)); }

function exportToCSV() {
  if (window.accounts.length === 0) return alert("当前没有账号数据可导出！");
  let csvContent = "\uFEFF大区,名字,祝福,任务(完成填1否则填0),作物,水1,水2,收获\n";
  window.accounts.forEach(a => {
    let row = [
      a.area || '', a.name || '', a.blessing || 0, 
      a.taskDone ? '1' : '0', a.fruit || '', 
      a.water1 || '', a.water2 || '', a.harvest || ''
    ];
    csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `农场账号备份_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function parseCSVRow(str) {
  const result = []; let current = '', inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < str.length && str[i + 1] === '"') { current += '"'; i++; } 
        else { inQuotes = false; }
      } else { current += char; }
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { result.push(current); current = ''; } 
      else current += char;
    }
  }
  result.push(current);
  return result;
}

function importFromCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length <= 1) { event.target.value = ''; return alert("❌ 文件为空或格式不正确！"); }
    const newAccs = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      if (row.length < 8) continue; 
      newAccs.push({
        id: Date.now() + i, 
        area: row[0].trim(), name: row[1].trim(), blessing: parseInt(row[2]) || 0,
        taskDone: row[3].trim() === '1', fruit: row[4].trim(),
        water1: row[5].trim(), water2: row[6].trim(), harvest: row[7].trim(),
        water1_ts: null, water2_ts: null, harvest_ts: null 
      });
    }
    if (newAccs.length > 0) {
      if (confirm(`📦 成功解析到 ${newAccs.length} 个账号！\n\n⚠️ 警告：导入将【完全覆盖】当前设备的所有账号数据。\n\n是否继续？`)) {
        window.accounts = newAccs; saveAccs(); updateSyncDropdowns(); renderAccountManager(); alert("✅ 数据迁移导入成功！");
      }
    } else { alert("❌ 没有读取到有效数据，请确保文件格式正确。"); }
    event.target.value = ''; 
  };
  reader.readAsText(file, 'UTF-8');
}

// 暴露给 HTML 调用
Object.assign(window, {
  addNewAccount, deleteAcc, updateAccField, toggleAccTask,
  resetDailyAll, resetAccRow, moveAcc, syncTimelineToAccount, syncCalcToAccount,
  startTouch, cancelTouch, preventClickIfLongPress,
  exportToCSV, importFromCSV
});