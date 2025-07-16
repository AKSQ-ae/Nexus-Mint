import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { BRANDING_CONFIG } from '@/lib/branding.config';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-elegant">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">{BRANDING_CONFIG.platformName}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Own • Earn • Multiply
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm">Platform</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/analytics" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/global-trading" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Trading
                </Link>
              </li>
              <li>
                <Link to="/early-access" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Early Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/documentation" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Compliance
                </Link>
              </li>
              <li>
                 <Link to={BRANDING_CONFIG.legal.termsOfService} className="hover:text-primary transition-colors duration-300 hover:underline">
                   Terms
                 </Link>
              </li>
              <li>
                 <Link to={BRANDING_CONFIG.legal.privacyPolicy} className="hover:text-primary transition-colors duration-300 hover:underline">
                   Privacy
                 </Link>
              </li>
              <li>
                 <Link to={BRANDING_CONFIG.legal.riskDisclaimer} className="hover:text-primary transition-colors duration-300 hover:underline">
                   Risk Disclaimer
                 </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground text-sm">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center justify-center md:justify-start space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@nexus-mint.com" className="hover:text-primary transition-colors">
                  support@nexus-mint.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-2">
                <Phone className="h-4 w-4" />
                <span>+971 4 XXX‑XXXX</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Abu Dhabi, UAE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2025 Nexus Mint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}