# 今日平安

一个给家人用的报平安网页原型。

## 现在已经实现

- 一个大按钮：`我今天平安`
- 点击后显示：`今日已平安`
- 点击后出现烟花动画
- 本机保存当天报平安时间
- 展示最近 7 天记录
- 手机和电脑都可以直接打开

## 如何打开

直接用浏览器打开：

```text
index.html
```

也可以在本地启动一个静态服务：

```bash
npm run start
```

## 用 GitHub + Vercel 部署

推荐方式是先把这个目录作为独立仓库推到 GitHub，然后在 Vercel 网页里一键 Import。

1. 在 GitHub 新建一个私有仓库，例如 `peace-checkin-web`。
2. 在本目录执行：

```bash
git remote add origin git@github.com:<你的 GitHub 用户名>/peace-checkin-web.git
git push -u origin main
```

3. 打开 Vercel Dashboard，选择 `Add New...` -> `Project`。
4. 从 GitHub 列表里 Import `peace-checkin-web`。
5. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 留空，然后点击 Deploy。

## 目前限制

这是第一版本地原型，记录保存在当前浏览器里。也就是说：

- 你爸手机上点了，你的电脑暂时不会自动知道。
- 换手机或清浏览器缓存后，本地记录会消失。
- 还没有每天定时提醒和漏报通知。

## 下一版建议

接入一个后端和通知：

- Supabase：保存每天的报平安记录
- Vercel：部署成公网网页
- 飞书机器人：你爸点击后通知你
- 定时任务：晚上没点时提醒你
