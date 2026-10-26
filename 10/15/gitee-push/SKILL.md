---
name: gitee-push
description: 把本地项目首次提交并推送到 Gitee 远程仓库，覆盖 SSH 公钥生成与配置、remote 地址切换、add/commit/push 全流程。当用户说"上传到 gitee""推到 gitee""把项目传到 gitee""git gitee 提交""配置 gitee ssh"，或给出一个 gitee.com 仓库链接并要求把本地代码传上去时使用。
---

# gitee-push

把本地项目首次推送到 Gitee 的标准流程。全程在 Windows PowerShell 下执行（本环境无 Bash）。

## 前置检查

1. 确认 git 可用：`git --version`。
2. 确认全局身份：`git config --global user.name` / `user.email`。若为空，先设置成用户的 Gitee 用户名和邮箱。
3. 确认本地项目目录存在且是一个 git 仓库（有 `.git`）；若不是，在项目目录里 `git init`。

## 步骤

### 1. 生成 ed25519 密钥（仅首次）

检查 `$env:USERPROFILE\.ssh\id_ed25519` 是否已存在：
- 已存在 → 跳过本步，直接读公钥。
- 不存在 → 生成（空密码，免输 passphrase）：

```powershell
ssh-keygen -t ed25519 -C "<用户名字>" -f "$env:USERPROFILE\.ssh\id_ed25519" -N '""'
```

### 2. 把公钥交给用户贴到 Gitee

打印公钥内容：

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

把整行 `ssh-ed25519 AAAA... <备注>` 给用户，让他登录 https://gitee.com/profile/sshkeys → 添加公钥 → 粘贴 → 确定。
**这一步必须用户手动完成**（涉及 Gitee 账号登录），等待用户回复"加好了"再继续。

### 3. 验证 SSH 连通

```powershell
ssh -T -o StrictHostKeyChecking=accept-new git@gitee.com
```

看到 `Hi <用户名>! You've successfully authenticated, but GITEE.COM does not provide shell access.` 即成功。exit code 非 0 是正常的（Gitee 不提供 shell）。

### 4. 把 remote 切成 SSH 地址

```powershell
cd <项目目录>
git remote set-url origin git@gitee.com:<Gitee用户名>/<仓库名>.git
git remote -v
```

若原本没有 remote，用 `git remote add origin git@gitee.com:<用户名>/<仓库名>.git`。

### 5. 提交并推送

```powershell
git add .
git commit -m "<说明>"
git branch -M master
git push -u origin master
```

看到 `* [new branch] master -> master` 即成功。

## 常见坑

- **PowerShell 把 git/ssh 的 stderr 当报错**：`remote: Powered by GITEE.COM` 之类是正常输出，只要最后有 `[new branch]` 或 `master -> master` 就是成功。
- **push 报 Permission denied (publickey)**：说明公钥没贴对，回到第 2 步核对公钥指纹。
- **remote 还是 https**：push 时会弹账号密码框；用第 4 步切成 SSH 地址即可免密。
- **仓库是空的**：Gitee 新建仓库默认空，首次 push 用 `-u origin master` 建立跟踪关系。
