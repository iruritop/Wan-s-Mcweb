// 页面加载动画管理器
class LoadingManager {
    constructor() {
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.progressFill = document.querySelector('.progress-fill');
        this.isLoading = false;
        this.minLoadingTime = 800; // 最小加载时间（毫秒）
        this.startTime = 0;
        
        this.init();
    }

    init() {
        if (!this.loadingSpinner) return;

        // 监听页面加载事件
        this.setupPageLoadListener();
        
        // 监听页面切换事件
        this.setupNavigationListener();
        
        // 监听页面可见性变化（处理浏览器标签切换）
        this.setupVisibilityListener();
    }

    setupPageLoadListener() {
        // 页面首次加载 - 总是显示加载动画
        this.showLoading();
        
        // 模拟进度条
        this.simulateProgress();
        
        // 监听页面加载完成事件
        if (document.readyState === 'loading') {
            // 页面还在加载中
            document.addEventListener('DOMContentLoaded', () => {
                // DOM 加载完成，但资源可能还在加载
            });
            window.addEventListener('load', () => {
                // 所有资源加载完成
                this.hideLoading();
            });
        } else {
            // 页面已经加载完成，但为了用户体验，仍然显示短暂动画
            setTimeout(() => {
                this.hideLoading();
            }, this.minLoadingTime);
        }
        
        // 安全机制：如果页面加载时间过长，强制隐藏动画
        setTimeout(() => {
            if (this.isLoading) {
                this.hideLoading();
            }
        }, 5000); // 5秒超时
    }

    setupNavigationListener() {
        // 监听链接点击事件（页面切换）
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isInternalLink(link.href)) {
                e.preventDefault();
                this.handleNavigation(link.href);
            }
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', () => {
            this.showLoading();
            this.simulateProgress();
            setTimeout(() => this.hideLoading(), this.minLoadingTime);
        });
    }

    setupVisibilityListener() {
        // 处理页面可见性变化（浏览器标签切换）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停动画
                this.pauseAnimations();
            } else {
                // 页面显示时恢复动画
                this.resumeAnimations();
            }
        });
    }

    isInternalLink(href) {
        // 检查是否是内部链接（排除外部链接和锚点链接）
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin && 
                   !href.startsWith('mailto:') && 
                   !href.startsWith('tel:') &&
                   !href.includes('#');
        } catch {
            return false;
        }
    }

    handleNavigation(url) {
        this.showLoading();
        this.simulateProgress();
        
        // 模拟页面切换延迟
        setTimeout(() => {
            window.location.href = url;
        }, this.minLoadingTime);
    }

    showLoading() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.startTime = Date.now();
        
        // 显示加载动画
        this.loadingSpinner.style.display = 'flex';
        requestAnimationFrame(() => {
            this.loadingSpinner.classList.add('show');
        });
        
        // 暂停页面滚动
        document.body.style.overflow = 'hidden';
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('loadingStart'));
    }

    hideLoading() {
        if (!this.isLoading) return;
        
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);
        
        // 确保最小加载时间
        setTimeout(() => {
            this.loadingSpinner.classList.remove('show');
            
            // 等待动画完成后再隐藏元素
            setTimeout(() => {
                this.loadingSpinner.style.display = 'none';
                this.isLoading = false;
                
                // 恢复页面滚动
                document.body.style.overflow = '';
                
                // 重置进度条
                this.progressFill.style.width = '0%';
                
                // 触发自定义事件
                document.dispatchEvent(new CustomEvent('loadingComplete'));
            }, 300);
        }, remainingTime);
    }

    simulateProgress() {
        // 模拟进度条动画
        let progress = 0;
        const interval = setInterval(() => {
            if (progress >= 90) {
                clearInterval(interval);
                return;
            }
            
            progress += Math.random() * 10;
            this.progressFill.style.width = Math.min(progress, 90) + '%';
        }, 200);
        
        // 页面加载完成后完成进度条
        window.addEventListener('load', () => {
            clearInterval(interval);
            this.progressFill.style.width = '100%';
        });
    }

    pauseAnimations() {
        // 暂停所有动画
        const animations = this.loadingSpinner.getAnimations();
        animations.forEach(animation => animation.pause());
    }

    resumeAnimations() {
        // 恢复所有动画
        const animations = this.loadingSpinner.getAnimations();
        animations.forEach(animation => animation.play());
    }

    // 公共方法：手动控制加载状态
    show() {
        this.showLoading();
    }

    hide() {
        this.hideLoading();
    }

    // 设置自定义最小加载时间
    setMinLoadingTime(time) {
        this.minLoadingTime = time;
    }
}

// 立即初始化加载管理器，确保在页面加载早期就开始显示动画
window.loadingManager = new LoadingManager();

// 如果 DOM 已经加载完成，立即开始页面加载动画
if (document.readyState !== 'loading') {
    // DOM 已经加载完成，但为了确保动画显示，延迟一小段时间
    setTimeout(() => {
        if (window.loadingManager && !window.loadingManager.isLoading) {
            window.loadingManager.showLoading();
            window.loadingManager.simulateProgress();
            setTimeout(() => {
                window.loadingManager.hideLoading();
            }, window.loadingManager.minLoadingTime);
        }
    }, 100);
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}