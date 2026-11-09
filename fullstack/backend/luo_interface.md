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
