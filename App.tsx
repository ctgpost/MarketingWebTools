
import React, { useState, useEffect, useRef } from 'react';
import { MARKETING_STRATEGY, SEO_DETAILS, STRATEGY_TREE, FEATURED_PRODUCTS, Product } from './constants';
import TreeDiagram from './components/TreeDiagram';
import AITipCard from './components/AITipCard';
import { generateSocialCaption, suggestKeywords } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [feedback, setFeedback] = useState({ name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({1: true});
  
  // Dashboard & Audit States
  const [auditUrl, setAuditUrl] = useState('');
  const [isAuditingSite, setIsAuditingSite] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);

  // SEO Tool States
  const [seoAuditInput, setSeoAuditInput] = useState('');
  const [seoAuditResult, setSeoAuditResult] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  
  // Content Lab States
  const [labProduct, setLabProduct] = useState<Product | null>(null);
  const [labCaption, setLabCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // Cart & Checkout State
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', area: 'Dhaka' });
  
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Highlight active nav item based on scroll
          if (entry.target.id) setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);

  const handleFullAudit = () => {
    if (!auditUrl) return;
    setIsAuditingSite(true);
    setTimeout(() => {
      setAuditScore(Math.floor(Math.random() * 30) + 65);
      setIsAuditingSite(false);
    }, 2000);
  };

  const handleSeoAudit = async () => {
    if (!seoAuditInput) return;
    setIsAuditing(true);
    const result = await suggestKeywords(seoAuditInput);
    setSeoAuditResult(result || '');
    setIsAuditing(false);
  };

  const handleGenerateCaption = async (product: Product) => {
    setLabProduct(product);
    setIsGeneratingCaption(true);
    const result = await generateSocialCaption(product.name, product.category);
    setLabCaption(result || '');
    setIsGeneratingCaption(false);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setAddingToCartId(product.id);
    setCartItems(prev => [...prev, product]);
    setTimeout(() => setAddingToCartId(null), 1000);
  };

  const toggleStep = (id: number) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, '')), 0);
    const delivery = shippingInfo.area === 'Dhaka' ? 60 : 120;
    return { subtotal, delivery, total: subtotal + delivery };
  };

  const { subtotal, delivery, total } = calculateTotal();

  // Fix: Added missing 'categories' variable by extracting unique categories from FEATURED_PRODUCTS
  const categories = ['All', ...Array.from(new Set(FEATURED_PRODUCTS.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All' 
    ? FEATURED_PRODUCTS 
    : FEATURED_PRODUCTS.filter(p => p.category === selectedCategory);

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড' },
    { id: 'strategy', label: 'স্ট্রাটেজি' },
    { id: 'seo', label: 'এসইও' },
    { id: 'products', label: 'কালেকশন' },
    { id: 'content-lab', label: 'কন্টেন্ট ল্যাব', highlight: true }
  ];

  return (
    <div className="min-h-screen pb-20 relative bg-[#fffafb]">
      {/* Floating Cart Icon */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button 
          onClick={() => { setIsCheckoutOpen(true); setCheckoutStep(1); }} 
          className="bg-pink-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span className="font-bold text-sm bg-white text-pink-600 px-2 rounded-full min-w-[24px]">{cartItems.length}</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 text-xs font-bold">অর্ডার দেখুন</span>
        </button>
      </div>

      {/* Header & Sticky Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 
            onClick={() => window.scrollTo({top:0, behavior:'smooth'})} 
            className="text-2xl font-black text-pink-600 cursor-pointer tracking-tighter"
          >
            BOUTIQUE<span className="text-gray-800">MARKETER</span>
          </h1>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  item.highlight 
                  ? 'bg-pink-600 text-white hover:bg-pink-700 ml-2' 
                  : activeTab === item.id 
                    ? 'text-pink-600 bg-pink-50' 
                    : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50/50'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />}
             </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-white border-b border-pink-50 overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
          <div className="flex flex-col p-6 gap-2 font-bold text-gray-700">
            {navItems.map(item => (
              <a 
                key={item.id}
                href={`#${item.id}`} 
                onClick={() => setIsMenuOpen(false)}
                className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* Intro Hero Section */}
        <section id="home" className="text-center mb-20 scroll-mt-24">
          <div className="inline-block bg-pink-100 text-pink-600 px-6 py-1.5 rounded-full text-xs font-black mb-6 tracking-widest uppercase">Digital Growth Hub 2024</div>
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
            আপনার বুটিক শপকে <br/>
            <span className="text-pink-600 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400">ব্র্যান্ডে পরিণত করুন</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            মার্কেট লিডার হতে প্রয়োজন সঠিক পরিকল্পনা। আমরা আপনাকে দিচ্ছি ডিজিটাল দোরগোড়ায় পৌঁছানোর পরিপূর্ণ গাইডলাইন এবং AI চালিত টুলস।
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#strategy" className="bg-pink-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-pink-100 hover:scale-105 transition-all">গাইডলাইন শুরু করুন</a>
            <a href="#dashboard" className="bg-white border-2 border-gray-100 text-gray-700 font-black py-4 px-10 rounded-2xl hover:bg-gray-50 transition-all">ইনসাইটস দেখুন</a>
          </div>
        </section>

        {/* Performance Center (Dashboard) */}
        <section id="dashboard" className="mb-24 scroll-mt-24 reveal">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-2 w-16 bg-pink-600 rounded-full"></div>
            <h3 className="text-4xl font-black text-gray-900">পারফরম্যান্স সেন্টার</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Chart Block */}
            <div className="col-span-1 md:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6"><span className="text-xs font-black text-green-500 bg-green-50 px-3 py-1 rounded-full">+১৮.৫% এই সপ্তাহে</span></div>
              <h4 className="font-black text-2xl text-gray-800 mb-10">ভিজিটর ও সেলস ইনসাইটস</h4>
              <div className="flex items-end gap-3 md:gap-6 h-64 mb-6">
                {[35, 75, 55, 95, 65, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer">
                    <div className="h-full bg-gray-50 rounded-2xl relative overflow-hidden">
                      <div 
                        style={{ height: `${h}%` }} 
                        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-pink-600 to-rose-400 rounded-2xl transition-all duration-1000 group-hover:from-pink-800 group-hover:to-pink-600"
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 text-center uppercase tracking-widest">{['S','M','T','W','T','F','S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Audit Tool */}
            <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative group overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-600/20 blur-[60px] rounded-full"></div>
              <div>
                <h4 className="text-2xl font-black mb-4">কুইক শপ অডিট</h4>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed">আপনার পেজ বা সাইটের পারফরম্যান্স চেক করুন এবং উন্নতির উপায় জানুন।</p>
                <div className="space-y-4">
                  <input 
                    type="url" 
                    placeholder="https://yourshop.com" 
                    value={auditUrl} 
                    onChange={e => setAuditUrl(e.target.value)} 
                    className="w-full p-5 bg-white/10 rounded-2xl outline-none border border-white/10 focus:bg-white/15 transition-all text-sm" 
                  />
                  <button 
                    onClick={handleFullAudit} 
                    className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-900/40 active:scale-95"
                  >
                    {isAuditingSite ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        অডিট হচ্ছে...
                      </span>
                    ) : 'অডিট শুরু করুন'}
                  </button>
                </div>
              </div>
              {auditScore && (
                <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 text-center animate-fade-in">
                  <div className="text-5xl font-black text-pink-500 mb-2">{auditScore}%</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Digital Health Score</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <AITipCard />

        {/* Marketing Strategy (Step-by-Step) */}
        <section id="strategy" className="mb-24 scroll-mt-24 reveal">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-2 w-16 bg-pink-600 rounded-full"></div>
            <h3 className="text-4xl font-black text-gray-900">ধাপে ধাপে স্ট্রাটেজি</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {MARKETING_STRATEGY.map((step) => (
              <div 
                key={step.id} 
                onClick={() => toggleStep(step.id)} 
                className={`bg-white p-10 rounded-[3rem] shadow-xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                  expandedSteps[step.id] ? 'border-pink-500 ring-8 ring-pink-50' : 'border-transparent hover:border-pink-100 hover:shadow-2xl'
                }`}
              >
                <div className="flex justify-between items-center mb-8">
                  <div className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] font-black text-2xl transition-all shadow-lg ${
                    expandedSteps[step.id] ? 'bg-pink-600 text-white rotate-6' : 'bg-pink-50 text-pink-600'
                  }`}>0{step.id}</div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    expandedSteps[step.id] ? 'bg-pink-600 text-white rotate-180' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                <h4 className="text-3xl font-black text-gray-800 mb-4">{step.title}</h4>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">{step.description}</p>
                
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${expandedSteps[step.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-8 border-t border-gray-50 mt-4 space-y-6">
                    <h5 className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] mb-4">Implementation Checklist:</h5>
                    <div className="grid grid-cols-1 gap-4">
                      {step.tasks.map((task, idx) => (
                        <div key={idx} className="flex gap-5 items-center bg-gray-50/80 p-5 rounded-3xl border border-gray-100 group/item hover:bg-white hover:border-pink-200 transition-all">
                          <div className="w-8 h-8 rounded-2xl bg-white shadow-sm text-green-500 flex items-center justify-center font-bold text-sm group-hover/item:bg-green-500 group-hover/item:text-white transition-all">✓</div>
                          <span className="text-gray-700 font-bold leading-snug">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Research Center */}
        <section id="seo" className="mb-24 scroll-mt-24 reveal">
          <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-2xl border border-pink-50 flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6"><div className="w-1.5 h-8 bg-pink-600 rounded-full"></div><h3 className="text-4xl font-black text-gray-900 tracking-tight">এসইও রিসার্চ সেন্টার</h3></div>
              <p className="text-gray-500 text-lg mb-12 leading-relaxed">গুগল সার্চে আপনার শপকে সবার উপরে নিয়ে আসতে প্রয়োজনীয় কিওয়ার্ড এবং মেটা ডেটা রিসার্চ করুন সরাসরি AI এর সাহায্যে।</p>
              
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="আপনার পণ্যের নাম বা ক্যাটাগরি লিখুন..." 
                  value={seoAuditInput} 
                  onChange={e => setSeoAuditInput(e.target.value)} 
                  className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none border-2 border-transparent focus:border-pink-500 focus:bg-white transition-all text-lg shadow-inner"
                />
                <button 
                  onClick={handleSeoAudit} 
                  disabled={isAuditing} 
                  className="absolute right-3 top-3 bottom-3 px-10 bg-gray-900 text-white font-black rounded-[1.5rem] hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {isAuditing ? '...' : 'খুঁজুন'}
                </button>
              </div>
              
              {seoAuditResult && (
                <div className="mt-10 p-8 bg-pink-50/50 rounded-[2.5rem] text-gray-800 leading-loose border-2 border-pink-100 animate-fade-in whitespace-pre-wrap font-medium">
                  {seoAuditResult}
                </div>
              )}
            </div>
            
            <div className="lg:w-1/3 space-y-6">
              <h5 className="font-black text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">SEO Pillars</h5>
              {SEO_DETAILS.map((point, i) => (
                <div key={i} className="group p-8 bg-white border-2 border-pink-50 rounded-[2.5rem] hover:border-pink-600 hover:shadow-xl transition-all">
                  <h6 className="font-black text-pink-600 text-xl mb-4 group-hover:scale-105 transition-transform origin-left">{point.category}</h6>
                  <ul className="space-y-3">
                    {point.details.slice(0, 2).map((d, di) => (
                      <li key={di} className="text-sm text-gray-500 flex gap-3 items-start font-medium"><span className="text-pink-300">•</span> {d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Collection */}
        <section id="products" className="mb-24 scroll-mt-24 reveal">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
            <div>
              <div className="flex items-center gap-4 mb-4"><div className="h-2 w-12 bg-pink-600 rounded-full"></div><h3 className="text-4xl font-black text-gray-900">এক্সক্লুসিভ কালেকশন</h3></div>
              <p className="text-gray-500 font-bold">আপনার পছন্দের পোশাকটি বেছে নিন সরাসরি ক্যাটালগ থেকে</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar w-full md:w-auto">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-8 py-3.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap border-2 ${
                    selectedCategory === cat ? 'bg-pink-600 text-white border-pink-600 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-pink-200 hover:text-pink-500'
                  }`}
                >
                  {cat === 'All' ? 'সবগুলো' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                className="group bg-white rounded-[3rem] shadow-xl border border-pink-50 overflow-hidden hover:shadow-[0_20px_60px_-15px_rgba(219,39,119,0.2)] transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 cursor-zoom-in" 
                    onClick={() => setQuickViewProduct(p)} 
                  />
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm font-black px-5 py-2 rounded-2xl text-pink-600 text-sm shadow-xl">{p.price}</div>
                  <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-all duration-500 bg-gradient-to-t from-black/60 to-transparent">
                     <button 
                      onClick={(e) => handleAddToCart(e, p)} 
                      className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-2xl ${
                        addingToCartId === p.id ? 'bg-green-500 text-white' : 'bg-white text-pink-600 hover:bg-pink-600 hover:text-white'
                      }`}
                    >
                      {addingToCartId === p.id ? 'কার্টে যোগ হয়েছে ✓' : 'ব্যাগ-এ যোগ করুন'}
                    </button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-gray-800 text-xl mb-2 group-hover:text-pink-600 transition-colors">{p.name}</h4>
                    <span className="text-[10px] font-black uppercase text-pink-500 tracking-[0.3em] bg-pink-50 px-3 py-1 rounded-full">{p.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Content Lab Functional Hub */}
        <section id="content-lab" className="mb-24 scroll-mt-24 reveal">
          <div className="bg-gray-900 rounded-[4rem] p-12 md:p-24 text-white shadow-[0_40px_100px_-20px_rgba(219,39,119,0.3)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-600/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-20">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-8"><div className="w-1.5 h-10 bg-pink-600 rounded-full"></div><h3 className="text-4xl font-black tracking-tight">AI কন্টেন্ট ল্যাব</h3></div>
                <p className="text-gray-400 text-xl mb-12 leading-relaxed max-w-xl">আপনার সোশ্যাল মিডিয়া পোস্টগুলোকে আকর্ষণীয় করতে AI রাইটার ব্যবহার করুন। একটি ক্লিকেই পান চমৎকার ক্যাপশন এবং হ্যাশট্যাগ।</p>
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 min-h-[300px] shadow-inner relative flex flex-col justify-center">
                  {isGeneratingCaption ? (
                    <div className="flex flex-col items-center justify-center gap-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                      <span className="text-pink-500 font-black animate-pulse uppercase tracking-[0.2em] text-xs">AI ইজ জেনারেটিং...</span>
                    </div>
                  ) : labCaption ? (
                    <div className="animate-fade-in relative group/copy">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(labCaption); alert('কপি হয়েছে!'); }}
                        className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"
                        title="Copy to Clipboard"
                      >
                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      </button>
                      <p className="leading-loose text-lg font-medium text-pink-50/90 whitespace-pre-wrap">{labCaption}</p>
                    </div>
                  ) : (
                    <div className="text-center py-10 opacity-30">
                      <svg className="w-20 h-20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      <p className="font-bold text-lg">ডানদিকের কালেকশন থেকে একটি পণ্য নির্বাচন করুন</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:w-96 bg-white/5 p-8 rounded-[3rem] border border-white/10">
                <h5 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-pink-500 flex items-center gap-3">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                  Quick Selection
                </h5>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                  {FEATURED_PRODUCTS.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => handleGenerateCaption(p)} 
                      className={`w-full p-5 rounded-[2rem] border-2 flex items-center gap-5 transition-all group/btn ${
                        labProduct?.id === p.id 
                        ? 'border-pink-600 bg-white/10' 
                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border border-white/10 group-hover/btn:scale-110 transition-transform">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <h6 className="font-black text-sm truncate">{p.name}</h6>
                        <span className="text-[9px] font-bold text-pink-500/60 uppercase">{p.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tree Diagram Section */}
        <section id="visual" className="mb-24 reveal scroll-mt-24">
           <TreeDiagram data={STRATEGY_TREE} />
        </section>
      </main>

      {/* Modern Checkout Modal */}
      {isCheckoutOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-xl overflow-y-auto" 
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div 
            className="bg-white rounded-[4rem] max-w-3xl w-full relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-pink-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <h2 className="text-3xl font-black mb-1">আপনার ব্যাগ</h2>
                 <p className="text-pink-100 font-bold opacity-80">ধাপ {checkoutStep} / ৪</p>
               </div>
               <button onClick={() => setIsCheckoutOpen(false)} className="bg-white/20 p-4 rounded-3xl hover:bg-white/40 transition-all active:scale-90">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1">
              <div className="flex-1 p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {checkoutStep === 1 && (
                  <div className="animate-fade-in">
                    <h3 className="font-black text-2xl mb-8">আইটেম লিস্ট ({cartItems.length})</h3>
                    {cartItems.length === 0 ? (
                      <div className="text-center py-20 opacity-30 flex flex-col items-center">
                        <svg className="w-24 h-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <p className="font-bold text-xl">ব্যাগটি একদম খালি!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {cartItems.map((item, i) => (
                          <div key={i} className="flex gap-6 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 group transition-all hover:bg-white hover:border-pink-200">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                              <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h4 className="font-black text-lg text-gray-800">{item.name}</h4>
                              <p className="text-pink-600 font-black text-xl">{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {cartItems.length > 0 && (
                      <button 
                        onClick={() => setCheckoutStep(2)} 
                        className="w-full bg-pink-600 text-white font-black py-6 rounded-[2rem] mt-10 shadow-2xl shadow-pink-100 hover:scale-105 transition-all"
                      >
                        ঠিকানা লিখুন →
                      </button>
                    )}
                  </div>
                )}
                
                {checkoutStep === 2 && (
                  <div className="animate-fade-in space-y-6">
                    <h3 className="font-black text-2xl mb-4">শিপিং ডিটেইলস</h3>
                    <div className="grid grid-cols-1 gap-5">
                      <input type="text" placeholder="পুরো নাম" className="w-full p-6 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-pink-50 border-2 border-transparent focus:border-pink-200 transition-all" value={shippingInfo.name} onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})} />
                      <input type="text" placeholder="মোবাইল নম্বর" className="w-full p-6 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-pink-50 border-2 border-transparent focus:border-pink-200 transition-all" value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} />
                      <textarea placeholder="বিস্তারিত ঠিকানা" className="w-full p-6 bg-gray-50 rounded-2xl outline-none resize-none focus:bg-white focus:ring-4 focus:ring-pink-50 border-2 border-transparent focus:border-pink-200 transition-all" rows={4} value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} />
                    </div>
                    <div className="flex gap-4 pt-6">
                      <button onClick={() => setCheckoutStep(1)} className="flex-1 font-black text-gray-400 py-6 rounded-2xl hover:bg-gray-50 transition-all">পিছনে</button>
                      <button 
                        disabled={!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address}
                        onClick={() => setCheckoutStep(3)} 
                        className="flex-[2] bg-pink-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-pink-100 disabled:opacity-50"
                      >পেমেন্ট মেথড →</button>
                    </div>
                  </div>
                )}
                
                {checkoutStep === 3 && (
                  <div className="animate-fade-in space-y-8">
                    <h3 className="font-black text-2xl">পেমেন্ট মেথড</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {['bKash (Bkash)', 'Nagad (Nagad)', 'Cash On Delivery (ক্যাশ অন ডেলিভারি)'].map(m => (
                        <button 
                          key={m} 
                          onClick={() => setPaymentMethod(m)} 
                          className={`p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between font-black text-lg ${
                            paymentMethod === m 
                            ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-xl' 
                            : 'border-gray-50 text-gray-400 bg-gray-50/50 hover:border-pink-200'
                          }`}
                        >
                          <span>{m.split(' (')[0]}</span>
                          <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${paymentMethod === m ? 'border-pink-600' : 'border-gray-200'}`}>
                            {paymentMethod === m && <div className="w-4 h-4 bg-pink-600 rounded-full animate-scale-in"></div>}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-6">
                      <button onClick={() => setCheckoutStep(2)} className="flex-1 font-black text-gray-400 py-6 rounded-2xl hover:bg-gray-50 transition-all">পিছনে</button>
                      <button 
                        disabled={!paymentMethod}
                        onClick={() => setCheckoutStep(4)} 
                        className="flex-[2] bg-pink-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-pink-100 disabled:opacity-50"
                      >অর্ডার কনফার্ম করুন →</button>
                    </div>
                  </div>
                )}
                
                {checkoutStep === 4 && (
                  <div className="text-center py-16 animate-fade-in flex flex-col items-center">
                    <div className="w-32 h-32 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mb-10 text-5xl shadow-2xl shadow-green-100 animate-bounce">✓</div>
                    <h3 className="text-4xl font-black mb-4 tracking-tighter text-gray-900">অর্ডার সফল হয়েছে!</h3>
                    <p className="text-gray-500 font-bold mb-12 max-w-sm">বুটিক মার্কেটারের সাথে থাকার জন্য ধন্যবাদ। শীঘ্রই আমাদের কাস্টমার কেয়ার টিম আপনার সাথে যোগাযোগ করবে।</p>
                    <button 
                      onClick={() => { setIsCheckoutOpen(false); setCartItems([]); setCheckoutStep(1); }} 
                      className="bg-gray-900 text-white font-black py-6 px-16 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >বন্ধ করুন</button>
                  </div>
                )}
              </div>
              
              {checkoutStep < 4 && cartItems.length > 0 && (
                <div className="md:w-80 bg-gray-50/50 p-10 border-l border-gray-100 flex flex-col gap-8">
                  <h4 className="font-black text-xl mb-2">অর্ডার সারাংশ</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between font-bold text-gray-500"><span>সাবটোটাল</span><span>৳{subtotal}</span></div>
                    <div className="flex justify-between font-bold text-gray-500"><span>ডেলিভারি</span><span>৳{delivery}</span></div>
                    <div className="h-px bg-gray-200 my-4"></div>
                    <div className="flex justify-between font-black text-pink-600 text-2xl"><span>সর্বমোট</span><span>৳{total}</span></div>
                  </div>
                  <div className="mt-auto p-5 bg-pink-50 rounded-[2rem] border border-pink-100">
                    <p className="text-xs font-black text-pink-700 leading-relaxed uppercase tracking-widest text-center">Exclusive Discount Applied 🎁</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-32 border-t border-pink-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="reveal">
            <h1 className="text-4xl font-black text-pink-600 mb-8 tracking-tighter">BOUTIQUE<span className="text-gray-800">MARKETER</span></h1>
            <p className="text-gray-500 text-xl max-w-lg leading-relaxed mb-12">আমরা আপনার সাধারণ ব্যবসাকে একটি আধুনিক ডিজিটাল ব্র্যান্ডে রূপান্তর করতে কাজ করি। সঠিক ডাটা এবং ক্রিয়েটিভিটির সমন্বয়ই আমাদের মূল শক্তি।</p>
            <div className="flex gap-6">
              {['Facebook', 'Instagram', 'WhatsApp'].map(s => (
                <button key={s} className="w-14 h-14 bg-gray-50 rounded-[1.5rem] flex items-center justify-center font-black text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-90" title={s}>
                  {s[0]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="reveal">
            <h4 className="text-2xl font-black text-gray-800 mb-8">জরুরি পরামর্শ প্রয়োজন?</h4>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
              <input type="text" placeholder="আপনার নাম" required className="w-full p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-pink-500 focus:bg-white outline-none transition-all" />
              <textarea placeholder="আপনার শপ সম্পর্কে বিস্তারিত বা প্রশ্ন লিখুন..." rows={4} required className="w-full p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-pink-500 focus:bg-white outline-none transition-all resize-none"></textarea>
              <button className="w-full bg-pink-600 text-white font-black py-6 rounded-[2rem] hover:bg-pink-700 transition-all shadow-xl shadow-pink-100">মেসেজ পাঠান →</button>
              {submitted && <p className="text-green-600 font-black text-center animate-bounce">✓ আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!</p>}
            </form>
          </div>
        </div>
        <div className="text-center text-gray-400 font-bold text-sm mt-32 border-t border-gray-50 pt-16">
          <p>© ২০২৪ বুটিক মার্কেটার - আপনার ডিজিটাল সফলতার স্মার্ট সঙ্গী</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
