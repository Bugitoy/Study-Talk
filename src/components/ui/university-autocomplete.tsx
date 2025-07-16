"use client";

import React, { useState, useEffect, useRef } from "react";
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
}

export function UniversityAutocomplete({
  value = "",
  onSelect,
  placeholder = "Search for your university...",
  disabled = false,
}: UniversityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/universities');
        if (response.ok) {
          const data = await response.json();
          setUniversities(data);
        }
      } catch (error) {
        console.error('Failed to fetch universities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Filter universities based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredUniversities([]);
      return;
    }

    const filtered = universities.filter((uni) =>
      uni.name.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    setFilteredUniversities(filtered);
    setSelectedIndex(-1);
  }, [inputValue, universities]);

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
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredUniversities[selectedIndex]) {
          handleSelect(filteredUniversities[selectedIndex].name);
        } else if (inputValue.trim()) {
          // Allow custom university input
          handleSelect(inputValue.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
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
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Loading universities...
            </div>
          ) : filteredUniversities.length > 0 ? (
            <>
              {filteredUniversities.map((university, index) => (
                <button
                  key={university.id}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between",
                    selectedIndex === index && "bg-gray-100",
                    university.isVerified && "border-l-4 border-l-green-500"
                  )}
                  onClick={() => handleSelect(university.name)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="flex items-center">
                    {university.name}
                    {university.isVerified && (
                      <Check className="ml-2 h-3 w-3 text-green-600" />
                    )}
                  </span>
                </button>
              ))}
              {inputValue.trim() && !filteredUniversities.some(uni => 
                uni.name.toLowerCase() === inputValue.toLowerCase()
              ) && (
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-t border-gray-200",
                    selectedIndex === filteredUniversities.length && "bg-gray-100"
                  )}
                  onClick={() => handleSelect(inputValue.trim())}
                  onMouseEnter={() => setSelectedIndex(filteredUniversities.length)}
                >
                  Add "{inputValue.trim()}" as new university
                </button>
              )}
            </>
          ) : inputValue.trim() ? (
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => handleSelect(inputValue.trim())}
            >
              Add "{inputValue.trim()}" as new university
            </button>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              Start typing to search universities...
            </div>
          )}
        </div>
      )}
    </div>
  );
} 