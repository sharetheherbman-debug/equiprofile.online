import { ReactNode } from "react";
import { marketingAssets } from "@/config/marketingAssets";

interface AuthSplitLayoutProps {
  children: ReactNode;
  imageUrl?: string;
}

/**
 * Auth Split Layout Component
 *
 * Desktop (md+): 50/50 split — left panel plays the auth video, right panel
 * hosts the form. The outer wrapper is locked to exactly one viewport height
 * (h-screen overflow-hidden) so there is zero page scroll on desktop.
 *
 * Mobile: Video fills the full background. The panel itself is transparent so
 * the video remains visible all around. Only the Card (form block) carries the
 * glass-morphism effect via its own backdrop-blur / bg classes.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="w-full pt-[72px] relative flex flex-col min-h-screen md:flex-row md:h-screen md:overflow-hidden md:bg-gray-950">
      {/* Video panel — absolute full-bg on mobile, left 50% on desktop */}
      <div className="absolute inset-0 md:relative md:inset-auto md:w-1/2 md:flex-shrink-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover"
        >
          <source src={marketingAssets.auth.video} type="video/mp4" />
        </video>
        {/* Mobile: very light scrim so the card stands out against the video */}
        <div className="absolute inset-0 bg-black/30 md:hidden" />
      </div>

      {/* Form panel
          Mobile:  transparent + natural height so the video shows through
                   everywhere except the Card itself (which has its own glass)
          Desktop: solid dark right half, locked height — no scroll */}
      <div
        className={[
          // base — centres the card, transparent on mobile
          "relative z-10 w-full flex items-center justify-center px-4 py-8",
          "min-h-[calc(100vh-72px)]",
          // desktop: fill remaining height exactly, clip overflow — zero scroll
          "md:w-1/2 md:min-h-0 md:py-0 md:bg-gray-950 md:overflow-hidden md:border-l md:border-white/5",
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
