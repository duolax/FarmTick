window.currentDurationMins = 960;

function setDuration(mins, btnElement) {
  window.currentDurationMins = mins;
  const btns = document.querySelectorAll("#card_timeline .time-btn");
  btns.forEach((btn) => btn.classList.remove("active"));
  btnElement.classList.add("active");
  generateTimeline();
}

function setCurrentPlantTime() {
  const now = new Date();
  now.setSeconds(0); now.setMilliseconds(0);
  const offset = now.getTimezoneOffset() * 60000;
  document.getElementById("plantTime").value = new Date(now - offset).toISOString().slice(0, 16);
  generateTimeline();
}

function generateTimeline() {
  const plantInput = document.getElementById("plantTime").value;
  if (!plantInput) return;
  const startTime = new Date(plantInput);
  const duration = window.currentDurationMins;
  const M = duration / 3;
  const CD = M * 0.1;

  const useSleep = document.getElementById("useSleepMode").checked;
  const sStart = document.getElementById("sleepStart").value || "23:30";
  const sEnd = document.getElementById("sleepEnd").value || "07:30";
  const getMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const sleepStartMins = getMin(sStart);
  const sleepEndMins = getMin(sEnd);

  let R = duration, D = M, curTime = new Date(startTime), nodes = [];
  let skipSleep = false; 
  let hasLoggedHoldBreath = false; 
  
  let startMin = curTime.getHours() * 60 + curTime.getMinutes();
  let skipFirstSleep = false;
  if (useSleep) {
      if (sleepStartMins > sleepEndMins) {
          skipFirstSleep = (startMin >= sleepStartMins || startMin < sleepEndMins);
      } else {
          skipFirstSleep = (startMin >= sleepStartMins && startMin < sleepEndMins);
      }
  }

  R -= D/4; D = 0;
  nodes.push({ type: 'start', time: new Date(curTime), note: '🌱 种下首浇' });

  let limit = 0;
  while (R > 0 && limit < 10000) {
    limit++;
    let curMin = curTime.getHours() * 60 + curTime.getMinutes();
    
    let isSleep = false;
    if (useSleep && !skipSleep && !skipFirstSleep) {
        isSleep = (sleepStartMins > sleepEndMins) ? 
            (curMin >= sleepStartMins || curMin < sleepEndMins) : 
            (curMin >= sleepStartMins && curMin < sleepEndMins);
    }

    if (D/4 >= R && D >= CD) {
      nodes.push({ type: 'kill', time: new Date(curTime), note: '🔥 终极秒熟斩杀', isSkipped: skipFirstSleep });
      break;
    }

    if (useSleep && curMin === sleepStartMins && !skipSleep && !skipFirstSleep) {
        let testR = R - D/4;
        if (testR <= 90 && D >= CD) {
            skipSleep = true; 
            R -= D/4; D = 0; hasLoggedHoldBreath = false;
            nodes.push({ type: 'water', time: new Date(curTime), note: '👀 睡前补水(快熟了别睡)' });
        } else if (D >= CD) {
            R -= D/4; D = 0; hasLoggedHoldBreath = false;
            nodes.push({ type: 'water', time: new Date(curTime), note: '🌙 睡前强行满水' });
        }
    }

    if (useSleep && curMin === sleepEndMins && !skipSleep && !skipFirstSleep && D > 0) {
        let nextR = R - D/4;
        if (nextR > 0 && nextR < CD) {
            if (!hasLoggedHoldBreath) {
                nodes.push({ type: 'info', time: new Date(curTime), note: '🤫 醒了但憋气防偷' });
                hasLoggedHoldBreath = true;
            }
        } else if (D >= CD) {
            R -= D/4; D = 0; hasLoggedHoldBreath = false;
            nodes.push({ type: 'water', time: new Date(curTime), note: '☀️ 起床补水' });
        }
    }

    if (!isSleep && D >= M) {
        let nextR = R - M/4;
        if (nextR > 0 && nextR < CD) {
            if (!hasLoggedHoldBreath) {
                nodes.push({ type: 'info', time: new Date(curTime), note: '🤫 触发憋气防偷菜' });
                hasLoggedHoldBreath = true;
            }
        } else {
            R -= M/4; D = 0; hasLoggedHoldBreath = false;
            nodes.push({ type: 'water', time: new Date(curTime), note: '💧 正常干涸补水' });
        }
    }
    
    curTime.setMinutes(curTime.getMinutes() + 1);
    R -= 1;
    if (D < M) D += 1;
    
    if (skipFirstSleep && curMin === sleepEndMins) {
        skipFirstSleep = false;
    }

    if (R <= 0 && nodes[nodes.length-1].type !== 'kill') {
        nodes.push({ type: 'kill', time: new Date(curTime), note: '🌾 自然成熟(没赶上斩杀)', isSkipped: false });
    }
  }

  const warningBox = document.getElementById("timelineWarning");
  if(warningBox) warningBox.style.display = "none";
  
  const sleepDuration = (sleepEndMins - sleepStartMins + 1440) % 1440;
  if (useSleep && sleepDuration > 120 && warningBox) {
      let killNode = nodes.find(n => n.type === 'kill');
      if (killNode && !killNode.isSkipped) { 
          let killMin = killNode.time.getHours() * 60 + killNode.time.getMinutes();
          let offset = (killMin - sleepStartMins + 1440) % 1440;
          if (offset >= 60 && offset <= sleepDuration - 60) {
              warningBox.innerHTML = `<strong>⚠️ 审批拦截：</strong> 收割时间似乎绕不开休息时间（入睡率100%期间），你确定现在种植吗？`;
              warningBox.className = "alert-danger";
              warningBox.style.display = "block";
              warningBox.style.padding = "12px";
              warningBox.style.borderRadius = "8px";
          }
      }
  }

  const list = document.getElementById("timelineList");
  if(list) list.innerHTML = "";

  let waterNodes = nodes.filter(n => n.type === 'water');
  let killNode = nodes.find(n => n.type === 'kill') || nodes[nodes.length - 1];
  window.currentTimelineData = {
      t2: waterNodes[0] ? formatDisplayDate(waterNodes[0].time) : '',
      t3: waterNodes[1] ? formatDisplayDate(waterNodes[1].time) : '',
      t4: formatDisplayDate(killNode.time)
  };

  nodes.forEach(n => {
    if(!list) return;
    const item = document.createElement("div");
    item.className = "timeline-card";
    if(n.type==='kill') item.style.borderColor = 'var(--danger)';
    if(n.type==='info') item.style.borderColor = 'var(--warning)';
    
    let icon = n.type==='start' ? '🌱' : (n.type==='kill' ? '🔥' : (n.type==='info' ? '🤫' : '💧'));
    let elapsedMins = Math.round((n.time.getTime() - startTime.getTime()) / 60000);
    let btnText = "+" + formatElapsed(elapsedMins);

    item.innerHTML = `<div style="font-size:20px">${icon}</div>
      <div style="font-weight:bold;font-size:12px;margin:5px 0">${n.note}</div>
      <div style="color:var(--secondary);font-weight:bold">${formatDisplayDate(n.time)}</div>
      <button class="alarm-btn ${n.type==='kill'?'alarm-btn-danger':''}" onclick="createAlarm('${n.note}', ${n.time.getTime()})">${btnText}</button>`;
    list.appendChild(item);
  });
  document.getElementById("timelinePanel").style.display = "block";
}