"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, Search, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface University {
  id: string;
  name: string;
  domain?: string;
  isVerified: boolean;
  region: string;
  country: string;
}

interface Continent {
  region: string;
  _count: { region: number };
}

interface Country {
  country: string;
  _count: { country: number };
}

interface EnhancedUniversitySelectorProps {
  value?: string;
  onSelect: (university: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EnhancedUniversitySelector({
  value = "",
  onSelect,
  placeholder = "Select your university...",
  disabled = false,
}: EnhancedUniversitySelectorProps) {
  const [selectedContinent, setSelectedContinent] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isContinentOpen, setIsContinentOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isUniversityOpen, setIsUniversityOpen] = useState(false);

  // Fetch continents
  const { data: continents = [] } = useQuery<Continent[]>({
    queryKey: ["continents"],
    queryFn: async () => {
      const response = await fetch('/api/universities/continents');
      if (!response.ok) throw new Error('Failed to fetch continents');
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch countries for selected continent
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries", selectedContinent],
    queryFn: async () => {
      if (!selectedContinent) return [];
      const response = await fetch(`/api/universities/countries?region=${encodeURIComponent(selectedContinent)}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      return response.json();
    },
    enabled: !!selectedContinent,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch universities for selected country
  const { data: universities = [] } = useQuery<University[]>({
    queryKey: ["universities-by-country", selectedCountry, searchTerm],
    queryFn: async () => {
      if (!selectedCountry) return [];
      const response = await fetch(`/api/universities/by-country?country=${encodeURIComponent(selectedCountry)}&search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch universities');
      return response.json();
    },
    enabled: !!selectedCountry,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Reset selections when continent changes
  useEffect(() => {
    setSelectedCountry("");
    setSearchTerm("");
    setIsCountryOpen(false);
    setIsUniversityOpen(false);
  }, [selectedContinent]);

  // Reset search when country changes
  useEffect(() => {
    setSearchTerm("");
    setIsUniversityOpen(false);
  }, [selectedCountry]);

  const handleContinentSelect = (continent: string) => {
    setSelectedContinent(continent);
    setIsContinentOpen(false);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
  };

  const handleUniversitySelect = (universityName: string) => {
    onSelect(universityName);
    setIsUniversityOpen(false);
  };

  const getContinentDisplayName = (region: string) => {
    const continentMap: Record<string, string> = {
      'North America': 'North America',
      'Europe': 'Europe',
      'Asia': 'Asia',
      'Africa': 'Africa',
      'South America': 'South America',
      'Oceania': 'Oceania',
      'Antarctica': 'Antarctica'
    };
    return continentMap[region] || region;
  };

  return (
    <div className="space-y-4">
      {/* Continent Selection */}
      <div className="relative">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Continent
        </Label>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between",
            !selectedContinent && "text-gray-500"
          )}
          onClick={() => setIsContinentOpen(!isContinentOpen)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {selectedContinent ? getContinentDisplayName(selectedContinent) : "Choose continent..."}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>

        {isContinentOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {continents.map((continent) => (
              <button
                key={continent.region}
                type="button"
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between",
                  selectedContinent === continent.region && "bg-orange-50 text-orange-700"
                )}
                onClick={() => handleContinentSelect(continent.region)}
              >
                <span>{getContinentDisplayName(continent.region)}</span>
                <span className="text-sm text-gray-500">
                  {continent._count.region} universities
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Country Selection */}
      {selectedContinent && (
        <div className="relative">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Country
          </Label>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-between",
              !selectedCountry && "text-gray-500"
            )}
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {selectedCountry || "Choose country..."}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>

          {isCountryOpen && (
            <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {countries.map((country) => (
                <button
                  key={country.country}
                  type="button"
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between",
                    selectedCountry === country.country && "bg-orange-50 text-orange-700"
                  )}
                  onClick={() => handleCountrySelect(country.country)}
                >
                  <span>{country.country}</span>
                  <span className="text-sm text-gray-500">
                    {country._count.country} universities
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* University Selection */}
      {selectedCountry && (
        <div className="relative">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Search for your university
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Type to search universities..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsUniversityOpen(true);
              }}
              onFocus={() => setIsUniversityOpen(true)}
              disabled={disabled}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {isUniversityOpen && universities.length > 0 && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {universities.map((university) => (
                <button
                  key={university.id}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => handleUniversitySelect(university.name)}
                >
                  <div className="flex items-center gap-2">
                    <span>{university.name}</span>
                    {university.isVerified && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {university.domain && (
                    <span className="text-sm text-gray-500">
                      {university.domain}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {isUniversityOpen && searchTerm && universities.length === 0 && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
              No universities found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {/* Selected University Display */}
      {value && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-900">{value}</p>
              <p className="text-sm text-orange-700">
                {selectedCountry} • {getContinentDisplayName(selectedContinent)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelect("")}
              className="text-orange-600 hover:text-orange-800"
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 