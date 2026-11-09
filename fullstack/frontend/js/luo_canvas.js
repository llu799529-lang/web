/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：全站 canvas 背景动画（漂浮粒子 + 就近连线 + 鼠标轻微斥力）
 */

(function () {
    var luoCanvas = document.getElementById('luoCanvas');
    if (!luoCanvas || !luoCanvas.getContext) {
        return;
    }

    var luoCtx = luoCanvas.getContext('2d');
    var luoDpr = Math.min(window.devicePixelRatio || 1, 2);
    var luoLinkDist = 138;       /* 连线距离 */
    var luoWidth = 0;
    var luoHeight = 0;
    var luoDots = [];
    var luoMouse = { x: -9999, y: -9999 };

    function luoBuildDots() {
        var luoCount = Math.round(Math.min(92, Math.max(34, luoWidth * luoHeight / 17000)));
        luoDots = [];

        for (var luoI = 0; luoI < luoCount; luoI++) {
            luoDots.push({
                x: Math.random() * luoWidth,
                y: Math.random() * luoHeight,
                vx: (Math.random() - 0.5) * 0.34,
                vy: (Math.random() - 0.5) * 0.34,
                r: Math.random() * 1.5 + 1.1
            });
        }
    }

    function luoResize() {
        luoWidth = window.innerWidth;
        luoHeight = window.innerHeight;

        luoCanvas.width = Math.round(luoWidth * luoDpr);
        luoCanvas.height = Math.round(luoHeight * luoDpr);
        luoCanvas.style.width = luoWidth + 'px';
        luoCanvas.style.height = luoHeight + 'px';

        luoCtx.setTransform(luoDpr, 0, 0, luoDpr, 0, 0);
        luoBuildDots();
    }

    function luoDrawFrame() {
        luoCtx.clearRect(0, 0, luoWidth, luoHeight);

        var luoI;
        var luoJ;
        var luoA;
        var luoB;
        var luoDx;
        var luoDy;
        var luoDist;

        /* 先画连线，后画点，点压在线上更干净 */
        for (luoI = 0; luoI < luoDots.length; luoI++) {
            luoA = luoDots[luoI];

            for (luoJ = luoI + 1; luoJ < luoDots.length; luoJ++) {
                luoB = luoDots[luoJ];
                luoDx = luoA.x - luoB.x;
                luoDy = luoA.y - luoB.y;

                if (Math.abs(luoDx) > luoLinkDist || Math.abs(luoDy) > luoLinkDist) {
                    continue;
                }

                luoDist = Math.sqrt(luoDx * luoDx + luoDy * luoDy);
                if (luoDist >= luoLinkDist) {
                    continue;
                }

                luoCtx.strokeStyle = 'rgba(118, 140, 172, ' +
                    (0.2 * (1 - luoDist / luoLinkDist)).toFixed(3) + ')';
                luoCtx.lineWidth = 1;
                luoCtx.beginPath();
                luoCtx.moveTo(luoA.x, luoA.y);
                luoCtx.lineTo(luoB.x, luoB.y);
                luoCtx.stroke();
            }
        }

        for (luoI = 0; luoI < luoDots.length; luoI++) {
            var luoDot = luoDots[luoI];

            /* 鼠标附近稍微亮一点，形成一点互动 */
            var luoMdx = luoDot.x - luoMouse.x;
            var luoMdy = luoDot.y - luoMouse.y;
            var luoMdist = Math.sqrt(luoMdx * luoMdx + luoMdy * luoMdy);
            var luoHot = luoMdist < 130 ? (1 - luoMdist / 130) : 0;

            luoCtx.beginPath();
            luoCtx.arc(luoDot.x, luoDot.y, luoDot.r + luoHot * 1.1, 0, Math.PI * 2);
            luoCtx.fillStyle = 'rgba(76, 108, 158, ' + (0.32 + luoHot * 0.36).toFixed(3) + ')';
            luoCtx.fill();

            /* 移动 */
            luoDot.x += luoDot.vx;
            luoDot.y += luoDot.vy;

            /* 鼠标轻推 */
            if (luoMdist < 96 && luoMdist > 0.01) {
                luoDot.x += (luoMdx / luoMdist) * 0.5;
                luoDot.y += (luoMdy / luoMdist) * 0.5;
            }

            /* 边界回弹 */
            if (luoDot.x < -20) {
                luoDot.x = -20;
                luoDot.vx = -luoDot.vx;
            } else if (luoDot.x > luoWidth + 20) {
                luoDot.x = luoWidth + 20;
                luoDot.vx = -luoDot.vx;
            }

            if (luoDot.y < -20) {
                luoDot.y = -20;
                luoDot.vy = -luoDot.vy;
            } else if (luoDot.y > luoHeight + 20) {
                luoDot.y = luoHeight + 20;
                luoDot.vy = -luoDot.vy;
            }
        }

        window.requestAnimationFrame(luoDrawFrame);
    }

    window.addEventListener('resize', luoResize);

    window.addEventListener('mousemove', function (ev) {
        luoMouse.x = ev.clientX;
        luoMouse.y = ev.clientY;
    });

    window.addEventListener('mouseout', function () {
        luoMouse.x = -9999;
        luoMouse.y = -9999;
    });

    luoResize();
    window.requestAnimationFrame(luoDrawFrame);
})();
