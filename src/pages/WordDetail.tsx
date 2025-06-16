import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWordById, mockWords } from "@/lib/data";

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const word = id ? getWordById(id) : null;

  if (!word) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Word not found
            </h1>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dictionary
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const toggleStarred = () => {
    // In a real app, this would update the backend
    word.starred = !word.starred;
  };

  const playPronunciation = () => {
    // In a real app, this would play audio
    console.log(`Playing pronunciation for: ${word.word}`);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dictionary
            </Button>
          </Link>
        </div>

        {/* Word Card */}
        <Card className="rounded-3xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <CardHeader
            className="pb-8"
            style={{
              backgroundImage: "linear-gradient(to right, #FFECD2, #FFDECA)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-4xl font-bold text-gray-900">
                  {word.word}
                </CardTitle>
                {word.pronunciation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPronunciation}
                    className="w-12 h-12 rounded-full hover:bg-white/50"
                  >
                    <Volume2 className="w-6 h-6" />
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleStarred}
                className="w-12 h-12 rounded-full hover:bg-white/50"
              >
                <Star
                  className={cn(
                    "w-6 h-6",
                    word.starred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400",
                  )}
                />
              </Button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                {word.partOfSpeech}
              </span>
              {word.pronunciation && (
                <span className="text-gray-600 text-lg font-mono">
                  {word.pronunciation}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Translation */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Translation
                </h3>
                <p className="text-2xl font-medium text-orange-600">
                  {word.translation}
                </p>
              </div>

              {/* Definition */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Definition
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {word.definition}
                </p>
              </div>

              {/* Examples */}
              {word.examples && word.examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Examples
                  </h3>
                  <div className="space-y-3">
                    {word.examples.map((example, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                          style={{ backgroundColor: "#F7D379" }}
                        >
                          <span className="text-sm font-semibold text-gray-800">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700 italic text-lg leading-relaxed">
                          "{example}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
