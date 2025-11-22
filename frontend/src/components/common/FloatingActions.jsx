import { useTranslation } from 'react-i18next';
import { LiaLanguageSolid } from "react-icons/lia";
import { FiShoppingBag, FiWind } from "react-icons/fi";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSmokey } from '../../contexts/SmokeyContext';

function FloatingActions() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [storeHovered, setStoreHovered] = useState(false);
  const [langHovered, setLangHovered] = useState(false);
  const [bgHovered, setBgHovered] = useState(false);
  const { smokeyOn, toggleSmokey } = useSmokey();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  const goStore = () => {
    if (location.pathname.startsWith('/store')) return;
    navigate('/store');
  };


  return (
    <div className="fixed right-4 md:right-6 bottom-20 md:bottom-24 z-50 flex flex-col items-center gap-3 select-none">
      <div className="relative flex items-center group">
        <button
          onClick={toggleLanguage}
          onMouseEnter={() => setLangHovered(true)}
          onMouseLeave={() => setLangHovered(false)}
          onFocus={() => setLangHovered(true)}
          onBlur={() => setLangHovered(false)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-dark text-accent border border-accent/30 shadow-lg hover:bg-secondary transition"
          title={i18n.language === 'en' ? 'Français' : 'English'}
          aria-label="Toggle language"
        >
          <LiaLanguageSolid className="text-xl md:text-2xl" />
        </button>
        {/* Hover label */}
        <div
          className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-300 ease-in-out
             ${langHovered ? 'opacity-100 max-w[150px]' : 'opacity-0 max-w-0 pointer-events-none'}
          `}
          style={{ willChange: 'opacity, width' }}
        >
          <span className="bg-secondary text-accent text-base font-bold py-1 px-4 rounded-lg shadow translate-x-2 animate-fade-in">
            Translate
          </span>
        </div>
        {/* Small bar indicator */}
        <span className={`absolute -right-1 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-300 ${langHovered ? 'w-6 opacity-100' : 'w-0 opacity-0'}`}></span>
      </div>
      <div className="relative flex items-center group">
        <button
          onClick={goStore}
          onMouseEnter={() => setStoreHovered(true)}
          onMouseLeave={() => setStoreHovered(false)}
          onFocus={() => setStoreHovered(true)}
          onBlur={() => setStoreHovered(false)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-primary text-dark shadow-lg hover:brightness-110 transition heartbeat"
          title="Store"
          aria-label="Go to store"
        >
          <FiShoppingBag className="text-xl md:text-2xl" />
        </button>
        <div
          className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-300 ease-in-out
             ${storeHovered ? 'opacity-100 max-w-[130px]' : 'opacity-0 max-w-0 pointer-events-none'}
          `}
          style={{ willChange: 'opacity, width' }}
        >
          <span className="bg-primary text-dark text-base font-bold py-1 px-4 rounded-lg shadow translate-x-2 animate-fade-in">
            Store
          </span>
        </div>
      </div>
      <div className="relative flex items-center group">
        <button
          onClick={toggleSmokey}
          onMouseEnter={() => setBgHovered(true)}
          onMouseLeave={() => setBgHovered(false)}
          onFocus={() => setBgHovered(true)}
          onBlur={() => setBgHovered(false)}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${smokeyOn ? 'bg-green-600 text-white' : 'bg-dark text-accent border border-accent/30'} shadow-lg hover:brightness-110 transition`}
          title="Background"
          aria-label="Toggle background"
        >
          <FiWind className="text-xl md:text-2xl" />
        </button>
        <div
          className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-300 ease-in-out ${bgHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'}`}
          style={{ willChange: 'opacity, width' }}
        >
          <span className="bg-secondary text-accent text-base font-bold py-1 px-4 rounded-lg shadow translate-x-2 animate-fade-in">
            {smokeyOn ? 'Smokey ON' : 'Smokey OFF'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FloatingActions;


