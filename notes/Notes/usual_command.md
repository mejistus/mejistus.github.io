---
title: Usual Command 
date: 2026/3/27 
tag: Notes
excerpt: Some whisper about Docker、Git and Latex...
---
# Usual Command.
本文记录了 docker、git、latex 的一些常见使用方法。


三个类别的常用命令都整理好了，支持顶部 Tab 切换，也可以用搜索框快速筛选命令。

几个重点补充说明：

**Docker** 中标注 ⚠️ 危险的命令（如 `docker system prune -a`、`docker reset --hard`）会不可逆地删除数据，务必确认后再执行。

**Git** 协作中最重要的习惯是：`push --force-with-lease` 代替 `push --force`，以及用 `rebase -i` 整理提交再发 PR，保持提交历史整洁。

**LaTeX** 推荐现代工具链：用 `biblatex + biber` 管理文献（比旧的 `bibtex` 更强），中文文档用 `ctex` 包配合 `XeLaTeX` 编译。

# 常用命令速查

---

## 🐳 Docker 容器常用命令

### 镜像管理

| 命令 | 说明 |
|------|------|
| `docker images` | 列出本地所有镜像 |
| `docker pull nginx:latest` | 拉取镜像 |
| `docker build -t myapp:1.0 .` | 构建镜像（当前目录 Dockerfile） |
| `docker push myapp:1.0` | 推送镜像到仓库 |
| `docker rmi image_id` | 删除镜像 |
| `docker image prune` | 清理未使用的镜像 |
| `docker tag src:tag dst:tag` | 给镜像打标签 |
| `docker save -o img.tar myapp` | 导出镜像为 tar 文件 |
| `docker load -i img.tar` | 从 tar 文件载入镜像 |

### 容器生命周期

| 命令 | 说明 |
|------|------|
| `docker run -d -p 80:80 nginx` | 后台运行容器并映射端口 |
| `docker run -it ubuntu bash` | 交互式运行并进入 shell |
| `docker run --rm alpine echo hi` | 运行完自动删除容器 |
| `docker ps` | 列出运行中的容器 |
| `docker ps -a` | 列出所有容器（含已停止） |
| `docker start / stop / restart id` | 启动 / 停止 / 重启容器 |
| `docker rm id` | 删除已停止的容器 |
| `docker rm -f id` | 强制删除运行中容器 |
| `docker container prune` | 清理所有已停止容器 |

### 调试与交互

| 命令 | 说明 |
|------|------|
| `docker exec -it id bash` | 进入运行中容器的 shell |
| `docker logs -f id` | 实时查看容器日志 |
| `docker logs --tail 100 id` | 查看最后 100 行日志 |
| `docker inspect id` | 查看容器详细信息（JSON） |
| `docker stats` | 实时资源使用监控 |
| `docker top id` | 查看容器内进程 |
| `docker cp id:/path ./local` | 从容器复制文件到宿主机 |
| `docker diff id` | 查看容器文件系统变更 |

### 网络与存储

| 命令 | 说明 |
|------|------|
| `docker network ls` | 列出所有网络 |
| `docker network create mynet` | 创建自定义网络 |
| `docker run --network mynet ...` | 指定容器网络 |
| `docker volume ls` | 列出所有卷 |
| `docker volume create myvol` | 创建数据卷 |
| `docker run -v myvol:/data ...` | 挂载数据卷 |
| `docker run -v $(pwd):/app ...` | 挂载宿主机目录 |

### Compose & 系统

| 命令 | 说明 |
|------|------|
| `docker compose up -d` | 后台启动 compose 服务 |
| `docker compose down` | 停止并删除 compose 服务 |
| `docker compose logs -f` | 查看 compose 日志 |
| `docker compose ps` | 查看 compose 服务状态 |
| `docker compose build` | 重新构建服务镜像 |
| `docker system df` | 查看磁盘使用情况 |
| `docker system prune -a` | ⚠️ 清理所有未使用资源 |

---

## 🔀 Git 协作常用命令

### 初始化与配置

| 命令 | 说明 |
|------|------|
| `git init` | 初始化本地仓库 |
| `git clone url` | 克隆远程仓库 |
| `git config --global user.name 'Name'` | 设置全局用户名 |
| `git config --global user.email 'x@y'` | 设置全局邮箱 |
| `git remote -v` | 查看远程仓库信息 |
| `git remote add origin url` | 添加远程仓库 |

### 提交工作流

| 命令 | 说明 |
|------|------|
| `git status` | 查看工作区状态 |
| `git add .` | 暂存所有改动 |
| `git add file.txt` | 暂存指定文件 |
| `git commit -m 'msg'` | 提交并附说明 |
| `git commit --amend` | 修改最后一次提交 |
| `git diff` | 查看未暂存的改动 |
| `git diff --staged` | 查看已暂存的改动 |
| `git stash` | 临时储藏当前改动 |
| `git stash pop` | 恢复最近一次储藏 |

### 分支操作

| 命令 | 说明 |
|------|------|
| `git branch` | 列出本地分支 |
| `git branch -a` | 列出所有分支（含远程） |
| `git branch feat/login` | 创建新分支 |
| `git checkout feat/login` | 切换到分支 |
| `git checkout -b feat/login` | 创建并切换分支 |
| `git switch -c feat/login` | 同上（新语法） |
| `git branch -d feat/login` | 删除已合并分支 |
| `git branch -D feat/login` | 强制删除分支 |

### 合并与变基

| 命令 | 说明 |
|------|------|
| `git merge feat/login` | 合并分支（产生合并提交） |
| `git merge --no-ff feat/login` | 强制保留合并提交 |
| `git rebase main` | 将当前分支变基到 main |
| `git rebase -i HEAD~3` | 交互式整理最近 3 次提交 |
| `git cherry-pick abc1234` | 摘取指定提交到当前分支 |
| `git revert abc1234` | 撤销某次提交（生成新提交） |

### 同步远程

| 命令 | 说明 |
|------|------|
| `git fetch origin` | 拉取远程变更（不合并） |
| `git pull` | 拉取并合并远程分支 |
| `git pull --rebase` | 拉取并变基（保持线性历史） |
| `git push origin main` | 推送到远程分支 |
| `git push -u origin feat/login` | 推送并设置追踪关系 |
| `git push --force-with-lease` | 安全的强制推送 |
| `git push origin :feat/login` | 删除远程分支 |

### 历史与回滚

| 命令 | 说明 |
|------|------|
| `git log --oneline --graph` | 紧凑图形化查看提交历史 |
| `git log -p file.txt` | 查看文件改动历史 |
| `git blame file.txt` | 查看每行最后修改人 |
| `git reset --soft HEAD~1` | 回退提交，保留暂存区 |
| `git reset --hard HEAD~1` | ⚠️ 回退提交，丢弃所有改动 |
| `git reflog` | 查看操作记录（救命日志） |
| `git tag v1.0.0` | 打轻量标签 |
| `git tag -a v1.0.0 -m 'msg'` | 打附注标签 |

---

## 📄 LaTeX 常用命令

### 文档结构

| 命令 | 说明 |
|------|------|
| `\documentclass{article}` | 声明文档类型 |
| `\usepackage{ctex}` | 中文支持包 |
| `\usepackage{amsmath}` | 数学公式增强 |
| `\begin{document}` | 正文开始 |
| `\end{document}` | 正文结束 |
| `\title{} \author{} \date{}` | 设置标题、作者、日期 |
| `\maketitle` | 输出标题块 |
| `\tableofcontents` | 自动生成目录 |

### 章节标题

| 命令 | 说明 |
|------|------|
| `\chapter{标题}` | 章（book/report 类） |
| `\section{标题}` | 节 |
| `\subsection{标题}` | 小节 |
| `\subsubsection{标题}` | 子小节 |
| `\paragraph{标题}` | 段落标题 |
| `\section*{标题}` | 加 `*` 表示不编号 |

### 文本格式

| 命令 | 说明 |
|------|------|
| `\textbf{加粗}` | 粗体 |
| `\textit{斜体}` | 斜体 |
| `\underline{下划线}` | 下划线 |
| `\emph{强调}` | 语义强调（通常为斜体） |
| `\texttt{等宽字体}` | 代码/等宽 |
| `{\color{red} 文字}` | 彩色文字（需 xcolor 包） |
| `\footnote{注释内容}` | 脚注 |
| `\label{} \ref{}` | 标签与交叉引用 |

### 列表与表格

| 命令 | 说明 |
|------|------|
| `\begin{itemize} \item … \end{itemize}` | 无序列表 |
| `\begin{enumerate} \item … \end{enumerate}` | 有序列表 |
| `\begin{tabular}{|l|c|r|}` | 表格（左/中/右对齐） |
| `\hline` | 表格横线 |
| `A & B & C \\` | 表格行（`&` 分列，`\\` 换行） |
| `\multicolumn{2}{c}{内容}` | 跨列合并 |

### 数学公式

| 命令 | 说明 |
|------|------|
| `$E = mc^2$` | 行内公式 |
| `\[ E = mc^2 \]` | 独立公式（居中） |
| `\begin{equation} … \end{equation}` | 带编号的公式 |
| `\begin{align} … \end{align}` | 多行对齐公式 |
| `\frac{a}{b}` | 分式 |
| `\sqrt{x}` / `\sqrt[n]{x}` | 平方根 / n 次根 |
| `x^{2}` / `x_{i}` | 上标 / 下标 |
| `\sum_{i=1}^{n}` / `\int_{a}^{b}` | 求和 / 积分 |
| `\alpha \beta \gamma \pi` | 希腊字母 |
| `\vec{v}` / `\hat{x}` / `\dot{x}` | 向量 / 帽 / 导数 |
| `\begin{pmatrix} … \end{pmatrix}` | 圆括号矩阵 |

### 图片与浮动体

| 命令 | 说明 |
|------|------|
| `\usepackage{graphicx}` | 引入图片包 |
| `\includegraphics[width=0.8\linewidth]{img}` | 插入图片 |
| `\begin{figure}[h] … \end{figure}` | 图片浮动环境 |
| `\caption{图片说明}` | 图注 |
| `\centering` | 居中对齐 |

### 参考文献

| 命令 | 说明 |
|------|------|
| `\cite{key}` | 引用文献 |
| `\usepackage{biblatex}` | 使用 biblatex（现代方式） |
| `\addbibresource{refs.bib}` | 指定 bib 文件 |
| `\printbibliography` | 输出参考文献列表 |
