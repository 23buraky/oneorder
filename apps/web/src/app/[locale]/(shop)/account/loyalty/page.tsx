"use client";

import { useTranslations } from "next-intl";
import { useLoyalty, useLoyaltyTransactions } from "@/hooks/use-loyalty";

export default function AccountLoyaltyPage() {
  const t = useTranslations("account.loyalty");
  const { data: loyalty, isLoading } = useLoyalty();
  const { data: transactions } = useLoyaltyTransactions();

  if (isLoading || !loyalty) {
    return <p className="text-sm text-zinc-500">...</p>;
  }

  const currentLevelConfig = loyalty.levels.find((level) => level.level === loyalty.level);
  const nextLevelConfig = loyalty.nextLevel
    ? loyalty.levels.find((level) => level.level === loyalty.nextLevel!.level)
    : null;
  const rangeStart = currentLevelConfig?.minPointsRequired ?? 0;
  const rangeEnd = nextLevelConfig?.minPointsRequired ?? loyalty.points;
  const progressPct = nextLevelConfig
    ? Math.min(100, Math.max(0, ((loyalty.points - rangeStart) / (rangeEnd - rangeStart)) * 100))
    : 100;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">{t("title")}</h1>

      <div className="rounded-xl border border-zinc-200 bg-ink p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t("currentLevel")}</p>
        <p className="mt-1 text-2xl font-extrabold">{loyalty.level}</p>
        <p className="mt-1 text-sm text-zinc-300">
          {loyalty.points} {t("pointsLabel")}
        </p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-2 text-xs text-zinc-300">
          {loyalty.nextLevel ? t("nextLevel", { points: loyalty.nextLevel.pointsNeeded, level: loyalty.nextLevel.level }) : t("maxLevel")}
        </p>
      </div>

      {currentLevelConfig?.perksDescription && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("perksHeading")}</p>
          <p className="text-sm text-ink">{currentLevelConfig.perksDescription}</p>
          {currentLevelConfig.freeDelivery && (
            <p className="mt-1 text-sm font-semibold text-emerald-700">{t("freeDelivery")}</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("levelsHeading")}</p>
        <ul className="space-y-2">
          {loyalty.levels.map((level) => (
            <li
              key={level.level}
              className={`flex items-center justify-between rounded-md border px-4 py-2 text-sm ${
                level.level === loyalty.level ? "border-ink bg-zinc-50 font-semibold" : "border-zinc-200 text-zinc-500"
              }`}
            >
              <span>{level.level}</span>
              <span>{level.minPointsRequired}+ {t("pointsLabel")}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("historyHeading")}</p>
        {(!transactions || transactions.length === 0) && <p className="text-sm text-zinc-500">{t("noHistory")}</p>}
        {transactions && transactions.length > 0 && (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <p className="text-ink">{transaction.reason ?? transaction.type}</p>
                  <p className="text-xs text-zinc-400">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={transaction.points >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
                  {transaction.points >= 0 ? "+" : ""}
                  {transaction.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
