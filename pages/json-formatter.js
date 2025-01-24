document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('jsonInput');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const indentSize = document.getElementById('indentSize');
    const errorMsg = document.getElementById('errorMsg');
    const jsonTree = document.getElementById('jsonTree');
    const lineNumbers = document.querySelector('.line-numbers');

    // 更新行号
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n');
        lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('\n');
    }

    // 格式化 JSON
    function formatJSON() {
        const input = jsonInput.value.trim();
        if (!input) {
            showError('请输入JSON数据');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const indent = indentSize.value === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize.value));
            const formatted = JSON.stringify(parsed, null, indent);
            jsonInput.value = formatted;
            updateLineNumbers();
            errorMsg.textContent = '';
            updateJsonTree(parsed);
        } catch (e) {
            showError('无效的JSON格式: ' + e.message);
        }
    }

    // 压缩 JSON
    function minifyJSON() {
        const input = jsonInput.value.trim();
        if (!input) {
            showError('请输入JSON数据');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            jsonInput.value = minified;
            updateLineNumbers();
            errorMsg.textContent = '';
            updateJsonTree(parsed);
        } catch (e) {
            showError('无效的JSON格式: ' + e.message);
        }
    }

    // 创建 JSON 树视图
    function createJsonTreeView(data, isRoot = true) {
        const ul = document.createElement('ul');
        
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                const li = document.createElement('li');
                const content = document.createElement('div');
                content.className = 'content-wrapper';
                
                if (typeof item === 'object' && item !== null) {
                    const toggle = document.createElement('span');
                    toggle.className = 'toggle';
                    toggle.textContent = '▼';
                    li.appendChild(toggle);
                    
                    content.innerHTML = `<span class="key">${index}:</span>`;
                    content.appendChild(createJsonTreeView(item, false));
                } else {
                    content.innerHTML = `<span class="key">${index}:</span> <span class="${typeof item}">${formatValue(item)}</span>`;
                }
                
                li.appendChild(content);
                ul.appendChild(li);
            });
        } else if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                const li = document.createElement('li');
                const content = document.createElement('div');
                content.className = 'content-wrapper';
                
                if (typeof value === 'object' && value !== null) {
                    const toggle = document.createElement('span');
                    toggle.className = 'toggle';
                    toggle.textContent = '▼';
                    li.appendChild(toggle);
                    
                    content.innerHTML = `<span class="key">${key}:</span>`;
                    content.appendChild(createJsonTreeView(value, false));
                } else {
                    content.innerHTML = `<span class="key">${key}:</span> <span class="${typeof value}">${formatValue(value)}</span>`;
                }
                
                li.appendChild(content);
                ul.appendChild(li);
            });
        }
        
        return ul;
    }

    // 更新 JSON 树视图
    function updateJsonTree(data) {
        jsonTree.innerHTML = '';
        jsonTree.appendChild(createJsonTreeView(data));
        addTreeInteraction();
    }

    // 格式化值
    function formatValue(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (value === null) return 'null';
        return value;
    }

    // 添加树形结构的交互功能
    function addTreeInteraction() {
        const toggles = jsonTree.querySelectorAll('.toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const li = this.parentElement;
                li.classList.toggle('collapsed');
                this.textContent = li.classList.contains('collapsed') ? '▶' : '▼';
            });
        });
    }

    // 复制到剪贴板
    function copyToClipboard() {
        const text = jsonInput.value;
        if (!text) {
            showError('没有可复制的内容');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                showTooltip(copyBtn, '已复制！');
            })
            .catch(err => {
                showError('复制失败，请手动复制');
                console.error('复制失败：', err);
            });
    }

    // 显示工具提示
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;

        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    // 清空内容
    function clearContent() {
        if (confirm('确定要清空所有内容吗？')) {
            jsonInput.value = '';
            jsonTree.innerHTML = '';
            errorMsg.textContent = '';
            updateLineNumbers();
        }
    }

    // 显示错误信息
    function showError(message) {
        errorMsg.textContent = message;
    }

    // 实时语法检查
    let checkTimeout;
    jsonInput.addEventListener('input', function() {
        clearTimeout(checkTimeout);
        updateLineNumbers();
        
        checkTimeout = setTimeout(() => {
            const input = this.value.trim();
            if (!input) {
                errorMsg.textContent = '';
                jsonTree.innerHTML = '';
                return;
            }
            try {
                const parsed = JSON.parse(input);
                errorMsg.textContent = '';
                updateJsonTree(parsed);
            } catch (e) {
                showError('无效的JSON格式: ' + e.message);
            }
        }, 300);
    });

    // 同步滚动
    jsonInput.addEventListener('scroll', function() {
        lineNumbers.style.top = -this.scrollTop + 'px';
    });

    // 添加事件监听
    formatBtn.addEventListener('click', formatJSON);
    minifyBtn.addEventListener('click', minifyJSON);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearContent);
    indentSize.addEventListener('change', formatJSON);

    // 初始化行号
    updateLineNumbers();
}); 