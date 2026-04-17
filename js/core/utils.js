function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h === 0 && m === 0) return "0 分钟";
    let res = "";
    if (h > 0) res += h + " 小时 ";
    if (m > 0) res += m + " 分钟";
    return res;
  }
  
  function formatClockTime(date) {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
  
  function formatElapsed(mins) {
    if (mins === 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    let res = "";
    if (h > 0) res += h + "h";
    if (m > 0 || h === 0) res += m + "m";
    return res;
  }
  
  function formatMinsToText(mins) {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return (h > 0 ? h + "h" : "") + (m > 0 ? m + "m" : "");
  }
  
  function formatDisplayDate(dateObj) {
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const dd = dateObj.getDate().toString().padStart(2, "0");
    const hh = dateObj.getHours().toString().padStart(2, "0");
    const min = dateObj.getMinutes().toString().padStart(2, "0");
    return `${mm}-${dd} ${hh}:${min}`;
  }
  
  function formatTimeStr(seconds) {
    if (seconds < 60) return seconds + " 秒";
    if (seconds < 3600) return seconds / 60 + " 分钟";
    return seconds / 3600 + " 小时";
  }