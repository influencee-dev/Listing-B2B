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

// Interfaccia allineata allo schema DB fornito
interface Company {
  id: string;
  name: string;              // nome
  type: string;              // tipologia
  sector: string;            // settore
  shortDescription: string;   // descrizione_breve
  fullDescription: string;    // descrizione_completa
  products: string[];         // prodotti (TEXT[])
  services: string[];         // servizi (TEXT[])
  marketsServed: string[];    // mercati_serviti (TEXT[])
  location: string;           // localita
  size: string;               // dimensione_organico
  logo: string;               // logo_url
  cover: string;              // cover_url
  email: string;              // email
  phone: string;              // telefono
  website: string;            // sito_web
  whatsapp: string;           // whatsapp
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
  {
    "id": "1",
    "name": "Eccellenza Italiana Arredi",
    "type": "Produttore",
    "sector": "DESIGN CONCEPT, ARREDAMENTI",
    "shortDescription": "Leader nel settore contract per il retail di lusso e hotellerie.",
    "fullDescription": "Progettiamo e realizziamo arredamenti che definiscono l'esperienza d'acquisto moderna. Fondata nel 1985, esportiamo il Made in Italy in oltre 40 paesi con un focus sulla sostenibilità.",
    "products": ["Banconi Food", "Vetrine Refrigerate", "Sedute Ergonomiche"],
    "services": ["Design Consulting", "Installation", "Post-vendita"],
    "marketsServed": ["Europa", "Nord America", "Medio Oriente"],
    "location": "Torino, IT",
    "size": "50-100 dipendenti",
    "logo": "https://api.dicebear.com/7.x/initials/svg?seed=EI",
    "cover": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?auto=format&fit=crop&q=80&w=1000",
    "email": "contact@eccellenza.it",
    "phone": "+39 011 223344",
    "website": "https://example.it",
    "whatsapp": "+39 333 1234567"
  }
];

const App = () => {
  const [view, setView] = useState<'home' | 'listing' | 'profile' | 'add-company'>('home');
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ sector: 'All', type: 'All' });
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
      alert("Database non connesso. Dati salvati localmente (mock).");
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
      alert("Errore nel salvataggio. Verifica i permessi del database.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
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
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Cloud Data...</p>
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
            <section className="bg-slate-900 py-32 px-6 text-center text-white relative overflow-hidden">
               <div className="max-w-4xl mx-auto relative z-10">
                  <div className="inline-block bg-sky-500/20 text-sky-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 border border-sky-500/30 shadow-2xl backdrop-blur-sm">Verified Network Only</div>
                  <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-8 leading-[0.9]">Direct <span className="text-sky-400">B2B</span> Hub</h1>
                  <p className="text-xl text-slate-400 mb-12 font-light max-w-2xl mx-auto">La directory professionale per il networking strategico. Fornitori, produttori e partner certificati in un unico database cloud.</p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                     <button onClick={() => navigateToListing()} className="px-12 py-5 sigep-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Trova Fornitori</button>
                     <button onClick={() => navigateToView('add-company')} className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">Iscrivi la tua Azienda</button>
                  </div>
               </div>
            </section>
            
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                   <div>
                      <span className="text-sky-600 font-black text-[10px] uppercase tracking-widest italic mb-2 block">Sectors</span>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic">Mercati Chiave</h2>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CATEGORIES.slice(0, 4).map(cat => (
                        <button key={cat} onClick={() => navigateToListing('', cat)} className="p-8 bg-white rounded-3xl shadow-xl hover:translate-y-[-5px] transition-all text-left border border-slate-100 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:bg-sky-50 transition-colors"></div>
                            <span className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest relative z-10">Cluster</span>
                            <span className="text-sm font-black uppercase leading-tight group-hover:text-sky-600 relative z-10">{cat}</span>
                            <div className="mt-6 text-[10px] font-black text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">Esplora &rarr;</div>
                        </button>
                    ))}
                </div>
            </section>
          </div>
        )}

        {view === 'listing' && (
           <div className="max-w-7xl mx-auto py-16 px-6 animate-slideUp">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                 <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">Directory Aziende</h2>
                    <p className="text-slate-500 text-sm mt-2 italic font-medium">{filteredCompanies.length} partner trovati nel network</p>
                 </div>
                 <div className="relative w-full md:w-96 group">
                    <input 
                      type="text" 
                      placeholder="Cerca per nome, settore o città..." 
                      className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl text-sm font-bold shadow-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                    />
                    <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {filteredCompanies.map(c => (
                    <div key={c.id} onClick={() => navigateToProfile(c)} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group cursor-pointer hover:shadow-2xl hover:translate-y-[-8px] transition-all flex flex-col">
                       <div className="h-44 overflow-hidden relative">
                          <img src={c.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                          <div className="absolute bottom-4 left-6">
                             <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/30">{c.type}</span>
                          </div>
                       </div>
                       <div className="p-8 relative flex-1 flex flex-col">
                          <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl p-3 -mt-16 relative z-10 border border-slate-50 mb-6 group-hover:rotate-3 transition-transform"><img src={c.logo} className="w-full h-full object-contain" /></div>
                          <h3 className="text-2xl font-black uppercase italic mb-3 leading-tight tracking-tighter group-hover:text-sky-600 transition-colors">{c.name}</h3>
                          <div className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-4 italic">{c.sector}</div>
                          <p className="text-xs text-slate-500 line-clamp-2 italic mb-8 flex-1 leading-relaxed">"{c.shortDescription}"</p>
                          <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
                             <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{c.location}</span>
                             </div>
                             <span className="text-sky-600 font-black text-[10px] uppercase tracking-widest bg-sky-50 px-4 py-2 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-all">Dossier &rarr;</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {view === 'profile' && selectedCompany && (
           <div className="animate-slideUp">
              <div className="h-[450px] relative bg-slate-900 overflow-hidden">
                 <img src={selectedCompany.cover} className="w-full h-full object-cover opacity-50 scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-12 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end gap-10">
                       <div className="w-48 h-48 bg-white rounded-[2.5rem] p-8 shadow-3xl flex items-center justify-center"><img src={selectedCompany.logo} className="w-full h-full object-contain" /></div>
                       <div className="flex-1 pb-4">
                          <div className="flex gap-3 mb-6">
                             <span className="bg-sky-500 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-xl">{selectedCompany.type}</span>
                             <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest">{selectedCompany.size}</span>
                          </div>
                          <h1 className="text-6xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{selectedCompany.name}</h1>
                          <div className="flex items-center gap-3 text-slate-300">
                             <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                             <span className="text-lg font-medium italic">{selectedCompany.location}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
                 <div className="lg:col-span-8 space-y-16">
                    {/* Descrizione */}
                    <section>
                       <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-4"><div className="w-2 h-10 sigep-blue rounded-full"></div>Executive Summary</h2>
                       <p className="text-2xl font-light text-slate-600 italic leading-relaxed">{selectedCompany.fullDescription}</p>
                    </section>

                    {/* Prodotti e Servizi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <section>
                          <h3 className="text-lg font-black uppercase italic mb-6 text-slate-900 tracking-tight">Main Products</h3>
                          <div className="flex flex-wrap gap-2">
                             {selectedCompany.products.map(p => (
                                <span key={p} className="px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-xl border border-slate-200">{p}</span>
                             ))}
                          </div>
                       </section>
                       <section>
                          <h3 className="text-lg font-black uppercase italic mb-6 text-slate-900 tracking-tight">Core Services</h3>
                          <div className="flex flex-wrap gap-2">
                             {selectedCompany.services.map(s => (
                                <span key={s} className="px-4 py-2 bg-sky-50 text-sky-700 text-[10px] font-bold uppercase rounded-xl border border-sky-100">{s}</span>
                             ))}
                          </div>
                       </section>
                    </div>

                    {/* Mercati */}
                    <section className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100">
                       <h3 className="text-lg font-black uppercase italic mb-6 text-slate-900 tracking-tight">Geographic Reach</h3>
                       <div className="flex flex-wrap gap-4">
                          {selectedCompany.marketsServed.map(m => (
                             <div key={m} className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-600">{m}</span>
                             </div>
                          ))}
                       </div>
                    </section>
                 </div>

                 {/* Sidebar Contatti Sticky */}
                 <div className="lg:col-span-4">
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-3xl text-white sticky top-28 border border-white/5 overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                       <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-10 border-b border-white/5 pb-6 italic relative z-10">Connect Dashboard</h3>
                       
                       <div className="space-y-8 mb-12 relative z-10">
                          <a href={selectedCompany.website} target="_blank" className="flex items-center justify-between group">
                             <span className="text-[10px] font-black text-slate-500 uppercase italic">Official Website</span>
                             <span className="font-bold text-sm group-hover:text-sky-400 transition-colors">Visit Site &nearr;</span>
                          </a>
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black text-slate-500 uppercase italic">Primary Contact</span>
                             <span className="font-bold text-lg">{selectedCompany.phone}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black text-slate-500 uppercase italic">Email Gateway</span>
                             <span className="font-bold text-sm truncate">{selectedCompany.email}</span>
                          </div>
                       </div>

                       <div className="flex flex-col gap-4 relative z-10">
                          <a href={`mailto:${selectedCompany.email}`} className="w-full py-5 sigep-blue rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-transform">Invia Email Commerciale</a>
                          
                          {selectedCompany.whatsapp && (
                             <a href={`https://wa.me/${selectedCompany.whatsapp.replace(/\s+/g, '')}`} target="_blank" className="w-full py-5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest hover:bg-green-600 hover:text-white transition-all">WhatsApp Direct Chat</a>
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

      <footer className="bg-slate-950 py-16 px-6 text-center border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sigep-blue rounded-lg flex items-center justify-center shadow-lg"><span className="text-white font-black italic">B2</span></div>
              <span className="text-xl font-black text-white italic uppercase tracking-tighter">Connect Hub</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Enterprise Network Layer v2.0 • 2024</p>
            <div className="flex gap-10 text-[10px] font-black uppercase text-slate-600">
               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

const AddCompanyForm = ({ onFinish, onCancel }: { onFinish: (c: Company) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '', type: 'Azienda', sector: CATEGORIES[0], 
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
    <div className="max-w-5xl mx-auto py-20 px-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] shadow-3xl overflow-hidden border border-slate-100 animate-slideUp">
         <div className="bg-slate-900 p-12 md:p-16 text-white italic relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter relative z-10">Onboarding Hub</h2>
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest mt-4 relative z-10">Iscrizione al Database Certificato</p>
         </div>
         
         <div className="p-12 md:p-20 space-y-12">
            {/* Sezione Base */}
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-4 mb-10 italic">1. Corporate Identity</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className={labelClass}>Ragione Sociale</label>
                     <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Es: Italian Food Solutions SpA" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Settore Strategico</label>
                     <select onChange={e => setFormData({...formData, sector: e.target.value})} className={inputClass}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className={labelClass}>Tipologia Business</label>
                     <select onChange={e => setFormData({...formData, type: e.target.value})} className={inputClass}>
                        <option value="Produttore">Produttore</option>
                        <option value="Distributore">Distributore</option>
                        <option value="Service Provider">Service Provider</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Import/Export">Import/Export</option>
                     </select>
                  </div>
                  <div>
                     <label className={labelClass}>Dimensione Organico</label>
                     <select onChange={e => setFormData({...formData, size: e.target.value})} className={inputClass}>
                        <option value="1-10 dipendenti">1-10 dipendenti</option>
                        <option value="11-50 dipendenti">11-50 dipendenti</option>
                        <option value="51-200 dipendenti">51-200 dipendenti</option>
                        <option value="200+ dipendenti">200+ dipendenti</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Sezione Dettagli */}
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-4 mb-10 italic">2. Portfolio & Strategy</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div>
                     <label className={labelClass}>Slogan / Payoff (max 150 car.)</label>
                     <input maxLength={150} type="text" onChange={e => setFormData({...formData, shortDescription: e.target.value})} placeholder="Una breve frase che descrive il core business" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Presentazione Estesa (Company Bio)</label>
                     <textarea required onChange={e => setFormData({...formData, fullDescription: e.target.value})} placeholder="Descrivi la storia, i valori e la mission dell'azienda..." className={`${inputClass} h-40 resize-none`} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                  <div>
                     <label className={labelClass}>Prodotti (separati da virgola)</label>
                     <input type="text" value={productsStr} onChange={e => setProductsStr(e.target.value)} placeholder="Prodotto A, Prodotto B..." className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Servizi (separati da virgola)</label>
                     <input type="text" value={servicesStr} onChange={e => setServicesStr(e.target.value)} placeholder="Servizio X, Servizio Y..." className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Mercati (separati da virgola)</label>
                     <input type="text" value={marketsStr} onChange={e => setMarketsStr(e.target.value)} placeholder="Italia, Germania, USA..." className={inputClass} />
                  </div>
               </div>
            </div>

            {/* Sezione Contatti */}
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-4 mb-10 italic">3. Contact Gateway</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className={labelClass}>Località (Sede Principale)</label>
                     <input type="text" onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Città, Provincia (IT)" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Email Commerciale</label>
                     <input required type="email" onChange={e => setFormData({...formData, email: e.target.value})} placeholder="commerciale@azienda.it" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Telefono Diretto</label>
                     <input type="tel" onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+39 0XX XXXXXX" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Sito Web (URL)</label>
                     <input type="url" onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://www.azienda.it" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>WhatsApp Business</label>
                     <input type="tel" onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+39 3XX XXXXXXX" className={inputClass} />
                  </div>
               </div>
            </div>

            {/* Media */}
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-100 pb-4 mb-10 italic">4. Visual Assets</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className={labelClass}>URL Logo Aziendale</label>
                     <input type="url" onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://percorso-immagine.png" className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>URL Immagine di Copertina</label>
                     <input type="url" onChange={e => setFormData({...formData, cover: e.target.value})} placeholder="https://percorso-cover.jpg" className={inputClass} />
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 pt-10">
               <button type="button" onClick={onCancel} className="px-10 py-6 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors">Annulla</button>
               <button type="submit" className="flex-1 py-6 bg-green-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-green-700 hover:scale-[1.01] active:scale-[0.98] transition-all">Pubblica Dossier nel Database</button>
            </div>
         </div>
      </form>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);