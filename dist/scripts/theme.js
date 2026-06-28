// 主题切换功能
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // 设置初始主题
        this.setTheme(this.currentTheme);
        
        // 绑定主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 监听系统主题变化
        this.watchSystemTheme();
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // 添加切换动画
        this.addTransitionEffect();
    }

    addTransitionEffect() {
        document.body.style.transition = 'none';
        document.body.style.opacity = '0.8';
        
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.3s var(--ease-smooth)';
            document.body.style.opacity = '1';
        });

        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 如果没有手动设置过主题，跟随系统
            if (!localStorage.getItem('theme')) {
                this.setTheme(mediaQuery.matches ? 'dark' : 'light');
            }

            // 监听系统主题变化
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    }

    // 检查是否是暗色主题
    isDark() {
        return this.currentTheme === 'dark';
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}