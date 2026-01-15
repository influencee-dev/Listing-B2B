import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE DATABASE SUPABASE ---
// In Vercel, aggiungi queste variabili nelle impostazioni "Environment Variables"
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Types
interface Contact {
  email: string;
  phone: string;
  website: string;
  whatsapp?: string;
}

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
  contact: Contact;
  location: string;
  size: string;
  logo: string;
  cover: string;
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

// Fallback data in caso di database non configurato o vuoto
const MOCK_DATA: Company[] = [
  {
    "id": "1",
    "name": "Eccellenza Italiana Arredi",
    "type": "Produttore",
    "sector": "DESIGN CONCEPT, ARREDAMENTI",
    "shortDescription": "Leader nel settore contract per il retail di lusso.",
    "fullDescription": "Progettiamo e realizziamo arredamenti che definiscono l'esperienza d'acquisto moderna. Fondata nel 1985, esportiamo il Made in Italy in oltre 40 paesi.",
    "products": ["Banconi Food", "Vetrine Refrigerate"],
    "services": ["Design Consulting", "Installation"],
    "marketsServed": ["Global"],
    "contact": { "email": "contact@eccellenza.it", "phone": "+39 011 2233", "website": "https://example.it" },
    "location": "Torino, IT",
    "size": "50-100",
    "logo": "https://api.dicebear.com/7.x/initials/svg?seed=EI",
    "cover": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?auto=format&fit=crop&q=80&w=1000"
  }
];

const App = () => {
  const [view, setView] = useState<'home' | 'listing' | 'profile' | 'add-company'>('home');
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ sector: 'All', type: 'All' });
  const [showSectorsMenu, setShowSectorsMenu] = useState(false);
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
        .order('created_at', { ascending: false });

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
          contact: {
            email: item.email,
            phone: item.telefono,
            website: item.sito_web,
            whatsapp: item.whatsapp
          }
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
    if (!supabase) {
      alert("Database non connesso. I dati andranno persi al refresh.");
      setAllCompanies(prev => [company, ...prev]);
      navigateToProfile(company);
      return;
    }

    setLoading(true);
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
        email: company.contact.email,
        telefono: company.contact.phone,
        sito_web: company.contact.website,
        whatsapp: company.contact.whatsapp
      }]);

      if (error) throw error;
      await fetchCompanies();
      navigateToView('listing');
    } catch (err) {
      console.error("Save Error:", err);
      alert("Errore nel salvataggio. Verifica la configurazione di Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = filters.sector === 'All' || c.sector === filters.sector;
      return matchesSearch && matchesSector;
    });
  }, [allCompanies, searchQuery, filters]);

  const navigateToProfile = (company: Company) => {
    setSelectedCompany(company);
    setView('profile');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToListing = (query?: string, sector?: string) => {
    if (query !== undefined) setSearchQuery(query);
    if (sector !== undefined) setFilters(f => ({ ...f, sector }));
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
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Cloud Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar Professionale */}
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
            <button onClick={() => navigateToView('add-company')} className="px-6 py-2.5 sigep-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Iscriviti</button>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] md:hidden bg-white animate-slideUp flex flex-col pt-24 px-10">
           <button onClick={() => navigateToView('home')} className="text-3xl font-black uppercase italic mb-8">Home</button>
           <button onClick={() => navigateToListing()} className="text-3xl font-black uppercase italic mb-8">Directory</button>
           <button onClick={() => navigateToView('add-company')} className="w-full py-6 sigep-blue text-white rounded-2xl font-black uppercase">Aggiungi Azienda</button>
        </div>
      )}

      <main className="flex-1">
        {view === 'home' && (
          <div className="animate-slideUp">
            <section className="bg-slate-900 py-32 px-6 text-center text-white relative overflow-hidden">
               <div className="max-w-4xl mx-auto relative z-10">
                  <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-8">Direct <span className="text-sky-400">Database</span></h1>
                  <p className="text-xl text-slate-400 mb-12 font-light">Il cloud hub per il networking B2B professionale. Connessioni verificate, dati real-time.</p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                     <button onClick={() => navigateToListing()} className="px-12 py-5 sigep-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Esplora Directory</button>
                     <button onClick={() => navigateToView('add-company')} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Inserisci Azienda</button>
                  </div>
               </div>
            </section>
            
            <section className="py-24 max-w-7xl mx-auto px-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-12 italic border-b pb-4">Settori Core</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {CATEGORIES.slice(0, 4).map(cat => (
                        <button key={cat} onClick={() => navigateToListing('', cat)} className="p-8 bg-white rounded-3xl shadow-xl hover:translate-y-[-5px] transition-all text-left border border-slate-100 group">
                            <span className="block text-[10px] font-black text-sky-500 mb-3 uppercase tracking-widest">Database Cloud</span>
                            <span className="text-sm font-black uppercase leading-tight group-hover:text-sky-600">{cat}</span>
                        </button>
                    ))}
                </div>
            </section>
          </div>
        )}

        {view === 'listing' && (
           <div className="max-w-7xl mx-auto py-16 px-6 animate-slideUp">
              <div className="flex justify-between items-center mb-16">
                 <h2 className="text-3xl font-black uppercase tracking-tighter italic">Directory Cloud</h2>
                 <div className="relative w-72">
                    <input type="text" placeholder="Filtra..." className="w-full px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {filteredCompanies.map(c => (
                    <div key={c.id} onClick={() => navigateToProfile(c)} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 group cursor-pointer hover:translate-y-[-10px] transition-all">
                       <div className="h-48 overflow-hidden"><img src={c.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /></div>
                       <div className="p-8 relative">
                          <div className="w-16 h-16 bg-white rounded-xl shadow-2xl p-2 -mt-16 relative z-10 border border-slate-50 mb-4"><img src={c.logo} className="w-full h-full object-contain" /></div>
                          <h3 className="text-xl font-black uppercase italic mb-2 leading-none group-hover:text-sky-600">{c.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 italic mb-6">"{c.shortDescription}"</p>
                          <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{c.location}</span>
                             <span className="text-sky-600 font-black text-[10px] uppercase">Vedi Scheda &rarr;</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {view === 'profile' && selectedCompany && (
           <div className="animate-slideUp">
              <div className="h-[400px] relative bg-slate-900">
                 <img src={selectedCompany.cover} className="w-full h-full object-cover opacity-60" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-12 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end gap-10">
                       <div className="w-48 h-48 bg-white rounded-[2rem] p-6 shadow-3xl"><img src={selectedCompany.logo} className="w-full h-full object-contain" /></div>
                       <div className="flex-1 pb-4">
                          <span className="bg-sky-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block shadow-lg">{selectedCompany.type}</span>
                          <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedCompany.name}</h1>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
                 <div className="lg:col-span-8">
                    <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4"><div className="w-2 h-10 sigep-blue rounded-full"></div>Dossier</h2>
                    <p className="text-2xl font-light text-slate-600 italic leading-relaxed">{selectedCompany.fullDescription}</p>
                 </div>
                 <div className="lg:col-span-4">
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white sticky top-28 border border-white/5">
                       <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-10 border-b border-white/5 pb-6 italic">Corporate Info</h3>
                       <div className="space-y-6 mb-10">
                          <div><span className="block text-[10px] text-slate-500 font-black uppercase mb-1">HQ</span><span className="font-black text-lg">{selectedCompany.location}</span></div>
                          <div><span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Staff</span><span className="font-black text-lg">{selectedCompany.size}</span></div>
                       </div>
                       <a href={`mailto:${selectedCompany.contact.email}`} className="w-full py-5 sigep-blue rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-xl">Richiedi Contatto</a>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {view === 'add-company' && (
           <AddCompanyForm onFinish={addNewCompany} onCancel={() => setView('home')} />
        )}
      </main>

      <footer className="bg-slate-950 py-16 px-6 text-center">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sigep-blue rounded-lg flex items-center justify-center shadow-lg"><span className="text-white font-black italic">B2</span></div>
              <span className="text-xl font-black text-white italic uppercase">Connect Hub</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Cloud Database access Layer v1.0</p>
            <div className="flex gap-10 text-[10px] font-black uppercase text-slate-700">
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
    name: '', type: 'Azienda', sector: CATEGORIES[0], shortDescription: '', fullDescription: '',
    products: [], services: [], marketsServed: [],
    contact: { email: '', phone: '', website: '' },
    location: '', size: '', logo: '', cover: ''
  });

  const inputClass = "w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none mb-6 text-sm font-bold shadow-inner";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-3 px-1 uppercase tracking-widest italic";

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-100 animate-slideUp">
         <div className="bg-slate-900 p-12 text-white italic">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Onboarding Hub</h2>
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest mt-2">Dossier Aziendale Cloud</p>
         </div>
         <div className="p-12 md:p-20">
            <label className={labelClass}>Ragione Sociale</label>
            <input type="text" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome Azienda" className={inputClass} />
            <label className={labelClass}>Settore Strategico</label>
            <select onChange={e => setFormData({...formData, sector: e.target.value})} className={inputClass}>
               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className={labelClass}>Email Commerciale</label>
            <input type="email" onChange={e => setFormData({...formData, contact: {...formData.contact!, email: e.target.value}})} className={inputClass} />
            <label className={labelClass}>Presentazione (Executive Summary)</label>
            <textarea onChange={e => setFormData({...formData, fullDescription: e.target.value})} className={`${inputClass} h-48 resize-none`} />
            
            <div className="flex gap-4 mt-12">
               <button onClick={onCancel} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Annulla</button>
               <button onClick={() => onFinish(formData as Company)} className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-2xl hover:bg-green-700 transition-all">Pubblica nel Database</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);