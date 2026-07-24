import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getCategoryTree } from "@/lib/api/categories";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, categories] = await Promise.all([getTranslations("home"), getCategoryTree(locale)]);

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">One kitchen. Endless choices.</p>
        <h1 className="max-w-2xl text-4xl font-extrabold text-ink sm:text-5xl">{t("heading")}</h1>
        <p className="max-w-md text-zinc-600">{t("subheading")}</p>
        <Link
          href="/menu"
          className="rounded-md bg-ink px-8 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          {t("cta")}
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="mb-6 text-center text-2xl font-bold text-ink">{t("categoriesHeading")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={{ pathname: "/menu", query: { category: category.slug } }}
                className="group relative flex aspect-square items-end overflow-hidden rounded-xl bg-ink transition hover:opacity-90"
              >
                {category.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                )}
                <span className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-semibold text-white">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
