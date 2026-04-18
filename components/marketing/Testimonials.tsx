"use client";

import { motion } from "framer-motion";

const quotes = [
  {
    text: "The first place my daughter actually wanted to go.",
    name: "Priya",
    sub: "mother of three-year-old twins",
    shift: "md:-translate-x-6",
  },
  {
    text: "Our son started narrating his day over dinner again. I don't know what they do differently, but something is working.",
    name: "James",
    sub: "father of a four-year-old",
    shift: "md:translate-x-6 md:ml-auto",
  },
  {
    text: "When we toured, Maria remembered our son's name four days later. That's when we knew.",
    name: "Camila",
    sub: "mother of a two-year-old",
    shift: "md:translate-x-20",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-paper">
      <div className="mx-auto max-w-[1000px] px-6 py-32 sm:px-8 md:py-40">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
          className="mb-20 font-sans text-[11px] uppercase tracking-[0.32em] text-clay"
        >
          What families tell us
        </motion.p>

        <div className="space-y-20 md:space-y-28">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.05 * i }}
              className={`max-w-[780px] ${q.shift}`}
            >
              <blockquote className="font-display text-[26px] leading-[1.3] text-ink md:text-[38px]">
                <span className="text-clay">“</span>
                {q.text}
                <span className="text-clay">”</span>
              </blockquote>
              <figcaption className="mt-6 font-sans text-[11px] uppercase tracking-[0.28em] text-ink-soft">
                {q.name}
                <span className="mx-2 text-paper-edge">·</span>
                <span className="normal-case tracking-normal text-ink-mute">
                  {q.sub}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
