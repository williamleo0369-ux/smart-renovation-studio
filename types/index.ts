export type UserRole = 'designer' | 'homeowner';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  createdAt: number;
}

export interface StyleCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  styles: RenovationStyle[];
}

export interface RenovationStyle {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  image: string;
  baseCost: number;
  costRange: [number, number];
  promptKeywords: string;
  lightingMaterial: string;
  commercialAnchor: string;
  categoryId: string;
}

export interface EngineeringConstraint {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface Project {
  id: string;
  title: string;
  originalPhoto: string;
  generatedPhoto?: string;
  styleId: string;
  constraints: Record<string, boolean>;
  estimatedCost?: number;
  costRange?: [number, number];
  createdAt: number;
  status: "draft" | "generating" | "completed" | "failed";
}

export interface GenerationResult {
  imageBase64: string;
  mimeType: string;
  estimatedCost: number;
  costRange: [number, number];
  styleId: string;
}

export type SubscriptionTier = 'free' | 'professional';

export interface Subscription {
  tier: SubscriptionTier;
  expiryDate: number | null;
  dailyGenerations: number;
  lastGenerationDate: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  nameEn: string;
  price: number;
  priceLabel: string;
  period: string;
  features: string[];
  highlighted: boolean;
}
