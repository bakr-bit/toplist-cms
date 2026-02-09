export interface Country {
  id: string;
  name: string;
  flag: string;
}

export interface Language {
  id: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { id: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { id: "DE", name: "Germany", flag: "🇩🇪" },
  { id: "FI", name: "Finland", flag: "🇫🇮" },
  { id: "SE", name: "Sweden", flag: "🇸🇪" },
  { id: "NO", name: "Norway", flag: "🇳🇴" },
  { id: "DK", name: "Denmark", flag: "🇩🇰" },
  { id: "CA", name: "Canada", flag: "🇨🇦" },
  { id: "AU", name: "Australia", flag: "🇦🇺" },
  { id: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { id: "IE", name: "Ireland", flag: "🇮🇪" },
  { id: "AT", name: "Austria", flag: "🇦🇹" },
  { id: "CH", name: "Switzerland", flag: "🇨🇭" },
  { id: "NL", name: "Netherlands", flag: "🇳🇱" },
  { id: "BE", name: "Belgium", flag: "🇧🇪" },
  { id: "FR", name: "France", flag: "🇫🇷" },
  { id: "ES", name: "Spain", flag: "🇪🇸" },
  { id: "IT", name: "Italy", flag: "🇮🇹" },
  { id: "PT", name: "Portugal", flag: "🇵🇹" },
  { id: "PL", name: "Poland", flag: "🇵🇱" },
  { id: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { id: "HU", name: "Hungary", flag: "🇭🇺" },
  { id: "RO", name: "Romania", flag: "🇷🇴" },
  { id: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { id: "HR", name: "Croatia", flag: "🇭🇷" },
  { id: "SK", name: "Slovakia", flag: "🇸🇰" },
  { id: "SI", name: "Slovenia", flag: "🇸🇮" },
  { id: "EE", name: "Estonia", flag: "🇪🇪" },
  { id: "LV", name: "Latvia", flag: "🇱🇻" },
  { id: "LT", name: "Lithuania", flag: "🇱🇹" },
  { id: "GR", name: "Greece", flag: "🇬🇷" },
  { id: "CY", name: "Cyprus", flag: "🇨🇾" },
  { id: "MT", name: "Malta", flag: "🇲🇹" },
  { id: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { id: "US", name: "United States", flag: "🇺🇸" },
  { id: "MX", name: "Mexico", flag: "🇲🇽" },
  { id: "BR", name: "Brazil", flag: "🇧🇷" },
  { id: "AR", name: "Argentina", flag: "🇦🇷" },
  { id: "CL", name: "Chile", flag: "🇨🇱" },
  { id: "CO", name: "Colombia", flag: "🇨🇴" },
  { id: "PE", name: "Peru", flag: "🇵🇪" },
  { id: "JP", name: "Japan", flag: "🇯🇵" },
  { id: "KR", name: "South Korea", flag: "🇰🇷" },
  { id: "IN", name: "India", flag: "🇮🇳" },
  { id: "TH", name: "Thailand", flag: "🇹🇭" },
  { id: "PH", name: "Philippines", flag: "🇵🇭" },
  { id: "MY", name: "Malaysia", flag: "🇲🇾" },
  { id: "SG", name: "Singapore", flag: "🇸🇬" },
  { id: "ID", name: "Indonesia", flag: "🇮🇩" },
  { id: "VN", name: "Vietnam", flag: "🇻🇳" },
  { id: "ZA", name: "South Africa", flag: "🇿🇦" },
  { id: "NG", name: "Nigeria", flag: "🇳🇬" },
  { id: "KE", name: "Kenya", flag: "🇰🇪" },
  { id: "GH", name: "Ghana", flag: "🇬🇭" },
  { id: "TR", name: "Turkey", flag: "🇹🇷" },
  { id: "RU", name: "Russia", flag: "🇷🇺" },
  { id: "UA", name: "Ukraine", flag: "🇺🇦" },
  { id: "IL", name: "Israel", flag: "🇮🇱" },
  { id: "AE", name: "UAE", flag: "🇦🇪" },
  { id: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { id: "EG", name: "Egypt", flag: "🇪🇬" },
];

export const LANGUAGES: Language[] = [
  { id: "en", name: "English" },
  { id: "de", name: "German" },
  { id: "fi", name: "Finnish" },
  { id: "sv", name: "Swedish" },
  { id: "no", name: "Norwegian" },
  { id: "da", name: "Danish" },
  { id: "fr", name: "French" },
  { id: "es", name: "Spanish" },
  { id: "it", name: "Italian" },
  { id: "pt", name: "Portuguese" },
  { id: "nl", name: "Dutch" },
  { id: "pl", name: "Polish" },
  { id: "cs", name: "Czech" },
  { id: "hu", name: "Hungarian" },
  { id: "ro", name: "Romanian" },
  { id: "bg", name: "Bulgarian" },
  { id: "hr", name: "Croatian" },
  { id: "sk", name: "Slovak" },
  { id: "sl", name: "Slovenian" },
  { id: "et", name: "Estonian" },
  { id: "lv", name: "Latvian" },
  { id: "lt", name: "Lithuanian" },
  { id: "el", name: "Greek" },
  { id: "tr", name: "Turkish" },
  { id: "ru", name: "Russian" },
  { id: "uk", name: "Ukrainian" },
  { id: "ja", name: "Japanese" },
  { id: "ko", name: "Korean" },
  { id: "zh", name: "Chinese" },
  { id: "th", name: "Thai" },
  { id: "vi", name: "Vietnamese" },
  { id: "ar", name: "Arabic" },
  { id: "hi", name: "Hindi" },
];

export function getCountryName(id: string): string {
  const country = COUNTRIES.find((c) => c.id === id);
  return country ? `${country.flag} ${country.name}` : id;
}

export function getLanguageName(id: string): string {
  const language = LANGUAGES.find((l) => l.id === id);
  return language?.name || id;
}
