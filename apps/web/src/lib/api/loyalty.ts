import { apiRequest } from "./base";

export interface LoyaltyLevel {
  level: string;
  minPointsRequired: number;
  freeDelivery: boolean;
  perksDescription: string | null;
}

export interface LoyaltySummary {
  points: number;
  level: string;
  levels: LoyaltyLevel[];
  nextLevel: { level: string; pointsNeeded: number } | null;
}

export interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  reason: string | null;
  orderId: string | null;
  createdAt: string;
}

export function getMyLoyalty(accessToken: string): Promise<LoyaltySummary> {
  return apiRequest<LoyaltySummary>("/loyalty/me", { accessToken });
}

export function getLoyaltyTransactions(accessToken: string): Promise<LoyaltyTransaction[]> {
  return apiRequest<LoyaltyTransaction[]>("/loyalty/transactions", { accessToken });
}
