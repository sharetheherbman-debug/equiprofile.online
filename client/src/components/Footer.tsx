import { Link } from "wouter";
import { Mail, MessageSquare } from "lucide-react";

const WHATSAPP_NUMBER = "+447700900000";
const SUPPORT_EMAIL = "support@equiprofile.online";

export function Footer() {
  return (
    <footer className="py-12 lg:py-16 border-t bg-card">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold font-serif mb-4">
              <span className="text-gradient">EquiProfile</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Built for equine professionals
            </p>
            <p className="text-muted-foreground text-sm">
              Professional horse management for the modern equestrian.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features"><a className="hover:text-foreground transition-colors">Features</a></Link></li>
              <li><Link href="/pricing"><a className="hover:text-foreground transition-colors">Pricing</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about"><a className="hover:text-foreground transition-colors">About</a></Link></li>
              <li><Link href="/contact"><a className="hover:text-foreground transition-colors">Contact</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>{SUPPORT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{WHATSAPP_NUMBER}</span>
                </a>
              </li>
            </ul>
            <h4 className="font-semibold mb-4 mt-6">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy"><a className="hover:text-foreground transition-colors">Privacy</a></Link></li>
              <li><Link href="/terms"><a className="hover:text-foreground transition-colors">Terms</a></Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EquiProfile. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
