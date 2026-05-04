import { Link } from "react-router-dom";

export function FeaturedEvents({ events }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-orange-300">
            Evenements a la une
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">Selection proche de vous</h2>
        </div>
        <p className="text-sm text-slate-400">Defilement horizontal fluide</p>
      </div>

      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/event/${event.id}`}
            className="group min-w-[280px] max-w-[320px] flex-none snap-start overflow-hidden rounded-[28px] border border-white/8 bg-slate-950/60"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-[#FF5722] px-4 py-2 text-xs font-extrabold text-white">
                {event.price}
              </div>
            </div>
            <div className="space-y-2 px-5 py-4">
              <h3 className="text-lg font-extrabold text-white">{event.title}</h3>
              <p className="text-sm text-slate-400">{event.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
