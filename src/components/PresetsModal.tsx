import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Radio,
  HeartPulse,
  Film,
  ShoppingBag,
  Flame,
  Globe,
} from 'lucide-react';
import { GeminiVoice, SupportedLanguage } from '../types';

export interface PresetItem {
  id: string;
  title: string;
  category: string;
  language: SupportedLanguage;
  icon: React.ElementType;
  recommendedVoice: GeminiVoice;
  style: string;
  text: string;
}

export const SCRIPT_PRESETS: PresetItem[] = [
  // --- ENGLISH PRESETS ---
  {
    id: 'en-audiobook-scifi',
    title: 'Sci-Fi Space Odyssey',
    category: 'Audiobook & Fiction',
    language: 'en',
    icon: Film,
    recommendedVoice: 'Charon',
    style: 'Deep cinematic narrator with epic gravitas and slow theatrical pacing',
    text: 'Beyond the Orion Nebula, the derelict ship drifted in absolute silence. <breath> For three centuries, its automated beacons pulsed like a forgotten heartbeat in the void. Captain Vance stepped onto the bridge, his breath catching in his throat. <gasp> "It is not empty," he whispered. |yeah| Something ancient was waiting.',
  },
  {
    id: 'en-podcast-teaser',
    title: 'Daily Tech Podcast Intro',
    category: 'Podcast & Media',
    language: 'en',
    icon: Radio,
    recommendedVoice: 'Puck',
    style: 'Upbeat, charismatic tech podcast host with infectious enthusiasm',
    text: 'Welcome back to Future Bytes! |yeah| Today, we are breaking down the biggest breakthrough in synthetic intelligence. <laugh> You thought language models were impressive? Wait until you hear what engineers just pulled off in quantum neural synthesis! Let’s get right into it.',
  },
  {
    id: 'en-mindfulness-calm',
    title: 'Mindful Evening Decompression',
    category: 'Wellness & Sleep',
    language: 'en',
    icon: HeartPulse,
    recommendedVoice: 'Zephyr',
    style: 'Soft, gentle, peaceful meditation guide with soothing pauses',
    text: 'Close your eyes. Let your shoulders soften away from your ears. <breath> Take a slow, deep breath in through your nose... and gently release it completely. Whatever happened today, you are safe right now. Allow this stillness to wash over you like calm ocean water.',
  },
  {
    id: 'en-news-anchor',
    title: 'Global Breaking News Bulletin',
    category: 'Broadcasting',
    language: 'en',
    icon: Sparkles,
    recommendedVoice: 'Kore',
    style: 'Authoritative, crisp, professional news anchor with polished cadence',
    text: 'Good evening. Our top story tonight: international climate summits in Geneva have reached a landmark accord on clean hydrogen corridors. Diplomatic envoys announced that three dozen nations ratified the treaty this morning, marking the fastest legislative turnaround in council history.',
  },
  {
    id: 'en-product-ad',
    title: 'High-Converting Product Launch',
    category: 'Commercial & Marketing',
    language: 'en',
    icon: ShoppingBag,
    recommendedVoice: 'Puck',
    style: 'Dynamic, persuasive commercial voiceover with crisp delivery',
    text: 'Tired of clunky workflows slowing down your creative flow? Meet Aura Studio. It turns your ideas into production-ready sound in seconds. No complex hardware. No tedious retakes. Just pure inspiration. Try Aura today and hear the difference for yourself.',
  },

  // --- HINDI (हिन्दी) PRESETS ---
  {
    id: 'hi-news-bulletin',
    title: 'समाचार बुलेटिन (Hindi News)',
    category: 'Broadcasting (समाचार)',
    language: 'hi',
    icon: Sparkles,
    recommendedVoice: 'Kore',
    style: 'Crisp, articulate Hindi news anchor with polished clear pronunciation',
    text: 'नमस्कार! आज के मुख्य समाचारों में, विज्ञान एवं प्रौद्योगिकी मंत्रालय ने स्वच्छ सौर ऊर्जा और हरित हाइड्रोजन के क्षेत्र में एक नए राष्ट्रीय मिशन की शुरुआत की है। <breath> अधिकारियों के अनुसार, इस परियोजना से देश भर के लाखों घरों को निर्बाध और पर्यावरण-अनुकूल ऊर्जा मिलेगी।',
  },
  {
    id: 'hi-meditation-peace',
    title: 'ध्यान और आत्म-शांति (Hindi Meditation)',
    category: 'Wellness & Calm (शांति)',
    language: 'hi',
    icon: HeartPulse,
    recommendedVoice: 'Zephyr',
    style: 'Soft, serene, gentle Hindi meditation guide with deep calming breaths',
    text: 'अपनी आँखें धीरे से बंद करें और आरामदायक मुद्रा में बैठें। <breath> एक गहरी और शांत सांस अंदर खींचें... और धीरे-धीरे सारा तनाव बाहर छोड़ दें। आज की चिंताओं को अलविदा कहें। आप इस शांत क्षण में पूरी तरह सुरक्षित और प्रसन्न हैं।',
  },
  {
    id: 'hi-story-kahani',
    title: 'रहस्यमयी मंदिर की कथा (Hindi Story)',
    category: 'Storytelling (कहानियां)',
    language: 'hi',
    icon: BookOpen,
    recommendedVoice: 'Charon',
    style: 'Deep theatrical Hindi storyteller with suspenseful dramatic pauses',
    text: 'रात का सन्नाटा गहरा हो चुका था और दूर घने जंगलों में सिर्फ हवा की सरसराहट सुनाई दे रही थी। <breath> विक्रम ने जैसे ही प्राचीन गुफा के विशाल शिलाखंड को स्पर्श किया... <gasp> चारों तरफ नीली रोशनी फैल गई! |mhm| सदियों से छुपा रहस्य आखिरकार उजागर हो गया था।',
  },
  {
    id: 'hi-festive-ad',
    title: 'त्योहार स्पेशल विज्ञापन (Festive Commercial)',
    category: 'Commercial (विज्ञापन)',
    language: 'hi',
    icon: ShoppingBag,
    recommendedVoice: 'Kore',
    style: 'Joyful, bright, celebratory festive Hindi advertisement voiceover',
    text: 'इस पावन त्योहार पर, अपने परिवार और प्रियजनों के लिए लाएं खुशियों की सौगात! <breath> हमारे सभी प्रीमियम उत्पादों पर पाइए 50% तक की भारी छूट। सीमित समय का यह विशेष अवसर हाथ से न जाने दें। आज ही नजदीकी स्टोर पर पधारें!',
  },
  {
    id: 'hi-motivational',
    title: 'जोशीला प्रेरणादायक संदेश (Hindi Motivation)',
    category: 'Inspiration (प्रेरणा)',
    language: 'hi',
    icon: Flame,
    recommendedVoice: 'Fenrir',
    style: 'Powerful, confident, resonant Hindi motivational speaker',
    text: 'हर बड़ी सफलता की शुरुआत एक छोटे से कदम से होती है। <breath> जब रास्ते कठिन लगने लगें, तब याद रखें कि हीरा भी अत्यधिक दबाव के बाद ही चमकता है। |yeah| अपने सामर्थ्य पर विश्वास कीजिए और अपने लक्ष्य की ओर निरंतर बढ़ते रहिए!',
  },

  // --- HINGLISH PRESETS ---
  {
    id: 'hinglish-podcast-tech',
    title: 'टेक वार्तालाप (Hinglish Tech Podcast)',
    category: 'Urban Podcast',
    language: 'hinglish',
    icon: Radio,
    recommendedVoice: 'Puck',
    style: 'Conversational urban Hinglish tech host with high energy and casual slang',
    text: 'Hey everyone, welcome back to Tech Bytes! |yeah| Aaj hum discuss karne wale hain synthetic AI audio ke baare mein. <laugh> Trust me guys, ab computer audio aur real human voice mein fark batana almost impossible ho chuka hai! Let’s dive straight into it.',
  },
  {
    id: 'hinglish-travel-vlog',
    title: 'ट्रैवल व्लॉग वॉइसओवर (Hinglish Travel Vlog)',
    category: 'Vlog & Creator',
    language: 'hinglish',
    icon: Film,
    recommendedVoice: 'Kore',
    style: 'Breezy, friendly, engaging Hinglish travel storytelling',
    text: 'Subah ke cheh baje the aur pahadon par halki dhundh chhai hui thi. <breath> Itni shanti maine shehar mein kabhi feel nahi ki thi. Chai ki ek chuski ke saath, jab samne sunrise dekha, <laugh> tab laga ki haan, safar bilkul worth it tha!',
  },
];

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetItem) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [filterLang, setFilterLang] = useState<'all' | 'en' | 'hi' | 'hinglish'>('all');

  if (!isOpen) return null;

  const filteredPresets = SCRIPT_PRESETS.filter((p) => {
    if (filterLang === 'all') return true;
    return p.language === filterLang;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Speech Script Presets
              </h3>
              <p className="text-xs text-slate-400">
                Ready-to-use scripts with natural pauses and emotional vocal bursts in English & Hindi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs Filter */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            Language:
          </span>
          <button
            type="button"
            onClick={() => setFilterLang('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterLang === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All ({SCRIPT_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterLang('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterLang === 'hi'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🇮🇳 हिन्दी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => setFilterLang('en')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterLang === 'en'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setFilterLang('hinglish')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterLang === 'hinglish'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🌐 Hinglish
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {filteredPresets.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-slate-950 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {preset.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {preset.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.language === 'hi' ? 'Hindi' : preset.language === 'hinglish' ? 'Hinglish' : 'English'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                      Voice: {preset.recommendedVoice}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans italic line-clamp-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                  "{preset.text}"
                </p>

                <div className="mt-2 text-[11px] text-slate-400">
                  <span className="text-indigo-400 font-medium">Style:</span> {preset.style}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
