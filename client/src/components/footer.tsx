import { Eye } from "lucide-react";
import { SiX, SiGithub, SiLinkedin } from "react-icons/si";

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
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">desk.ai</span>
            </div>
            <p className="text-gray-600 mb-6">Fix your screen habits without breaking your flow</p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/deskai_app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors"
              >
                <SiX className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/desk-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors"
              >
                <SiGithub className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/desk-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors"
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
                  className="hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <a 
                  href="/downloads" 
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  Downloads
                </a>
              </li>
              <li>
                <a 
                  href="https://changelog.desk-ai.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Changelog
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
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <a 
                  href="https://help.desk-ai.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@desk-ai.app"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="https://community.desk-ai.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-600">
              <li>
                <a 
                  href="https://about.desk-ai.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="https://desk-ai.app/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a 
                  href="https://desk-ai.app/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a 
                  href="https://desk-ai.app/security" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-600">
          <p>&copy; 2024 desk.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
