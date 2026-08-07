# 智能装修工作室

一款基于 React Native 和 Expo Router 的 AI 室内改造应用。用户可以上传房间照片、选择装修风格与工程约束，生成改造效果图和预算估算。项目同时支持 iOS、Android 和 Web。

## 主要功能

- 手机号和用户角色登录
- 相册选图与照片预览
- 12 类装修风格和分类筛选
- 工程约束选项与装修预算估算
- AI 图片编辑与改造效果图
- 本地项目历史和生成次数管理
- 免费版/专业版功能界面

> 当前登录、项目记录和会员状态均保存在本机 `AsyncStorage` 中；会员页尚未接入 App Store/Google Play 真实支付。AI 生图需要有效的 `EXPO_PUBLIC_TOOLKIT_URL` 服务地址。

## 技术栈

- React Native 0.81
- Expo SDK 54
- Expo Router 6
- TypeScript 5.9
- TanStack Query
- Zustand
- AsyncStorage
- Rork Toolkit SDK

## 目录结构

```text
smart-renovation-studio/
├── README.md
└── expo/
    ├── app/             # Expo Router 页面与路由
    ├── assets/          # 图标和启动图
    ├── components/      # 通用组件
    ├── constants/       # 风格、约束和主题配置
    ├── hooks/           # 登录、项目与会员状态
    ├── types/           # TypeScript 类型
    ├── utils/           # Prompt 和价格计算
    ├── app.json         # Expo 应用配置
    └── package.json
```

## 本地开发

需要 Node.js 和 Bun。

```bash
git clone https://github.com/williamleo0369-ux/smart-renovation-studio.git
cd smart-renovation-studio/expo
bun install
```

配置 AI 图片服务：

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```dotenv
EXPO_PUBLIC_TOOLKIT_URL=https://your-api.example.com
```

启动项目：

```bash
bun run start
```

启动 Web 预览：

```bash
bun run start-web
```

## 代码检查

```bash
bunx tsc --noEmit
bun run lint
```

## 安装为独立 iPhone App

这种方式不需要 Expo Go，但需要 macOS、Xcode、已信任并连接的 iPhone，以及可用的 Apple 开发签名。

```bash
cd expo
bunx expo prebuild --platform ios
bunx expo run:ios --device
```

使用免费 Apple ID 签名时，应用通常需要定期重新签名；Apple Developer Program 付费账号可用于更稳定的真机分发。

## Android 独立安装包

需要 Android Studio/Android SDK 和已开启 USB 调试的 Android 手机。

```bash
cd expo
bunx expo prebuild --platform android
bunx expo run:android --device
```

## 应用标识

- iOS Bundle ID: `app.rork.smart-renovation-studio`
- Android Package: `app.rork.smart_renovation_studio`
- URL Scheme: `rork-app`

## License

仓库目前未声明开源许可证。未经仓库所有者授权，请勿将代码用于未授权的分发或商业用途。
