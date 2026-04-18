"use client";

import { motion } from "framer-motion";

export function Philosophy() {
  return (
    <section className="relative bg-cream">
      <div className="mx-auto max-w-[940px] px-6 py-32 sm:px-8 md:py-40">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9 }}
          className="font-display text-[30px] italic leading-[1.35] text-ink md:text-[42px]"
        >
          Children learn by doing the same small thing, again, and again, with
          someone who has time.{" "}
          <span className="not-italic text-clay">That is all.</span>{" "}
          <span className="italic text-ink-soft">That is everything.</span>
        </motion.p>
      </div>
    </section>
  );
}
