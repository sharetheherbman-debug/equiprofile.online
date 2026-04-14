import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="py-16 border-t border-white/10 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/10 to-transparent pointer-events-none" />
      <div className="container relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold font-serif mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                EquiProfile
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional horse management and equestrian learning platform.
              Health tracking, training logs, 95 structured lessons, and a
              complete school management system — all in one place.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link
                  href="/features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/students"
                  className="hover:text-white transition-colors"
                >
                  For Students
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Start Free Trial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              For Schools
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link
                  href="/pricing?type=school"
                  className="hover:text-white transition-colors"
                >
                  School Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/students"
                  className="hover:text-white transition-colors"
                >
                  Teacher Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?plan=school"
                  className="hover:text-white transition-colors"
                >
                  Book a Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p
            aria-label={`© ${new Date().getFullYear()} EquiProfile.online · Part of AmarktAI Network`}
          >
            © {new Date().getFullYear()} EquiProfile.online · Part of{" "}
            <a
              href="https://amarktai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Amarkt<span className="text-blue-400 font-semibold">AI</span>{" "}
              Network
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
