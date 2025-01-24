document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const imageSize = document.getElementById('imageSize');
    const imageDimensions = document.getElementById('imageDimensions');
    const imageFormat = document.getElementById('imageFormat');
    const formatSelect = document.getElementById('formatSelect');
    const qualityControl = document.getElementById('qualityControl');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const flashMessage = document.getElementById('flashMessage');

    let originalFile = null;
    let convertedImageURL = null;

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
        const file = e.dataTransfer.files[0];
        const validTypes = [
            'image/png', 'image/jpeg', 'image/webp', 'image/gif',
            'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon',
            'image/jpg', 'image/jfif', 'image/pjpeg', 'image/pjp',
            'image/apng', 'image/avif'
        ];
        if (file && validTypes.includes(file.type)) {
            handleImageUpload(file);
        } else {
            showFlashMessage('不支持的图片格式');
        }
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        originalFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.onload = () => {
                updateImageInfo(file);
                convertBtn.disabled = false;
            };
        };
        
        reader.readAsDataURL(file);
    }

    // 更新图片信息
    function updateImageInfo(file) {
        imageSize.textContent = `大小: ${formatSize(file.size)}`;
        imageDimensions.textContent = `尺寸: ${previewImage.naturalWidth} x ${previewImage.naturalHeight}`;
        const format = file.type.split('/')[1].toUpperCase().replace('JPEG', 'JPG');
        imageFormat.textContent = `格式: ${format}`;
    }

    // 格式化文件大小
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 转换图片
    convertBtn.addEventListener('click', async () => {
        if (!originalFile) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = previewImage.naturalWidth;
        canvas.height = previewImage.naturalHeight;
        ctx.drawImage(previewImage, 0, 0);

        const format = formatSelect.value;
        const quality = qualitySlider.value / 100;

        try {
            let blob;
            // 特殊格式处理
            if (format === 'image/svg+xml') {
                // SVG转换需要特殊处理
                const svgData = await canvasToSVG(canvas);
                blob = new Blob([svgData], { type: 'image/svg+xml' });
            } else if (format === 'image/x-icon') {
                // ICO转换需要特殊处理
                blob = await canvasToICO(canvas);
            } else {
                // 普通格式转换
                blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, format, quality);
                });
            }

            if (convertedImageURL) {
                URL.revokeObjectURL(convertedImageURL);
            }

            convertedImageURL = URL.createObjectURL(blob);
            previewImage.src = convertedImageURL;
            
            // 更新图片信息
            const convertedFile = new File([blob], `converted.${format.split('/')[1]}`, { type: format });
            updateImageInfo(convertedFile);
            
            downloadBtn.disabled = false;
            showFlashMessage('转换成功！');
        } catch (error) {
            showFlashMessage('转换失败，请重试');
            console.error('转换失败:', error);
        }
    });

    // 下载转换后的图片
    downloadBtn.addEventListener('click', () => {
        if (!convertedImageURL) return;

        const format = formatSelect.value.split('/')[1];
        const link = document.createElement('a');
        link.href = convertedImageURL;
        link.download = `converted.${format}`;
        link.click();
    });

    // 显示提示消息
    function showFlashMessage(message) {
        flashMessage.textContent = message;
        flashMessage.classList.add('show');
        
        setTimeout(() => {
            flashMessage.classList.remove('show');
        }, 2000);
    }

    // 质量滑块值更新
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value;
    });

    // 格式选择变化处理
    formatSelect.addEventListener('change', () => {
        const format = formatSelect.value;
        // 只有JPEG和WEBP支持质量调节
        qualityControl.style.display = 
            ['image/jpeg', 'image/webp', 'image/jpg'].includes(format) ? 'flex' : 'none';
    });

    // SVG转换函数
    async function canvasToSVG(canvas) {
        const width = canvas.width;
        const height = canvas.height;
        const data = canvas.toDataURL('image/png');
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                     width="${width}" height="${height}">
                    <image width="${width}" height="${height}" xlink:href="${data}"/>
                </svg>`;
    }

    // ICO转换函数
    async function canvasToICO(canvas) {
        // 创建16x16、32x32和64x64的图标
        const sizes = [16, 32, 64];
        const pngBlobs = await Promise.all(sizes.map(async size => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0, size, size);
            return new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        }));
        
        // 使用第一个PNG作为ICO
        return pngBlobs[0];
    }
}); 