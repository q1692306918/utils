document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdownInput');
    const preview = document.getElementById('preview');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const copyHtml = document.getElementById('copyHtml');
    const copyMarkdown = document.getElementById('copyMarkdown');
    const clearContent = document.getElementById('clearContent');
    const toolbarButtons = document.querySelectorAll('.toolbar button');

    // 配置 marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    // 实时预览
    let updateTimeout;
    markdownInput.addEventListener('input', () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updatePreview, 300);
    });

    function updatePreview() {
        const markdown = markdownInput.value;
        preview.innerHTML = marked.parse(markdown);
        updateWordCount(markdown);
    }

    // 工具栏按钮
    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const syntax = button.dataset.syntax;
            const isMultiline = button.dataset.multiline === 'true';
            insertSyntax(syntax, isMultiline);
        });
    });

    function insertSyntax(syntax, isMultiline) {
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        const text = markdownInput.value;
        const selection = text.substring(start, end);

        let insertion;
        if (isMultiline) {
            insertion = syntax.replace('\n\n', '\n' + selection + '\n');
        } else {
            insertion = syntax + selection + syntax;
        }

        markdownInput.value = text.substring(0, start) + insertion + text.substring(end);
        markdownInput.focus();
        
        // 设置新的光标位置
        if (selection) {
            markdownInput.setSelectionRange(start, start + insertion.length);
        } else {
            const newPosition = start + (isMultiline ? syntax.indexOf('\n') + 1 : syntax.length);
            markdownInput.setSelectionRange(newPosition, newPosition);
        }

        updatePreview();
    }

    // 字数统计
    function updateWordCount(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const chars = text.length;
        wordCount.textContent = words.length;
        charCount.textContent = chars;
    }

    // 复制功能
    copyHtml.addEventListener('click', () => {
        navigator.clipboard.writeText(preview.innerHTML).then(() => {
            showTooltip(copyHtml, '已复制HTML');
        });
    });

    copyMarkdown.addEventListener('click', () => {
        navigator.clipboard.writeText(markdownInput.value).then(() => {
            showTooltip(copyMarkdown, '已复制Markdown');
        });
    });

    // 清空内容
    clearContent.addEventListener('click', () => {
        if (confirm('确定要清空所有内容吗？')) {
            markdownInput.value = '';
            updatePreview();
        }
    });

    // 工具提示
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;

        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    // 添加示例内容
    const exampleMarkdown = `# Markdown 预览器

这是一个简单的 Markdown 预览器示例。

## 功能特点

- 实时预览
- 语法高亮
- 工具栏快捷按钮
- 字数统计

### 代码示例

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

> 支持引用块和其他 Markdown 语法
`;

    markdownInput.value = exampleMarkdown;
    updatePreview();
}); 