import { Sparkles, Twitter, Github, Linkedin, Instagram } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Dashboard', 'Insights', 'Pricing', 'API'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Contact', 'Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
};

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/prakhar_ffv', label: 'Instagram' },
  { icon: Github, href: 'https://github.com/prakhar-1617', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/prakharkumar1617', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0B0C10] border-t border-white/5 z-[90]">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A87FF3] to-[#7C6BFF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">FinTrack</span>
            </a>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              AI-powered expense tracking that learns your habits and keeps your budget on autopilot.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-white/40 mb-1">
              © 2026 FinTrack. All rights reserved.
            </p>
            <p className="text-xs font-medium text-[#A87FF3]">
              Designed & Developed by Prakhar Kumar
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
