
import React, { useState } from 'react';
import { generateMarketingTip } from '../services/geminiService';

const AITipCard: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetTip = async () => {
    if (!goal) return;
    setLoading(true);
    const result = await generateMarketingTip(goal);
    setTip(result || '');
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-8 rounded-2xl shadow-2xl text-white mb-10">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5z" />
        </svg>
        AI মার্কেটিং অ্যাসিস্ট্যান্ট
      </h2>
      <p className="mb-6 opacity-90">আপনার ব্যবসার নির্দিষ্ট লক্ষ্য লিখুন (যেমন: "বিক্রয় বাড়ানো" বা "ফেসবুক ফলোয়ার বাড়ানো") এবং AI এর পরামর্শ নিন।</p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="আপনার লক্ষ্য এখানে লিখুন..."
          className="flex-1 p-3 rounded-lg text-gray-800 outline-none focus:ring-4 focus:ring-pink-200"
        />
        <button 
          onClick={handleGetTip}
          disabled={loading}
          className="bg-white text-pink-600 font-bold px-8 py-3 rounded-lg hover:bg-pink-50 transition-all disabled:opacity-50"
        >
          {loading ? 'লোড হচ্ছে...' : 'পরামর্শ নিন'}
        </button>
      </div>

      {tip && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20 animate-fade-in">
          <p className="leading-relaxed">{tip}</p>
        </div>
      )}
    </div>
  );
};

export default AITipCard;
