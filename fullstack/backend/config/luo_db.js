/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：MySQL 连接配置（凭据全部来自 backend/.env，不出现在代码里）
 */

const mysql = require('mysql2/promise');

/* 可以对外公开的一部分配置（不含密码） */
const luoPublicConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'luo_fullstack'
};

/* 业务查询用的连接池 */
const luoPool = mysql.createPool({
    host: luoPublicConfig.host,
    port: luoPublicConfig.port,
    user: luoPublicConfig.user,
    password: process.env.DB_PASSWORD || '',
    database: luoPublicConfig.database,
    waitForConnections: true,
    connectionLimit: 8,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+08:00'
});

module.exports = {
    luoPool: luoPool,
    luoPublicConfig: luoPublicConfig
};
