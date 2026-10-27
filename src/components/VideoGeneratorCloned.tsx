import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Play,
  RefreshCw,
  Download,
  Check,
  X,
  Plus,
  Clapperboard,
  Film,
  Percent,
  ShoppingBag,
  Upload,
  Music,
  Copy,
} from 'lucide-react';
import { Product, CampaignToVideoData, RenderedVideoCampaign } from '../types/index.js';
import {
  MusicGenre,
  preRenderFullCommercialAudio,
} from '../utils/commercialAudioEngine.js';

export interface VideoGeneratorProps {
  productsList?: Product[];
  onTakeForSelling?: (product: Product) => void;
  sharedCampaignData?: CampaignToVideoData | null;
  selectedProduct?: Product | null;
  onSelectProduct?: (product: Product) => void;
  onOpenCatalog?: () => void;
  lang?: 'bn' | 'en';
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  productsList = [],
  onTakeForSelling,
  sharedCampaignData,
  selectedProduct: propSelectedProduct,
  onSelectProduct,
  onOpenCatalog,
  lang: propLang = 'bn',
  showToast: propShowToast,
}) => {
  const [internalToast, setInternalToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (propShowToast) {
      propShowToast(msg, type);
    } else {
      setInternalToast({ msg, type });
      setTimeout(() => setInternalToast(null), 3000);
    }
  }, [propShowToast]);

  const lang = propLang;

  // Selected Catalog Product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Branding & Logo
  const [brandName, setBrandName] = useState<string>('TawZoon');
  const [brandTagline, setBrandTagline] = useState<string>('STYLE FOR EVERY YOU');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Product Data
  const [productTitle, setProductTitle] = useState<string>("প্রোডাক্টের নাম লিখুন");
  const [sellingPrice, setSellingPrice] = useState<number>(23000);
  const [regularPrice, setRegularPrice] = useState<number>(28750);

  // Special Offer Banner
  const [enableSpecialOffer, setEnableSpecialOffer] = useState<boolean>(true);
  const [specialOfferText, setSpecialOfferText] = useState<string>('স্পেশাল অফার');

  // Color Variant Images (Dominant 70%–80% display)
  const [variantImages, setVariantImages] = useState<string[]>([]);

  // Video Aspect Ratio Format ('9:16' Reels | '4:5' FB Portrait)
  const [videoAspectRatio, setVideoAspectRatio] = useState<'9:16' | '4:5'>('9:16');

  useEffect(() => {
    if (sharedCampaignData) {
      const images: string[] = [];

      if (sharedCampaignData.generatedPosterUrls && sharedCampaignData.generatedPosterUrls.length > 0) {
        sharedCampaignData.generatedPosterUrls.forEach((url) => {
          if (url && !images.includes(url)) images.push(url);
        });
      } else if (sharedCampaignData.posterUrl) {
        images.push(sharedCampaignData.posterUrl);
      } else if (sharedCampaignData.allImages && sharedCampaignData.allImages.length > 0) {
        sharedCampaignData.allImages.forEach((img) => {
          if (img && !images.includes(img)) images.push(img);
        });
      }

      if (images.length > 0) {
        setVariantImages(images);
      }

      if (sharedCampaignData.aspectRatio) setVideoAspectRatio(sharedCampaignData.aspectRatio === '4:5' ? '4:5' : '9:16');
      if (sharedCampaignData.productTitle) setProductTitle(sharedCampaignData.productTitle);
      if (sharedCampaignData.sellingPrice) setSellingPrice(sharedCampaignData.sellingPrice);
      if (sharedCampaignData.regularPrice) setRegularPrice(sharedCampaignData.regularPrice);
      if (sharedCampaignData.brandName) setBrandName(sharedCampaignData.brandName);
      if (sharedCampaignData.brandTagline) setBrandTagline(sharedCampaignData.brandTagline);
      if (sharedCampaignData.customLogoUrl !== undefined) setCustomLogoUrl(sharedCampaignData.customLogoUrl);
      if (sharedCampaignData.offerTitle) setSpecialOfferText(sharedCampaignData.offerTitle);
    }
  }, [sharedCampaignData]);

  const secondsPerImage = 2.0;

  // Audio Engine States
  const [musicGenre, setMusicGenre] = useState<MusicGenre>('upbeat_pop');
  const [musicVolume, setMusicVolume] = useState<number>(0.7);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [sfxVolume, setSfxVolume] = useState<number>(0.6);
  const [customAudioBuffer, setCustomAudioBuffer] = useState<AudioBuffer | null>(null);
  const [customAudioFileName, setCustomAudioFileName] = useState<string>('');

  // Playback & Active Variant selection
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // Video Generation / Export States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<RenderedVideoCampaign | null>(null);

  // Canvas & Audio Refs
  const loadedImagesCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // AI Social Media Copywriter States
  const [aiSocialCopy, setAiSocialCopy] = useState<{
    catchyHeadline: string;
    shortHook: string;
    description: string;
    reelsCaption: string;
    hashtags: string[];
    fullPostCopy: string;
  } | null>(null);
  const [isGeneratingAiCopy, setIsGeneratingAiCopy] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (text: string, sectionKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    showToast(lang === 'bn' ? 'ক্লিপবোর্ডে কপি হয়েছে! পেস্ট করুন 📋' : 'Copied to clipboard! 📋');
    setTimeout(() => {
      setCopiedSection((prev) => (prev === sectionKey ? null : prev));
    }, 2500);
  };

  const generateAiCopy = useCallback(async () => {
    setIsGeneratingAiCopy(true);
    try {
      const res = await fetch('/api/reseller/generate-social-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          sellingPrice,
          regularPrice,
          brandName,
          brandTagline,
          specialOfferText: enableSpecialOffer ? specialOfferText : '',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiSocialCopy(json.data);
      }
    } catch (err) {
      console.warn('AI Copy generation error:', err);
    } finally {
      setIsGeneratingAiCopy(false);
    }
  }, [productTitle, sellingPrice, regularPrice, brandName, brandTagline, enableSpecialOffer, specialOfferText]);

  useEffect(() => {
    const disc = regularPrice > sellingPrice ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100) : 0;
    const cleanBrand = (brandName || 'TawZoon').trim();
    const pageTag = '#' + cleanBrand.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '');

    const headline = `🔥 ${enableSpecialOffer ? specialOfferText : 'ধামাকা অফার'}! প্রিমিয়াম ${productTitle} এখন সেরা অফার মূল্যে!`;
    const fullPost =
`${headline}
✨ ${cleanBrand} - ${brandTagline || 'STYLE FOR EVERY YOU'}

স্টাইল আর আভিজাত্যের সেরা কম্বিনেশন! আপনার প্রতিদিনের ফ্যাশনে নিয়ে আসুন স্মার্ট ও প্রিমিয়াম লুক।

🛍️ প্রোডাক্টের নাম: ${productTitle}
📏 উপলব্ধ সাইজ: M (38), L (40), XL (42), XXL (44)
🧵 ফেব্রিক ও কোয়ালিটি: ১০০% প্রিমিয়াম আরামদায়ক এক্সপোর্ট ফেব্রিক ও নিখুঁত স্টিচিং
🎨 কালার ভ্যারিয়েন্ট: ভিডিওতে প্রদর্শিত সকল আকর্ষণীয় কালার কালেকশন

💰 স্পেশাল অফার মূল্য: মাত্র ৳${sellingPrice.toLocaleString()}/- ${regularPrice > sellingPrice ? `(পূর্বের মূল্য: ৳${regularPrice.toLocaleString()}/-)` : ''}
${disc > 0 ? `🏷️ বিশেষ ডিসকাউন্ট: ${disc}% ছাড়!\n` : ''}
⭐ প্রিমিয়াম বৈশিষ্ট্যসমূহ:
✔️ ১০০% প্রিমিয়াম কোয়ালিটি ও বডি কমফোর্ট ফেব্রিক
✔️ দীর্ঘস্থায়ী কালার ও নিখুঁত ফিনিশিং গ্যারান্টি
✔️ আধুনিক ও আকর্ষণীয় ট্রেন্ডি স্মার্ট ডিজাইন
✔️ ক্যাজুয়াল, অফিস কিংবা পার্টিতে ব্যবহারের জন্য পারফেক্ট

🚚 ডেলিভারি ও পেমেন্ট সুবিধা:
✔️ সারা দেশে দ্রুততম সময়ে ক্যাশ অন হোম ডেলিভারি
✔️ পার্সেল খুলে চেক করে টাকা পরিশোধের পূর্ণ নিশ্চয়তা

🛒 অর্ডার করার সহজ নিয়ম:
ইনবক্সে আপনার নাম, পূর্ণ ঠিকানা, মোবাইল নাম্বার এবং পছন্দের সাইজ ও কালার লিখে পাঠিয়ে দিন অথবা সরাসরি মেসেজ দিন! 📩

${pageTag} #TawZoon #OnlineShoppingBD #TrendingFashion #PremiumQuality #SpecialOffer #CashOnDeliveryBD #ViralReels`;

    const defaultData = {
      catchyHeadline: headline,
      shortHook: `স্টাইল আর প্রিমিয়াম কমফোর্টের এক অনন্য মিশ্রণ! আপনার পছন্দের কালারে আজই সংগ্রহ করুন।`,
      description: fullPost,
      reelsCaption: `🔥 সেরা অফারে প্রিমিয়াম ${productTitle}! এখনই অর্ডার করতে ইনবক্স করুন। 🛍️✨`,
      hashtags: [
        pageTag,
        '#TawZoon',
        '#TrendingFashion',
        '#OnlineShoppingBD',
        '#PremiumQuality',
        '#SpecialOffer',
        '#CashOnDeliveryBD',
        '#ViralReels',
      ],
      fullPostCopy: fullPost,
    };

    setAiSocialCopy(defaultData);
  }, [productTitle, sellingPrice, regularPrice, brandName, brandTagline, enableSpecialOffer, specialOfferText]);

  const handleSelectCatalogProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductTitle(lang === 'bn' ? (product.nameBn || product.nameEn) : (product.nameEn || product.nameBn));
    setSellingPrice(product.sellingPrice);
    setRegularPrice(product.regularPrice || Math.round(product.sellingPrice * 1.25));

    const images: string[] = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.url && !images.includes(img.url)) images.push(img.url);
      });
    }

    if (images.length > 0) {
      setVariantImages(images);
      setActiveVariantIndex(0);
    }

    setIsCatalogModalOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  useEffect(() => {
    if (propSelectedProduct) {
      handleSelectCatalogProduct(propSelectedProduct);
    }
  }, [propSelectedProduct]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newImages: string[] = [];
      let count = 0;

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
          }
          count++;
          if (count === fileArray.length) {
            setVariantImages((prev) => [...prev, ...newImages]);
            showToast(`${fileArray.length}টি ভ্যারিয়েন্ট ছবি যুক্ত হয়েছে!`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeVariantImage = (index: number) => {
    if (variantImages.length <= 1) {
      showToast('কমপক্ষে একটি ছবি থাকতে হবে', 'error');
      return;
    }
    setVariantImages((prev) => prev.filter((_, i) => i !== index));
    if (activeVariantIndex >= variantImages.length - 1) {
      setActiveVariantIndex(0);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {internalToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white font-medium shadow-2xl flex items-center gap-2 ${internalToast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <Check className="w-5 h-5" />
          <span>{internalToast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-emerald-500/30">
            <Clapperboard className="w-3.5 h-3.5" /> 1080p Full HD Commercial Video Studio
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            কমার্শিয়াল রিলস ও ভিডিও জেনারেটর 🎬
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base max-w-2xl">
            প্রোডাক্টের এইচডি ছবি, অফার প্রাইজ, সাউন্ড ইফেক্টস এবং ব্যাকগ্রাউন্ড মিউজিক সহ প্রফেশনাল ১০৮০p ফেসলেস শপিং ভিডিও জেনারেট করুন এক ক্লিকে!
          </p>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Controls & Customization */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" /> ১. প্রোডাক্ট ও ব্র্যান্ডিং তথ্য
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">প্রোডাক্ট টাইটেল</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ব্র্যান্ড / পেজের নাম</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">বিক্রি মূল্য (৳)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">পূর্বের মূল্য (৳)</label>
                <input
                  type="number"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Film className="w-5 h-5 text-emerald-600" /> ২. কালার ও ভ্যারিয়েন্ট ছবিসমূহ
            </h3>

            <div className="flex flex-wrap gap-3 items-center">
              {variantImages.map((img, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                  <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeVariantImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-600 cursor-pointer transition-colors">
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">ছবি যুক্ত</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-600" /> ৩. ব্যাকগ্রাউন্ড মিউজিক ও সাউন্ড ইফেক্ট
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'upbeat_pop', label: 'Upbeat Commercial Pop 🎵' },
                { key: 'luxury_chill', label: 'Luxury Lounge Chill 🛋️' },
                { key: 'viral_reels', label: 'Viral Reels Trap Beat ⚡' },
                { key: 'soft_acoustic', label: 'Soft Lo-Fi Acoustic 🎸' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMusicGenre(m.key as MusicGenre)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-center transition-all ${musicGenre === m.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Studio Live Preview & AI Post Copy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
              <span>লাইভ ভিডিও প্রিভিউ 📱</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">1080p FHD</span>
            </h3>

            <div className="aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center border-4 border-slate-800">
              {variantImages.length > 0 ? (
                <img src={variantImages[activeVariantIndex]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 text-center p-6 text-sm">
                  কোনো ছবি লোড করা হয়নি
                </div>
              )}

              {/* Title & Price Overlay Preview */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 text-white space-y-2">
                <div className="inline-block px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow">
                  ⚡ {specialOfferText}
                </div>
                <h4 className="text-xl font-extrabold text-white leading-tight">{productTitle}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-emerald-400">৳{sellingPrice.toLocaleString()}</span>
                  {regularPrice > sellingPrice && (
                    <span className="text-sm line-through text-slate-400">৳{regularPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Copywriter Output */}
          {aiSocialCopy && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">এআই ক্যাপশন ও হ্যাশট্যাগ 📝</h4>
                <button
                  onClick={() => handleCopyText(aiSocialCopy.fullPostCopy, 'fullPost')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedSection === 'fullPost' ? 'কপি হয়েছে!' : 'সম্পূর্ণ পোস্ট কপি'}
                </button>
              </div>

              <textarea
                readOnly
                value={aiSocialCopy.fullPostCopy}
                className="w-full h-44 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-700 leading-relaxed resize-none focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
