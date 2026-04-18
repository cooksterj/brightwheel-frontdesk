"use client";

import { motion } from "framer-motion";
import { ChatCTA } from "./ChatCTA";
import { UnderlineScribble } from "./UnderlineScribble";

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="paper-grain relative overflow-hidden">
      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 gap-y-16 gap-x-8 px-6 pb-28 pt-14 sm:px-8 md:grid-cols-12 md:px-12 md:pb-32 md:pt-20">
        <div className="md:col-span-7">
          <motion.p
            {...fade}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mb-8 font-sans text-[11px] uppercase tracking-[0.32em] text-clay"
          >
            A family day school · Est. 2016
          </motion.p>

          <motion.h1
            {...fade}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="font-display text-[56px] leading-[0.95] text-ink sm:text-[72px] md:text-[92px] xl:text-[112px]"
          >
            A{" "}
            <span className="relative inline-block text-clay">
              gentle
              <UnderlineScribble className="absolute -bottom-3 left-0 h-[0.22em] w-full text-clay md:-bottom-4" />
            </span>{" "}
            place
            <br className="hidden md:block" />
            to grow.
          </motion.h1>

          <motion.p
            {...fade}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-10 max-w-[52ch] font-sans text-[17px] leading-[1.7] text-ink-soft md:mt-12 md:text-[18px]"
          >
            Quiet care, plain food, slow mornings. The Slow Cooker is where
            the day moves at a child's pace.
          </motion.p>

          <motion.div
            {...fade}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="mt-12 flex flex-wrap items-center gap-6"
          >
            <ChatCTA />
            <span className="font-sans text-[13px] italic text-ink-mute">
              tuition, hours, sick days — real answers, right now.
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative hidden md:col-span-5 md:block"
          aria-hidden
        >
          <Aperture />
        </motion.div>
      </div>
    </section>
  );
}

function Aperture() {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[460px]">
      <div className="absolute -left-2 top-6 h-20 w-44 -rotate-[6deg] rounded-[3px] bg-sage shadow-[0_18px_30px_-22px_rgba(0,0,0,0.25)]" />

      <div
        className="paper-grain absolute left-6 top-0 h-[440px] w-[320px] -rotate-[3deg] overflow-hidden rounded-[4px] shadow-[0_44px_80px_-40px_rgba(0,0,0,0.4)]"
        style={{
          background:
            "linear-gradient(162deg, #f1d199 0%, #e5a48e 55%, #b8533c 100%)",
        }}
      >
        <svg
          viewBox="0 0 320 440"
          className="absolute inset-0 h-full w-full text-ink/20"
          fill="none"
        >
          <circle cx="62" cy="72" r="28" fill="currentColor" opacity="0.35" />
          <path
            d="M 40 236 L 280 236"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M 56 340 Q 92 320 136 340 T 240 340"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute -bottom-4 right-0 h-44 w-24 rotate-[5deg] rounded-[2px] bg-dusk/90 shadow-[0_30px_50px_-25px_rgba(0,0,0,0.5)]" />
      <div className="absolute right-14 top-36 h-4 w-4 rounded-full bg-clay" />
      <div className="absolute left-4 bottom-10 h-10 w-10 rotate-12 rounded-[2px] bg-cream shadow-[0_10px_20px_-12px_rgba(0,0,0,0.3)]" />
    </div>
  );
}
