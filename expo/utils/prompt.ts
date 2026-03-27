import { RenovationStyle, EngineeringConstraint } from "@/types";

export function buildRenovationPrompt(
  style: RenovationStyle,
  constraints: EngineeringConstraint[],
  isPro: boolean = false
): string {
  const activeConstraints = constraints.filter((c) => c.enabled);
  const constraintText = activeConstraints
    .map((c) => c.description)
    .join("，");

  const negativeConstraints = [
    "no distortion of room structure",
    "no unrealistic proportions",
    "no floating furniture",
    "no blurry textures",
    "maintain original window and door positions",
    "maintain original room dimensions",
    "no cartoonish or anime style",
  ];

  if (activeConstraints.find((c) => c.id === "keep_walls")) {
    negativeConstraints.push("do not remove or move any walls");
  }
  if (activeConstraints.find((c) => c.id === "keep_floor")) {
    negativeConstraints.push("keep original floor layout unchanged");
  }
  if (activeConstraints.find((c) => c.id === "keep_ceiling")) {
    negativeConstraints.push("keep original ceiling structure unchanged");
  }

  const prompt = [
    `Transform this room into a ${style.nameEn} (${style.name}) style interior design.`,
    `Style: ${style.promptKeywords}.`,
    `Space: Maintain the exact room architecture, structural elements, windows, doors, and spatial proportions.`,
    `Lighting & Materials: ${style.lightingMaterial}.`,
    isPro
      ? `Quality: Ultra-realistic interior photography, 8K ultra-high resolution, professional architectural photography lighting, magazine editorial quality, Ray-traced global illumination, cinematic color grading, Leica camera quality.`
      : `Quality: Realistic interior photography, high resolution, professional lighting, clean rendering.`,
    isPro
      ? `Commercial reference: Precisely matching ${style.commercialAnchor}. Include recognizable brand-specific design elements for accurate product sourcing.`
      : `Commercial reference: Inspired by ${style.commercialAnchor}.`,
    constraintText
      ? `Engineering constraints: ${constraintText}.`
      : "",
    `Negative: ${negativeConstraints.join(", ")}.`,
    isPro
      ? `The result must be indistinguishable from professional architectural photography. Elevate the aesthetic two levels above standard renovation — create aspirational luxury with precise material textures and photorealistic lighting. No watermarks.`
      : `The result should look like a professional interior design rendering. Elevate the aesthetic one level above standard renovation — create aspirational yet achievable luxury.`,
  ]
    .filter(Boolean)
    .join(" ");

  return prompt;
}

export function calculateEstimatedCost(
  style: RenovationStyle,
  constraints: EngineeringConstraint[],
  areaSqm: number = 80
): { total: number; range: [number, number] } {
  let multiplier = 1.0;

  const softOnly = constraints.find(
    (c) => c.id === "soft_decor_only" && c.enabled
  );
  if (softOnly) {
    multiplier = 0.4;
  } else {
    const keepFloor = constraints.find(
      (c) => c.id === "keep_floor" && c.enabled
    );
    const keepCeiling = constraints.find(
      (c) => c.id === "keep_ceiling" && c.enabled
    );
    const noPlumbing = constraints.find(
      (c) => c.id === "no_plumbing" && c.enabled
    );
    const noElectrical = constraints.find(
      (c) => c.id === "no_electrical" && c.enabled
    );

    if (keepFloor) multiplier -= 0.1;
    if (keepCeiling) multiplier -= 0.08;
    if (noPlumbing) multiplier -= 0.05;
    if (noElectrical) multiplier -= 0.05;
  }

  const total = Math.round(style.baseCost * areaSqm * multiplier);
  const rangeLow = Math.round(style.costRange[0] * areaSqm * multiplier);
  const rangeHigh = Math.round(style.costRange[1] * areaSqm * multiplier);

  return { total, range: [rangeLow, rangeHigh] };
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toLocaleString()}`;
}
