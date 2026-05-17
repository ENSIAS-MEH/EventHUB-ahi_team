import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const footerColumns = [
    {
      title: "Explorer",
      links: ["Evenements", "Cinema", "Concerts", "Voyages"],
    },
    {
      title: "Guichet.com",
      links: ["A propos", "Partenaires", "Presse", "Contact"],
    },
    {
      title: "Termes & conditions",
      links: ["Confidentialite", "CGU", "Paiement", "Support"],
    },
  ];

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.includes("@")) {
      setStatusMessage("Entrez une adresse email valide.");
      return;
    }

    setStatusMessage("Inscription enregistree. Merci.");
    setEmail("");
  }

  return (
    <footer className="mt-8 rounded-[32px] border border-stroke bg-panel/80 px-5 py-8 backdrop-blur xl:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.3fr,2fr]">
        <div className="rounded-[28px] border border-white/6 bg-slate-950/60 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
            Newsletter
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Recevez les meilleures sorties avant tout le monde.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
            Nouveaux evenements, ouvertures de ventes et selections exclusives dans votre boite mail.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-panel-soft px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
            >
              S'inscrire
            </button>
          </form>
          {statusMessage ? (
            <p className="mt-3 text-sm text-orange-300">{statusMessage}</p>
          ) : null}
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
                {column.title}
              </h3>
              <div className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <button
                    key={link}
                    type="button"
                    className="block text-sm text-slate-400 transition hover:text-orange-300"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
