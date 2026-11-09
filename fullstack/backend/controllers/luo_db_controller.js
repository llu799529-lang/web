/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：数据库连接测试控制器（成功与失败都给出明确提示）
 */

const mysql = require('mysql2/promise');
const luoDb = require('../config/luo_db');

/* 把 MySQL 驱动的原始报错翻译成人能看懂的话 */
function luoErrorText(err) {
    const luoCode = err && err.code ? err.code : '';

    if (luoCode === 'ER_ACCESS_DENIED_ERROR') {
        return '用户名或密码错误，MySQL 拒绝了这次登录';
    }
    if (luoCode === 'ECONNREFUSED') {
        return '连不上数据库服务：MySQL 可能没有启动，或端口不对';
    }
    if (luoCode === 'ETIMEDOUT' || luoCode === 'PROTOCOL_SEQUENCE_TIMEOUT') {
        return '连接超时：主机地址不可达，或防火墙拦截了端口';
    }
    if (luoCode === 'ENOTFOUND') {
        return '主机地址无法解析，请检查填写的地址';
    }
    if (luoCode === 'ER_BAD_DB_ERROR') {
        return '这个数据库不存在，请检查库名';
    }
    return err && err.message ? err.message : '未知错误';
}

/*
 * POST /api/db/test
 * 请求体：{ host, port, user, password, database }
 * 返回：  { code: 0, msg: '连接成功', data: { version, currentUser, database, databases, elapsed } }
 */
async function luoTestConnection(req, res) {
    const luoBody = req.body || {};
    const luoUser = String(luoBody.user || '').trim();
    const luoPassword = typeof luoBody.password === 'string' ? luoBody.password : '';
    const luoHost = String(luoBody.host || '127.0.0.1').trim();
    const luoPort = Number(luoBody.port) || 3306;
    const luoDatabase = String(luoBody.database || '').trim();

    if (!luoUser) {
        return res.json({ code: 4001, msg: '请填写用户名', data: null });
    }
    if (!luoHost) {
        return res.json({ code: 4002, msg: '请填写主机地址', data: null });
    }

    const luoStartedAt = Date.now();
    let luoConn = null;

    try {
        luoConn = await mysql.createConnection({
            host: luoHost,
            port: luoPort,
            user: luoUser,
            password: luoPassword,
            database: luoDatabase || undefined,
            connectTimeout: 6000,
            charset: 'utf8mb4'
        });

        const [luoVersionRows] = await luoConn.query(
            'SELECT VERSION() AS version, CURRENT_USER() AS currentUser, DATABASE() AS currentDb'
        );
        const [luoDbRows] = await luoConn.query('SHOW DATABASES');

        const luoVersion = luoVersionRows[0];
        const luoDatabases = luoDbRows
            .map(function (row) { return row.Database; })
            .filter(function (name) { return name !== 'information_schema' && name !== 'performance_schema'; });

        return res.json({
            code: 0,
            msg: '连接成功',
            data: {
                host: luoHost,
                port: luoPort,
                user: luoUser,
                version: luoVersion.version,
                currentUser: luoVersion.currentUser,
                database: luoVersion.currentDb,
                databases: luoDatabases,
                elapsed: Date.now() - luoStartedAt
            }
        });
    } catch (luoErr) {
        console.error('[luo] 数据库连接失败：', luoErr.code, luoErr.message);
        return res.json({
            code: 4003,
            msg: luoErrorText(luoErr),
            data: {
                errno: luoErr.errno || null,
                code: luoErr.code || null,
                sqlState: luoErr.sqlState || null,
                elapsed: Date.now() - luoStartedAt
            }
        });
    } finally {
        if (luoConn) {
            try { await luoConn.end(); } catch (e) { /* 忽略关闭异常 */ }
        }
    }
}

/*
 * GET /api/db/info
 * 返回 .env 里配置的目标库信息（不含密码），并顺手探一次连接是否可用
 */
async function luoDbInfo(req, res) {
    const luoInfo = {
        host: luoDb.luoPublicConfig.host,
        port: luoDb.luoPublicConfig.port,
        user: luoDb.luoPublicConfig.user,
        database: luoDb.luoPublicConfig.database,
        connected: false,
        version: null,
        error: null
    };

    try {
        const luoConn = await luoDb.luoPool.getConnection();
        try {
            const [luoRows] = await luoConn.query('SELECT VERSION() AS version, DATABASE() AS currentDb');
            luoInfo.connected = true;
            luoInfo.version = luoRows[0].version;
            luoInfo.database = luoRows[0].currentDb || luoInfo.database;
        } finally {
            luoConn.release();
        }
    } catch (luoErr) {
        luoInfo.error = luoErrorText(luoErr);
    }

    return res.json({ code: 0, msg: 'ok', data: luoInfo });
}

module.exports = {
    luoTestConnection: luoTestConnection,
    luoDbInfo: luoDbInfo
};
