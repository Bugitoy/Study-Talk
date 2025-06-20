"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import NextLayout from "@/components/NextLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Star, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockWords,
  alphabet,
  getWordsByLanguage,
  searchWords,
  DictionaryWord,
} from "@/lib/data";

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "tn">("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [words, setWords] = useState(mockWords);

  const filteredWords = useMemo(() => {
    let filteredList = getWordsByLanguage(language);

    if (searchQuery) {
      filteredList = searchWords(searchQuery, language);
    } else if (selectedLetter) {
      filteredList = filteredList.filter((word) =>
        word.word.toLowerCase().startsWith(selectedLetter.toLowerCase()),
      );
    }

    // Map with current starred state from local words state
    return filteredList
      .map((word) => ({
        ...word,
        starred: words.find((w) => w.id === word.id)?.starred || false,
      }))
      .slice(0, 20); // Limit to 20 words for better performance
  }, [language, searchQuery, selectedLetter, words]);

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLetter("");
  };

  const toggleStarred = (wordId: string) => {
    setWords((prevWords) =>
      prevWords.map((word) =>
        word.id === wordId ? { ...word, starred: !word.starred } : word,
      ),
    );
  };

  const playPronunciation = (word: DictionaryWord) => {
    // In a real app, this would play audio
    console.log(`Playing pronunciation for: ${word.word}`);
  };

  return (
    <NextLayout>
      <div className="max-w-6xl mx-auto flex flex-col">
        {/* Language Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mx-auto mb-8">
          <Button
            variant={language === "en" ? "default" : "outline"}
            onClick={() => setLanguage("en")}
            className="rounded-lg px-8 py-3 text-lg font-medium overflow-hidden"
            style={{
              backgroundColor: language === "en" ? "#F7D379" : undefined,
            }}
          >
            English - Setswana
          </Button>
          <Button
            variant={language === "tn" ? "default" : "outline"}
            onClick={() => setLanguage("tn")}
            className="rounded-lg px-8 py-3 text-lg font-medium overflow-hidden"
            style={{
              backgroundColor: language === "tn" ? "#F7D379" : undefined,
            }}
          >
            Setswana - English
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Alphabet Sidebar */}
          <div className="lg:w-20">
            <div className="sticky top-8">
              <div className="grid grid-cols-9 lg:grid-cols-1 gap-2 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? "default" : "ghost"}
                    onClick={() => {
                      setSelectedLetter(
                        selectedLetter === letter ? "" : letter,
                      );
                      setSearchQuery("");
                    }}
                    className="w-8 h-8 lg:w-12 lg:h-12 text-sm lg:text-lg font-semibold rounded-lg"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedLetter("");
                  }}
                  placeholder="Search words..."
                  className="pl-12 pr-12 py-4 text-lg rounded-lg border-2 border-gray-200 focus:border-orange-400 transition-colors"
                />
                {(searchQuery || selectedLetter) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Words List */}
            <div className="space-y-4">
              {filteredWords.map((word) => (
                <Card
                  key={word.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 -mb-0.5">
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/word/${word.id}`}
                        className="flex-1 space-y-2 hover:text-orange-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {word.word}
                          </h3>
                          {word.pronunciation && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                playPronunciation(word);
                              }}
                              className="w-8 h-8 rounded-full hover:bg-gray-100"
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <p className="text-gray-600 text-lg">
                          {word.definition}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-md">
                            {word.partOfSpeech}
                          </span>
                          <span>→</span>
                          <span className="font-medium text-orange-600">
                            {word.translation}
                          </span>
                        </div>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStarred(word.id)}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 ml-4"
                      >
                        <Star
                          className={cn(
                            "w-5 h-5",
                            word.starred
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400",
                          )}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredWords.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchQuery
                      ? `No words found for "${searchQuery}"`
                      : selectedLetter
                        ? `No words found starting with "${selectedLetter}"`
                        : "No words available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </NextLayout>
  );
}
