# 接口记录

> 每次创建或修改接口后，在本文件末尾追加，禁止覆盖已有内容。
> 追加格式：`接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间`

---

## GET /api/health

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无

响应示例：

```json
{
  "code": 0,
  "msg": "ok",
  "data": { "service": "luo-fullstack-409", "port": 409, "time": "2026-11-09T05:54:04.930Z" }
}
```

修改时间：2026-11-09 13:55

---

## GET /api/db/info

- 接口路径：`/api/db/info`
- HTTP 方法：`GET`
- 请求参数：无（读取 backend/.env 中的 DB_HOST / DB_PORT / DB_USER / DB_NAME，不含密码）

响应示例：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "database": "luo_fullstack",
    "connected": true,
    "version": "9.4.0",
    "error": null
  }
}
```

修改时间：2026-11-09 13:55

---

## POST /api/db/test

- 接口路径：`/api/db/test`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

```json
{
  "host": "127.0.0.1",
  "port": 3306,
  "user": "root",
  "password": "你的密码",
  "database": "luo_fullstack"
}
```

`database` 可留空，表示只验证账号密码、不指定库。

成功响应示例（实测 7 ms）：

```json
{
  "code": 0,
  "msg": "连接成功",
  "data": {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "version": "9.4.0",
    "currentUser": "root@localhost",
    "database": "luo_fullstack",
    "databases": ["deepsea_explorer", "hongmeng", "luo_fullstack", "..."],
    "elapsed": 7
  }
}
```

失败响应示例（密码错误）：

```json
{
  "code": 4003,
  "msg": "用户名或密码错误，MySQL 拒绝了这次登录",
  "data": { "errno": 1045, "code": "ER_ACCESS_DENIED_ERROR", "sqlState": "28000", "elapsed": 10 }
}
```

其他失败码：`4001` 用户名为空、`4002` 主机为空、`4003` 连接失败（含库不存在、服务未启动、超时等，`msg` 均为中文说明）。

修改时间：2026-11-09 13:55

---

## POST /api/db/test（补充：fromEnv 方式）

- 接口路径：`/api/db/test`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：`{ "fromEnv": true }`
- 说明：为 `true` 时，后端直接使用 `backend/.env` 里的 `DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME` 发起连接，
  **密码不下发到浏览器**。响应里的 `data.source` 为 `"env"`；用表单提交时为 `"form"`。

响应示例：

```json
{
  "code": 0,
  "msg": "连接成功",
  "data": {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "version": "9.4.0",
    "currentUser": "root@localhost",
    "database": "luo_fullstack",
    "source": "env",
    "elapsed": 5
  }
}
```

修改时间：2026-11-09 14:35

---

## GET /api/news

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数（Query）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `category` | string | 否 | 分类名：校园 / 通知 / 学术 / 活动 / 就业；不传或传「全部」表示不过滤 |
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页条数，默认 8，最大 50 |

请求示例：

```
GET http://localhost:409/api/news?category=通知&page=1&pageSize=8
```

响应示例（截取前两条）：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 12,
    "page": 1,
    "pageSize": 8,
    "totalPages": 2,
    "category": "全部",
    "list": [
      {
        "id": 1,
        "title": "学校召开 2026 年秋季学期教学工作会",
        "category": "校园",
        "author": "宣传部",
        "source": "校园新闻网",
        "summary": "会议总结了上学期教学运行情况，部署本学期课程建设与课堂质量提升的重点任务。",
        "views": 1286,
        "is_top": 1,
        "publish_time": "2026-11-08 09:20"
      }
    ],
    "categories": [
      { "name": "学术", "count": 3 },
      { "name": "校园", "count": 3 },
      { "name": "通知", "count": 3 },
      { "name": "活动", "count": 2 },
      { "name": "就业", "count": 1 }
    ],
    "sql": "SELECT id, title, ... FROM luo_news ORDER BY is_top DESC, publish_time DESC LIMIT 8 OFFSET 0;",
    "elapsed": 28
  }
}
```

失败响应示例（分类不存在）：

```json
{ "code": 4001, "msg": "分类不存在：abc", "data": null }
```

说明：`publish_time` 在 SQL 里用 `DATE_FORMAT(publish_time, '%Y-%m-%d %H:%i')` 输出为字符串，避免前后端时区换算差异。

修改时间：2026-11-09 14:42

---

## GET /api/gallery

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 请求参数（Query）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `category` | string | 否 | 分类：校园 / 建筑 / 风景 / 活动 / 实验；不传或「全部」表示不过滤 |
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页张数，默认 9，最大 48 |

请求示例：

```
GET http://localhost:409/api/gallery?category=风景&page=1&pageSize=9
```

响应示例：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 12,
    "page": 1,
    "pageSize": 9,
    "totalPages": 2,
    "category": "全部",
    "list": [
      {
        "id": 1,
        "title": "图书馆的清晨",
        "category": "校园",
        "image_url": "images/gallery/g01.jpg",
        "author": "罗亚博",
        "description": "开馆前的半小时，自习区只有翻书声和窗外的光。",
        "likes": 326,
        "created_at": "2026-11-08 07:30"
      }
    ],
    "categories": [
      { "name": "建筑", "count": 3 },
      { "name": "校园", "count": 3 },
      { "name": "实验", "count": 2 },
      { "name": "活动", "count": 2 },
      { "name": "风景", "count": 2 }
    ],
    "sql": "SELECT id, title, ... FROM luo_gallery ORDER BY id ASC LIMIT 9 OFFSET 0;",
    "elapsed": 25
  }
}
```

失败响应示例（分类不存在）：

```json
{ "code": 4001, "msg": "分类不存在：人物", "data": null }
```

修改时间：2026-11-09 14:46

---

## GET /api/gallery（分类调整）

分类白名单改为：`风景` / `动物` / `生活` / `食物`（原「校园/建筑/活动/实验」不再接受，传旧值会返回 4001）。

修改时间：2026-11-09 14:52

---

## POST /api/chat

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 说明：代理硅基流动 `https://api.siliconflow.cn/v1/chat/completions`，
  密钥从 `backend/.env` 的 `LLM_API_KEY` 读取，**不会下发到浏览器**。
  后端控制台会打印本次请求的完整 messages 与返回的 JSON。

请求体：

```json
{
  "messages": [
    { "role": "system", "content": "你是一个有用的中文助手" },
    { "role": "user", "content": "用一句话说明什么是全栈开发" }
  ],
  "temperature": 0.7,
  "maxTokens": 1024
}
```

`temperature` / `maxTokens` 可省略，默认 0.7 / 1024。

成功响应：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "reply": "全栈开发是指一名开发者同时掌握前端与后端技术……",
    "model": "deepseek-ai/DeepSeek-V4-Flash",
    "usage": { "prompt_tokens": 36, "completion_tokens": 17, "total_tokens": 53 },
    "elapsed": 6175,
    "raw": { "id": "…", "choices": ["…"] }
  }
}
```

失败响应：

| code | 含义 |
|---|---|
| 4001 | messages 为空 |
| 4002 | 后端没有配置 `LLM_API_KEY` |
| 5003 | LLM 返回非 2xx（401 密钥无效 / 402 余额不足 / 429 限流） |
| 5004 | 请求超时（60 秒）或网络异常 |

修改时间：2026-11-12 13:58
