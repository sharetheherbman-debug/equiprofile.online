import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="pt-16 pb-12 bg-[#0f1c2e] text-gray-300 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2e6da4]/30 to-transparent" />
      <div className="container relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-bold font-serif mb-3">
              <span className="text-white">
                Equi<span className="text-[#4a9eca]">Profile</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Professional horse management and equestrian learning platform.
              Health tracking, training logs, structured lessons, and complete
              school management — all in one place.
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-gray-400">
              <a href="mailto:hello@equiprofile.online" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" /> hello@equiprofile.online
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/students" className="hover:text-white transition-colors">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Start Free Trial
                </Link>
              </li>
            </ul>
          </div>

          {/* For Schools */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              For Schools
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/schools" className="hover:text-white transition-colors">
                  School Pricing
                </Link>
              </li>
              <li>
                <Link href="/schools" className="hover:text-white transition-colors">
                  Teacher Tools
                </Link>
              </li>
              <li>
                <Link href="/contact?plan=school" className="hover:text-white transition-colors">
                  Book a Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} EquiProfile.online · Part of{" "}
            <a
              href="https://amarktai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Amarkt<span className="text-[#4a9eca] font-semibold">AI</span>{" "}
              Network
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
