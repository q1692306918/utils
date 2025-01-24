document.addEventListener('DOMContentLoaded', function() {
    const qrInput = document.getElementById('qrInput');
    const sizeInput = document.getElementById('sizeInput');
    const errorLevel = document.getElementById('errorLevel');
    const foregroundColor = document.getElementById('foregroundColor');
    const backgroundColor = document.getElementById('backgroundColor');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const qrSize = document.getElementById('qrSize');
    const contentLength = document.getElementById('contentLength');

    let qrcode = null;

    function generateQRCode() {
        const text = qrInput.value.trim();
        if (!text) {
            alert('请输入要生成二维码的内容');
            return;
        }

        // 清除旧的二维码
        qrcodeDiv.innerHTML = '';

        try {
            const size = parseInt(sizeInput.value);
            // 创建新的二维码
            qrcode = new QRCode(qrcodeDiv, {
                text: text,
                width: size,
                height: size,
                colorDark: foregroundColor.value,
                colorLight: backgroundColor.value,
                correctLevel: QRCode.CorrectLevel[errorLevel.value]
            });

            // 更新信息显示
            qrSize.textContent = `尺寸: ${size} x ${size} px`;
            contentLength.textContent = `内容长度: ${text.length} 字符`;
        } catch (e) {
            alert('生成二维码时出错：' + e.message);
        }
    }

    function downloadQRCode() {
        if (!qrcode) {
            alert('请先生成二维码');
            return;
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrcodeDiv.querySelector('canvas').toDataURL('image/png');
        link.click();
    }

    // 事件监听
    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);

    // 输入内容长度限制和实时更新
    qrInput.addEventListener('input', () => {
        contentLength.textContent = `内容长度: ${qrInput.value.length} 字符`;
    });

    // 尺寸输入限制
    sizeInput.addEventListener('input', () => {
        let value = parseInt(sizeInput.value);
        if (value < 100) value = 100;
        if (value > 1000) value = 1000;
        sizeInput.value = value;
        qrSize.textContent = `尺寸: ${value} x ${value} px`;
    });

    // 颜色选择器变化时重新生成
    foregroundColor.addEventListener('change', generateQRCode);
    backgroundColor.addEventListener('change', generateQRCode);
    errorLevel.addEventListener('change', generateQRCode);

    // 初始生成示例
    qrInput.value = 'https://example.com';
    generateQRCode();

    // 标签切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.qrcode-container');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // 扫描功能
    const uploadArea = document.getElementById('uploadArea');
    const scanInput = document.getElementById('scanInput');
    const scanPreview = document.getElementById('scanPreview');
    const scanCanvas = document.getElementById('scanCanvas');
    const scanResult = document.getElementById('scanResult');
    const copyScanResult = document.getElementById('copyScanResult');

    uploadArea.addEventListener('click', () => {
        scanInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-color').trim();
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleScanImage(file);
        }
    });

    scanInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleScanImage(file);
        }
    });

    function handleScanImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                scanPreview.src = e.target.result;
                scanCanvas.width = img.width;
                scanCanvas.height = img.height;
                const ctx = scanCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                try {
                    const imageData = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        scanResult.value = code.data;
                    } else {
                        scanResult.value = '未能识别二维码，请尝试其他图片';
                    }
                } catch (e) {
                    scanResult.value = '图片处理失败：' + e.message;
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    copyScanResult.addEventListener('click', () => {
        navigator.clipboard.writeText(scanResult.value).then(() => {
            showTooltip(copyScanResult, '已复制');
        });
    });

    // 添加错误处理
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