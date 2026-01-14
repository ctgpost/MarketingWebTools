
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingTip = async (goal: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `একজন ডিজিটাল মার্কেটিং এক্সপার্ট হিসেবে, একটি লেডিস পোশাকের শো-রুমের জন্য "${goal}" অর্জনে একটি ছোট এবং কার্যকর টিপস দিন। উত্তরটি বাংলা ভাষায় দিন।`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "দুঃখিত, এই মুহূর্তে টিপস জেনারেট করা সম্ভব হচ্ছে না।";
  }
};

export const generateSocialCaption = async (productName: string, category: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `একটি লেডিস ফ্যাশন ব্র্যান্ডের জন্য "${productName}" (ক্যাটাগরি: ${category}) পণ্যটির জন্য একটি আকর্ষণীয় ফেসবুক/ইনস্টাগ্রাম ক্যাপশন এবং ৫টি হ্যাশট্যাগ তৈরি করুন। উত্তরটি বাংলা ভাষায় দিন এবং ইমোজি ব্যবহার করুন।`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ক্যাপশন জেনারেট করা সম্ভব হয়নি।";
  }
};

export const suggestKeywords = async (shopDescription: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `আমার লেডিস বুটিক শপের বর্ণনা: "${shopDescription}"। এই শপটির এসইও এর জন্য ১০টি অত্যন্ত কার্যকর কিওয়ার্ড সাজেস্ট করুন যা গুগল সার্চে ভালো ফলাফল দেবে। উত্তরটি বাংলা ভাষায় দিন।`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "কিওয়ার্ড সাজেস্ট করা সম্ভব হয়নি।";
  }
};
