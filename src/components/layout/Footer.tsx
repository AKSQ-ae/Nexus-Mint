import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { getCompanyName, getBrandingConfig } from '../../config/branding.config';

export function Footer() {
  const branding = getBrandingConfig();
  
  return (
    <footer className="bg-gradient-to-b from-background to-muted/50 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-elegant">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">{getCompanyName()}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {branding.company.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link to="/properties" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors duration-300 hover:underline">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Compliance
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/risk-disclaimer" className="hover:text-primary transition-colors duration-300 hover:underline">
                  Risk Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{branding.contact.supportEmail}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{branding.contact.phone}</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{branding.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground font-medium">
            &copy; 2025 {branding.company.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2">
            Real estate investments carry risks. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}