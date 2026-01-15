/// <reference types="vite/client" />
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE DATABASE SUPABASE ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Interfaccia allineata allo schema DB
interface Company {
  id: string;
  name: string;
  type: string;
  sector: string;
  shortDescription: string;
  fullDescription: string;
  products: string[];
  services: string[];
  marketsServed: string[];
  location: string;
  size: string;
  logo: string;
  cover: string;
  email: string;
  phone: string;
  website: string;
  whatsapp: string;
  createdAt?: string;
}

const CATEGORIES = [
  "DESIGN CONCEPT, ARREDAMENTI",
  "INGREDIENTI E SEMILAVORATI",
  "PACKAGING & TABLEWARE",
  "PRODOTTI READY TO EAT",
  "PRODOTTI SURGELATI",
  "SERVIZI E VARIE",
  "TECNOLOGIE E ATTREZZATURE"
];

const MOCK_DATA: Company[] = [
  // 1. DESIGN CONCEPT
  {
    id: "dc-1", name: "Arredo Contract Italia", type: "Produttore", sector: "DESIGN CONCEPT, ARREDAMENTI",
    shortDescription: "Specialisti in allestimenti per hotel e retail di lusso.",
    fullDescription: "Arredo Contract Italia realizza soluzioni su misura per il settore hospitality, unendo design Made in Italy e funzionalità tecnologica.",
    products: ["Sistemi Modulari", "Sedute Design"], services: ["Progettazione 3D", "Installazione"],
    marketsServed: ["Italia", "Francia", "UK"], location: "Milano, IT", size: "51-200 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AC", cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
    email: "info@arredocontract.it", phone: "+39 02 123456", website: "https://example.com", whatsapp: "+39 333 000001"
  },
  {
    id: "dc-2", name: "Mobili & Visioni", type: "Distributore", sector: "DESIGN CONCEPT, ARREDAMENTI",
    shortDescription: "Il punto di riferimento per il design contemporaneo in ufficio.",
    fullDescription: "Distribuiamo i migliori brand internazionali di arredamento per ufficio con un focus sull'ergonomia e il benessere lavorativo.",
    products: ["Scrivanie Elevabili", "Pareti Divisorie"], services: ["Consulenza Ergonomica"],
    marketsServed: ["Italia", "Svizzera"], location: "Lissone, IT", size: "11-50 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=MV", cover: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000",
    email: "commerciale@mobilivisioni.it", phone: "+39 039 987654", website: "https://example.com", whatsapp: "+39 333 000002"
  },
  // 2. INGREDIENTI
  {
    id: "in-1", name: "BioBasics Food", type: "Produttore", sector: "INGREDIENTI E SEMILAVORATI",
    shortDescription: "Ingredienti biologici certificati per l'industria alimentare.",
    fullDescription: "Forniamo semilavorati bio di alta qualità per pasticcerie e industrie dolciarie, garantendo tracciabilità totale.",
    products: ["Farine Speciali", "Estratti Naturali"], services: ["R&D Personalizzato"],
    marketsServed: ["Europa"], location: "Bologna, IT", size: "51-200 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=BB", cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000",
    email: "bio@biobasics.it", phone: "+39 051 112233", website: "https://example.com", whatsapp: "+39 333 000003"
  },
  {
    id: "in-2", name: "Aromi d'Oriente SpA", type: "Import/Export", sector: "INGREDIENTI E SEMILAVORATI",
    shortDescription: "Spezie e aromi rari per la gastronomia gourmet.",
    fullDescription: "Importiamo spezie pregiate direttamente dai produttori mondiali per rifornire la ristorazione stellata e l'industria food.",
    products: ["Zafferano Puro", "Vaniglia Bourbon"], services: ["Analisi di Laboratorio"],
    marketsServed: ["Global"], location: "Napoli, IT", size: "11-50 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AO", cover: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=1000",
    email: "info@aromioriente.it", phone: "+39 081 445566", website: "https://example.com", whatsapp: "+39 333 000004"
  },
  // 3. PACKAGING
  {
    id: "pk-1", name: "EcoPack Solutions", type: "Produttore", sector: "PACKAGING & TABLEWARE",
    shortDescription: "Packaging sostenibile e compostabile per il food delivery.",
    fullDescription: "Innovazione nel packaging alimentare con materiali 100% riciclabili per ridurre l'impatto ambientale del settore take-away.",
    products: ["Vaschette in Polpa", "Posate Bio"], services: ["Branding Personalizzato"],
    marketsServed: ["Italia", "Spagna"], location: "Padova, IT", size: "51-200 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=EP", cover: "https://images.unsplash.com/photo-1605600611284-1956133a8be0?auto=format&fit=crop&q=80&w=1000",
    email: "eco@ecopack.it", phone: "+39 049 778899", website: "https://example.com", whatsapp: "+39 333 000005"
  },
  {
    id: "pk-2", name: "TableArt Exclusive", type: "Produttore", sector: "PACKAGING & TABLEWARE",
    shortDescription: "Tableware di design per la ristorazione di alta gamma.",
    fullDescription: "Produciamo ceramiche e vetrerie artistiche per hotel e ristoranti che cercano un'estetica ricercata sulla tavola.",
    products: ["Piatti in Gres", "Calici Cristallo"], services: ["Design su Richiesta"],
    marketsServed: ["Europa", "USA"], location: "Firenze, IT", size: "11-50 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TA", cover: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1000",
    email: "art@tableart.it", phone: "+39 055 334455", website: "https://example.com", whatsapp: "+39 333 000006"
  },
  // 4. READY TO EAT
  {
    id: "rt-1", name: "Pronto & Buono", type: "Produttore", sector: "PRODOTTI READY TO EAT",
    shortDescription: "Piatti pronti freschi senza conservanti per il retail.",
    fullDescription: "Cuciniamo piatti della tradizione italiana confezionati in atmosfera protetta per la grande distribuzione e i bar.",
    products: ["Lasagne Classiche", "Insalate Quinoa"], services: ["Logistica Refrigerata"],
    marketsServed: ["Italia"], location: "Verona, IT", size: "200+ dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=PB", cover: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000",
    email: "ordini@prontobuono.it", phone: "+39 045 667788", website: "https://example.com", whatsapp: "+39 333 000007"
  },
  {
    id: "rt-2", name: "Chef in Box", type: "Service Provider", sector: "PRODOTTI READY TO EAT",
    shortDescription: "Meal kit e soluzioni gastronomiche per uffici.",
    fullDescription: "Soluzioni innovative per la pausa pranzo aziendale: meal kit bilanciati consegnati quotidianamente.",
    products: ["Office Box", "Fitness Meal"], services: ["Catering Aziendale"],
    marketsServed: ["Milano", "Roma"], location: "Roma, IT", size: "11-50 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=CB", cover: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1000",
    email: "hello@chefinbox.it", phone: "+39 06 112233", website: "https://example.com", whatsapp: "+39 333 000008"
  },
  // 5. SURGELATI
  {
    id: "su-1", name: "GeloElite", type: "Produttore", sector: "PRODOTTI SURGELATI",
    shortDescription: "Prodotti ittici e vegetali surgelati IQF.",
    fullDescription: "Eccellenza nella surgelazione rapida per mantenere intatte le proprietà organolettiche di pesce e verdure.",
    products: ["Filetti di Branzino", "Mix Verdure Bio"], services: ["Private Label"],
    marketsServed: ["Europa"], location: "Ancona, IT", size: "200+ dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=GE", cover: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&q=80&w=1000",
    email: "sales@geloelite.it", phone: "+39 071 889900", website: "https://example.com", whatsapp: "+39 333 000009"
  },
  {
    id: "su-2", name: "Dolci Sottozero", type: "Produttore", sector: "PRODOTTI SURGELATI",
    shortDescription: "Pasticceria surgelata per il canale HoReCa.",
    fullDescription: "Torte, monoporzioni e croissant surgelati pronti per il forno o lo scongelamento, ideali per bar e hotel.",
    products: ["Croissant Francesi", "Torte Artigianali"], services: ["Formazione Staff"],
    marketsServed: ["Italia", "Germania"], location: "Bergamo, IT", size: "51-200 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=DS", cover: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=1000",
    email: "pasticceria@sottozero.it", phone: "+39 035 556677", website: "https://example.com", whatsapp: "+39 333 000010"
  },
  // 6. SERVIZI
  {
    id: "sv-1", name: "Logistica FoodExpress", type: "Service Provider", sector: "SERVIZI E VARIE",
    shortDescription: "Trasporti a temperatura controllata in tutta Europa.",
    fullDescription: "Leader nella catena del freddo con sistemi di monitoraggio real-time della temperatura durante il trasporto.",
    products: ["Servizio Last Mile"], services: ["Stoccaggio Frigo", "Distribuzione"],
    marketsServed: ["Europa"], location: "Parma, IT", size: "200+ dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=LF", cover: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000",
    email: "logistic@foodexpress.it", phone: "+39 0521 990011", website: "https://example.com", whatsapp: "+39 333 000011"
  },
  {
    id: "sv-2", name: "SafeFood Consulting", type: "Service Provider", sector: "SERVIZI E VARIE",
    shortDescription: "Consulenza HACCP e certificazioni alimentari.",
    fullDescription: "Supportiamo le aziende nel percorso di certificazione ISO e BRC, garantendo la conformità alle normative igienico-sanitarie.",
    products: ["Corsi Formazione"], services: ["Audit Qualità", "HACCP Manuals"],
    marketsServed: ["Italia"], location: "Genova, IT", size: "1-10 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=SF", cover: "https://images.unsplash.com/photo-1454165833767-027ffea9e787?auto=format&fit=crop&q=80&w=1000",
    email: "consulting@safefood.it", phone: "+39 010 123456", website: "https://example.com", whatsapp: "+39 333 000012"
  },
  // 7. TECNOLOGIE
  {
    id: "tc-1", name: "TechBake Systems", type: "Produttore", sector: "TECNOLOGIE E ATTREZZATURE",
    shortDescription: "Forni industriali e impastatrici ad alta efficienza.",
    fullDescription: "Progettiamo tecnologie per la panificazione moderna, riducendo i consumi energetici del 30% grazie all'AI.",
    products: ["Forni Rotativi", "Impastatrici"], services: ["Manutenzione Predittiva"],
    marketsServed: ["Global"], location: "Vicenza, IT", size: "51-200 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TB", cover: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000",
    email: "tech@techbake.it", phone: "+39 0444 112233", website: "https://example.com", whatsapp: "+39 333 000013"
  },
  {
    id: "tc-2", name: "Cooling Smart", type: "Produttore", sector: "TECNOLOGIE E ATTREZZATURE",
    shortDescription: "Refrigerazione intelligente e abbattitori rapidi.",
    fullDescription: "Sistemi di refrigerazione connessi per il monitoraggio remoto della conservazione alimentare.",
    products: ["Abbattitori", "Armadi Frigo"], services: ["Monitoraggio IoT"],
    marketsServed: ["Europa", "Medio Oriente"], location: "Bari, IT", size: "51-200 dipendenti",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=CS", cover: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000",
    email: "smart@cooling.it", phone: "+39 080 334455", website: "https://example.com", whatsapp: "+39 333 000014"
  }
];

const App = () => {
  const [view, setView] = useState<'home' | 'listing' | 'profile' | 'add-company'>('home');
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    if (!supabase) {
      setAllCompanies(MOCK_DATA);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setAllCompanies(data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          type: item.tipologia,
          sector: item.settore,
          shortDescription: item.descrizione_breve,
          fullDescription: item.descrizione_completa,
          products: item.prodotti || [],
          services: item.servizi || [],
          marketsServed: item.mercati_serviti || [],
          location: item.localita,
          size: item.dimensione_organico,
          logo: item.logo_url,
          cover: item.cover_url,
          email: item.email,
          phone: item.telefono,
          website: item.sito_web,
          whatsapp: item.whatsapp
        })));
      } else {
        setAllCompanies(MOCK_DATA);
      }
    } catch (err) {
      console.error("Database Error:", err);
      setAllCompanies(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const addNewCompany = async (company: Company) => {
    setLoading(true);
    if (!supabase) {
      setAllCompanies(prev => [company, ...prev]);
      setLoading(false);
      navigateToView('listing');
      return;
    }

    try {
      const { error } = await supabase.from('aziende').insert([{
        nome: company.name,
        tipologia: company.type,
        settore: company.sector,
        descrizione_breve: company.shortDescription,
        descrizione_completa: company.fullDescription,
        prodotti: company.products,
        servizi: company.services,
        mercati_serviti: company.marketsServed,
        localita: company.location,
        dimensione_organico: company.size,
        logo_url: company.logo,
        cover_url: company.cover,
        email: company.email,
        telefono: company.phone,
        sito_web: company.website,
        whatsapp: company.whatsapp
      }]);

      if (error) throw error;
      await fetchCompanies();
      navigateToView('listing');
    } catch (err) {
      console.error("Save Error:", err);
      alert("Errore nel salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(c => {
      const query = searchQuery.toLowerCase();
      const loc = searchLocation.toLowerCase();
      
      const matchesSearch = c.name.toLowerCase().includes(query) || c.shortDescription.toLowerCase().includes(query);
      const matchesLocation = c.location.toLowerCase().includes(loc);
      const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
      
      return matchesSearch && matchesLocation && matchesSector;
    });
  }, [allCompanies, searchQuery, searchLocation, selectedSector]);

  const navigateToProfile = (company: Company) => {
    setSelectedCompany(company);
    setView('profile');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToListing = (query?: string, sector?: string) => {
    if (query !== undefined) setSearchQuery(query);
    if (sector !== undefined) setSelectedSector(sector);
    setView('listing');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToView = (v: 'home' | 'listing' | 'add-company') => {
    setView(v);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && allCompanies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-[100] glass-header">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <button onClick={() => navigateToView('home')} className="flex items-center gap-3">
            <div className="w-9 h-9 sigep-blue rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black italic">B2</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Connect</span>
          </button>
          
          <div className="hidden md:flex gap-10 items-center">
            <button onClick={() => navigateToView('home')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Home</button>
            <button onClick={() => navigateToListing()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Directory</button>
            <button onClick={() => navigateToView('add-company')} className="px-6 py-2.5 sigep-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Iscrivi Azienda</button>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] md:hidden bg-white animate-slideUp flex flex-col pt-24 px-10">
           <button onClick={() => navigateToView('home')} className="text-4xl font-black uppercase italic mb-8 text-left">Home</button>
           <button onClick={() => navigateToListing()} className="text-4xl font-black uppercase italic mb-8 text-left">Directory</button>
           <button onClick={() => navigateToView('add-company')} className="w-full py-6 sigep-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs">Aggiungi Azienda</button>
        </div>
      )}

      <main className="flex-1">
        {view === 'home' && (
          <div className="animate-slideUp">
            {/* HERO */}
            <section className="bg-slate-900 py-32 px-6 text-center text-white relative overflow-hidden">
               <div className="max-w-4xl mx-auto relative z-10">
                  <div className="inline-block bg-sky-500/20 text-sky-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 border border-sky-500/30 shadow-2xl backdrop-blur-sm">Certified Database Access</div>
                  <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-8 leading-[0.9]">Direct <span className="text-sky-400">B2B</span> Hub</h1>
                  <p className="text-xl text-slate-400 mb-12 font-light max-w-2xl mx-auto">La directory professionale per il networking strategico. Fornitori e partner certificati in un unico hub.</p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                     <button onClick={() => navigateToListing()} className="px-12 py-5 sigep-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Trova Fornitori</button>
                     <button onClick={() => navigateToView('add-company')} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Iscrivi Azienda</button>
                  </div>
               </div>
            </section>

            {/* SEZIONE 1: TUTTE LE CATEGORIE (ORA PRIMA) */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                   <div>
                      <span className="text-sky-600 font-black text-[10px] uppercase tracking-widest italic mb-2 block">Directory Sectors</span>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic">Tutte le Categorie</h2>
                   </div>
                   <p className="text-slate-400 text-sm max-w-md italic">Esplora l'intero ecosistema B2B attraverso i nostri cluster specializzati per settore industriale.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CATEGORIES.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => navigateToListing('', cat)} 
                          className="p-8 bg-white rounded-3xl shadow-xl hover:translate-y-[-5px] transition-all text-left border border-slate-100 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:bg-sky-50 transition-colors"></div>
                            <span className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest relative z-10">Sector Cluster</span>
                            <span className="text-sm font-black uppercase leading-tight group-hover:text-sky-600 relative z-10">{cat}</span>
                            <div className="mt-6 text-[10px] font-black text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">Esplora Directory &rarr;</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* SEZIONE 2: AZIENDE PIU' CERCATE (ORA SECONDA) */}
            <section className="py-20 bg-slate-100/50">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-sky-600 font-black text-[10px] uppercase tracking-widest italic mb-2 block">Top Rated</span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">Aziende in evidenza</h2>
                  </div>
                  <button onClick={() => navigateToListing()} className="text-xs font-black uppercase text-slate-400 hover:text-sky-600 transition-colors bg-white px-5 py-2.5 rounded-full border border-slate-200">Vedi tutte &rarr;</button>
                </div>
                
                <div className="flex overflow-x-auto gap-8 pb-8 no-scrollbar -mx-6 px-6 snap-x">
                  {allCompanies.slice(0, 8).map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => navigateToProfile(c)}
                      className="min-w-[320px] bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 group cursor-pointer snap-start flex flex-col hover:shadow-2xl transition-all"
                    >
                      <div className="h-40 overflow-hidden relative">
                        <img src={c.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      </div>
                      <div className="p-8 flex flex-col flex-1">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl p-3 -mt-16 relative z-10 border border-slate-100 mb-4 flex items-center justify-center">
                          <img src={c.logo} className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic mb-2 leading-tight group-hover:text-sky-600 transition-colors">{c.name}</h3>
                        <div className="text-[9px] font-black text-sky-500 uppercase tracking-widest mb-4 italic">{c.sector}</div>
                        <p className="text-xs text-slate-500 line-clamp-2 italic mb-6 leading-relaxed flex-1">"{c.shortDescription}"</p>
                        <div className="flex items-center gap-2 mt-auto text-slate-400">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                           <span className="text-[10px] font-black uppercase tracking-widest">{c.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'listing' && (
           <div className="max-w-7xl mx-auto py-16 px-6 animate-slideUp">
              {/* HEADER LISTING + FILTRI MIGLIORATI */}
              <div className="flex flex-col mb-16">
                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
                    <div className="flex-1">
                       <h2 className="text-4xl font-black uppercase tracking-tighter italic">Directory Aziende</h2>
                       <p className="text-slate-500 text-sm mt-2 italic font-medium">{filteredCompanies.length} partner trovati nel network</p>
                    </div>
                    
                    {/* Console di Ricerca Sdoppiata */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                      <div className="relative group flex-1 sm:min-w-[300px]">
                         <input 
                           type="text" 
                           placeholder="Cerca per Nome o Keyword..." 
                           className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300" 
                           value={searchQuery} 
                           onChange={e => setSearchQuery(e.target.value)} 
                         />
                         <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <div className="relative group flex-1 sm:min-w-[200px]">
                         <input 
                           type="text" 
                           placeholder="Località..." 
                           className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300" 
                           value={searchLocation} 
                           onChange={e => setSearchLocation(e.target.value)} 
                         />
                         <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      </div>
                    </div>
                 </div>

                 {/* Chips Settori con UX migliorata */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Settore Core</span>
                       {(selectedSector !== 'All' || searchQuery || searchLocation) && (
                         <button 
                            onClick={() => { setSearchQuery(''); setSearchLocation(''); setSelectedSector('All'); }} 
                            className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:bg-sky-50 px-3 py-1 rounded-full transition-colors"
                          >
                            Resetta Filtri
                          </button>
                       )}
                    </div>
                    <div className="relative group">
                      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6">
                        <button 
                          onClick={() => setSelectedSector('All')}
                          className={`whitespace-nowrap px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSector === 'All' ? 'sigep-blue text-white border-transparent shadow-xl shadow-blue-200 scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'}`}
                        >
                          Tutti i Settori
                        </button>
                        {CATEGORIES.map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setSelectedSector(cat)}
                            className={`whitespace-nowrap px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSector === cat ? 'sigep-blue text-white border-transparent shadow-xl shadow-blue-200 scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      {/* Gradiente di indicazione scroll su mobile */}
                      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none sm:hidden"></div>
                    </div>
                 </div>
              </div>

              {filteredCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {filteredCompanies.map(c => (
                      <div key={c.id} onClick={() => navigateToProfile(c)} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group cursor-pointer hover:shadow-2xl hover:translate-y-[-8px] transition-all flex flex-col">
                         <div className="h-44 overflow-hidden relative">
                            <img src={c.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                               <span className="text-[9px] font-black text-white uppercase">{c.type}</span>
                            </div>
                         </div>
                         <div className="p-8 relative flex-1 flex flex-col">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl p-3 -mt-16 relative z-10 border border-slate-50 mb-6 group-hover:rotate-3 transition-transform flex items-center justify-center">
                              <img src={c.logo} className="w-full h-full object-contain" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic mb-3 leading-tight tracking-tighter group-hover:text-sky-600 transition-colors">{c.name}</h3>
                            <div className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-4 italic">{c.sector}</div>
                            <p className="text-xs text-slate-500 line-clamp-2 italic mb-8 flex-1 leading-relaxed">"{c.shortDescription}"</p>
                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-auto">
                               <div className="flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{c.location}</span>
                               </div>
                               <span className="text-sky-600 font-black text-[10px] uppercase tracking-widest bg-sky-50 px-4 py-2 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-all">Dossier &rarr;</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white rounded-[3rem] shadow-inner border border-slate-100 border-dashed animate-pulse">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-black uppercase italic text-slate-900 mb-2">Nessun partner trovato</h3>
                  <p className="text-slate-400 text-sm mb-8">Prova a modificare i termini della ricerca o il settore selezionato.</p>
                  <button onClick={() => { setSearchQuery(''); setSearchLocation(''); setSelectedSector('All'); }} className="px-10 py-4 sigep-blue text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Mostra Tutti</button>
                </div>
              )}
           </div>
        )}

        {view === 'profile' && selectedCompany && (
           <div className="animate-slideUp">
              {/* Header Profilo Premium */}
              <div className="h-[500px] relative bg-slate-900 overflow-hidden">
                 <img src={selectedCompany.cover} className="w-full h-full object-cover opacity-50 scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-12 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end gap-10">
                       <div className="w-56 h-56 bg-white rounded-[3rem] p-8 shadow-3xl flex items-center justify-center border border-slate-100">
                         <img src={selectedCompany.logo} className="w-full h-full object-contain" />
                       </div>
                       <div className="flex-1 pb-6">
                          <div className="flex gap-3 mb-6">
                             <span className="bg-sky-500 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-xl">{selectedCompany.type}</span>
                             <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest">{selectedCompany.size}</span>
                          </div>
                          <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{selectedCompany.name}</h1>
                          <div className="flex items-center gap-3 text-slate-300">
                             <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                             <span className="text-xl font-medium italic">{selectedCompany.location}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Contenuto Profilo */}
              <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
                 <div className="lg:col-span-8 space-y-20">
                    <section>
                       <h2 className="text-3xl font-black uppercase italic mb-10 flex items-center gap-4">
                         <div className="w-2.5 h-12 sigep-blue rounded-full"></div>
                         Dossier Aziendale
                       </h2>
                       <p className="text-2xl font-light text-slate-600 italic leading-relaxed">{selectedCompany.fullDescription}</p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <section>
                          <h3 className="text-xl font-black uppercase italic mb-8 text-slate-900 tracking-tight">Prodotti Principali</h3>
                          <div className="flex flex-wrap gap-3">
                             {selectedCompany.products.map(p => (
                                <span key={p} className="px-5 py-3 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-2xl border border-slate-200">{p}</span>
                             ))}
                          </div>
                       </section>
                       <section>
                          <h3 className="text-xl font-black uppercase italic mb-8 text-slate-900 tracking-tight">Servizi Core</h3>
                          <div className="flex flex-wrap gap-3">
                             {selectedCompany.services.map(s => (
                                <span key={s} className="px-5 py-3 bg-sky-50 text-sky-700 text-xs font-bold uppercase rounded-2xl border border-sky-100">{s}</span>
                             ))}
                          </div>
                       </section>
                    </div>

                    <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl">
                       <h3 className="text-xl font-black uppercase italic mb-8 text-slate-900 tracking-tight">Geographic Reach</h3>
                       <div className="flex flex-wrap gap-5">
                          {selectedCompany.marketsServed.map(m => (
                             <div key={m} className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl shadow-sm border border-slate-200">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{m}</span>
                             </div>
                          ))}
                       </div>
                    </section>
                 </div>

                 {/* Sidebar Contatti Professionale */}
                 <div className="lg:col-span-4">
                    <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-3xl text-white sticky top-28 border border-white/5 overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                       <h3 className="text-[11px] font-black text-sky-400 uppercase tracking-widest mb-12 border-b border-white/5 pb-8 italic">Connect Dashboard</h3>
                       
                       <div className="space-y-10 mb-16">
                          <a href={selectedCompany.website} target="_blank" className="flex items-center justify-between group">
                             <span className="text-[11px] font-black text-slate-500 uppercase italic">Sito Web Ufficiale</span>
                             <span className="font-bold text-sm group-hover:text-sky-400 transition-colors">Visita Online &nearr;</span>
                          </a>
                          <div className="flex flex-col gap-2">
                             <span className="text-[11px] font-black text-slate-500 uppercase italic">Linea Diretta</span>
                             <span className="font-bold text-2xl tracking-tight">{selectedCompany.phone}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                             <span className="text-[11px] font-black text-slate-500 uppercase italic">Email Gateway</span>
                             <span className="font-bold text-sm truncate">{selectedCompany.email}</span>
                          </div>
                       </div>

                       <div className="flex flex-col gap-5">
                          <a href={`mailto:${selectedCompany.email}`} className="w-full py-6 sigep-blue rounded-2xl flex items-center justify-center font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Richiedi Preventivo</a>
                          
                          {selectedCompany.whatsapp && (
                             <a href={`https://wa.me/${selectedCompany.whatsapp.replace(/\s+/g, '')}`} target="_blank" className="w-full py-6 bg-green-600/20 text-green-400 border border-green-600/30 rounded-2xl flex items-center justify-center font-black uppercase text-xs tracking-[0.2em] hover:bg-green-600 hover:text-white transition-all">WhatsApp Direct Chat</a>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {view === 'add-company' && (
           <AddCompanyForm onFinish={addNewCompany} onCancel={() => setView('home')} />
        )}
      </main>

      <footer className="bg-slate-950 py-20 px-6 text-center border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sigep-blue rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-black italic">B2</span></div>
              <span className="text-2xl font-black text-white italic uppercase tracking-tighter">Connect Hub</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 italic">Enterprise Network v2.5 • Cloud Native • 2024</p>
            <div className="flex gap-12 text-[10px] font-black uppercase text-slate-600 tracking-widest">
               <a href="#" className="hover:text-white transition-colors">Data Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Network Terms</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

const AddCompanyForm = ({ onFinish, onCancel }: { onFinish: (c: Company) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '', type: 'Produttore', sector: CATEGORIES[0], 
    shortDescription: '', fullDescription: '',
    products: [], services: [], marketsServed: [],
    location: '', size: '1-10 dipendenti', 
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=' + Math.random(), 
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
    email: '', phone: '', website: '', whatsapp: ''
  });

  const [productsStr, setProductsStr] = useState('');
  const [servicesStr, setServicesStr] = useState('');
  const [marketsStr, setMarketsStr] = useState('');

  const inputClass = "w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none mb-6 text-sm font-bold shadow-inner placeholder:text-slate-300";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-3 px-1 uppercase tracking-widest italic";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: Company = {
      ...formData as Company,
      id: Math.random().toString(36).substr(2, 9),
      products: productsStr.split(',').map(s => s.trim()).filter(s => s),
      services: servicesStr.split(',').map(s => s.trim()).filter(s => s),
      marketsServed: marketsStr.split(',').map(s => s.trim()).filter(s => s),
    };
    onFinish(finalData);
  };

  return (
    <div className="max-w-5xl mx-auto py-24 px-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-[4rem] shadow-3xl overflow-hidden border border-slate-100 animate-slideUp">
         <div className="bg-slate-900 p-16 md:p-20 text-white italic relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter relative z-10 leading-none">Onboarding Hub</h2>
            <p className="text-sky-400 text-[11px] font-black uppercase tracking-[0.3em] mt-6 relative z-10">Inserimento Dossier Aziendale</p>
         </div>
         
         <div className="p-12 md:p-20 space-y-20">
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-6 mb-12 italic text-slate-900">1. Corporate Identity</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className={labelClass}>Ragione Sociale</label>
                     <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Es: Food Solutions Italia SpA" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Settore Strategico</label>
                     <select onChange={e => setFormData({...formData, sector: e.target.value})} className={inputClass}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className={labelClass}>Tipologia</label>
                     <select onChange={e => setFormData({...formData, type: e.target.value})} className={inputClass}>
                        <option value="Produttore">Produttore</option>
                        <option value="Distributore">Distributore</option>
                        <option value="Service Provider">Service Provider</option>
                        <option value="Import/Export">Import/Export</option>
                     </select>
                  </div>
                  <div>
                     <label className={labelClass}>Dimensione Team</label>
                     <select onChange={e => setFormData({...formData, size: e.target.value})} className={inputClass}>
                        <option value="1-10 dipendenti">1-10 dipendenti</option>
                        <option value="11-50 dipendenti">11-50 dipendenti</option>
                        <option value="51-200 dipendenti">51-200 dipendenti</option>
                        <option value="200+ dipendenti">200+ dipendenti</option>
                     </select>
                  </div>
               </div>
            </div>

            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-6 mb-12 italic text-slate-900">2. Portfolio & Description</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div>
                     <label className={labelClass}>Elevator Pitch (max 150 car.)</label>
                     <input maxLength={150} type="text" onChange={e => setFormData({...formData, shortDescription: e.target.value})} placeholder="Breve payoff aziendale..." className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Company History & Mission</label>
                     <textarea required onChange={e => setFormData({...formData, fullDescription: e.target.value})} placeholder="Descrizione dettagliata delle competenze..." className={`${inputClass} h-48 resize-none`} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <div>
                     <label className={labelClass}>Prodotti (CSV)</label>
                     <input type="text" value={productsStr} onChange={e => setProductsStr(e.target.value)} placeholder="Prodotto A, Prodotto B..." className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Servizi (CSV)</label>
                     <input type="text" value={servicesStr} onChange={e => setServicesStr(e.target.value)} placeholder="Servizio X, Servizio Y..." className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Mercati (CSV)</label>
                     <input type="text" value={marketsStr} onChange={e => setMarketsStr(e.target.value)} placeholder="Italia, Germania..." className={inputClass} />
                  </div>
               </div>
            </div>

            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-6 mb-12 italic text-slate-900">3. Contact Gateway</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className={labelClass}>Headquarters (Città)</label>
                     <input type="text" onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Es: Milano, IT" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Email Commerciale</label>
                     <input required type="email" onChange={e => setFormData({...formData, email: e.target.value})} placeholder="commerciale@azienda.it" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Telefono</label>
                     <input type="tel" onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+39 02..." className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>WhatsApp Business</label>
                     <input type="tel" onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+39 333..." className={inputClass} />
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 pt-12">
               <button type="button" onClick={onCancel} className="px-12 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Annulla</button>
               <button type="submit" className="flex-1 py-6 bg-green-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all">Pubblica Dossier Certificato</button>
            </div>
         </div>
      </form>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);