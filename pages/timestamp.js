document.addEventListener('DOMContentLoaded', function() {
    const currentTime = document.getElementById('currentTime');
    const currentTimestamp = document.getElementById('currentTimestamp');
    const timestampInput = document.getElementById('timestampInput');
    const timestampUnit = document.getElementById('timestampUnit');
    const dateInput = document.getElementById('dateInput');
    const dateResult = document.getElementById('dateResult');
    const secondsResult = document.getElementById('secondsResult');
    const millisecondsResult = document.getElementById('millisecondsResult');

    // 更新当前时间显示
    function updateCurrentTime() {
        const now = new Date();
        currentTime.textContent = now.toLocaleString();
        currentTimestamp.textContent = `秒级时间戳: ${Math.floor(now.getTime() / 1000)}\n毫秒级时间戳: ${now.getTime()}`;
        requestAnimationFrame(updateCurrentTime);
    }

    // 格式化日期时间
    function formatDateTime(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // 时间戳转日期时间
    function timestampToDate() {
        const timestamp = timestampInput.value.trim();
        if (!timestamp) {
            dateResult.textContent = '';
            return;
        }

        try {
            const unit = timestampUnit.value;
            const ms = unit === 's' ? timestamp * 1000 : timestamp;
            const date = new Date(Number(ms));
            
            if (isNaN(date.getTime())) {
                throw new Error('无效的时间戳');
            }

            dateResult.textContent = formatDateTime(date);
        } catch (e) {
            dateResult.textContent = '无效的时间戳';
        }
    }

    // 日期时间转时间戳
    function dateToTimestamp() {
        const dateStr = dateInput.value;
        if (!dateStr) {
            secondsResult.textContent = '';
            millisecondsResult.textContent = '';
            return;
        }

        try {
            const date = new Date(dateStr);
            const ms = date.getTime();
            const s = Math.floor(ms / 1000);

            if (isNaN(ms)) {
                throw new Error('无效的日期');
            }

            secondsResult.textContent = s;
            millisecondsResult.textContent = ms;
        } catch (e) {
            secondsResult.textContent = '无效的日期';
            millisecondsResult.textContent = '无效的日期';
        }
    }

    // 设置默认值
    const now = new Date();
    dateInput.value = now.toISOString().slice(0, 19);
    dateToTimestamp();

    // 添加事件监听
    timestampInput.addEventListener('input', timestampToDate);
    timestampUnit.addEventListener('change', timestampToDate);
    dateInput.addEventListener('input', dateToTimestamp);

    // 启动实时时间显示
    updateCurrentTime();
}); 