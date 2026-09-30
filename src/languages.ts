export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const APAC_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌏' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳/🇧🇩' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Filipino', flag: '🇵🇭' },
];

export const APAC_REGIONS = [
  { code: 'IN', name: 'India (Monsoon & Subtropical)', defaultLang: 'hi' },
  { code: 'VN', name: 'Vietnam (Mekong & Red River Deltas)', defaultLang: 'vi' },
  { code: 'ID', name: 'Indonesia (Java, Sumatra, Kalimantan)', defaultLang: 'id' },
  { code: 'PH', name: 'Philippines (Luzon, Visayas, Mindanao)', defaultLang: 'tl' },
  { code: 'TH', name: 'Thailand (Central Plains & Isan)', defaultLang: 'th' },
  { code: 'BD', name: 'Bangladesh (Padma & Brahmaputra)', defaultLang: 'bn' },
  { code: 'LK', name: 'Sri Lanka (Wet & Dry Zones)', defaultLang: 'en' },
  { code: 'MM', name: 'Myanmar (Ayeyarwady Delta)', defaultLang: 'en' },
  { code: 'NP', name: 'Nepal (Terai & Mid-Hills)', defaultLang: 'hi' },
];
