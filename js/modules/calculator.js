function setCalcDurationWeb(h, btnElement) {
    document.getElementById("t_h").value = h;
    const tmInput = document.getElementById("t_m");
    if (tmInput) tmInput.value = 0;
    const btns = document.getElementById("calcBtnGroup").querySelectorAll(".time-btn");
    btns.forEach((btn) => btn.classList.remove("active"));
    btnElement.classList.add("active");
    calculate();
  }
  
  function clearCalcActiveBtn() {
    const btns = document.getElementById("calcBtnGroup").querySelectorAll(".time-btn");
    btns.forEach((btn) => btn.classList.remove("active"));
  }
  
  function calculate() {
    document.getElementById("saveHarvestContainer").style.display = "none";
    window.currentHarvestData = null;
    const th = parseInt(document.getElementById("t_h").value) || 0;
    const tmInput = document.getElementById("t_m");
    const tm = tmInput ? parseInt(tmInput.value) || 0 : 0;
    const rh = parseInt(document.getElementById("r_h").value) || 0;
    const rm = parseInt(document.getElementById("r_m").value) || 0;
    const wh = parseInt(document.getElementById("w_h").value) || 0;
    const wm = parseInt(document.getElementById("w_m").value) || 0;
  
    const T = th * 60 + tm;
    const R = rh * 60 + rm;
    const W = wh * 60 + wm;
  
    const panel = document.getElementById("resultPanel");
  
    if (T === 0 || R === 0) {
      panel.style.display = "none";
      return;
    }
  
    panel.style.display = "block";
  
    if (R > T) {
      panel.className = "alert-danger";
      panel.innerHTML = `<strong style="font-size: 18px;">❌ 输入数据异常</strong><br>剩余时间（<strong>${formatDuration(R)}</strong>）不可能大于植物总时间（<strong>${formatDuration(T)}</strong>）。<br>👉 <strong>请核实输入：</strong>您可能填反了或者看错行了。`;
      return;
    }
  
    const M = T / 3;
  
    if (W > M) {
      panel.className = "alert-danger";
      panel.innerHTML = `<strong style="font-size: 18px;">❌ 输入数据异常</strong><br>当前水量（<strong>${formatDuration(W)}</strong>）超过了该植物的储水上限（<strong>${formatDuration(M)}</strong>）。<br>👉 <strong>请核实输入：</strong>水滴上的时间绝不可能超过 ${formatDuration(M)}。`;
      return;
    }
  
    const limit = W + M / 4;
  
    if (R > limit) {
      let currR = R;
      let currW = W;
      let passed = 0;
      let actions = [];
  
      while (currR > currW + M / 4) {
        if (currW > 0) {
          passed += currW;
          currR -= currW;
          actions.push({ type: "water", offset: Math.round(passed), title: "💧 储水干涸，需补满水" });
          currW = M;
          currR -= M / 4;
        } else {
          actions.push({ type: "water", offset: Math.round(passed), title: "💧 尚未浇水，请立刻补水！" });
          currW = M;
          currR -= M / 4;
        }
      }
  
      let mathWait = (4 * currR - M + currW) / 5;
      let unlockWait = M * 0.1 - (M - currW); 
      let finalWait = Math.max(mathWait, unlockWait);
      finalWait = Math.max(0, Math.ceil(finalWait));
  
      if (finalWait >= currR) {
        passed += currR;
        actions.push({ type: "kill", offset: Math.round(passed), title: "🌾 完美收官！自然成熟！" });
      } else {
        passed += finalWait;
        actions.push({ type: "kill", offset: Math.round(passed), title: "🔥 终极秒熟！马上浇水收割！" });
      }
  
      const now = new Date();
      let html = `<strong style="font-size: 16px;">⏳ 尚未进入斩杀线，后续排期如下：</strong><br>`;
      html += `<ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; color: var(--text-main);">`;
  
      actions.forEach((act) => {
        const actTime = new Date(now.getTime() + act.offset * 60000);
        const dayPrefix = actTime.getDate() !== now.getDate() ? "明天 " : "今天 ";
        const timeStr = `${dayPrefix}${formatClockTime(actTime)}`;
        const durationStr = act.offset === 0 ? "现在" : formatDuration(act.offset) + "后";
  
        act.timeStr = timeStr;
        act.durationStr = durationStr;
  
        if (act.type === "water") {
          html += `<li style="margin-bottom: 6px;">${durationStr} <strong>(${timeStr})</strong><br><span style="color: var(--secondary); font-weight: bold;">${act.title}</span></li>`;
        } else {
          html += `<li style="margin-bottom: 6px;">${durationStr} <strong>(${timeStr})</strong><br><span style="color: var(--danger); font-weight: bold;">${act.title}</span></li>`;
        }
      });
      html += `</ul>`;
  
      const nextAct = actions[0];
      const nextTime = now.getTime() + nextAct.offset * 60000;
      const alarmTitle = nextAct.type === "kill" ? "农场秒熟收割" : "农场加水提醒";
      html += `<button class="alarm-btn" style="margin-top: 5px;" onclick="createAlarm('${alarmTitle}', ${nextTime})">⏰ 为下一次操作设日历</button>`;
  
      panel.className = "alert-warning";
      panel.innerHTML = html;
      window.currentHarvestData = actions.map(a => {
        if (a.type === "kill") {
          return `${a.durationStr} <strong style="color: var(--danger);">(${a.timeStr})</strong> ${a.title}`;
        } else {
          return `${a.durationStr} <strong>(${a.timeStr})</strong> ${a.title}`;
        }
      }).join("<br>");
      document.getElementById("saveHarvestContainer").style.display = "block";
      return;
    }
  
    let mathWait = (4 * R - M + W) / 5;
    let unlockWait = M * 0.1 - (M - W);
    let waitMins = Math.max(mathWait, unlockWait);
    waitMins = Math.max(0, Math.ceil(waitMins));
  
    if (waitMins >= R) {
      panel.className = "alert-warning";
      panel.innerHTML = `<strong>⚠️ 卡 10% 补水门槛</strong><br>等待浇水按键亮起的时间（${formatDuration(waitMins)}）已经大于等于自然成熟的时间（${formatDuration(R)}）。<br>👉 <strong>建议：</strong>无须操作，让植物自然成熟即可。`;
      window.currentHarvestData = "<strong style='color: var(--warning);'>⚠️ 卡门槛，建议自然成熟</strong>";
      document.getElementById("saveHarvestContainer").style.display = "block";
      return;
    }
  
    if (waitMins === 0) {
      panel.className = "alert-success";
      panel.innerHTML = `<strong style="font-size: 20px;">🔥 马上浇水！直接秒熟！</strong><br>不用等了，现在按下浇水键，植物瞬间成熟！`;
      window.currentHarvestData = "<strong style='color: var(--danger);'>🔥 现在立刻浇水秒熟！</strong>";
    } else {
      const now = new Date();
      const alarmTime = new Date(now.getTime() + waitMins * 60000);
      const isTomorrow = alarmTime.getDate() !== now.getDate();
      const dayPrefix = isTomorrow ? "明天 " : "今天 ";
  
      panel.className = "alert-success";
      panel.innerHTML = `<strong>✅ 完美收割时机</strong><br>你需要精确等待：<strong>${formatDuration(waitMins)}</strong><br><span class="alarm-time">⏰ 闹钟设定为：${dayPrefix}${formatClockTime(alarmTime)}</span>在此时间点，浇水按键将刚好亮起，按下瞬间成熟！`;
      panel.innerHTML += `<button class="alarm-btn" style="margin-top: 10px;" onclick="createAlarm('农场秒熟收割', ${alarmTime.getTime()})">⏰ 为本次操作设日历</button>`;
      window.currentHarvestData = `等 ${formatDuration(waitMins)} <strong style="color: var(--danger);">(${dayPrefix}${formatClockTime(alarmTime)})</strong> 浇水秒熟`;
    }
    document.getElementById("saveHarvestContainer").style.display = "block";
  }
  
  function getMaxHistoryCount() { return parseInt(localStorage.getItem("harvest_history_max")) || 5; }
  function updateMaxHistoryCount() {
    let val = parseInt(document.getElementById("maxHistoryCount").value);
    if (isNaN(val) || val < 1) val = 10; 
    localStorage.setItem("harvest_history_max", val);
    let history = JSON.parse(localStorage.getItem("harvest_history") || "[]");
    if (history.length > val) {
      history = history.slice(0, val);
      localStorage.setItem("harvest_history", JSON.stringify(history));
    }
    renderHarvestHistory(); 
  }
  
  function saveHarvestRecord() {
    const nameInput = document.getElementById("harvestRecordName").value.trim();
    const name = nameInput || "未命名记录";
    if (!window.currentHarvestData) return; 
    const record = { id: Date.now(), name: name, desc: window.currentHarvestData };
    let history = JSON.parse(localStorage.getItem("harvest_history") || "[]");
    history.unshift(record);
    const maxCount = getMaxHistoryCount();
    if (history.length > maxCount) history = history.slice(0, maxCount);
    localStorage.setItem("harvest_history", JSON.stringify(history));
    document.getElementById("harvestRecordName").value = "";
    renderHarvestHistory();
  }
  
  function renderHarvestHistory() {
    const history = JSON.parse(localStorage.getItem("harvest_history") || "[]");
    const panel = document.getElementById("historyPanel");
    const list = document.getElementById("historyList");
    const maxCount = getMaxHistoryCount();
    const titleEl = document.getElementById("historyTitle");
    if (titleEl) titleEl.innerText = `🕒 最近 ${maxCount} 次收割记录`;
    const countInput = document.getElementById("maxHistoryCount");
    if (countInput) countInput.value = maxCount;
    if (history.length === 0) { panel.style.display = "none"; return; }
    panel.style.display = "block"; list.innerHTML = "";
    history.forEach(item => {
      list.innerHTML += `
          <div style="background: #fafafa; border: 1px solid var(--border); border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="flex: 1; padding-right: 10px;">
                  <div style="font-weight: bold; font-size: 13px; color: var(--primary); margin-bottom: 4px;">🔖 ${item.name}</div>
                  <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">${item.desc}</div>
              </div>
              <button onclick="deleteHarvestHistory(${item.id})" style="background: none; border: none; font-size: 16px; cursor: pointer; padding: 5px; opacity: 0.6;">🗑️</button>
          </div>
        `;
    });
  }
  
  function deleteHarvestHistory(id) {
    let history = JSON.parse(localStorage.getItem("harvest_history") || "[]");
    history = history.filter(item => item.id !== id);
    localStorage.setItem("harvest_history", JSON.stringify(history));
    renderHarvestHistory();
  }