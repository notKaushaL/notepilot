import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

const GlossaryTooltip = () => {
  const [tooltip, setTooltip] = useState({ show: false, content: '', position: { x: 0, y: 0 } });

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.classList.contains('glossary-highlight')) {
        const term = target.getAttribute('data-term');
        const definition = target.getAttribute('data-definition');
        
        if (term && definition) {
          const rect = target.getBoundingClientRect();
          setTooltip({
            show: true,
            content: { term, definition },
            position: {
              x: rect.left + rect.width / 2,
              y: rect.top - 10
            }
          });
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (target.classList.contains('glossary-highlight')) {
        setTooltip(prev => ({ ...prev, show: false }));
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!tooltip.show || !tooltip.content) return null;

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs animate-fade-in"
      style={{
        left: `${tooltip.position.x}px`,
        top: `${tooltip.position.y}px`,
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none'
      }}
    >
      <div className="flex items-start gap-2">
        <BookOpen size={16} className="mt-0.5 text-blue-300 flex-shrink-0" />
        <div>
          <div className="font-semibold text-blue-300">{tooltip.content.term}</div>
          <div className="text-sm text-gray-200 mt-1">{tooltip.content.definition}</div>
        </div>
      </div>
      
      {/* Arrow */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid rgb(17, 24, 39)'
        }}
      />
    </div>
  );
};

export default GlossaryTooltip;