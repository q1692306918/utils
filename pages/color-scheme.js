document.addEventListener('DOMContentLoaded', function() {
    const mainColor = document.getElementById('mainColor');
    const colorHex = document.getElementById('colorHex');
    const colorGrid = document.getElementById('colorGrid');
    const schemeButtons = document.querySelectorAll('.scheme-btn');
    const schemeDescription = document.getElementById('schemeDescription');
    const flashMessage = document.getElementById('flashMessage');

    // 配色方案描述
    const schemeDescriptions = {
        monochromatic: '单色配色：基于单一颜色的明度和饱和度变化，创造和谐统一的视觉效果。',
        analogous: '类似色配色：使用色轮上相邻的颜色，产生自然和谐的视觉效果。',
        complementary: '互补色配色：使用色轮上对立的两个颜色，创造强烈的对比效果。',
        triadic: '三角色配色：使用色轮上相隔120度的三个颜色，形成平衡而富有活力的效果。',
        split: '分裂互补色配色：主色调搭配互补色两侧的颜色，创造丰富而和谐的效果。'
    };

    // 更新颜色显示
    function updateColorDisplay(color) {
        colorHex.textContent = color.toUpperCase();
        mainColor.value = color;
        generateColorScheme(color);
    }

    // 生成配色方案
    function generateColorScheme(baseColor) {
        const currentScheme = document.querySelector('.scheme-btn.active').dataset.type;
        const colors = calculateColors(baseColor, currentScheme);
        
        // 清空现有颜色格子
        colorGrid.innerHTML = '';
        
        // 创建新的颜色格子
        colors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color;
            colorBox.dataset.color = color.toUpperCase();
            
            colorBox.addEventListener('click', () => {
                copyToClipboard(color);
            });
            
            colorGrid.appendChild(colorBox);
        });
    }

    // 计算配色方案
    function calculateColors(baseColor, scheme) {
        // 将十六进制转换为HSL
        const hsl = hexToHSL(baseColor);
        
        switch(scheme) {
            case 'monochromatic':
                return [
                    baseColor,
                    adjustHSL(hsl, 0, 0.1, 0.1),
                    adjustHSL(hsl, 0, -0.1, 0.1),
                    adjustHSL(hsl, 0, 0.2, -0.1),
                    adjustHSL(hsl, 0, -0.2, -0.1)
                ];
            case 'analogous':
                return [
                    baseColor,
                    adjustHSL(hsl, 30, 0, 0),
                    adjustHSL(hsl, -30, 0, 0),
                    adjustHSL(hsl, 60, 0, 0),
                    adjustHSL(hsl, -60, 0, 0)
                ];
            case 'complementary':
                return [
                    baseColor,
                    adjustHSL(hsl, 180, 0, 0),
                    adjustHSL(hsl, 180, 0.1, 0.1),
                    adjustHSL(hsl, 0, 0.1, 0.1),
                    adjustHSL(hsl, 180, -0.1, -0.1)
                ];
            case 'triadic':
                return [
                    baseColor,
                    adjustHSL(hsl, 120, 0, 0),
                    adjustHSL(hsl, 240, 0, 0),
                    adjustHSL(hsl, 120, 0.1, 0.1),
                    adjustHSL(hsl, 240, 0.1, 0.1)
                ];
            case 'split':
                return [
                    baseColor,
                    adjustHSL(hsl, 150, 0, 0),
                    adjustHSL(hsl, 210, 0, 0),
                    adjustHSL(hsl, 150, 0.1, 0.1),
                    adjustHSL(hsl, 210, 0.1, 0.1)
                ];
        }
    }

    // 颜色转换工具函数
    function hexToHSL(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s, l: l };
    }

    function HSLToHex(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;

            r = hue2rgb(p, q, h / 360 + 1/3);
            g = hue2rgb(p, q, h / 360);
            b = hue2rgb(p, q, h / 360 - 1/3);
        }

        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function adjustHSL(hsl, hChange, sChange, lChange) {
        let newH = (hsl.h + hChange) % 360;
        if (newH < 0) newH += 360;
        let newS = Math.max(0, Math.min(1, hsl.s + sChange));
        let newL = Math.max(0, Math.min(1, hsl.l + lChange));
        return HSLToHex(newH, newS, newL);
    }

    // 复制颜色代码
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showFlashMessage(`已复制颜色代码：${text}`);
        });
    }

    // 显示闪现消息
    function showFlashMessage(message) {
        flashMessage.textContent = message;
        flashMessage.classList.add('show');
        
        setTimeout(() => {
            flashMessage.classList.remove('show');
        }, 1000);
    }

    // 事件监听
    mainColor.addEventListener('input', (e) => {
        updateColorDisplay(e.target.value);
    });

    mainColor.addEventListener('change', (e) => {
        updateColorDisplay(e.target.value);
    });

    schemeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            schemeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            schemeDescription.textContent = schemeDescriptions[btn.dataset.type];
            generateColorScheme(mainColor.value);
        });
    });

    // 初始化
    updateColorDisplay(mainColor.value);
}); 