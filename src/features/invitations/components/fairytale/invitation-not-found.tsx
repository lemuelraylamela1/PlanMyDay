import { GoldCorner, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { parchmentBackground } from "@/features/invitations/components/fairytale/textures";

export function InvitationNotFound() {
  return (
    <main
      className="flex min-h-[100svh] items-center justify-center px-5 py-16"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(232,212,168,0.16), transparent 70%), radial-gradient(ellipse 40% 35% at 70% 70%, rgba(201,184,232,0.1), transparent 70%), linear-gradient(180deg,#2a2c45,#22243A)",
      }}
    >
      <div
        className="relative w-full max-w-md px-10 py-14 text-center text-[#4a3236]"
        style={{ backgroundImage: parchmentBackground }}
      >
        <span aria-hidden className="absolute inset-3 border border-[#DDBF8D]/70" />
        <GoldCorner className="left-2 top-2" />
        <GoldCorner className="right-2 top-2 rotate-90" />
        <GoldCorner className="bottom-2 right-2 rotate-180" />
        <GoldCorner className="bottom-2 left-2 -rotate-90" />
        <p className={`${smallCaps} text-[#B76E79]`}>A missing invitation</p>
        <h1 className={`${displayFont} mt-5 text-3xl font-medium`}>Invitation not found</h1>
        <p className={`${displayFont} mt-4 text-sm leading-relaxed text-[#6d4a50]`}>
          This invitation link is invalid or has expired. Please contact the couple.
        </p>
      </div>
    </main>
  );
}
