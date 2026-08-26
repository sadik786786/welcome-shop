"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Gift,
  Smartphone,
  NotebookPen,
  Check,
  Truck,
} from "lucide-react";

const categories = [
  { icon: Leaf, name: "Herbal", note: "Natural essentials" },
  { icon: NotebookPen, name: "Stationery", note: "Work & study" },
  { icon: Gift, name: "Gifts", note: "Something special" },
  { icon: Smartphone, name: "Mobile", note: "Accessories" },
];

const trust = ["Quality products", "Easy shopping", "Friendly support"];

// ─── Animation variants ────────────────────────────────────────
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-black">
      {/* ─── Decorative orbs (dark glass glow) ────────────────── */}
      <motion.div
        className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ─── Subtle grid overlay ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:py-24">
        {/* ─── LEFT CONTENT ─────────────────────────────────────── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center lg:text-left"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            Everything you need, in one place
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Shop smart.
            <br />
            <span className="relative inline-block">
              <span className="italic text-blue-400">Live better.</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 300 20"
                className="absolute -bottom-2 left-0 h-3 w-full text-purple-400"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 14 C 80 4, 220 4, 298 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0"
          >
            Discover quality products across herbal essentials, stationery, gifts,
            mobile accessories, home essentials and more — all in one convenient
            place.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 font-medium text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40"
            >
              Explore products
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-300 lg:justify-start"
          >
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-blue-400">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* ─── RIGHT VISUAL ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-lg"
        >
          {/* ─── Main glass card (dark) ─────────────────────────── */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/hero-products.png"
                alt="An editorial arrangement of everyday products — herbs, stationery, gifts and home essentials"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 512px"
                className="object-cover opacity-80"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                WelcomeShop
              </div>
            </div>

            {/* ─── Category strip (dark glass tiles) ───────────── */}
            <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
              {categories.map(({ icon: Icon, name, note }) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.1)" }}
                  className="group cursor-default bg-white/5 p-4 backdrop-blur-sm transition-all duration-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-slate-400">{note}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── Floating badge 1 (dark glass) ──────────────────── */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-3 top-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl sm:-right-6"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-400">
              <Truck className="h-4 w-4" />
            </span>
            <div className="text-left">
              <p className="text-[11px] text-slate-400">Shopping made</p>
              <p className="text-sm font-bold text-white">Simple & easy</p>
            </div>
          </motion.div>

          {/* ─── Floating badge 2 (dark glass) ──────────────────── */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl sm:-left-6"
          >
            <div className="text-left">
              <p className="text-[11px] text-slate-400">Wide variety</p>
              <p className="text-sm font-bold text-white">Categories</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}