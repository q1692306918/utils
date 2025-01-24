document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 文本转换相关元素
    const textInput = document.getElementById('textInput');
    const textOutput = document.getElementById('textOutput');
    const encodeText = document.getElementById('encodeText');
    const decodeText = document.getElementById('decodeText');
    const copyText = document.getElementById('copyText');
    
    // 图片转换相关元素
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imageOutput = document.getElementById('imageOutput');
    const imageSize = document.getElementById('imageSize');
    const imageDimensions = document.getElementById('imageDimensions');
    const copyImage = document.getElementById('copyImage');

    // Base64转图片相关元素
    const decodeInput = document.getElementById('decodeInput');
    const decodeImage = document.getElementById('decodeImage');
    const downloadImage = document.getElementById('downloadImage');
    const decodePreview = document.getElementById('decodePreview');
    const decodeImageInfo = document.getElementById('decodeImageInfo');

    // 标签切换功能
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // 文本编码
    encodeText.addEventListener('click', () => {
        const text = textInput.value;
        if (!text) {
            showTooltip(encodeText, '请输入要编码的文本');
            return;
        }
        try {
            const encoded = btoa(encodeURIComponent(text));
            textOutput.value = encoded;
        } catch (e) {
            showTooltip(encodeText, '编码失败：' + e.message);
        }
    });

    // 文本解码
    decodeText.addEventListener('click', () => {
        const text = textInput.value;
        if (!text) {
            showTooltip(decodeText, '请输入要解码的Base64文本');
            return;
        }
        try {
            const decoded = decodeURIComponent(atob(text));
            textOutput.value = decoded;
        } catch (e) {
            showTooltip(decodeText, '解码失败：' + e.message);
        }
    });

    // 复制文本结果
    copyText.addEventListener('click', () => {
        const text = textOutput.value;
        if (!text) {
            showTooltip(copyText, '没有可复制的内容');
            return;
        }
        navigator.clipboard.writeText(text)
            .then(() => showTooltip(copyText, '已复制'))
            .catch(() => showTooltip(copyText, '复制失败'));
    });

    // 图片拖放功能
    dropZone.addEventListener('click', () => imageInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    // 图片选择处理
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        // 更新文件信息
        imageSize.textContent = `大小: ${formatSize(file.size)}`;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imageOutput.value = e.target.result;
            
            // 获取图片尺寸
            const img = new Image();
            img.onload = function() {
                imageDimensions.textContent = `尺寸: ${this.width} x ${this.height}`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 复制图片Base64
    copyImage.addEventListener('click', () => {
        const base64 = imageOutput.value;
        if (!base64) {
            showTooltip(copyImage, '没有可复制的内容');
            return;
        }
        navigator.clipboard.writeText(base64)
            .then(() => showTooltip(copyImage, '已复制'))
            .catch(() => showTooltip(copyImage, '复制失败'));
    });

    // Base64转图片功能
    decodeImage.addEventListener('click', () => {
        const base64 = decodeInput.value.trim();
        if (!base64) {
            showTooltip(decodeImage, '请输入Base64编码');
            return;
        }

        try {
            // 处理Base64编码
            let imgSrc = base64;
            if (!base64.startsWith('data:image')) {
                imgSrc = 'data:image/png;base64,' + base64;
            }

            // 预览图片
            decodePreview.src = imgSrc;
            decodePreview.onload = () => {
                downloadImage.disabled = false;
                decodeImageInfo.textContent = `图片加载成功 - 尺寸: ${decodePreview.naturalWidth} x ${decodePreview.naturalHeight}`;
            };
            decodePreview.onerror = () => {
                showTooltip(decodeImage, '无效的图片Base64编码');
                decodePreview.src = '';
                downloadImage.disabled = true;
                decodeImageInfo.textContent = '图片加载失败，请检查Base64编码是否正确';
            };
        } catch (e) {
            showTooltip(decodeImage, '转换失败：' + e.message);
            decodePreview.src = '';
            downloadImage.disabled = true;
            decodeImageInfo.textContent = '转换失败，请检查输入';
        }
    });

    // 下载转换后的图片
    downloadImage.addEventListener('click', () => {
        if (!decodePreview.src || decodePreview.src === window.location.href) {
            showTooltip(downloadImage, '请先转换图片');
            return;
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'decoded-image.png';
        link.href = decodePreview.src;
        link.click();
    });

    // 工具函数：格式化文件大小
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 工具函数：显示提示
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
}); 