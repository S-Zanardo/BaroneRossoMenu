/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { Utensils, Beer, Info, ChevronDown, X, Filter } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// ============================================================================
// 🔴 INSERISCI QUI IL LINK DEL TUO GOOGLE SHEET IN FORMATO CSV 🔴
// Esempio: 'https://docs.google.com/spreadsheets/d/IL_TUO_ID/pub?output=csv'
// ============================================================================
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7xTPNn-haCLN3L15WeVZOF7Y8udUjiN-okFpAcmDFYkGykPAtzWkGiL7zZzrwvIH9I32Ub4lfSzHr/pub?output=csv'; 

interface MenuItem {
  Tipologia: string;
  Categoria: string;
  Nome: string;
  Ingredienti: string;
  Prezzo: string;
  'URL Immagine': string;
  Allergeni?: string;
}

// Dati di fallback nel caso il link non sia ancora inserito o ci siano errori
const FALLBACK_DATA: MenuItem[] = [
  { Tipologia: 'Food', Categoria: 'Panini', Nome: 'London Bridge', Ingredienti: 'Roast beef, cheddar, cipolla caramellata, salsa BBQ', Prezzo: '8.50', 'URL Immagine': '', Allergeni: 'Glutine, Lattosio' },
  { Tipologia: 'Food', Categoria: 'Hamburger', Nome: 'Classic Burger', Ingredienti: 'Hamburger di manzo 200g, insalata, pomodoro, salsa burger', Prezzo: '9.00', 'URL Immagine': '', Allergeni: 'Glutine' },
  { Tipologia: 'Food', Categoria: 'Piatti Carni', Nome: 'Ribs BBQ', Ingredienti: 'Costolette di maiale in salsa BBQ con patatine fritte', Prezzo: '14.00', 'URL Immagine': '' },
  { Tipologia: 'Food', Categoria: 'Piatti Carni', Nome: 'Galline in fuga', Ingredienti: 'Tagliata di pollo ruspante con rucola e grana', Prezzo: '12.00', 'URL Immagine': '' },
  { Tipologia: 'Drink', Categoria: 'Birre alla spina', Nome: 'Guinness', Ingredienti: 'Stout irlandese', Prezzo: '4.00 / 6.00', 'URL Immagine': '' },
  { Tipologia: 'Drink', Categoria: 'Cocktails', Nome: 'Negroni', Ingredienti: 'Gin, Campari, Vermouth rosso', Prezzo: '7.00', 'URL Immagine': '' },
];

const getPlaceholderImage = (categoria: string, tipologia: string) => {
  const cat = categoria?.toLowerCase() || '';
  const tip = tipologia?.toLowerCase() || '';
  
  if (cat.includes('hamburger') || cat.includes('panin')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('hot dog')) return 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('insalat')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('dolc')) return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('birr')) return 'https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('cocktail')) return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80';
  if (tip === 'drink') return 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80';
  
  // Default food
  return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80';
};

function CheersAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const leftX = useTransform(scrollYProgress, [0, 0.7], ["-100%", "-8%"]);
  const rightX = useTransform(scrollYProgress, [0, 0.7], ["100%", "8%"]);

  const leftRotate = useTransform(scrollYProgress, [0, 0.7, 1], [-20, 0, 6]);
  const rightRotate = useTransform(scrollYProgress, [0, 0.7, 1], [20, 0, -6]);

  return (
    <div ref={containerRef} className="h-[200vh] w-full relative z-20">
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-contain bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('${import.meta.env.BASE_URL}Fioi.jpg')`,
          backgroundColor: "#ffffff" /* Modifica questo codice HEX con il colore esatto dello sfondo della tua immagine */
        }}
      >
        <motion.div 
          className="absolute z-10 left-0 w-1/2 h-full flex items-center justify-end origin-bottom-right"
          style={{ x: leftX, rotate: leftRotate }}
        >
          <img 
            src={`${import.meta.env.BASE_URL}Boccale.png`}
            alt="Beer Left" 
            className="h-[30vh] md:h-[80vh] w-auto max-w-none object-contain drop-shadow-2xl"
            style={{ transform: 'scaleX(-1)' }}
          />
        </motion.div>

        <motion.div 
          className="absolute z-10 right-0 w-1/2 h-full flex items-center justify-start origin-bottom-left"
          style={{ x: rightX, rotate: rightRotate }}
        >
          <img 
            src={`${import.meta.env.BASE_URL}Boccale.png`}
            alt="Beer Right" 
            className="h-[30vh] md:h-[80vh] w-auto max-w-none object-contain drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          className="absolute z-20 font-serif text-6xl md:text-8xl font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          style={{ 
            opacity: useTransform(scrollYProgress, [0.75, 0.9], [0, 1]),
            scale: useTransform(scrollYProgress, [0.75, 1], [0.5, 1.2])
          }}
        >
          Cheers!
        </motion.div>

      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTipologia, setActiveTipologia] = useState<'Food' | 'Drink'>('Food');
  const [activeCategoria, setActiveCategoria] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [isAllergensExpanded, setIsAllergensExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!GOOGLE_SHEET_CSV_URL) {
        setItems(FALLBACK_DATA);
        setLoading(false);
        return;
      }

      try {
        Papa.parse<MenuItem>(GOOGLE_SHEET_CSV_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0 && results.data.length === 0) {
              setError('Errore nel caricamento dei dati dal foglio.');
              setItems(FALLBACK_DATA);
            } else {
              // Filtra righe vuote o non valide
              const validData = results.data.filter(item => item.Nome && item.Tipologia);
              setItems(validData.length > 0 ? validData : FALLBACK_DATA);
            }
            setLoading(false);
          },
          error: (err) => {
            console.error(err);
            setError('Impossibile connettersi al Google Sheet. Mostro i dati di esempio.');
            setItems(FALLBACK_DATA);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error(err);
        setError('Errore imprevisto.');
        setItems(FALLBACK_DATA);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Estrae dinamicamente tutti gli allergeni presenti nella tipologia attiva
  const allergeniDisponibili = useMemo(() => {
    const allergeniSet = new Set<string>();
    items.forEach(item => {
      if (item.Tipologia?.toLowerCase() === activeTipologia.toLowerCase() && item.Allergeni) {
        item.Allergeni.split(',').forEach(a => allergeniSet.add(a.trim().toLowerCase()));
      }
    });
    return Array.from(allergeniSet).filter(Boolean).sort();
  }, [items, activeTipologia]);

  // Filtra i prodotti per Tipologia (Food/Drink) e per Allergeni esclusi
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (item.Tipologia?.toLowerCase() !== activeTipologia.toLowerCase()) return false;
      
      if (excludedAllergens.length > 0) {
        const itemAllergens = item.Allergeni ? item.Allergeni.split(',').map(a => a.trim().toLowerCase()) : [];
        const hasExcluded = excludedAllergens.some(ea => itemAllergens.includes(ea));
        if (hasExcluded) return false;
      }
      return true;
    });
  }, [items, activeTipologia, excludedAllergens]);

  // Deriva le categorie disponibili in base agli elementi filtrati
  const categorieDisponibili = useMemo(() => {
    const cats = Array.from(new Set(filteredItems.map(item => item.Categoria))).filter(Boolean);
    return cats;
  }, [filteredItems]);

  // Raggruppa i prodotti per categoria in base agli elementi filtrati
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    filteredItems.forEach(item => {
      if (!grouped[item.Categoria]) {
        grouped[item.Categoria] = [];
      }
      grouped[item.Categoria].push(item);
    });
    return grouped;
  }, [filteredItems]);

  // ScrollSpy logic
  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categorieDisponibili.map(cat => document.getElementById(`category-${cat}`));
      
      let currentActive = categorieDisponibili[0];
      // Trova l'ultimo elemento che ha superato la soglia superiore
      for (let i = 0; i < categoryElements.length; i++) {
        const el = categoryElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          // Offset per compensare l'header sticky
          if (rect.top <= 120) {
            currentActive = categorieDisponibili[i];
          }
        }
      }
      if (currentActive) {
        setActiveCategoria(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Esegui subito per impostare lo stato iniziale
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categorieDisponibili]);

  const scrollToCategory = (cat: string) => {
    const el = document.getElementById(`category-${cat}`);
    if (el) {
      // Calcola la posizione tenendo conto dell'header sticky (circa 80px)
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToMenu = () => {
    const menuElement = document.getElementById('menu-anchor');
    if (!menuElement) return;

    const targetPosition = menuElement.getBoundingClientRect().top + window.scrollY;
    // ... rest of the code is unchanged below
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    
    // Variabile per determinare la velocità di scorrimento (durata in millisecondi)
    const scrollDuration = 3800; // 3.8 secondi per uno scorrimento lento
    let startTimestamp: number | null = null;

    // Funzione di easing per uno scorrimento fluido (ease-in-out)
    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      
      const currentY = easeInOutQuad(progress, startPosition, distance, scrollDuration);
      window.scrollTo(0, currentY);
      
      if (progress < scrollDuration) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetPosition);
      }
    };

    window.requestAnimationFrame(step);
  };

  const scrollToMenuStartRapido = () => {
    const menuElement = document.getElementById('menu-anchor');
    if (menuElement) {
      const y = menuElement.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Blocca lo scroll del body quando il modal è aperto
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedItem]);

  return (
    <div className="min-h-screen flex flex-col bg-barone-bg">
      
      {/* Hero Section */}
      <div 
        className="h-[100dvh] w-full bg-[#ef6c57] relative flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}hero.jpg')` }}
      >
        {/* Indicatore di scroll */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center text-[#fdf0d5] drop-shadow-md cursor-pointer hover:text-white transition-colors" 
          onClick={scrollToMenu}
        >
          <span className="text-xs font-bold tracking-widest uppercase mb-2">Scorri</span>
          <ChevronDown className="w-8 h-8" />
        </div>
      </div>

      <CheersAnimation />

      <div id="menu-anchor" />
      {/* Sticky Header for Tipologia */}
      <div id="menu-start" className="sticky top-0 z-30 bg-barone-bg/95 backdrop-blur-md border-b border-black/5 shadow-sm h-[80px] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center gap-4">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-barone-text hidden sm:block">
            Barone <span className="text-barone-red">Rosso</span>
          </h2>
          
          <div className="flex justify-center w-full sm:w-auto">
            <div className="inline-flex bg-white/50 rounded-full p-1 border border-black/5 shadow-inner w-full sm:w-auto justify-center">
              <button
                onClick={() => {
                  setActiveTipologia('Food');
                  scrollToMenuStartRapido();
                }}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                  activeTipologia === 'Food' 
                    ? "bg-barone-red text-white shadow-md" 
                    : "text-zinc-600 hover:text-black"
                )}
              >
                <Utensils className="w-4 h-4" />
                Food
              </button>
              <button
                onClick={() => {
                  setActiveTipologia('Drink');
                  scrollToMenuStartRapido();
                }}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                  activeTipologia === 'Drink' 
                    ? "bg-barone-red text-white shadow-md" 
                    : "text-zinc-600 hover:text-black"
                )}
              >
                <Beer className="w-4 h-4" />
                Drink
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-grow w-full max-w-7xl mx-auto flex items-start">
        
        {/* Left Sidebar (Categories) - Visible on all screens */}
        <div className="w-[110px] sm:w-[160px] md:w-[220px] shrink-0 bg-barone-sidebar border-r border-black/5 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto no-scrollbar py-4">
          
          {/* Sezione Filtri Allergeni */}
          {allergeniDisponibili.length > 0 && (
            <div className="px-3 sm:px-4 mb-6 border-b border-black/5 pb-2">
              <button
                onClick={() => setIsAllergensExpanded(!isAllergensExpanded)}
                className="relative flex items-center justify-center w-full group py-2"
              >
                {excludedAllergens.length > 0 && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-barone-red text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                    {excludedAllergens.length}
                  </span>
                )}
                
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-barone-red" fill="currentColor" />
                
                <ChevronDown className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-zinc-400 transition-transform duration-200", isAllergensExpanded ? "rotate-180" : "")} />
              </button>
              
              <AnimatePresence>
                {isAllergensExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1.5 pb-4 pt-1">
                      {allergeniDisponibili.map(allergen => (
                        <button
                          key={allergen}
                          onClick={() => {
                            setExcludedAllergens(prev => 
                              prev.includes(allergen) 
                                ? prev.filter(a => a !== allergen) 
                                : [...prev, allergen]
                            );
                          }}
                          className={cn(
                            "text-left text-[11px] sm:text-xs py-1.5 px-2 rounded-md transition-colors w-full break-words",
                            excludedAllergens.includes(allergen) 
                              ? "bg-red-100 text-red-700 font-medium border border-red-200" 
                              : "bg-black/5 text-zinc-600 hover:bg-black/10 hover:text-black"
                          )}
                        >
                          {excludedAllergens.includes(allergen) ? '🚫 ' : ''}{allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <nav className="flex flex-col">
            {categorieDisponibili.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={cn(
                  "text-left px-3 sm:px-4 py-4 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 break-words",
                  activeCategoria === cat
                    ? "bg-barone-bg text-barone-red border-l-4 border-barone-red shadow-[-4px_0_0_0_rgba(0,0,0,0.03)_inset]"
                    : "text-zinc-500 border-l-4 border-transparent hover:bg-black/5 hover:text-black"
                )}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content (Products) */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-barone-red border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500">Caricamento menù...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 mb-8">
              <Info className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && categorieDisponibili.map((cat) => (
            <div key={cat} id={`category-${cat}`} className="mb-12 scroll-mt-[100px]">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-barone-text mb-6 pb-2 border-b border-black/10 uppercase tracking-wide">
                {cat}
              </h3>
              
              <div className="flex flex-col gap-6">
                {itemsByCategory[cat]?.map((item, idx) => (
                  <div 
                    key={`${item.Nome}-${idx}`} 
                    onClick={() => setSelectedItem(item)}
                    className="group flex items-center gap-4 bg-transparent transition-all duration-300 cursor-pointer hover:bg-black/5 p-2 -m-2 rounded-xl"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden bg-black/5 border border-black/10 shadow-sm">
                      <img 
                        src={item['URL Immagine'] || getPlaceholderImage(item.Categoria, item.Tipologia)} 
                        alt={item.Nome}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                        <h4 className="font-sans text-base sm:text-lg font-bold text-barone-text uppercase leading-tight truncate whitespace-normal">
                          {item.Nome}
                        </h4>
                        <div className="shrink-0">
                          <span className="font-semibold text-barone-red text-base sm:text-lg">
                            € {item.Prezzo}
                          </span>
                        </div>
                      </div>
                      
                      {item.Ingredienti && (
                        <p className="text-zinc-600 text-xs sm:text-sm italic leading-snug line-clamp-2 sm:line-clamp-none">
                          {item.Ingredienti}
                        </p>
                      )}
                    {item.Allergeni && (
                      <p className="text-barone-red text-[10px] sm:text-xs mt-1 font-medium line-clamp-1">
                        Allergeni: {item.Allergeni}
                      </p>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-barone-sidebar border-t border-black/5 py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="text-barone-red font-serif font-bold text-xl mb-2">
            Barone Rosso
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600">
            <a href="#" className="hover:text-black transition-colors">Termini di servizio</a>
            <span className="hidden sm:inline text-zinc-400">•</span>
            <a href="#" className="hover:text-black transition-colors">Informativa sulla privacy</a>
          </div>
          <div className="text-xs text-zinc-500 mt-4 flex items-center gap-1">
            Powered by <a href="https://s-zanardo.github.io/Landing-portfolio-page/" target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-800 hover:text-black transition-colors">Zanardo DEV</a>
          </div>
        </div>
      </footer>

      {/* Modal Prodotto */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-barone-bg w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col border border-black/5"
            >
              {/* Pulsante di chiusura */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Immagine Header */}
              <div className="w-full h-64 shrink-0 relative bg-black/5">
                <img
                  src={selectedItem['URL Immagine'] || getPlaceholderImage(selectedItem.Categoria, selectedItem.Tipologia)}
                  alt={selectedItem.Nome}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              {/* Contenuto */}
              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-sans text-2xl md:text-3xl font-bold text-barone-text uppercase leading-tight">
                    {selectedItem.Nome}
                  </h3>
                  <span className="font-semibold text-barone-red text-2xl whitespace-nowrap">
                    € {selectedItem.Prezzo}
                  </span>
                </div>
                
                {selectedItem.Ingredienti && (
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Ingredienti e Dettagli
                    </h4>
                    <p className="text-zinc-700 text-base leading-relaxed">
                      {selectedItem.Ingredienti}
                    </p>
                  </div>
                )}
              
              {selectedItem.Allergeni && (
                <div className="mt-2">
                  <h4 className="text-xs font-bold text-barone-red uppercase tracking-wider mb-2">
                    Allergeni
                  </h4>
                  <p className="text-zinc-700 text-base leading-relaxed">
                    {selectedItem.Allergeni}
                  </p>
                </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
