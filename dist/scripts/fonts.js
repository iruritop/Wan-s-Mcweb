// 字体管理功能
class FontManager {
    constructor() {
        this.fontConfig = null;
        this.init();
    }

    async init() {
        // 等待页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadFontConfig());
        } else {
            await this.loadFontConfig();
        }
    }

    async loadFontConfig() {
        try {
            // 尝试从全局配置获取字体设置
            if (window.websiteConfig && window.websiteConfig.fonts) {
                this.fontConfig = window.websiteConfig.fonts;
                this.applyFonts();
            } else {
                // 如果全局配置不可用，尝试API
                const response = await fetch('/api/font-config');
                if (response.ok) {
                    this.fontConfig = await response.json();
                    this.applyFonts();
                } else {
                    // 如果API不可用，使用默认配置
                    this.useDefaultFonts();
                }
            }
        } catch (error) {
            console.warn('无法加载字体配置，使用默认字体:', error);
            this.useDefaultFonts();
        }
    }

    useDefaultFonts() {
        // 默认字体配置
        this.fontConfig = {
            main: {
                family: '像素体',
                file: '/fonts/像素体.ttf',
                fallback: "'Quicksand', 'Noto Sans SC', sans-serif",
                weight: 'normal'
            },
            title: {
                family: '像素体',
                file: '/fonts/像素体.ttf',
                fallback: "'Quicksand', 'Noto Sans SC', sans-serif",
                weight: 'bold'
            }
        };
        this.applyFonts();
    }

    applyFonts() {
        if (!this.fontConfig) return;

        // 动态创建字体加载CSS
        this.createFontCSS();
        
        // 设置CSS变量
        this.setCSSVariables();
        
        // 预加载字体文件
        this.preloadFonts();
    }

    createFontCSS() {
        const style = document.createElement('style');
        style.id = 'dynamic-fonts';
        
        let css = '';
        
        // 为主字体创建@font-face
        if (this.fontConfig.main) {
            css += `
@font-face {
    font-family: '${this.fontConfig.main.family}';
    src: url('${this.fontConfig.main.file}') format('truetype');
    font-weight: ${this.fontConfig.main.weight};
    font-style: normal;
    font-display: swap;
}
            `;
        }

        // 为标题字体创建@font-face（如果与主字体不同）
        if (this.fontConfig.title && this.fontConfig.title.family !== this.fontConfig.main.family) {
            css += `
@font-face {
    font-family: '${this.fontConfig.title.family}';
    src: url('${this.fontConfig.title.file}') format('truetype');
    font-weight: ${this.fontConfig.title.weight};
    font-style: normal;
    font-display: swap;
}
            `;
        }

        style.textContent = css;
        
        // 移除已存在的动态字体样式
        const existingStyle = document.getElementById('dynamic-fonts');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
    }

    setCSSVariables() {
        const root = document.documentElement;
        
        if (this.fontConfig.main) {
            const mainFontStack = `'${this.fontConfig.main.family}', ${this.fontConfig.main.fallback}`;
            root.style.setProperty('--font-main', mainFontStack);
        }
        
        if (this.fontConfig.title) {
            const titleFontStack = `'${this.fontConfig.title.family}', ${this.fontConfig.title.fallback}`;
            root.style.setProperty('--font-title', titleFontStack);
        }
    }

    preloadFonts() {
        const fontsToPreload = new Set();
        
        if (this.fontConfig.main && this.fontConfig.main.file) {
            fontsToPreload.add(this.fontConfig.main.file);
        }
        
        if (this.fontConfig.title && this.fontConfig.title.file && this.fontConfig.title.file !== this.fontConfig.main.file) {
            fontsToPreload.add(this.fontConfig.title.file);
        }
        
        fontsToPreload.forEach(fontFile => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = fontFile;
            link.as = 'font';
            link.type = 'font/ttf';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // 更新字体配置（可用于动态切换字体）
    updateFonts(newConfig) {
        this.fontConfig = { ...this.fontConfig, ...newConfig };
        this.applyFonts();
        
        // 触发字体变化事件
        document.dispatchEvent(new CustomEvent('fontsChange', { 
            detail: { fontConfig: this.fontConfig } 
        }));
    }

    // 获取当前字体配置
    getFontConfig() {
        return this.fontConfig;
    }
}

// 初始化字体管理器
window.fontManager = new FontManager();

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontManager;
}