import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories, cities, periods } from "../data/events";

export function FilterModal({ initialFilters, isOpen, onApply, onClose }) {
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters, isOpen]);

  function toggleCategory(category) {
    setDraftFilters((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-panel p-6 shadow-[0_24px_120px_rgba(0,0,0,0.45)] sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                  Filtres avances
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-white">
                  Affinez votre recherche
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-300 transition hover:text-white"
              >
                Fermer
              </button>
            </div>

            <div className="mt-8 space-y-8">
              <div>
                <p className="text-sm font-bold text-white">Categories</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {categories
                    .filter((item) => item !== "Tout")
                    .map((category) => {
                      const active = draftFilters.categories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                            active
                              ? "bg-[#FF5722] text-white"
                              : "border border-white/10 bg-slate-950/60 text-slate-300"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-white" htmlFor="city-filter">
                  Villes
                </label>
                <select
                  id="city-filter"
                  value={draftFilters.city}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, city: event.target.value }))
                  }
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-bold text-white">Periode</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {periods.map((period) => {
                    const active = draftFilters.period === period.key;
                    return (
                      <button
                        key={period.key}
                        type="button"
                        onClick={() =>
                          setDraftFilters((current) => ({ ...current, period: period.key }))
                        }
                        className={`rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                          active
                            ? "bg-[#FF5722] text-white"
                            : "border border-white/10 bg-slate-950/60 text-slate-300"
                        }`}
                      >
                        {period.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => onApply(draftFilters)}
                className="rounded-2xl bg-[#FF5722] px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Appliquer
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
