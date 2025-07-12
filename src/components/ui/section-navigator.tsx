import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  element: HTMLElement | null;
}

export function SectionNavigator() {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Define sections based on your landing page structure
    const sectionData = [
      { id: 'hero', title: 'Home' },
      { id: 'stats', title: 'Stats' },
      { id: 'trust-signals', title: 'Trust' },
      { id: 'features', title: 'Features' },
      { id: 'properties', title: 'Properties' },
      { id: 'markets', title: 'Markets' },
      { id: 'how-it-works', title: 'How it Works' },
      { id: 'fees', title: 'Fees' },
      { id: 'faq', title: 'FAQ' },
      { id: 'cta', title: 'Get Started' }
    ];

    // Find actual elements
    const foundSections = sectionData.map(section => ({
      ...section,
      element: document.querySelector(`[data-section="${section.id}"]`) as HTMLElement ||
               document.querySelector(`#${section.id}`) as HTMLElement ||
               null
    })).filter(section => section.element);

    setSections(foundSections);

    // Scroll listener
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
      
      // Find current section
      const scrollPosition = window.scrollY + 100;
      
      for (let i = foundSections.length - 1; i >= 0; i--) {
        const section = foundSections[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setCurrentSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section?.element) {
      section.element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (sections.length === 0) return null;

  return (
    <div className={cn(
      "fixed left-6 top-1/2 transform -translate-y-1/2 z-[9997] transition-all duration-500",
      isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
    )}>
      <div className="bg-white border border-grey-mid/30 rounded-2xl shadow-elegant py-4 px-2 min-w-[160px]">
        {/* Quick Navigation */}
        <div className="flex justify-center mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-grey-dark hover:text-blue-primary hover:bg-blue-light/30 rounded-lg w-8 h-8"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>

        {/* Section Links */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm font-inter font-medium rounded-lg transition-all duration-200 hover:bg-blue-light/30",
                currentSection === section.id
                  ? "bg-blue-primary text-white shadow-sm"
                  : "text-grey-dark hover:text-blue-primary"
              )}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Quick Navigation */}
        <div className="flex justify-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToBottom}
            className="text-grey-dark hover:text-blue-primary hover:bg-blue-light/30 rounded-lg w-8 h-8"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}