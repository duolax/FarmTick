document.addEventListener("DOMContentLoaded", () => {
    // 1. 初始化时间选择器
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const plantTimeInput = document.getElementById("plantTime");
    if(plantTimeInput) {
        plantTimeInput.value = now.toISOString().slice(0, 16);
    }
    
    // 2. 初始化排期器与计算器
    if(typeof generateTimeline === 'function') generateTimeline();
    if(typeof calculate === 'function') calculate();
    
    // 3. 恢复折叠状态
    if(typeof restoreFolds === 'function') restoreFolds();
    
    // 4. 渲染账号管家数据
    if(typeof renderAccountManager === 'function') {
        renderAccountManager();
        // 每分钟刷新一次倒计时告警
        setInterval(renderAccountManager, 60000); 
    }
    
    // 5. 渲染数据中心图表
    // 延迟 50ms 确保 data.js 数据已经挂载
    setTimeout(() => {
        if(typeof renderTable === 'function') renderTable();          
        if(typeof renderStaticTables === 'function') renderStaticTables();   
    }, 50);
    
    // 6. 渲染收割历史记录
    if(typeof renderHarvestHistory === 'function') renderHarvestHistory(); 
    
    // 7. 处理独立 App 专有功能判断
    const isApp = window.Capacitor && window.Capacitor.isNativePlatform();
    if (!isApp) {
        const appDownloadCard = document.getElementById("app_download_card");
        const busuanziFooter = document.getElementById("busuanzi_footer");
        
        if(appDownloadCard) appDownloadCard.style.display = "block";
        if(busuanziFooter) busuanziFooter.style.display = "block";
        
        // 动态加载不蒜子流量统计脚本
        const script = document.createElement("script");
        script.async = true;
        script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
        document.body.appendChild(script);
    }
});