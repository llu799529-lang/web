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

---

## 2026-11-09 14:40　创建新闻表 luo_news 并插入 12 条测试数据

```sql
-- 新闻表
CREATE TABLE IF NOT EXISTS luo_news (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  title        VARCHAR(120) NOT NULL               COMMENT '标题',
  category     VARCHAR(20)  NOT NULL               COMMENT '分类：校园/通知/学术/活动/就业',
  author       VARCHAR(30)  NOT NULL               COMMENT '作者',
  source       VARCHAR(40)  NOT NULL               COMMENT '来源',
  summary      VARCHAR(255) NOT NULL               COMMENT '摘要',
  content      TEXT         NOT NULL               COMMENT '正文',
  views        INT UNSIGNED NOT NULL DEFAULT 0     COMMENT '阅读量',
  is_top       TINYINT(1)   NOT NULL DEFAULT 0     COMMENT '是否置顶',
  publish_time DATETIME     NOT NULL               COMMENT '发布时间',
  PRIMARY KEY (id),
  KEY idx_luo_news_category (category),
  KEY idx_luo_news_publish (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻列表';

-- 测试数据（12 条）
INSERT INTO luo_news (title, category, author, source, summary, content, views, is_top, publish_time) VALUES
('学校召开 2026 年秋季学期教学工作会', '校园', '宣传部', '校园新闻网', '会议总结了上学期教学运行情况，部署本学期课程建设与课堂质量提升的重点任务。', '10 月 28 日下午，学校在行政楼报告厅召开 2026 年秋季学期教学工作会。会议通报了上学期课堂教学检查、课程考核与学评教结果，并对本学期的专业建设、实践教学和青年教师培养作出安排。会议要求各学院把课堂质量放在首位，落实听课评课制度。', 1286, 1, '2026-11-08 09:20:00'),
('关于开展 2026 年校园网络安全宣传周的通知', '通知', '网信中心', '学校办公网', '11 月 10 日至 16 日开展网络安全宣传周，包含专题讲座、应急演练与线上答题。', '为提升师生网络安全意识，学校定于 11 月 10 日至 16 日开展校园网络安全宣传周。活动包括网络安全专题讲座、钓鱼邮件识别演练、弱口令自查和线上知识答题。请各单位组织师生参加，并于 11 月 20 日前提交活动总结。', 967, 0, '2026-11-07 16:45:00'),
('计算机学院在省级大学生程序设计竞赛中获佳绩', '学术', '张明', '学院办公室', '学院派出 6 支队伍参赛，获得一等奖 2 项、二等奖 3 项，创近年最好成绩。', '2026 年省大学生程序设计竞赛于 11 月 1 日至 2 日举行，全省 58 所高校的 312 支队伍参赛。计算机学院 6 支队伍全部获奖，其中两支队伍以全场前 20 名的成绩获得一等奖。指导教师表示，队伍从暑假开始集训，重点训练算法设计与团队协作。', 2043, 0, '2026-11-06 14:10:00'),
('图书馆延长开放时间并新增 120 个自习座位', '校园', '图书馆', '图书馆公告', '自 11 月 9 日起，主馆闭馆时间延后至 23:00，四楼新改造的自习区同步开放。', '为满足期末复习需求，图书馆自 11 月 9 日起调整开放时间：周一至周日 7:30 开馆，闭馆时间由 22:00 延后至 23:00。四楼东侧新改造的自习区新增 120 个座位，配备独立照明与电源插座，可通过图书馆公众号预约。', 1532, 0, '2026-11-05 10:30:00'),
('第十一届校园科技创新节启动报名', '活动', '校团委', '团委通知', '本届科技节设智能硬件、软件应用、数据可视化三个赛道，报名截止 11 月 25 日。', '第十一届校园科技创新节正式启动，面向全校学生征集作品。本届设智能硬件、软件应用、数据可视化三个赛道，鼓励跨专业组队。初赛提交作品说明与演示视频，决赛现场答辩。报名截止时间为 11 月 25 日 18:00，各赛道设一、二、三等奖及最佳创意奖。', 876, 0, '2026-11-04 15:20:00'),
('2027 届毕业生秋季双选会将于 11 月 22 日举行', '就业', '就业指导中心', '就业信息网', '预计 186 家企业参会，提供岗位 3200 余个，覆盖软件、制造、金融等行业。', '2027 届毕业生秋季大型双选会定于 11 月 22 日 9:00 至 15:00 在体育馆举行。目前已有 186 家企业确认参会，提供岗位 3200 余个，覆盖软件开发、智能制造、金融、教育等行业。请毕业生提前准备好简历，凭学生证入场。', 3125, 1, '2026-11-03 11:00:00'),
('学校与三家本地企业签署产教融合合作协议', '校园', '宣传部', '校园新闻网', '双方将在实习基地、联合课程和项目研发三方面开展合作，首批接收 80 名学生实习。', '11 月 2 日，学校与三家本地企业签署产教融合合作协议。根据协议，企业将共建校外实习基地，参与专业课程设计，并与学院联合开展技术项目研发。首批 80 名学生将于明年春季进入企业实习，实行双导师制。', 1140, 0, '2026-11-02 09:00:00'),
('关于 2026-2027 学年第一学期期末考试安排的通知', '通知', '教务处', '教务处', '考试周为 12 月 22 日至 31 日，考场安排将于 12 月 10 日在教务系统公布。', '本学期期末考试安排在 12 月 22 日至 31 日进行，具体考场与时间将于 12 月 10 日在教务系统公布。请同学们提前查看考试安排，携带学生证与身份证参加考试。有课程冲突的，须于 12 月 5 日前向所在学院提出缓考申请。', 4218, 0, '2026-11-01 17:30:00'),
('“人工智能与教育”专题讲座顺利举办', '学术', '李静', '学院办公室', '讲座围绕大模型在教育场景的应用与伦理边界展开，200 余名师生参加。', '10 月 30 日晚，“人工智能与教育”专题讲座在图书馆报告厅举行，200 余名师生参加。主讲人从大模型的能力边界、教学场景落地和数据隐私三个方面展开，并结合具体案例分析了 AI 辅助学习可能带来的依赖与误判问题。', 745, 0, '2026-10-30 20:00:00'),
('校园马拉松报名开启，设 5 公里与 10 公里两个项目', '活动', '体育部', '体育部公告', '比赛定于 11 月 30 日举行，即日起接受报名，限额 1200 人。', '2026 年校园马拉松定于 11 月 30 日上午 8:00 鸣枪，设 5 公里健康跑与 10 公里挑战跑两个项目，限额 1200 人。报名截至 11 月 20 日，参赛选手须提交健康承诺书。完赛者可获得纪念奖牌与电子证书。', 1689, 0, '2026-10-29 08:40:00'),
('实验楼网络设备升级，11 月 12 日凌晨短时断网', '通知', '网信中心', '学校办公网', '升级期间实验楼有线与无线网络将中断约 2 小时，请提前保存工作。', '为提升实验楼网络稳定性，网信中心将于 11 月 12 日 0:00 至 2:00 对核心交换设备进行升级。升级期间实验楼有线网络与无线网络将短时中断，请相关师生提前保存实验数据，避免在此时段提交作业或进行在线考试。', 623, 0, '2026-10-28 13:15:00'),
('学校新增 6 个省级一流本科课程', '学术', '教务处', '校园新闻网', '本次认定的课程涵盖数据结构、操作系统、大学英语等，累计已达 23 门。', '省教育厅近日公布 2026 年一流本科课程认定结果，学校 6 门课程入选，包括数据结构、操作系统、大学英语、概率论与数理统计等。至此学校省级一流本科课程累计 23 门。学校将以此为契机推进课程内容更新与混合式教学改革。', 986, 0, '2026-10-27 10:05:00');
```

说明：
- 分类共 5 类（校园 / 通知 / 学术 / 活动 / 就业），其中 2 条置顶（`is_top = 1`）。
- 阅读量 `views` 为整数，页面直接读取展示。
- 排序规则：`ORDER BY is_top DESC, publish_time DESC`。

---

## 2026-11-09 14:44　创建图片表 luo_gallery 并插入 12 条测试数据

```sql
CREATE TABLE IF NOT EXISTS luo_gallery (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  title       VARCHAR(80)  NOT NULL               COMMENT '图片标题',
  category    VARCHAR(20)  NOT NULL               COMMENT '分类：校园/建筑/风景/活动/实验',
  image_url   VARCHAR(160) NOT NULL               COMMENT '图片相对路径',
  author      VARCHAR(30)  NOT NULL               COMMENT '作者',
  description VARCHAR(255) NOT NULL               COMMENT '图片说明',
  likes       INT UNSIGNED NOT NULL DEFAULT 0     COMMENT '点赞数',
  created_at  DATETIME     NOT NULL               COMMENT '上传时间',
  PRIMARY KEY (id),
  KEY idx_luo_gallery_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片列表';

INSERT INTO luo_gallery (title, category, image_url, author, description, likes, created_at) VALUES
('图书馆的清晨', '校园', 'images/gallery/g01.jpg', '罗亚博', '开馆前的半小时，自习区只有翻书声和窗外的光。', 326, '2026-11-08 07:30:00'),
('操场上的黄昏', '校园', 'images/gallery/g02.jpg', '罗亚博', '跑道被夕阳拉出长影子，跑步的人一茬接一茬。', 512, '2026-11-07 18:10:00'),
('教学楼长廊', '建筑', 'images/gallery/g03.jpg', '罗亚博', '下课铃后的走廊，一侧是教室，一侧是整排的窗。', 208, '2026-11-06 16:40:00'),
('秋天的银杏道', '风景', 'images/gallery/g04.jpg', '罗亚博', '十一月最好看的一条路，风一过就落一层。', 693, '2026-11-05 15:20:00'),
('实验室的午后', '实验', 'images/gallery/g05.jpg', '罗亚博', '设备都开着，屏幕上的波形慢慢稳定下来。', 174, '2026-11-04 14:00:00'),
('篮球赛决赛', '活动', 'images/gallery/g06.jpg', '罗亚博', '最后一分钟反超两分，全场都站起来了。', 845, '2026-11-03 20:30:00'),
('湖畔倒影', '风景', 'images/gallery/g07.jpg', '罗亚博', '没风的时候，湖面能把整片天装进去。', 431, '2026-11-02 17:05:00'),
('老校门', '建筑', 'images/gallery/g08.jpg', '罗亚博', '比学校年纪还大的门，砖缝里长了草。', 287, '2026-11-01 10:15:00'),
('深夜自习室', '校园', 'images/gallery/g09.jpg', '罗亚博', '十一点以后，还剩三分之一的人在坚持。', 356, '2026-10-31 23:10:00'),
('社团招新', '活动', 'images/gallery/g10.jpg', '罗亚博', '广场摆满了展板，每个摊位都在喊自己的名字。', 264, '2026-10-30 12:00:00'),
('显微镜下的世界', '实验', 'images/gallery/g11.jpg', '罗亚博', '第一次自己调出清晰的细胞结构，拍了很久。', 198, '2026-10-29 15:45:00'),
('雪后的钟楼', '建筑', 'images/gallery/g12.jpg', '罗亚博', '那年冬天的第一场雪，钟楼顶上积了薄薄一层。', 578, '2026-10-28 08:20:00');
```

说明：
- 图片文件位于 `frontend/images/gallery/g01.jpg ~ g12.jpg`，共 12 张，由脚本本地生成（640×420，总计约 218 KB），不依赖外网。
- `image_url` 存相对路径，页面直接用 `<img src>` 引用。
- 分类 5 类：校园 3 / 建筑 3 / 实验 2 / 活动 2 / 风景 2。

---

## 2026-11-09 14:52　图片改为真实照片，同步改标题与分类

说明：`g01.jpg ~ g12.jpg` 换成 12 张真实照片（本地下载后打包，不依赖外网），标题 / 分类 / 说明按照片内容重写；
分类由「校园/建筑/风景/活动/实验」改为「风景/动物/生活/食物」。

```sql
UPDATE luo_gallery SET title='峡湾深处',   category='风景', description='从山脊往下看，海水在峡湾里拐了个弯。', likes=326 WHERE id=1;
UPDATE luo_gallery SET title='红色峡谷',   category='风景', description='夕阳把砂岩照成橘红色，一层一层堆上去。', likes=512 WHERE id=2;
UPDATE luo_gallery SET title='云雾山谷',   category='风景', description='云压得很低，公路沿着山腰慢慢绕过去。', likes=208 WHERE id=3;
UPDATE luo_gallery SET title='风暴前的海', category='风景', description='云层翻涌，海面已经起风，船都回港了。', likes=693 WHERE id=4;
UPDATE luo_gallery SET title='展翅的秃鹫', category='动物', description='翼展接近两米，从头顶直接掠过去。', likes=174 WHERE id=5;
UPDATE luo_gallery SET title='瀑布与彩虹', category='风景', description='水雾里出现一整道虹，站在下面的人很小。', likes=845 WHERE id=6;
UPDATE luo_gallery SET title='松林与山谷', category='风景', description='河水清得能看见底，对岸是整片针叶林。', likes=431 WHERE id=7;
UPDATE luo_gallery SET title='老工作室',   category='生活', description='墙上挂满旧照片和工具，桌上还有一台老相机。', likes=287 WHERE id=8;
UPDATE luo_gallery SET title='深海水母',   category='动物', description='橙色伞盖，触手拖得很长，像一盏灯。', likes=356 WHERE id=9;
UPDATE luo_gallery SET title='母狮',       category='动物', description='眼神很稳，一动不动地看着镜头。', likes=264 WHERE id=10;
UPDATE luo_gallery SET title='草莓',       category='食物', description='刚从市场买回来，红得发亮，还带着叶子。', likes=198 WHERE id=11;
UPDATE luo_gallery SET title='沙滩上的海象', category='动物', description='一堆挤在一起晒太阳，偶尔抬一下头。', likes=578 WHERE id=12;
```

---

## 2026-11-12 14:15　创建 AI 聊天会话表与消息表（含测试数据）

```sql
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `luo_chat_session` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '会话主键',
  `title` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会话标题',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '最后更新',
  PRIMARY KEY (`id`),
  KEY `idx_luo_session_updated` (`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 聊天会话';
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `luo_chat_session` VALUES (1,'全栈开发是什么','2026-11-10 09:12:00','2026-11-12 14:37:18'),(2,'帮我解释一下 RAG','2026-11-10 10:02:00','2026-11-10 10:06:00'),(3,'MySQL 索引怎么建','2026-11-10 14:20:00','2026-11-10 14:22:00'),(4,'Express 中间件顺序','2026-11-11 08:40:00','2026-11-11 08:44:00'),(5,'写一段 Promise 示例','2026-11-11 09:30:00','2026-11-11 09:31:00'),(6,'怎么防止 API Key 泄露','2026-11-11 15:05:00','2026-11-11 15:08:00'),(7,'前端 fetch 跨域报错','2026-11-12 10:10:00','2026-11-12 10:12:00'),(8,'帮我润色一段项目总结','2026-11-12 11:00:00','2026-11-12 11:03:00');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `luo_chat_message` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '消息主键',
  `session_id` int unsigned NOT NULL COMMENT '所属会话',
  `role` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'system/user/assistant',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `tokens` int unsigned NOT NULL DEFAULT '0' COMMENT '估算 token 数',
  `created_at` datetime NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`),
  KEY `idx_luo_msg_session` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 聊天消息';
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `luo_chat_message` VALUES (1,1,'user','全栈开发是什么？',8,'2026-11-10 09:12:00'),(2,1,'assistant','全栈开发是指同一个人同时掌握前端与后端技术，能独立完成从界面到数据存储的完整开发。前端负责页面与交互，后端负责接口、业务逻辑与数据库。',67,'2026-11-10 09:12:20'),(3,2,'user','RAG 是什么，为什么能减少胡说？',17,'2026-11-10 10:02:00'),(4,2,'assistant','RAG 是检索增强生成：先把私有文档切分并向量化入库，提问时先检索最相关的片段，再把这些片段拼进提示词交给模型。模型基于给定材料作答，所以比凭空生成更少编造。',79,'2026-11-10 10:02:40'),(5,3,'user','MySQL 里经常按分类和时间查询，索引应该怎么建？',26,'2026-11-10 14:20:00'),(6,3,'assistant','建联合索引 (category, publish_time)，遵循最左前缀原则。若还有排序需求，让排序字段跟在等值条件字段之后，可以避免额外排序。',73,'2026-11-10 14:20:35'),(7,4,'user','Express 中间件注册顺序有什么讲究？',21,'2026-11-11 08:40:00'),(8,4,'assistant','中间件按注册顺序执行。cors、json 解析要放在路由之前；静态托管一般放在路由之后或之前都可以，但 404 与错误处理必须放最后。',67,'2026-11-11 08:41:10'),(9,5,'user','写一个三秒后返回结果的 Promise 示例',22,'2026-11-11 09:30:00'),(10,5,'assistant','new Promise((resolve) => setTimeout(() => resolve(\'done\'), 3000)).then(console.log) —— 三秒后打印 done。',98,'2026-11-11 09:30:20'),(11,6,'user','前端项目里 API Key 怎么放才安全？',21,'2026-11-11 15:05:00'),(12,6,'assistant','密钥只能放服务端：写进 backend/.env，由后端代理请求外部接口，前端只调用自己的 /api。.env 要加入 .gitignore。',71,'2026-11-11 15:05:30'),(13,7,'user','浏览器请求报 CORS 错误怎么办？',18,'2026-11-12 10:10:00'),(14,7,'assistant','在 Express 里 app.use(cors()) 允许跨域；或者让前端只请求同源的 /api，由后端转发。生产环境建议后者，同时限制来源。',72,'2026-11-12 10:10:25'),(15,8,'user','帮我把项目总结润色得更书面一些',15,'2026-11-12 11:00:00'),(16,8,'assistant','本项目基于前后端分离架构完成：前端以原生 HTML/CSS/JS 实现交互，后端通过 Express 代理调用大模型，密钥保存在服务端；配合 MySQL 完成会话与消息持久化，并用上下文压缩控制 token 开销。',107,'2026-11-12 11:00:50'),(17,1,'user','那前后端分离的好处是什么？',9,'2026-11-12 14:18:05'),(18,1,'user','前后端分离有什么好处？',7,'2026-11-12 14:19:26'),(19,1,'user','一句话说明前后端分离的好处',9,'2026-11-12 14:22:06'),(20,1,'assistant','前后端分离的好处是：前后端可独立开发、部署和扩展，提升协作效率、系统灵活性和维护性。',27,'2026-11-12 14:22:08'),(21,1,'user','一句话说明前后端分离的好处',9,'2026-11-12 14:22:08'),(22,1,'assistant','前后端分离可以让开发更高效、维护更简单，因为前端和后端可以独立开发、测试和部署，互不干扰。',29,'2026-11-12 14:22:10'),(23,1,'user','一句话说明前后端分离的好处',9,'2026-11-12 14:22:18'),(24,1,'assistant','前后端分离可以让前后端团队独立开发、测试和部署，提升开发效率，并增强系统的可维护性和扩展性。',29,'2026-11-12 14:22:21'),(25,1,'user','前后端分离有什么好处？',7,'2026-11-12 14:24:23'),(26,1,'assistant','前后端分离的主要好处包括：\n\n1. **开发效率高**：前后端团队可并行开发，互不阻塞。\n2. **职责清晰**：前端专注UI/交互，后端专注API/业务逻辑。\n3. **维护方便**：代码解耦，修改前端或后端不影响对方。\n4. **扩展性强**：后端API可复用，支持多端（Web、App、小程序等）。\n5. **性能优化**：前端静态资源可独立部署CDN，减轻服务器压力。\n\n简单说：**分工明确、开发快、易维护、',131,'2026-11-12 14:24:29'),(27,1,'user','生成一个鹈鹕骑自行车svg html',12,'2026-11-12 14:36:39'),(28,1,'assistant','以下是您需要的鹈鹕骑自行车SVG动画HTML代码，一个生动有趣的卡通场景。\n```html\n<!DOCTYPE html>\n<html lang=\"zh\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>鹈鹕骑自行车 · 动态SVG</title>\n    <style>\n        body {\n            background: linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%);\n            min-height: 100vh;\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            margin: 0;\n            font-family: system-ui, \'Segoe UI\', Roboto, sans-serif;\n        }\n        .card {\n            background: rgba(255, 255, 255, 0.6);\n            backdrop-filter: blur(4px);\n            border-radius: 40px;\n            padding: 24px 20px 30px;\n            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);\n            border: 2px solid rgba(255, 255, 255, 0.7);\n            max-width: 700px;\n            width: fit-content;\n            margin: 20px;\n        }\n        svg {\n            display: block;\n            width: 100%;\n            height: auto;\n            border-radius: 24px;\n            background: #f0f9ff;\n            box-shadow: inset 0 0 0 2px #ffffffcc, 0 10px 20px -5px #07598540;\n        }\n        .caption {\n            text-align: center;\n            margin-top: 16px;\n            font-weight: 600;\n            color: #155e75;\n            letter-spacing: 1px;\n            font-size: 1.2rem;\n            background: #ecfeffbb;\n            padding: 8px 18px;\n            border-radius: 40px;\n            display: inline-block;\n            border: 1px solid #a5f3fc;\n        }\n        .footer {\n            display: flex;\n            justify-content: center;\n        }\n        .credit {\n            font-size: 0.8rem;\n            color: #0369a1;\n            opacity: 0.7;\n            margin-top: 12px;\n            text-align: center;\n        }\n    </style>\n</head>\n<body>\n<div class=\"card\">\n    <!-- 鹈鹕骑自行车 · 全SVG手绘风格 -->\n    <svg viewBox=\"0 0 600 340\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"鹈鹕骑自行车动画\">\n        <defs>\n            <!-- 车轮旋转动画 -->\n            <style>\n                @keyframes spinWheel {\n                    from { transform: rotate(0deg); }\n                    to { transform: rotate(360deg); }\n                }\n                @keyframes spinWheelBack {\n                    from { transform: rotate(0deg); }\n                    to { transform: rotate(360deg); }\n                }\n                @keyframes bobBody {\n                    0% { transform: translateY(0px); }\n                    50% { transform: translateY(-3px); }\n                    100% { transform: translateY(0px); }\n                }\n                @keyframes legPush {\n                    0% { transform: rotate(0deg); }\n                    25% { transform: rotate(12deg); }\n                    50% { transform: rotate(0deg); }\n                    75% { transform: rotate(-12deg); }\n                    100% { transform: rotate(0deg); }\n                }\n                @keyframes wingFlap {\n                    0% { transform: rotate(0deg); }\n                    30% { transform: rotate(-8deg); }\n                    60% { transform: rotate(5deg); }\n                    100% { transform: rotate(0deg); }\n                }\n                @keyframes beakChomp {\n                    0%, 100% { transform: rotate(0deg); }\n                    20% { transform: rotate(4deg); }\n                    40% { transform: rotate(-2deg); }\n                    60% { transform: rotate(3deg); }\n                }\n                @keyframes cloudMove {\n                    0% { transform: translateX(0px); }\n                    50% { transform: translateX(10px); }\n                    100% { transform: translateX(0px); }\n                }\n                .wheel-front {\n                    animation: spinWheel 1.2s linear infinite;\n                    transform-origin: 460px 250px;\n                }\n                .wheel-back {\n                    animation: spinWheelBack 1.2s linear infinite;\n                   ',2510,'2026-11-12 14:37:18'),(29,1,'user','不完整',2,'2026-11-12 14:39:53');
```

说明：
- `luo_chat_session` 存会话（标题、创建/更新时间），`luo_chat_message` 存每条消息（角色、内容、估算 token）。
- 测试数据：8 个会话、16 条消息，覆盖 8 个常见开发问题。
- 页面按 `updated_at DESC` 排列会话，按 `id ASC` 回放单个会话的消息。
