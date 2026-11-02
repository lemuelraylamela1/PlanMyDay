"use client";

import { SectionHeading } from "../ui/section-heading";
import { Accordion } from "../ui/accordion";
import { StarField } from "../effects/star-field";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

export function Faq() {
  const wedding = useLanternContent();

  return (
    <section
      id="faq"
      className="relative overflow-hidden lantern-section"
      style={{ background: "linear-gradient(180deg, #0d0720 0%, #1e0f3a 50%, #2d1b5e 100%)" }}
    >
      <StarField className="absolute inset-0" count={180} parallaxFactor={0.05} />
      <MagicDust count={22} intensity="soft" className="opacity-55" />
      <FloatingLanterns count={10} intensity="ambient" className="opacity-65" />
      <LanternReflection className="opacity-45" />
      <SceneAtmosphere tone="night" className="opacity-60" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.faq.eyebrow}
          title={wedding.faq.title}
          theme="dark"
        />

        <div className="mt-14">
          <Accordion items={[...wedding.faq.items]} theme="dark" />
        </div>
      </div>
    </section>
  );
}
