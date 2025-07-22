"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import NextLayout from "@/components/NextLayout";
import { Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserQuiz {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function QuizLibraryPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [userQuizzes, setUserQuizzes] = useState<UserQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get the settings parameter to preserve it when navigating back
  const settingsId = searchParams.get('settings');

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      if (!user?.id) return;
      
      try {
        const res = await fetch(`/api/user-quizzes?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserQuizzes(data);
        } else if (res.status === 404) {
          // No quizzes found, that's okay
          setUserQuizzes([]);
        }
      } catch (error) {
        console.error('Error fetching user quizzes:', error);
        toast({
          title: "Error",
          description: "Failed to load your quizzes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserQuizzes();
  }, [user?.id, toast]);

  const handleCreateNewQuiz = () => {
    // Preserve the settings parameter when navigating to create-quiz
    const settingsParam = settingsId ? `?settings=${settingsId}` : '';
    router.push(`/meetups/compete/create-quiz${settingsParam}`);
  };

  const handleQuizSelect = async (quiz: UserQuiz) => {
    // Create a meeting with the selected user quiz
    try {
      const res = await fetch('/api/user-quizzes/' + quiz.id + '?userId=' + user?.id);
      if (res.ok) {
        const quizData = await res.json();
        
        // Navigate back to choose-topic with the quiz data and preserve settings parameter
        const settingsParam = settingsId ? `&settings=${settingsId}` : '';
        router.push(`/meetups/compete/choose-topic?selectedQuiz=${quiz.id}${settingsParam}`);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <NextLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </NextLayout>
    );
  }

  return (
    <NextLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          {/* Back button - above everything on small screens */}
          <div className="mb-4 sm:mb-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          
          {/* Title and New Quiz button - on same row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Library</h1>
            <button
              onClick={handleCreateNewQuiz}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">New Quiz</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {userQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You haven't created any quizzes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first quiz with custom questions and answers.
              </p>
              <button
                onClick={handleCreateNewQuiz}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Create Your First Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {userQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => handleQuizSelect(quiz)}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                    {quiz.title}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                    {quiz.questionCount} Q
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                  {quiz.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {formatDate(quiz.createdAt)}</span>
                  <span>Updated {formatDate(quiz.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NextLayout>
  );
} 