import { createContext, useContext, useState, useEffect } from 'react';

const SmokeyContext = createContext();

export const SmokeyProvider = ({ children }) => {
  const [smokeyOn, setSmokeyOn] = useState(false);

  useEffect(() => {
    const apply = () => {
      try {
        let pref = localStorage.getItem('smokeyBg');
        if (pref === null) { 
          localStorage.setItem('smokeyBg', '1'); 
          pref = '1'; 
        }
        const enabled = pref === '1';
        document.body.classList.toggle('smokey-bg', !!enabled);
        setSmokeyOn(enabled);
      } catch {}
    };
    
    apply();
    
    const handler = () => apply();
    window.addEventListener('toggle-smokey-bg', handler);
    
    return () => {
      window.removeEventListener('toggle-smokey-bg', handler);
    };
  }, []);

  const toggleSmokey = () => {
    const next = !smokeyOn;
    setSmokeyOn(next);
    try { 
      localStorage.setItem('smokeyBg', next ? '1' : '0'); 
      document.body.classList.toggle('smokey-bg', next);
      window.dispatchEvent(new Event('toggle-smokey-bg'));
    } catch {}
  };

  return (
    <SmokeyContext.Provider value={{ smokeyOn, toggleSmokey }}>
      {children}
    </SmokeyContext.Provider>
  );
};

export const useSmokey = () => {
  const context = useContext(SmokeyContext);
  if (!context) {
    throw new Error('useSmokey must be used within a SmokeyProvider');
  }
  return context;
};

export default SmokeyContext;















