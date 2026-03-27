import { EngineeringConstraint } from "@/types";

export const DEFAULT_CONSTRAINTS: EngineeringConstraint[] = [
  {
    id: "keep_floor",
    label: "保留原有地板",
    description: "不更换地面材料，仅进行表面处理",
    enabled: true,
  },
  {
    id: "keep_ceiling",
    label: "保留原有吊顶",
    description: "不改动天花板结构与装饰",
    enabled: true,
  },
  {
    id: "no_plumbing",
    label: "不改动水路",
    description: "保持现有给排水管线位置",
    enabled: true,
  },
  {
    id: "no_electrical",
    label: "不改动电路",
    description: "保持现有电路布局与开关位置",
    enabled: true,
  },
  {
    id: "keep_walls",
    label: "保留承重墙体",
    description: "不拆除或移动任何墙体结构",
    enabled: true,
  },
  {
    id: "soft_decor_only",
    label: "仅软装更换",
    description: "只更换家具、窗帘、灯饰等软装",
    enabled: false,
  },
];
