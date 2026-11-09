/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：Express 服务入口（/api 接口前缀 + 跨域 + 静态托管 frontend）
 */

const path = require('path');

/* .env 必须在读取配置之前加载 */
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const luoApiRouter = require('./routes/luo_api');

const LUO_PORT = 409;

const luoApp = express();

/* 后端支持所有跨域访问 */
luoApp.use(cors());

luoApp.use(express.json({ limit: '2mb' }));
luoApp.use(express.urlencoded({ extended: true }));

/* 访问日志：方便确认浏览器请求有没有真的打到服务端 */
luoApp.use(function (req, res, next) {
    var luoStart = Date.now();
    res.on('finish', function () {
        console.log('[luo] ' + req.method + ' ' + req.originalUrl + ' → ' + res.statusCode +
            ' (' + (Date.now() - luoStart) + 'ms)');
    });
    next();
});

/* 静态托管 frontend/ 目录
 * 开发阶段禁用缓存：改完 HTML/CSS/JS 刷新就能看到最新版，不会被浏览器缓存住 */
luoApp.use(express.static(path.join(__dirname, '..', 'frontend'), {
    etag: false,
    lastModified: false,
    setHeaders: function (res) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
    }
}));

/* 所有接口以 /api 为前缀 */
luoApp.use('/api', luoApiRouter);

/* /api 下未匹配到的路径，统一返回 JSON */
luoApp.use('/api', function (req, res) {
    res.status(404).json({
        code: 404,
        msg: '接口不存在：' + req.method + ' ' + req.originalUrl,
        data: null
    });
});

/* 统一错误处理，保证任何异常都返回 { code, msg, data } */
luoApp.use(function (err, req, res, next) {
    console.error('[luo] 未捕获异常：', err);
    res.status(500).json({
        code: 500,
        msg: err && err.message ? err.message : '服务器内部错误',
        data: null
    });
});

luoApp.listen(LUO_PORT, function () {
    console.log('==========================================');
    console.log('  罗亚博 · 学号 8409 · 端口 ' + LUO_PORT);
    console.log('  服务地址：http://localhost:' + LUO_PORT);
    console.log('  接口前缀：/api');
    console.log('  静态目录：frontend/');
    console.log('==========================================');
});
