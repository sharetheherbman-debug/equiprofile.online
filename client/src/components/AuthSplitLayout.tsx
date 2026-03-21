import { ReactNode } from "react";
import { ImageSlider } from "@/components/ImageSlider";
import { authSlides } from "@/config/marketingAssets";

interface AuthSplitLayoutProps {
  children: ReactNode;
  imageUrl?: string;
}

/**
 * Auth Split Layout Component
 *
 * Desktop (md+): 50/50 split — left panel shows an image slider, right panel
 * hosts the form. The outer wrapper is locked to exactly one viewport height
 * (h-screen overflow-hidden) so there is zero page scroll on desktop.
 * The image panel starts from the very top of the screen and sits behind the
 * fixed navbar (z-50), giving a seamless edge-to-edge look.
 *
 * Mobile: First image fills the background (including behind the navbar).
 * The panel itself is transparent so the image remains visible all around.
 * Only the Card (form block) carries the glass-morphism effect via its own
 * backdrop-blur / bg classes.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="w-full relative flex flex-col min-h-screen md:flex-row md:h-screen md:overflow-hidden md:bg-[#0a1628]">
      {/* Image slider panel — absolute full-bg on mobile, left 50% on desktop.
          No top padding so it extends behind the fixed navbar. */}
      <div className="absolute inset-0 md:relative md:inset-auto md:w-1/2 md:flex-shrink-0 overflow-hidden">
        <ImageSlider
          slides={authSlides}
          interval={6000}
          showArrows={false}
          showDots={true}
          showText={true}
          className="w-full h-full"
          overlayClass="bg-black/30"
        />
      </div>

      {/* Form panel
          Mobile:  transparent + natural height so the image shows through
                   everywhere except the Card itself (which has its own glass).
                   pt-[72px] keeps the form content below the fixed navbar.
          Desktop: solid dark right half, locked height — no scroll.
                   pt-[72px] keeps form vertically centered in visible area. */}
      <div
        className={[
          // base — centres the card, transparent on mobile
          "relative z-10 w-full flex items-center justify-center px-4 py-8",
          "pt-[72px] min-h-screen",
          // desktop: fill remaining height exactly, clip overflow — zero scroll
          "md:w-1/2 md:min-h-0 md:py-0 md:pt-[72px] md:bg-[#0a1628] md:overflow-hidden md:border-l md:border-white/5",
        ].join(" ")}
      >
        <div className="w-full max-w-md">{children}</div>

        {/* Copyright — visible on auth pages since the full Footer is omitted */}
        <p
          className="absolute bottom-3 left-0 right-0 text-center text-xs text-gray-600"
          aria-label={`© ${new Date().getFullYear()} EquiProfile.online · Part of AmarktAI Network`}
        >
          © {new Date().getFullYear()} EquiProfile.online · Part of{" "}
          <a
            href="https://amarktai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            Amarkt<span className="text-blue-400 font-semibold">AI</span>{" "}
            Network
          </a>
        </p>
      </div>
    </div>
  );
}
