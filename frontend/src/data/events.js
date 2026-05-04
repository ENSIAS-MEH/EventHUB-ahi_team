export const categories = ["Tout", "Cinema", "Theatre", "Voyage", "Concert"];

export const cities = [
  "Toutes les villes",
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Errachidia",
  "Tangier",
  "Fes",
];

export const periods = [
  { key: "all", label: "Toutes les dates" },
  { key: "today", label: "Aujourd'hui" },
  { key: "weekend", label: "Ce week-end" },
  { key: "week", label: "Cette semaine" },
];

export const events = [
  {
    id: 1,
    title: "Nuit Electro Atlas",
    category: "Concert",
    city: "Casablanca",
    location: "Casablanca, Morocco Mall",
    date: "Ven. 26 Avril - 21:00",
    period: "weekend",
    price: "250 DH",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    featured: true,
    description:
      "Une nuit electronique immersive avec une programmation house et techno, des installations lumineuses et des zones VIP dans un cadre premium face a l'ocean.",
  },
  {
    id: 2,
    title: "Avant-premiere Cinema Horizon",
    category: "Cinema",
    city: "Rabat",
    location: "Rabat, Mega Mall",
    date: "Sam. 27 Avril - 19:30",
    period: "weekend",
    price: "95 DH",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    featured: true,
    description:
      "Projection exclusive d'un film tres attendu avec rencontre equipe, tapis rouge et zone lounge avant la seance.",
  },
  {
    id: 3,
    title: "Le Grand Theatre du Rire",
    category: "Theatre",
    city: "Marrakech",
    location: "Marrakech, Palais des Congres",
    date: "Dim. 28 Avril - 20:00",
    period: "weekend",
    price: "180 DH",
    image:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
    featured: false,
    description:
      "Une comedie theatrale grand format avec scenographie elegante, distribution marquee et ambiance raffinee.",
  },
  {
    id: 4,
    title: "Escape Weekend Merzouga",
    category: "Voyage",
    city: "Errachidia",
    location: "Errachidia, Depart Gare ONCF",
    date: "Jeu. 02 Mai - 06:30",
    period: "week",
    price: "790 DH",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    featured: true,
    description:
      "Une escapade desert premium avec transport, campement confort, diner sous les etoiles et animation live.",
  },
  {
    id: 5,
    title: "Soiree Jazz Rooftop",
    category: "Concert",
    city: "Tangier",
    location: "Tangier, Marina Bay",
    date: "Ven. 03 Mai - 22:00",
    period: "week",
    price: "210 DH",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
    featured: true,
    description:
      "Session jazz rooftop avec line-up live, service cocktail et vue panoramique sur la marina de Tanger.",
  },
  {
    id: 6,
    title: "Theatre des Etoiles",
    category: "Theatre",
    city: "Fes",
    location: "Fes, Centre Culturel",
    date: "Sam. 04 Mai - 18:00",
    period: "week",
    price: "130 DH",
    image:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80",
    featured: false,
    description:
      "Une piece contemporaine portee par une mise en scene sobre, un texte fort et un travail vocal precis.",
  },
];
