# 图片生成 API

基于 Cloudflare Workers AI 的正式图生图接口，供“空间焕新”App 使用。

## 接口

- `GET /health`：健康检查。
- `POST /images/edit/`：接收 `{ prompt, images: [{ image }] }`，返回 `{ image: { mimeType, base64Data } }`。

模型使用 `@cf/black-forest-labs/flux-2-klein-4b`。参考图片只用于本次推理；该模型在 Cloudflare 模型目录中标注为 Zero Data Retention。

## 部署

```bash
npm install
npx wrangler login
npm run deploy
```

部署成功后，把 Worker 根地址写入 App 的 `EXPO_PUBLIC_TOOLKIT_URL`。不要在结尾添加 `/`。
