import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
] as const;

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Phone number',
  className = '',
}) => {
  const [countryCode, setCountryCode] = useState<string>('IN');
  const selectedCountry = COUNTRIES.find((country) => country.code === countryCode) ?? COUNTRIES[0];
  const localNumber = value.startsWith(selectedCountry.dialCode)
    ? value.slice(selectedCountry.dialCode.length).replace(/\D/g, '')
    : value.replace(/\D/g, '');

  useEffect(() => {
    if (!value.startsWith('+')) return;

    const matches = [...COUNTRIES]
      .sort((first, second) => second.dialCode.length - first.dialCode.length)
      .filter((country) => value.startsWith(country.dialCode));
    const matchingCountry = matches.find((country) => country.code === countryCode) ?? matches[0];

    if (matchingCountry) setCountryCode(matchingCountry.code);
  }, [value, countryCode]);

  const handleCountryChange = (nextCountryCode: string) => {
    const nextCountry = COUNTRIES.find((country) => country.code === nextCountryCode);
    if (!nextCountry) return;

    setCountryCode(nextCountry.code);
    onChange(localNumber ? `${nextCountry.dialCode}${localNumber}` : '');
  };

  const handleNumberChange = (input: string) => {
    if (input.startsWith('+')) {
      const matchingCountry = [...COUNTRIES]
        .sort((first, second) => second.dialCode.length - first.dialCode.length)
        .find((country) => input.startsWith(country.dialCode));

      if (matchingCountry) {
        const digits = input.slice(matchingCountry.dialCode.length).replace(/\D/g, '');
        setCountryCode(matchingCountry.code);
        onChange(digits ? `${matchingCountry.dialCode}${digits}` : '');
        return;
      }
    }

    const digits = input.replace(/\D/g, '');
    onChange(digits ? `${selectedCountry.dialCode}${digits}` : '');
  };

  return (
    <div className={`flex w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 ${className}`}>
      <div className="relative flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-gray-50 px-3">
        <span aria-hidden="true" className="text-sm text-slate-700">{selectedCountry.dialCode}</span>
        <span aria-hidden="true" className="text-base leading-none">{selectedCountry.flag}</span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
        <select
          aria-label="Country calling code"
          value={countryCode}
          onChange={(event) => handleCountryChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.dialCode} {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label="Phone number"
        placeholder={placeholder}
        value={localNumber}
        onChange={(event) => handleNumberChange(event.target.value)}
        className="h-full min-h-[38px] min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
};
