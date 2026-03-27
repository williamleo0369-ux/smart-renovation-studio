import { SubscriptionPlan } from "@/types";

export const FREE_STYLE_IDS = [
  "nordic",
  "creamy",
  "japandi",
  "minimalist",
  "french-vintage",
  "industrial",
  "new-chinese",
  "wabi-sabi",
];

export const PREMIUM_STYLE_IDS = [
  "modern-luxury",
  "bauhaus",
  "pop-art",
  "moroccan",
];

export const FREE_DAILY_LIMIT = 1;
export const PRO_DAILY_LIMIT = 999;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "基础版",
    nameEn: "Basic",
    price: 0,
    priceLabel: "免费",
    period: "",
    features: [
      "每日 1 次生成额度",
      "标准清晰度 (1080P)",
      "8 大核心风格",
      "基础工程约束选项",
      "通用物料展示",
      "仅保存最近一次记录",
    ],
    highlighted: false,
  },
  {
    id: "professional",
    name: "专业版",
    nameEn: "Professional",
    price: 98,
    priceLabel: "¥98",
    period: "/月",
    features: [
      "无限次数生成",
      "超清 4K/8K 渲染，去除水印",
      "全量 12 大进阶风格",
      "进阶工程参数调节",
      "深度商品匹配 (EASEBELL 等)",
      "方案多轮迭代记忆",
    ],
    highlighted: true,
  },
];

export function isStylePremium(styleId: string): boolean {
  return PREMIUM_STYLE_IDS.includes(styleId);
}
