// 页面加载动画 — 显示 spinner 直到页面渲染完成
(function() {
    var spinner = document.getElementById('loading-spinner');
    var progress = document.querySelector('.progress-fill');
    if (!spinner) return;

    var timer = null;

    function show() {
        spinner.style.display = 'flex';
        requestAnimationFrame(function() { spinner.classList.add('show'); });
        document.body.style.overflow = 'hidden';
        if (progress) progress.style.transform = 'scaleX(0)';
        var p = 0;
        timer = setInterval(function() {
            if (p < 60) p += 8;
            else if (p < 85) p += 3;
            else if (p < 90) p += 1;
            else { clearInterval(timer); timer = null; }
            if (progress) progress.style.transform = 'scaleX(' + (p / 100) + ')';
        }, 80);
    }

    function hide() {
        if (timer) { clearInterval(timer); timer = null; }
        if (progress) progress.style.transform = 'scaleX(1)';
        setTimeout(function() {
            spinner.classList.remove('show');
            setTimeout(function() {
                spinner.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }, 200);
    }

    if (document.readyState === 'loading') {
        show();
        window.addEventListener('load', hide);
        setTimeout(function() { if (spinner.style.display === 'flex') hide(); }, 3000);
    } else {
        spinner.style.display = 'none';
    }
})();