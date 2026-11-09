/*
 * 姓名：罗亚博 | 学号：8409
 * 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
 * 功能名称：图片列表控制器（分页 + 分类筛选，数据来自 luo_gallery 表）
 */

const luoDb = require('../config/luo_db');

const LUO_CATEGORIES = ['风景', '动物', '生活', '食物'];

/*
 * GET /api/gallery?category=风景&page=1&pageSize=9
 */
async function luoListGallery(req, res) {
    const luoCategory = String(req.query.category || '').trim();
    const luoPage = Math.max(1, parseInt(req.query.page, 10) || 1);
    const luoPageSize = Math.min(48, Math.max(1, parseInt(req.query.pageSize, 10) || 9));
    const luoOffset = (luoPage - 1) * luoPageSize;

    if (luoCategory && luoCategory !== '全部' && LUO_CATEGORIES.indexOf(luoCategory) === -1) {
        return res.json({ code: 4001, msg: '分类不存在：' + luoCategory, data: null });
    }

    const luoFiltered = luoCategory && luoCategory !== '全部';
    const luoWhere = luoFiltered ? ' WHERE category = ?' : '';
    const luoWhereParams = luoFiltered ? [luoCategory] : [];

    const luoSqlText = 'SELECT id, title, category, image_url, author, description, likes,\n' +
        "       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at\n" +
        'FROM luo_gallery' + (luoFiltered ? " WHERE category = '" + luoCategory + "'" : '') + '\n' +
        'ORDER BY id ASC\n' +
        'LIMIT ' + luoPageSize + ' OFFSET ' + luoOffset + ';';

    try {
        const luoStartedAt = Date.now();

        const [luoCountRows] = await luoDb.luoPool.query(
            'SELECT COUNT(*) AS total FROM luo_gallery' + luoWhere,
            luoWhereParams
        );
        const luoTotal = Number(luoCountRows[0].total) || 0;

        const [luoRows] = await luoDb.luoPool.query(
            'SELECT id, title, category, image_url, author, description, likes, ' +
            "DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at " +
            'FROM luo_gallery' + luoWhere + ' ORDER BY id ASC LIMIT ? OFFSET ?',
            luoWhereParams.concat([luoPageSize, luoOffset])
        );

        const [luoCatRows] = await luoDb.luoPool.query(
            'SELECT category, COUNT(*) AS n FROM luo_gallery GROUP BY category ORDER BY n DESC, category ASC'
        );

        return res.json({
            code: 0,
            msg: 'ok',
            data: {
                total: luoTotal,
                page: luoPage,
                pageSize: luoPageSize,
                totalPages: Math.max(1, Math.ceil(luoTotal / luoPageSize)),
                category: luoFiltered ? luoCategory : '全部',
                list: luoRows,
                categories: luoCatRows.map(function (row) {
                    return { name: row.category, count: Number(row.n) };
                }),
                sql: luoSqlText,
                elapsed: Date.now() - luoStartedAt
            }
        });
    } catch (luoErr) {
        console.error('[luo] 查询图片失败：', luoErr.code, luoErr.message);
        return res.status(500).json({
            code: 500,
            msg: '查询图片失败：' + (luoErr.message || '未知错误'),
            data: null
        });
    }
}

module.exports = {
    luoListGallery: luoListGallery
};
