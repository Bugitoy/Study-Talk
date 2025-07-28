"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface University {
  id: string;
  name: string;
  domain?: string;
  isVerified: boolean;
}

interface UniversityAutocompleteProps {
  value?: string;
  onSelect: (university: string) => void;
  placeholder?: string;
  disabled?: boolean;
  universities?: University[]; // Pass from parent
}

export function UniversityAutocomplete({
  value = "",
  onSelect,
  placeholder = "Search for your university...",
  disabled = false,
  universities = [], // Use passed universities instead of fetching
}: UniversityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Optimize filtering with useMemo
  const filtered = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    return universities
      .filter((uni) =>
        uni.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, 10);
  }, [inputValue, universities]);

  useEffect(() => {
    setFilteredUniversities(filtered);
    setSelectedIndex(-1);
  }, [filtered]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // If the input is cleared, notify parent
    if (!newValue.trim()) {
      onSelect("");
    }
  };

  // Handle university selection
  const handleSelect = (universityName: string) => {
    setInputValue(universityName);
    setIsOpen(false);
    onSelect(universityName);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredUniversities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredUniversities.length) {
          handleSelect(filteredUniversities[selectedIndex].name);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {isOpen && filteredUniversities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredUniversities.map((university, index) => (
            <button
              key={university.id}
              type="button"
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                index === selectedIndex && "bg-gray-100",
                university.name === inputValue && "bg-blue-50"
              )}
              onClick={() => handleSelect(university.name)}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{university.name}</span>
                {university.name === inputValue && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 