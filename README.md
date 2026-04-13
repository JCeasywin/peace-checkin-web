# 今日平安

一个给家人用的报平安网页原型。

## 现在已经实现

- 一个大按钮：`我今天平安`
- 首页文案支持动态联系人，例如 `爸爸` 给 `佳琛` 报平安
- 点击后显示包含“时间 + 接收人 + 今日状态”的成功卡片
- 点击后出现烟花动画
- 支持接 Supabase，把每日确认记录同步到云端并跨设备读取
- 展示最近 7 天记录
- 手机和电脑都可以直接打开

## 动态联系人

页面默认是 `爸爸` 给 `佳琛` 报平安。也可以通过网址参数打开不同联系人版本：

```text
https://jceasywin.github.io/peace-checkin-web/?sender=妈妈&receiver=佳琛&family=home
```

支持的参数：

- `sender` 或 `from`：报平安的人
- `receiver` 或 `to`：接收人
- `family`：家庭标识，用来区分不同家庭或测试环境

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
2. 本项目已配置好 `origin`，仓库创建后在本目录执行：

```bash
git push -u origin main
```

如果是从零开始配置远端，可以先执行：

```bash
git remote add origin git@github.com:<你的 GitHub 用户名>/peace-checkin-web.git
```

3. 打开 Vercel Dashboard，选择 `Add New...` -> `Project`。
4. 从 GitHub 列表里 Import `peace-checkin-web`。
5. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 留空，然后点击 Deploy。

## 不用 Vercel：GitHub Pages 部署

如果 Vercel 注册不了，可以直接用 GitHub Pages 发布这个静态网页。

1. 打开仓库：`https://github.com/JCeasywin/peace-checkin-web`
2. 进入 `Settings` -> `Pages`。
3. 在 `Build and deployment` 里，`Source` 选择 `Deploy from a branch`。
4. `Branch` 选择 `main`，目录选择 `/ (root)`，然后点击 `Save`。
5. 等待 1-2 分钟，网页地址通常是：

```text
https://jceasywin.github.io/peace-checkin-web/
```

## Supabase 云端同步

这个网页会优先使用 Supabase 保存每日记录；如果 `supabase-config.js` 里还没有填连接信息，会退回到本机演示模式。

1. 在 Supabase 创建一个项目。
2. 打开 Supabase SQL Editor，执行 `supabase-schema.sql` 里的 SQL。
3. 在 Supabase 项目里找到 `Project URL` 和 `anon public` key。
4. 打开 `supabase-config.js`，填入：

```js
window.PEACE_CHECKIN_CONFIG = {
  supabaseUrl: "你的 Project URL",
  supabaseAnonKey: "你的 anon public key",
  tableName: "peace_checkins",
  defaultSender: "爸爸",
  defaultReceiver: "佳琛",
  defaultFamilyKey: "jiachen-family",
};
```

5. 提交并推送：

```bash
git add .
git commit -m "Configure Supabase"
git push
```

注意：`anon public` key 可以放在前端网页里，但当前 SQL 策略为了方便家庭使用，允许匿名读写这张表。不要在这里保存身份证号、手机号、病历等敏感信息。

## 目前限制

这是家庭自用的轻量版本。需要注意：

- 只有配置 Supabase 后，你爸手机上点了，你的电脑才会同步看到。
- 还没有每天定时提醒和漏报通知。
- 当前没有登录系统，拿到链接的人可以打开页面。

## 下一版建议

接入一个后端和通知：

- 简单访问密码：避免陌生人随手点开
- 飞书机器人：你爸点击后通知你
- 定时任务：晚上没点时提醒你
