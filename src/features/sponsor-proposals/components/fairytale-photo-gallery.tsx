"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronDown, Clock3, MapPin } from "lucide-react";

export interface ProposalImage {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
}

export const proposalHeroImages: ProposalImage[] = [
  { id: "hero-01", url: "/proposal-photos/hero-01.jpg", fileName: "By the carriage", caption: "By the carriage" },
  { id: "hero-02", url: "/proposal-photos/hero-02.jpg", fileName: "At Fernwood", caption: "At Fernwood" },
  { id: "hero-03", url: "/proposal-photos/hero-03.jpg", fileName: "Hand in hand", caption: "Hand in hand" },
  { id: "hero-04", url: "/proposal-photos/hero-04.jpg", fileName: "Our carriage", caption: "Our carriage" },
  { id: "hero-05", url: "/proposal-photos/hero-05.jpg", fileName: "A look back", caption: "A look back" },
  { id: "hero-06", url: "/proposal-photos/hero-06.jpg", fileName: "By the fountain", caption: "By the fountain" },
  { id: "hero-07", url: "/proposal-photos/hero-07.jpg", fileName: "A quiet moment", caption: "A quiet moment" },
  { id: "hero-08", url: "/proposal-photos/hero-08.jpg", fileName: "Stepping out", caption: "Stepping out" },
  { id: "hero-09", url: "/proposal-photos/hero-09.jpg", fileName: "Together", caption: "Together" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function ProposalExperience({
  images,
  coupleNames,
  honoreeName,
  rolePhrase,
  message,
  dateLabel,
  timeLabel,
  venueName,
  venueAddress,
  children,
}: {
  images: ProposalImage[];
  coupleNames: string;
  honoreeName: string;
  rolePhrase: string;
  message: string;
  dateLabel: string | null;
  timeLabel: string | null;
  venueName: string | null;
  venueAddress: string | null;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const photos = [...proposalHeroImages, ...images];

  React.useEffect(() => {
    if (reduceMotion || photos.length < 2) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % photos.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [photos.length, reduceMotion]);

  const hero = photos[active] ?? photos[0];
  const reveal = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="bg-[#FFFDF8] text-[#5c3d43]">
      <section className="relative h-svh overflow-hidden bg-[#FFFDF8]">
        <AnimatePresence mode="wait">
          {hero && (
            <motion.div
              key={hero.id}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              <Image
                src={hero.url}
                alt={hero.caption || hero.fileName}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.a
          href="#proposal-greeting"
          aria-label="Scroll down to the rest of the proposal"
          className="absolute bottom-6 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-[#FFFDF8]/90 text-[#B76E79] shadow-sm"
          animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.a>
      </section>

      <section className="bg-[#FFFDF8]">
        <div
          id="proposal-greeting"
          className="mx-auto max-w-3xl scroll-mt-8 px-6 pb-8 pt-8 text-center sm:pb-10 sm:pt-10"
        >
          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease }}
            className="text-sm font-medium uppercase tracking-[0.32em] text-[#B76E79]"
          >
            Dear
          </motion.p>
          <motion.h1
            {...reveal}
            transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.1, ease }}
            className="mt-4 font-serif text-4xl font-medium leading-tight text-[#6d4650] sm:text-6xl"
          >
            {honoreeName}
          </motion.h1>
          <motion.p
            {...reveal}
            transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.2, ease }}
            className="mt-6 font-serif text-3xl text-[#B76E79] sm:text-4xl"
          >
            {coupleNames}
          </motion.p>
          <motion.p
            {...reveal}
            transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.28, ease }}
            className="mt-3 font-serif text-xl italic text-[#8d5d66] sm:text-2xl"
          >
            Will you be {rolePhrase}?
          </motion.p>
        </div>
      </section>

      <section id="wedding-details" className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-24">
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
          }}
        >
          <DetailCard icon={CalendarDays} label="Date" value={dateLabel ?? "To be announced"} />
          <DetailCard icon={Clock3} label="Ceremony" value={timeLabel ?? "To be announced"} />
          <DetailCard
            icon={MapPin}
            label="Venue"
            value={venueName ?? "To be announced"}
            detail={venueAddress}
          />
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B76E79]">Our photographs</p>
          <h2 className="mt-3 font-serif text-3xl text-[#6d4650] sm:text-4xl">A glimpse of us</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setActive(index)}
              className={`group overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-[#E8B8C7]/70 ${
                index === active ? "ring-2 ring-[#B76E79]" : ""
              }`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : index * 0.08 }}
              aria-label={`Show ${photo.caption || photo.fileName} in the hero`}
              aria-current={index === active ? "true" : undefined}
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={photo.url}
                  alt={photo.caption || photo.fileName}
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>
              {photo.caption && (
                <p className="bg-[#FFFDF8] px-4 py-3 text-sm text-[#8d5d66]">{photo.caption}</p>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mx-auto mb-8 h-px w-16 bg-[#DDBF8D]" />
          <p className="whitespace-pre-line font-serif text-2xl leading-relaxed text-[#6d4650] sm:text-3xl sm:leading-relaxed">
            {message}
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-6">{children}</section>
    </main>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string | null;
}) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
      }}
      className="rounded-2xl border border-[#E8B8C7] bg-white/70 px-6 py-7 text-center shadow-sm"
    >
      <Icon className="mx-auto h-5 w-5 text-[#DDBF8D]" />
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[#B76E79]">{label}</p>
      <p className="mt-2 font-serif text-2xl text-[#6d4650]">{value}</p>
      {detail && <p className="mt-2 text-sm leading-6 text-[#8d5d66]">{detail}</p>}
    </motion.article>
  );
}
