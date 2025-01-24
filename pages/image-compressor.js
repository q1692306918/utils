document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const compressButton = document.getElementById('compressButton');

    // 更新质量显示
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value;
    });

    // 文件拖放处理
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
        handleFiles(e.dataTransfer.files);
    });

    // 文件选择处理
    imageInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // 处理选择的文件
    function handleFiles(files) {
        preview.innerHTML = '';
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    createPreviewItem(e.target.result, file);
                }
                reader.readAsDataURL(file);
            }
        });
        compressButton.disabled = false;
    }

    // 创建预览项
    function createPreviewItem(src, file) {
        const item = document.createElement('div');
        item.className = 'preview-item';

        const img = document.createElement('img');
        img.src = src;
        item.appendChild(img);

        const info = document.createElement('div');
        info.className = 'image-info';
        info.textContent = `${file.name} (${formatSize(file.size)})`;
        item.appendChild(info);

        preview.appendChild(item);
    }

    // 格式化文件大小
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 压缩图片
    compressButton.addEventListener('click', async function() {
        const items = preview.querySelectorAll('.preview-item');
        if (items.length === 0) return;

        items.forEach(item => {
            const img = item.querySelector('img');
            const info = item.querySelector('.image-info');
            const originalSrc = img.src;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const image = new Image();
            image.onload = function() {
                canvas.width = image.width;
                canvas.height = image.height;
                
                ctx.drawImage(image, 0, 0);
                
                const quality = qualitySlider.value / 100;
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // 创建下载链接
                const link = document.createElement('a');
                link.download = 'compressed-' + Date.now() + '.jpg';
                link.href = compressedDataUrl;
                link.click();

                // 更新预览和信息
                img.src = compressedDataUrl;
                const originalSize = getDataUrlSize(originalSrc);
                const compressedSize = getDataUrlSize(compressedDataUrl);
                info.textContent = `原始大小: ${formatSize(originalSize)} | 压缩后: ${formatSize(compressedSize)} | 压缩率: ${Math.round((1 - compressedSize/originalSize) * 100)}%`;
            };
            image.src = originalSrc;
        });
    });

    // 获取 Data URL 的大小
    function getDataUrlSize(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        const bytes = atob(base64).length;
        return bytes;
    }
}); 