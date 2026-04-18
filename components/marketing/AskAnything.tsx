"use client";

import { motion } from "framer-motion";
import { AskButton } from "./AskButton";

export function AskAnything() {
  return (
    <section className="dusk-grain relative overflow-hidden bg-dusk text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 h-[620px] w-[620px] -translate-y-1/2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(closest-side, rgba(184,83,60,0.75), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, rgba(110,123,92,0.85), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-36 sm:px-8 md:py-48">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
          className="mb-10 font-display text-[22px] italic text-clay-soft md:text-[26px]"
        >
          Is it nine at night, and your kid is warm?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-display text-[44px] leading-[1] text-paper md:text-[84px]"
        >
          Every real question
          <br />
          has a real answer.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-10 max-w-[60ch] font-sans text-[17px] leading-[1.7] text-paper/75"
        >
          Tuition. Pickup. What to do when your child wakes up warm. Ask Maria
          and the team directly — you'll hear back in under a minute during the
          day, and usually within the hour at night.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-14 flex flex-wrap items-center gap-8"
        >
          <AskButton variant="dusk" intent="general" source="ask-anything">
            Ask us anything
          </AskButton>
          <AskButton
            variant="quiet-light"
            intent="tour"
            source="ask-anything-tour"
          >
            or book a tour
          </AskButton>
        </motion.div>
      </div>
    </section>
  );
}
