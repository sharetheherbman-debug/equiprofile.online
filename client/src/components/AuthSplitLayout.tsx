import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "./MarketingNav";
import { PageTransition } from "./PageTransition";

interface AuthSplitLayoutProps {
  children: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * AuthSplitLayout - Shared 50/50 split screen layout for Login/Register pages
 * 
 * Features:
 * - Left side: Form content (passed as children)
 * - Right side: Hero image with soft dark overlay
 * - Mobile: Stacked layout (image as background)
 * - Responsive and modern design
 */
export function AuthSplitLayout({ 
  children, 
  imageSrc = "/images/hero-auth.jpg",
  imageAlt = "Professional horse management" 
}: AuthSplitLayoutProps) {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        {/* Desktop: 50/50 Split | Mobile: Stacked with background */}
        <div className="min-h-screen flex">
          {/* Left Side: Form Content */}
          <div className="flex-1 flex items-center justify-center px-6 py-20 relative z-10 bg-background">
            <div className="w-full max-w-md">
              {/* Back button */}
              <Link href="/">
                <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  Back to home
                </a>
              </Link>

              {/* Form Content */}
              {children}
            </div>
          </div>

          {/* Right Side: Hero Image (hidden on mobile, shown on lg+) */}
          <div className="hidden lg:flex flex-1 relative overflow-hidden">
            <img 
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Optional overlay content */}
            <div className="absolute inset-0 flex items-end justify-center p-12">
              <div className="text-white text-center max-w-lg">
                <h2 className="text-3xl font-bold font-serif mb-3">
                  Professional Horse Management
                </h2>
                <p className="text-white/90 text-lg">
                  Join thousands of equestrians managing their horses with EquiProfile
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
