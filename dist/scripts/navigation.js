// 导航栏自动隐藏功能
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.lastScrollTop = 0;
        this.hideThreshold = 100; // 向下滚动100px后隐藏
        this.showThreshold = 50;  // 向上滚动到距离顶部50px时显示
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.init();
    }

    init() {
        if (!this.navbar) return;

        // 绑定滚动事件
        window.addEventListener('scroll', () => this.handleScroll());
        
        // 绑定移动端菜单切换
        this.initMobileMenu();
        
        // 初始检查
        this.checkScrollPosition();
    }

    handleScroll() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        
        requestAnimationFrame(() => {
            this.checkScrollPosition();
            this.isScrolling = false;
        });
    }

    checkScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > this.lastScrollTop && scrollTop > this.hideThreshold) {
            // 向下滚动，隐藏导航栏
            this.hideNavbar();
        } else if (scrollTop < this.lastScrollTop && scrollTop < this.showThreshold) {
            // 向上滚动到顶部附近，显示导航栏
            this.showNavbar();
        }
        
        this.lastScrollTop = scrollTop;
    }

    hideNavbar() {
        if (this.navbar && !this.navbar.classList.contains('hidden')) {
            this.navbar.classList.add('hidden');
            
            // 触发自定义事件
            document.dispatchEvent(new CustomEvent('navbarHide'));
        }
    }

    showNavbar() {
        if (this.navbar && this.navbar.classList.contains('hidden')) {
            this.navbar.classList.remove('hidden');
            
            // 触发自定义事件
            document.dispatchEvent(new CustomEvent('navbarShow'));
        }
    }

    initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.querySelector('.navbar-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
                
                // 更新图标
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.className = navMenu.classList.contains('active') ? 'mdi mdi-close' : 'mdi mdi-menu';
                }
            });
            
            // 点击菜单项后关闭移动菜单
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'mdi mdi-menu';
                });
            });
            
            // 点击外部关闭菜单
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'mdi mdi-menu';
                }
            });
        }
    }

    // 强制显示导航栏（用于特殊场景）
    forceShow() {
        this.showNavbar();
        
        // 暂时禁用自动隐藏
        this.disableAutoHide();
        
        // 3秒后重新启用
        setTimeout(() => {
            this.enableAutoHide();
        }, 3000);
    }

    disableAutoHide() {
        window.removeEventListener('scroll', this.handleScroll);
        this.showNavbar();
    }

    enableAutoHide() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // 更新阈值设置
    updateThresholds(hideThreshold, showThreshold) {
        this.hideThreshold = hideThreshold;
        this.showThreshold = showThreshold;
    }
}

// 初始化导航管理器
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}