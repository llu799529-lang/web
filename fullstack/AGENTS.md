# AGENTS.md · 全栈项目开发规则

> 本文件是本项目唯一的规则来源。每次开始工作前先读这里，任何开发动作都不得违反以下约定。

---

## 一、项目结构与技术栈

**前端：`frontend/` 目录**

- 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
- 目录结构：`frontend/` 下建 `css/`、`js/`、`fonts/`、`images/` 子目录
- `fonts/` 存放 iconfont 图标文件（如果有）

**后端：`backend/` 目录**

- Node.js + Express，RESTful + MVC 风格
- 所有接口以 `/api/` 为前缀
- 端口固定为 **409**（学号 409，端口与学号一致）
- 并以 `express.static` 托管 `frontend/` 目录
- 后端支持所有跨域访问
- 后端依赖安装：优先 `cnpm i 包名`；失败或超时则使用 `npm i 包名`

**数据库：MySQL**

- 连接凭据写入 `backend/.env`（变量名：`DB_USER`、`DB_PASSWORD`、`DB_HOST`、`DB_NAME`），不得出现在代码或本文件中
- `.env` 同时加入 `.gitignore`
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

---

## 二、命名与注释

- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）**一律以 `luo_` 开头**
- 每个文件头部包含注释块，格式如下：

```
姓名：罗亚博 | 学号：409
时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}
```



---

## 三、记录文件（一律追加写入，禁止覆盖已有内容）

|   |   |   |
| - | - | - |

- **`luoyabo_prompt.md`**（项目根目录）：每次向 AI 发出开发指令后，追加记录：`时间 | 提示词全文 | 大模型名称`  
  |  |  |  |  |  |  
  | --- | --- | --- | --- | --- |
- **`backend/luo_interface.md`**：每次创建或修改接口后，追加：`接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间`
- **`backend/luo_database.md`**：每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），要求仅凭此文件即可在新机器上完整重建数据库

**统一 JSON 响应格式：**

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

`code = 0` 表示成功，非 0 表示失败。

---

## 四、前端约定

- 服务器返回的数据和错误信息输出到浏览器控制台（`console.log` / `console.error`）
- 新建 HTML 页面后，在 `frontend/index.html` 中追加超链接入口；文件名包含 `detail` 的页面除外

---

## 五、本机环境

- MySQL 9.4 已安装并在本机运行，连接信息见 `backend/.env`
- Node.js v22.22.2、npm 10.9.7、cnpm 9.4.0 已就绪
- 启动方式：`cd backend && node app.js`，浏览器访问 `http://localhost:409`
