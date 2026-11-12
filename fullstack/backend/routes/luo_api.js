/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：API 路由表（全部以 /api 为前缀）
 */

const express = require('express');
const luoDbController = require('../controllers/luo_db_controller');
const luoNewsController = require('../controllers/luo_news_controller');
const luoGalleryController = require('../controllers/luo_gallery_controller');
const luoChatController = require('../controllers/luo_chat_controller');

const luoRouter = express.Router();

/* 健康检查：前端用它判断后端是否起来了 */
luoRouter.get('/health', function (req, res) {
    res.json({
        code: 0,
        msg: 'ok',
        data: {
            service: 'luo-fullstack-409',
            port: 409,
            time: new Date().toISOString()
        }
    });
});

/* 数据库连接测试 */
luoRouter.post('/db/test', luoDbController.luoTestConnection);

/* 当前 .env 指向的数据库概况 */
luoRouter.get('/db/info', luoDbController.luoDbInfo);

/* 新闻列表：分页 + 分类筛选 */
luoRouter.get('/news', luoNewsController.luoListNews);

/* 图片列表：分页 + 分类筛选 */
luoRouter.get('/gallery', luoGalleryController.luoListGallery);

/* AI 聊天：代理硅基流动，密钥只在后端 */
luoRouter.post('/chat', luoChatController.luoChat);

module.exports = luoRouter;
