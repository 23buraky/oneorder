export interface LoyaltyLevelView {
  level: string;
  minPointsRequired: number;
  freeDelivery: boolean;
  perksDescription: string | null;
}

export interface LoyaltySummary {
  points: number;
  level: string;
  levels: LoyaltyLevelView[];
  nextLevel: { level: string; pointsNeeded: number } | null;
}

export interface LoyaltyTransactionView {
  id: string;
  points: number;
  type: string;
  reason: string | null;
  orderId: string | null;
  createdAt: Date;
}
