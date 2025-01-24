document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    const colorPreview = document.getElementById('colorPreview');
    const paletteGrid = document.getElementById('paletteGrid');
    const schemeColors = document.getElementById('schemeColors');
    const schemeButtons = document.querySelectorAll('.scheme-options button');

    // 工具提示函数
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';

        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    // 颜色转换函数
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToRgb(h, s, l) {
        h = h % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;
        
        if (s === 0) {
            const v = Math.round(l * 255);
            return { r: v, g: v, b: v };
        }

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;

        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    // 解析颜色输入
    function parseRgb(input) {
        const match = input.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
        return null;
    }

    function parseHsl(input) {
        const match = input.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/);
        if (match) {
            return {
                h: parseInt(match[1]),
                s: parseInt(match[2]),
                l: parseInt(match[3])
            };
        }
        return null;
    }

    // 更新颜色显示
    function updateColorDisplay(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) return;
        
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        colorPreview.style.backgroundColor = hex;
        hexInput.value = hex.toUpperCase();
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        colorPicker.value = hex;
        
        updateColorSchemes(hex);
    }

    // 生成配色方案
    function generateColorScheme(hex, type) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        let colors = [];

        switch(type) {
            case 'monochromatic':
                colors = [
                    { h: hsl.h, s: hsl.s, l: 20 },
                    { h: hsl.h, s: hsl.s, l: 40 },
                    { h: hsl.h, s: hsl.s, l: 60 },
                    { h: hsl.h, s: hsl.s, l: 80 }
                ];
                break;
            case 'analogous':
                colors = [
                    { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h - 15 + 360) % 360, s: hsl.s, l: hsl.l },
                    { h: hsl.h, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 15) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'complementary':
                colors = [
                    { h: hsl.h, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'triadic':
                colors = [
                    { h: hsl.h, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
            case 'split-complementary':
                colors = [
                    { h: hsl.h, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l },
                    { h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l }
                ];
                break;
        }

        return colors.map(color => {
            const rgb = hslToRgb(color.h, color.s, color.l);
            return rgbToHex(rgb.r, rgb.g, rgb.b);
        });
    }

    // 更新配色方案显示
    function updateColorSchemes(hex) {
        const activeScheme = document.querySelector('.scheme-options button.active');
        const schemeType = activeScheme ? activeScheme.dataset.scheme : 'analogous';
        const schemes = generateColorScheme(hex, schemeType);
        
        schemeColors.innerHTML = '';
        schemes.forEach(color => {
            const div = document.createElement('div');
            div.className = 'scheme-color';
            div.style.backgroundColor = color;
            div.setAttribute('data-color', color.toUpperCase());
            div.addEventListener('click', () => {
                navigator.clipboard.writeText(color.toUpperCase());
                showTooltip(div, '已复制颜色代码');
            });
            schemeColors.appendChild(div);
        });
    }

    // 生成调色板
    function generatePalette() {
        const hues = [0, 30, 60, 120, 180, 240, 300];
        const saturations = [100, 75, 50];
        const lightnesses = [80, 60, 40];

        paletteGrid.innerHTML = '';
        hues.forEach(h => {
            saturations.forEach(s => {
                lightnesses.forEach(l => {
                    const rgb = hslToRgb(h, s, l);
                    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                    
                    const div = document.createElement('div');
                    div.className = 'palette-color';
                    div.style.backgroundColor = hex;
                    div.setAttribute('data-color', hex.toUpperCase());
                    div.addEventListener('click', () => {
                        updateColorDisplay(hex);
                        showTooltip(div, '已选择颜色');
                    });
                    paletteGrid.appendChild(div);
                });
            });
        });
    }

    // 事件监听
    colorPicker.addEventListener('input', (e) => {
        updateColorDisplay(e.target.value);
    });

    hexInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            updateColorDisplay(hex);
        }
    });

    rgbInput.addEventListener('input', (e) => {
        const rgb = parseRgb(e.target.value);
        if (rgb) {
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            updateColorDisplay(hex);
        }
    });

    hslInput.addEventListener('input', (e) => {
        const hsl = parseHsl(e.target.value);
        if (hsl) {
            const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            updateColorDisplay(hex);
        }
    });

    schemeButtons.forEach(button => {
        button.addEventListener('click', () => {
            schemeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateColorSchemes(colorPicker.value);
        });
    });

    // 初始化
    generatePalette();
    updateColorDisplay('#3498db');
    schemeButtons[0].click();
}); 