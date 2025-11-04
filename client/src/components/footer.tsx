import { SiX, SiGithub, SiLinkedin } from 'react-icons/si';
import { Link } from 'wouter';
import logoIcon from '@/assets/icon_with_background.png';

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img
                src={logoIcon}
                alt="desk.ai icon"
                className="w-8 h-8"
                loading="lazy"
              />
              <span className="text-xl font-bold text-gray-700">desk.ai</span>
            </div>
            <p className="text-gray-600 mb-6">
              Fix your screen habits without breaking your flow
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/deskai_app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <SiX className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/desk-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <SiGithub className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/desk-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <SiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-gray-600">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-primary transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <a
                  href="/downloads"
                  target="_blank"
                  className="hover:text-primary transition-colors"
                >
                  Downloads
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-4 text-gray-600">
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@desk-ai.app"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-600">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/impressum"
                  className="hover:text-primary transition-colors"
                >
                  Impressum
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-600">
          <p>&copy; 2025 desk.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
