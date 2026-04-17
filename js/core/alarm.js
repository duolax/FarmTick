async function createAlarm(title, timestamp) {
    const isApp = window.Capacitor && window.Capacitor.isNativePlatform();
  
    if (isApp && window.NativeAlarm) {
      try {
        let permStatus = await window.NativeAlarm.requestPermissions();
        if (permStatus.display !== "granted") { alert("⚠️ 无法设置提醒。请在手机【设置】中开启通知权限。"); return; }
        const channelId = "farm_alerts_v2";
        try { await window.NativeAlarm.createChannel({ id: channelId, name: "务农提醒", importance: 5, vibration: true, visibility: 1 }); } catch (e) { }
  
        await window.NativeAlarm.schedule({
          notifications: [{
            title: `🌾 务农指令: ${title}`,
            body: "时间到了！系统已触及绝对斩杀线，马上浇水收割！",
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(timestamp), allowWhileIdle: true },
            channelId: channelId,
          }],
        });
        const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        alert(`✅ 提醒设定成功！\n\n系统将在 ${timeStr} 准时横幅弹窗。`);
      } catch (e) {
        alert("App提醒设置失败: " + JSON.stringify(e));
      }
  
    } else {
      const start = new Date(timestamp);
      const end = new Date(timestamp + 5 * 60000);
      const eventTitle = `🌾 ${title}`;
      const details = "提醒：储水已干 / 极限秒熟，马上浇水！";
  
      const ua = navigator.userAgent.toLowerCase();
      const isWeChat = ua.includes("micromessenger");
      const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  
      if (isWeChat) {
        alert("⚠️ 微信中无法直接生成日历，请手动定个闹钟");
        return;
      }
      if (isIOS) {
        const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const url = `https://ics.agical.io/?subject=${encodeURIComponent(eventTitle)}&description=${encodeURIComponent(details)}&dtstart=${fmt(start)}&dtend=${fmt(end)}&reminder=0`;
        window.location.href = url;
        return;
      }
      alert("💡 网页端无法直接拉起系统提醒，建议手动定个闹钟。或下载APP版本。");
    }
  }
  
  // 远程加载模式下，直接从注入的全局变量中获取闹钟插件
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (window.Capacitor && window.Capacitor.Plugins) {
        window.NativeAlarm = window.Capacitor.Plugins.LocalNotifications;
        console.log("原生闹钟插件挂载成功！");
      }
    }, 500);
  });
