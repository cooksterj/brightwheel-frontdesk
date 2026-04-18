"use client";

import { motion } from "framer-motion";
import { Tile, type TileSpec } from "./Tile";

const tiles: TileSpec[] = [
  { tint: "butter",     w: 280, h: 360, top: 20,  left:  20, rotate: -3.2, shape: "window"   },
  { tint: "clay-soft",  w: 240, h: 220, top: 120, left: 340, rotate:  2.0, shape: "circle"   },
  { tint: "sage",       w: 220, h: 300, top: 340, left: 160, rotate: -1.0, shape: "sprig"    },
  { tint: "sand",       w: 260, h: 220, top: 420, left: 440, rotate:  2.8, shape: "stones"   },
  { tint: "dusk-soft",  w: 200, h: 260, top:  40, left: 650, rotate: -2.4, shape: "moon"     },
  { tint: "cream",      w: 230, h: 200, top: 320, left: 680, rotate:  1.4, shape: "scribble" },
];

export function Gallery() {
  return (
    <section className="paper-grain relative bg-paper-deep">
      <div className="relative z-10 mx-auto max-w-[1180px] px-6 py-28 sm:px-8 md:py-40">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="mb-16 font-display text-[22px] italic text-ink-soft md:text-[26px]"
        >
          — small moments, in no particular order.
        </motion.p>

        <div className="relative hidden h-[720px] w-full md:block">
          {tiles.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18, rotate: t.rotate - 1 }}
              whileInView={{ opacity: 1, y: 0, rotate: t.rotate }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.9, delay: 0.05 * i }}
              className="absolute"
              style={{
                top: t.top,
                left: t.left,
                width: t.w,
                height: t.h,
              }}
            >
              <Tile spec={t} />
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 md:hidden">
          {tiles.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              style={{
                width: Math.min(t.w, 280),
                height: t.h,
                transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
              }}
            >
              <Tile spec={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
