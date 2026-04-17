function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    card.classList.toggle('card-collapsed');
    localStorage.setItem('fold_' + cardId, card.classList.contains('card-collapsed') ? '1' : '0');
  }
  
  function restoreFolds() {
    ['card_calc', 'card_timeline', 'card_account', 'card_data'].forEach(id => {
      const state = localStorage.getItem('fold_' + id);
      const card = document.getElementById(id);
      if (state === '1' && card) card.classList.add('card-collapsed');
    });
  }
  
  function openPlantModal() { document.getElementById("plantListModal").style.display = "flex"; }
  function closePlantModal() { document.getElementById("plantListModal").style.display = "none"; }
  
  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
  }
  
  let currentSort = { key: "level", asc: true };
  
  function renderTable() {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (typeof cropData === 'undefined') return; 
    
    cropData.forEach((row) => {
      const tr = document.createElement("tr");
      let rowStyle = "";
      let adviceStyle = "";
      if (row.advice.includes("🌟")) rowStyle = "pmo-star";
      if (row.advice.includes("👑")) rowStyle = "pmo-crown";
      if (row.advice.includes("💰")) { rowStyle = "pmo-warning"; adviceStyle = "color: var(--danger); font-weight: bold;"; }
      tr.className = `row-hover ${rowStyle}`;
      tr.innerHTML = `
          <td>Lv. ${row.level}</td>
          <td style="font-weight:bold;">${row.name}</td>
          <td style="color:#888;">${row.buy}</td>
          <td style="font-weight:bold;">${row.sell}</td>
          <td>${formatTimeStr(row.time)}</td>
          <td class="${row.expH > 250 ? "highlight-data" : ""}">${row.expH.toFixed(1)}</td>
          <td class="${row.coinH > 600 ? "highlight-data" : ""}">${row.coinH.toFixed(1)}</td>
          <td style="${adviceStyle}">${row.advice}</td>
        `;
      tbody.appendChild(tr);
    });
  }
  
  function sortTable(key) {
    if (currentSort.key === key) { currentSort.asc = !currentSort.asc; } 
    else { currentSort.key = key; currentSort.asc = false; if (key === "level" || key === "time") currentSort.asc = true; }
    cropData.sort((a, b) => {
      let valA = a[key]; let valB = b[key];
      if (valA < valB) return currentSort.asc ? -1 : 1;
      if (valA > valB) return currentSort.asc ? 1 : -1;
      return 0;
    });
    renderTable();
  }
  
  function renderStaticTables() {
    if (typeof farmData === 'undefined') return;
    
    const farmBody = document.getElementById("farmTableBody");
    if(farmBody) {
      farmBody.innerHTML = "";
      farmData.forEach(row => {
        farmBody.innerHTML += `<tr class="row-hover">
                <td>Lv. ${row.level}</td>
                <td style="color:var(--danger);">${row.cost}</td>
                <td>${row.exp}</td>
                <td style="color:var(--primary); font-weight:bold;">${row.crop}</td>
                <td style="color:#8b5a2b;">${row.mutation}</td>
                <td style="color:var(--secondary);">${row.stall}</td>
                <td style="color:var(--secondary);">${row.field}</td>
                <td style="color:var(--secondary);">${row.func}</td>
                <td style="color:var(--secondary);">${row.furniture}</td>
            </tr>`;
      });
    }
  
    const stallBody = document.getElementById("stallTableBody");
    if(stallBody) {
      stallBody.innerHTML = "";
      stallData.forEach(row => {
        let boostStr = row.boost === "-" ? "-" : "+ " + (parseFloat(row.boost) * 100).toFixed(0) + "%";
        stallBody.innerHTML += `<tr class="row-hover">
                <td>Lv. ${row.level}</td>
                <td style="color:var(--danger);">${row.cost}</td>
                <td>${row.exp}</td>
                <td style="color:var(--primary); font-weight:bold;">${boostStr}</td>
            </tr>`;
      });
    }
  
    const fieldBody = document.getElementById("fieldTableBody");
    if(fieldBody) {
      fieldBody.innerHTML = "";
      fieldData.forEach(row => {
        fieldBody.innerHTML += `<tr class="row-hover">
                <td>第 ${row.level} 块</td>
                <td style="color:var(--danger); font-weight:bold;">${row.cost}</td>
                <td style="color:var(--primary);">${row.exp}</td>
            </tr>`;
      });
    }
  
    const upgradeBody = document.getElementById("upgradeTableBody");
    if(upgradeBody) {
      upgradeBody.innerHTML = "";
      upgradeData.forEach(row => {
        upgradeBody.innerHTML += `<tr class="row-hover">
                <td style="position: sticky; left: 0; background: #fff; z-index: 1; font-weight:bold; border-right: 1px solid var(--border);">${row.name}</td>
                <td style="color:var(--danger); font-weight:bold;">${row.base}</td>
                <td>${row.l2}</td><td>${row.l3}</td><td>${row.l4}</td>
                <td>${row.l5}</td><td>${row.l6}</td><td>${row.l7}</td>
                <td>${row.l8}</td><td>${row.l9}</td><td>${row.l10}</td>
            </tr>`;
      });
    }
  }