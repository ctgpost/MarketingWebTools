
import React, { useState, useEffect, useRef } from 'react';
import { MARKETING_STRATEGY, SEO_DETAILS, STRATEGY_TREE, FEATURED_PRODUCTS, Product } from './constants';
import TreeDiagram from './components/TreeDiagram';
import AITipCard from './components/AITipCard';
import { generateSocialCaption, suggestKeywords } from './services/geminiService';

const App: React.FC = () => {
  const [feedback, setFeedback] = useState({ name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeSeoTab, setActiveSeoTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({1: true});
  
  // Dashboard & Lab States
  const [auditUrl, setAuditUrl] = useState('');
  const [isAuditingSite, setIsAuditingSite] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);

  const [seoAuditInput, setSeoAuditInput] = useState('');
  const [seoAuditResult, setSeoAuditResult] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  
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
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, observerOptions);
    cardsRef.current.forEach((card) => { if (card) observer.observe(card); });
    return () => observer.disconnect();
  }, [selectedCategory]);

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

  const categories = ['All', ...new Set(FEATURED_PRODUCTS.map(p => p.category))];
  const filteredProducts = selectedCategory === 'All' 
    ? FEATURED_PRODUCTS 
    : FEATURED_PRODUCTS.filter(p => p.category === selectedCategory);

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, '')), 0);
    const delivery = shippingInfo.area === 'Dhaka' ? 60 : 120;
    return { subtotal, delivery, total: subtotal + delivery };
  };

  const { subtotal, delivery, total } = calculateTotal();

  return (
    <div className="min-h-screen pb-20 relative bg-[#fffafb]">
      {/* Floating Cart */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button onClick={() => { setIsCheckoutOpen(true); setCheckoutStep(1); }} className="bg-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span className="font-bold text-sm bg-white text-pink-600 px-2 rounded-full">{cartItems.length}</span>
        </button>
      </div>

      {/* Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="text-2xl font-black text-pink-600 cursor-pointer">BOUTIQUE<span className="text-gray-800">MARKETER</span></h1>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-600">
            <a href="#dashboard" className="hover:text-pink-600 transition">ড্যাশবোর্ড</a>
            <a href="#strategy" className="hover:text-pink-600 transition">স্ট্রাটেজি</a>
            <a href="#seo" className="hover:text-pink-600 transition">এসইও</a>
            <a href="#products" className="hover:text-pink-600 transition">শপ</a>
            <a href="#content-lab" className="bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition">কন্টেন্ট ল্যাব</a>
          </nav>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg></button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white p-6 flex flex-col gap-4 font-bold border-b border-pink-50">
            <a href="#dashboard" onClick={() => setIsMenuOpen(false)}>ড্যাশবোর্ড</a>
            <a href="#strategy" onClick={() => setIsMenuOpen(false)}>মার্কেটিং স্ট্রাটেজি</a>
            <a href="#seo" onClick={() => setIsMenuOpen(false)}>এসইও গাইড</a>
            <a href="#products" onClick={() => setIsMenuOpen(false)}>শপ</a>
            <a href="#content-lab" className="text-pink-600" onClick={() => setIsMenuOpen(false)}>কন্টেন্ট ল্যাব</a>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* Intro */}
        <section className="text-center mb-16">
          <div className="inline-block bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-xs font-black mb-4">DIGITAL GROWTH HUB 2024</div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">আপনার বুটিক শপকে <br/><span className="text-pink-600 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">ব্র্যান্ডে পরিণত করুন</span></h2>
        </section>

        {/* Dashboard Section */}
        <section id="dashboard" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-10"><div className="h-1.5 w-12 bg-pink-500 rounded-full"></div><h3 className="text-3xl font-black">পারফরম্যান্স সেন্টার</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50 flex flex-col">
              <h4 className="font-black text-gray-800 mb-6">সেলস ও ভিজিটর গ্রোথ (Simulated)</h4>
              <div className="flex-1 min-h-[200px] flex items-end gap-2 md:gap-4 pb-4">
                {[40, 65, 50, 85, 70, 95, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-pink-50 rounded-t-xl relative group">
                    <div style={{ height: `${h}%` }} className="bg-pink-500 rounded-t-xl transition-all duration-1000 group-hover:bg-pink-700"></div>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-black text-pink-600">৳{h * 200}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-4"><span>SAT</span><span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span></div>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-rose-500 p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-black mb-2">কুইক শপ অডিট</h4>
                <p className="text-pink-100 text-sm mb-6">আপনার ওয়েবসাইট বা পেজের লিংক দিয়ে অডিট করুন।</p>
                <input type="text" placeholder="https://example.com" value={auditUrl} onChange={e => setAuditUrl(e.target.value)} className="w-full p-4 bg-white/20 rounded-2xl outline-none placeholder:text-pink-200 text-white mb-4 border border-white/20" />
                <button onClick={handleFullAudit} className="w-full bg-white text-pink-600 font-black py-4 rounded-2xl hover:bg-pink-50 transition">{isAuditingSite ? 'চেক হচ্ছে...' : 'অডিট শুরু করুন'}</button>
              </div>
              {auditScore && <div className="mt-8 text-center animate-bounce"><div className="text-4xl font-black">{auditScore}%</div><div className="text-xs font-bold uppercase tracking-widest">স্বাস্থ্য স্কোর</div></div>}
            </div>
          </div>
        </section>

        <AITipCard />

        {/* Strategy Section - Enhanced Expandable Cards */}
        <section id="strategy" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-10"><div className="h-1.5 w-12 bg-pink-500 rounded-full"></div><h3 className="text-3xl font-black">ধাপে ধাপে স্ট্রাটেজি</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MARKETING_STRATEGY.map((step) => (
              <div key={step.id} onClick={() => toggleStep(step.id)} className={`bg-white p-8 rounded-[2.5rem] shadow-xl border-2 transition-all cursor-pointer group ${expandedSteps[step.id] ? 'border-pink-500 bg-white ring-8 ring-pink-50' : 'border-transparent hover:border-pink-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-3xl font-black text-xl ${expandedSteps[step.id] ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600'}`}>0{step.id}</div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${expandedSteps[step.id] ? 'bg-pink-600 text-white rotate-180' : 'bg-gray-50 text-gray-400'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
                <h4 className="text-2xl font-black text-gray-800 mb-2">{step.title}</h4>
                <p className="text-gray-500 mb-4">{step.description}</p>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSteps[step.id] ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-6 border-t border-gray-50 mt-4">
                    <h5 className="text-xs font-black text-pink-600 uppercase tracking-widest mb-6">কি করতে হবে:</h5>
                    <div className="space-y-4">
                      {step.tasks.map((task, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">✓</div>
                          <span className="text-gray-700 font-medium text-sm">{task}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 h-2 bg-gray-100 rounded-full"><div className="h-full bg-pink-600 rounded-full" style={{width: `${Math.floor(Math.random()*40)+60}%`}}></div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEO & Lab Functional Blocks */}
        <section id="seo" className="mb-20 scroll-mt-24">
           <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-pink-50 flex flex-col md:flex-row gap-16">
              <div className="flex-1">
                 <h3 className="text-3xl font-black mb-6">এসইও রিসার্চ সেন্টার</h3>
                 <p className="text-gray-500 mb-8 leading-relaxed">আপনার ব্যবসার নিশ অনুযায়ী কার্যকর কিওয়ার্ড এবং মেটা ট্যাগ জেনারেট করুন সরাসরি AI দিয়ে।</p>
                 <div className="flex gap-4">
                    <input type="text" placeholder="আপনার পণ্যের নাম লিখুন..." value={seoAuditInput} onChange={e => setSeoAuditInput(e.target.value)} className="flex-1 p-5 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-pink-50 border-2 border-transparent focus:border-pink-200 transition-all" />
                    <button onClick={handleSeoAudit} disabled={isAuditing} className="bg-gray-900 text-white px-8 rounded-2xl font-black hover:bg-black transition">{isAuditing ? '...' : 'খুঁজুন'}</button>
                 </div>
                 {seoAuditResult && <div className="mt-8 p-6 bg-pink-50 rounded-2xl text-sm font-medium leading-loose border border-pink-100 animate-fade-in">{seoAuditResult}</div>}
              </div>
              <div className="md:w-1/3 flex flex-col gap-4">
                 {SEO_DETAILS.map((point, i) => (
                   <div key={i} className="p-6 bg-white border-2 border-pink-50 rounded-3xl hover:border-pink-500 transition-all cursor-default">
                      <h5 className="font-black text-pink-600 mb-2">{point.category}</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">{point.details[0]}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Product Catalog - Optimized for Mobile */}
        <section id="products" className="mb-20 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <h3 className="text-3xl font-black">আমাদের কালেকশন</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-pink-600 text-white' : 'bg-white text-gray-400 border border-gray-100 hover:border-pink-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          {/* Mobile Stacked Grid Optimization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <div key={p.id} className="group bg-white rounded-[2.5rem] shadow-xl border border-pink-50/50 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 cursor-zoom-in" onClick={() => setQuickViewProduct(p)} />
                  <div className="absolute top-4 right-4 bg-white/90 font-black px-4 py-1 rounded-xl text-pink-600 text-sm shadow-lg">{p.price}</div>
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <h4 className="font-black text-gray-800 text-lg mb-1 truncate">{p.name}</h4>
                    <span className="text-[10px] font-black uppercase text-pink-500 tracking-widest">{p.category}</span>
                  </div>
                  <button onClick={(e) => handleAddToCart(e, p)} className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${addingToCartId === p.id ? 'bg-green-500 text-white' : 'bg-pink-600 text-white hover:bg-pink-700 shadow-xl shadow-pink-100'}`}>
                    {addingToCartId === p.id ? 'কার্টে আছে ✓' : 'ব্যাগ-এ যোগ করুন'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Content Lab Functional Hub */}
        <section id="content-lab" className="mb-20 scroll-mt-24">
           <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 blur-[100px] rounded-full"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-12">
                 <div className="flex-1">
                    <h3 className="text-3xl font-black mb-4">AI কন্টেন্ট ল্যাব</h3>
                    <p className="text-gray-400 mb-10 leading-relaxed max-w-lg">আপনার সোশ্যাল মিডিয়া মার্কেটিং আরও সহজ করতে আমরা নিয়ে এসেছি AI রাইটার। যেকোনো পণ্যের জন্য অটোমেটিক ক্যাপশন জেনারেট করুন।</p>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 min-h-[200px]">
                       {isGeneratingCaption ? <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div> : labCaption ? <p className="animate-fade-in leading-loose text-sm">{labCaption}</p> : <p className="text-gray-500 italic text-center py-10">ডানদিকের লিস্ট থেকে পণ্য সিলেক্ট করুন</p>}
                    </div>
                 </div>
                 <div className="md:w-80 bg-white/5 p-6 rounded-[2rem] border border-white/10">
                    <h5 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-pink-500">কুইক জেনারেট</h5>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                       {FEATURED_PRODUCTS.map(p => (
                         <button key={p.id} onClick={() => handleGenerateCaption(p)} className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${labProduct?.id === p.id ? 'border-pink-600 bg-white/10' : 'border-white/5 hover:border-white/20'}`}>
                           <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                           <span className="text-xs font-bold truncate text-left">{p.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Checkout Modal (Functional 360) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md overflow-y-auto" onClick={() => setIsCheckoutOpen(false)}>
          <div className="bg-white rounded-[3rem] max-w-2xl w-full relative shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="bg-pink-600 p-8 text-white flex justify-between items-center">
               <h2 className="text-2xl font-black">অর্ডার রিভিউ</h2>
               <button onClick={() => setIsCheckoutOpen(false)} className="bg-white/20 p-2 rounded-xl hover:bg-white/40 transition">×</button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {checkoutStep === 1 && (
                <div className="animate-fade-in">
                  <div className="space-y-4 mb-8">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold">{item.name}</h4>
                          <p className="text-pink-600 font-black">{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="w-full bg-pink-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-pink-100">শিপিং ঠিকানা দিন</button>
                </div>
              )}
              {checkoutStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <input type="text" placeholder="পুরো নাম" className="w-full p-5 bg-gray-50 rounded-2xl outline-none" value={shippingInfo.name} onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})} />
                  <input type="text" placeholder="মোবাইল নম্বর" className="w-full p-5 bg-gray-50 rounded-2xl outline-none" value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} />
                  <textarea placeholder="বিস্তারিত ঠিকানা" className="w-full p-5 bg-gray-50 rounded-2xl outline-none resize-none" rows={3} value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} />
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setCheckoutStep(1)} className="flex-1 font-bold text-gray-400">পিছনে</button>
                    <button onClick={() => setCheckoutStep(3)} className="flex-[2] bg-pink-600 text-white font-black py-5 rounded-[1.5rem]">পেমেন্ট নির্বাচন করুন</button>
                  </div>
                </div>
              )}
              {checkoutStep === 3 && (
                <div className="animate-fade-in space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {['bKash', 'Nagad', 'Cash On Delivery'].map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)} className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-2 font-black ${paymentMethod === m ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-50 text-gray-400'}`}>{m}</button>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[1.5rem]">
                    <div className="flex justify-between font-bold mb-2"><span>আইটেম ({cartItems.length})</span><span>৳{subtotal}</span></div>
                    <div className="flex justify-between font-bold text-pink-600 text-lg border-t border-gray-200 pt-2"><span>সর্বমোট</span><span>৳{total}</span></div>
                  </div>
                  <button onClick={() => setCheckoutStep(4)} className="w-full bg-pink-600 text-white font-black py-5 rounded-[1.5rem]">অর্ডার কনফার্ম করুন</button>
                </div>
              )}
              {checkoutStep === 4 && (
                <div className="text-center py-10 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                  <h3 className="text-2xl font-black mb-2">অর্ডার সফল হয়েছে!</h3>
                  <p className="text-gray-500 mb-8">শীঘ্রই আমাদের রিপ্রেজেন্টেটিভ কল করবেন।</p>
                  <button onClick={() => { setIsCheckoutOpen(false); setCartItems([]); }} className="bg-gray-900 text-white font-black py-4 px-12 rounded-2xl">বন্ধ করুন</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-pink-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-black text-pink-600 mb-6">BOUTIQUE<span className="text-gray-800">MARKETER</span></h1>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">আপনার ফ্যাশন ব্যবসাকে ডিজিটাল বিপ্লবে শামিল করতে আমরা প্রতিশ্রুতিবদ্ধ।</p>
          <div className="flex justify-center gap-6 mb-12">
            {['FB', 'IG', 'YT'].map(s => <div key={s} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-pink-600 cursor-pointer hover:bg-pink-600 hover:text-white transition-all">{s}</div>)}
          </div>
          <p className="text-xs font-bold text-gray-400">© ২০২৪ বুটিক মার্কেটার - আপনার ডিজিটাল সাকসেস পার্টনার</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
