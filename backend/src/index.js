const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const MAX_BODY_BYTES = 4_500_000;
const MAX_PROMPT_LENGTH = 4_000;

function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function decodeBase64(value) {
  const normalized = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  if (!normalized || !/^[a-zA-Z0-9+/=\r\n]+$/.test(normalized)) {
    throw new Error("INVALID_IMAGE");
  }
  const binary = atob(normalized.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function errorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("capacity") || message.includes("429")) return [503, "生成服务繁忙，请稍后重试"];
  if (message.includes("INVALID_IMAGE")) return [400, "图片数据无效，请重新选择照片"];
  return [502, "图片生成暂时失败，请稍后重试"];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json({ ok: true, service: "smart-renovation-image-api", model: MODEL });
    }

    if (request.method !== "POST" || url.pathname !== "/images/edit/") {
      return json({ error: "NOT_FOUND", message: "接口不存在" }, 404);
    }

    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "PAYLOAD_TOO_LARGE", message: "图片过大，请选择较小的照片" }, 413);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "INVALID_JSON", message: "请求格式无效" }, 400);
    }

    const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
    const imageBase64 = payload?.images?.[0]?.image;
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH || typeof imageBase64 !== "string") {
      return json({ error: "INVALID_INPUT", message: "缺少有效的图片或设计描述" }, 400);
    }

    try {
      const imageBytes = decodeBase64(imageBase64);
      if (imageBytes.byteLength > 3_200_000) {
        return json({ error: "IMAGE_TOO_LARGE", message: "图片过大，请重新选择" }, 413);
      }

      const form = new FormData();
      form.append("prompt", `${prompt}\nUse the uploaded room as the structural reference. Preserve the room layout, camera angle, walls, windows and doors. Produce a realistic renovated interior without text, logos or watermarks.`);
      form.append("input_image_0", new Blob([imageBytes], { type: "image/jpeg" }), "room.jpg");
      form.append("width", "1024");
      form.append("height", "768");
      form.append("guidance", "4");

      const serialized = new Response(form);
      const result = await env.AI.run(MODEL, {
        multipart: {
          body: serialized.body,
          contentType: serialized.headers.get("content-type"),
        },
      });

      const base64Data = result?.image;
      if (typeof base64Data !== "string" || base64Data.length < 100) {
        throw new Error("EMPTY_MODEL_RESPONSE");
      }

      return json({
        image: { mimeType: "image/png", base64Data },
        model: MODEL,
      });
    } catch (error) {
      console.error("generation_failed", error);
      const [status, message] = errorMessage(error);
      return json({ error: "GENERATION_FAILED", message }, status);
    }
  },
};
