(function() {
    'use strict';

    var header = document.getElementById('header');
    var sidenav = document.getElementById('sidenav');
    var toggleBtn = document.querySelector('.sidenav__toggle');
    var backBtn = sidenav ? sidenav.querySelector('.sidenav__back') : null;
    var activeList = sidenav ? sidenav.querySelector('.sidenav__list') : null;
    var shadow = document.querySelector('.header__shadow');
    var history = [];
    var lastFocused = null;

    function throttle(fn, limit) {
        var waiting = false;
        return function() {
            if (!waiting) {
                fn.apply(this, arguments);
                waiting = true;
                setTimeout(function() { waiting = false; }, limit);
            }
        };
    }

    function openNav() {
        if (!sidenav) return;
        sidenav.classList.add('sidenav--open');
        sidenav.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        lastFocused = document.activeElement;
        var firstFocus = sidenav.querySelector('a, button');
        if (firstFocus) firstFocus.focus();
    }

    function closeNav() {
        if (!sidenav) return;
        sidenav.classList.remove('sidenav--open');
        sidenav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        while (history.length) {
            var prev = history.pop();
            prev.classList.add('sidenav__hidden');
        }
        if (activeList) activeList.classList.remove('sidenav__hidden');
        if (backBtn) backBtn.style.display = 'none';
        if (lastFocused) lastFocused.focus();
    }

    function navigateTo(sublist, link) {
        if (!sublist) return;
        history.push({ list: activeList, trigger: link });
        activeList.classList.add('sidenav__hidden');
        sublist.classList.remove('sidenav__hidden');
        activeList = sublist;
        if (backBtn) backBtn.style.display = 'block';
        if (link) link.setAttribute('aria-expanded', 'true');
    }

    function goBack() {
        if (!history.length) return;
        activeList.classList.add('sidenav__hidden');
        var item = history.pop();
        item.list.classList.remove('sidenav__hidden');
        if (item.trigger) item.trigger.setAttribute('aria-expanded', 'false');
        activeList = item.list;
        if (!history.length && backBtn) backBtn.style.display = 'none';
    }

    function bindSideNav() {
        if (!toggleBtn || !sidenav) return;
        toggleBtn.addEventListener('click', function() {
            if (sidenav.classList.contains('sidenav--open')) {
                closeNav();
            } else {
                openNav();
            }
        });
        sidenav.addEventListener('click', function(e) {
            if (e.target === sidenav) {
                closeNav();
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 27 && sidenav.classList.contains('sidenav--open')) {
                closeNav();
            }
        });
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                goBack();
            });
        }
        sidenav.addEventListener('click', function(e) {
            var link = e.target.closest('.sidenav__link--hasSub');
            if (link) {
                var sub = link.nextElementSibling;
                if (sub && sub.classList.contains('sidenav__sublist')) {
                    e.preventDefault();
                    navigateTo(sub, link);
                }
            }
        });
    }

    function bindMegaMenu() {
        var links = document.querySelectorAll('.header__link--hasMega');
        Array.prototype.forEach.call(links, function(link) {
            var mega = document.getElementById(link.getAttribute('aria-controls'));
            if (!mega) return;
            link.addEventListener('mouseenter', function() {
                mega.classList.add('header__mega--show');
                link.setAttribute('aria-expanded', 'true');
            });
            link.addEventListener('focus', function() {
                mega.classList.add('header__mega--show');
                link.setAttribute('aria-expanded', 'true');
            });
            link.parentNode.addEventListener('mouseleave', function() {
                mega.classList.remove('header__mega--show');
                link.setAttribute('aria-expanded', 'false');
            });
            document.addEventListener('keydown', function(e) {
                if (e.keyCode === 27) {
                    mega.classList.remove('header__mega--show');
                    link.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    function watchScroll() {
        var lastY = window.pageYOffset || 0;
        var handler = throttle(function() {
            var currentY = window.pageYOffset || 0;
            if (currentY > lastY && currentY > 50) {
                header.classList.add('header--hidden');
            } else {
                header.classList.remove('header--hidden');
            }
            if (shadow) {
                if (currentY > 0) {
                    shadow.classList.add('header__shadow--visible');
                } else {
                    shadow.classList.remove('header__shadow--visible');
                }
            }
            lastY = currentY;
        }, 100);
        window.addEventListener('scroll', handler);
    }

    function resizeHandler() {
        closeNav();
    }

    document.addEventListener('DOMContentLoaded', function() {
        bindSideNav();
        bindMegaMenu();
        watchScroll();
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', resizeHandler);
    });
})();
