# 数据库记录

> 每次建表、改表或插入数据后，按执行顺序在本文件末尾追加对应 SQL 语句（含测试数据的 INSERT），禁止覆盖已有内容。
> 要求：仅凭本文件即可在新机器上完整重建数据库。

**数据库**：MySQL · `luo_fullstack`

---

## 2026-11-09 13:45　创建数据库

```sql
CREATE DATABASE IF NOT EXISTS luo_fullstack
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

说明：本项目使用本机已有的 MySQL 9.4 实例（127.0.0.1:3306），只新建业务库 `luo_fullstack`，不改动本机其他库。

---

## 表结构

_（暂无业务表。后续每次建表、改表或插入测试数据后，按执行顺序追加到这里。）_
