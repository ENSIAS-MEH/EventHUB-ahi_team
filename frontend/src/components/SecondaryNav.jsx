export function SecondaryNav({ items, activeItem, onItemSelect }) {
  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((item) => {
        const active = item === activeItem;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onItemSelect(item)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              active
                ? "bg-orange-500 text-white shadow-glow"
                : "border border-white/10 bg-slate-950/70 text-slate-300 hover:border-orange-400/20 hover:text-white"
            }`}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
}
