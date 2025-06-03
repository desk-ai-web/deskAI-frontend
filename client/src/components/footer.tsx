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
            <p className="text-gray-400 mb-6">Fix your screen habits without breaking your flow</p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/deskflowapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SiX className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/deskflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SiGithub className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/deskflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-gray-400">
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
                  href="https://changelog.deskflow.app" 
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
            <ul className="space-y-4 text-gray-400">
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
                  href="https://docs.deskflow.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@deskflow.app"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="https://community.deskflow.app" 
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
            <ul className="space-y-4 text-gray-400">
              <li>
                <a 
                  href="https://about.deskflow.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="https://deskflow.app/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a 
                  href="https://deskflow.app/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a 
                  href="https://deskflow.app/security" 
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
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 DeskFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
