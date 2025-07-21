"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import NextLayout from "@/components/NextLayout";
import { ArrowLeft, Plus, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
}

interface UserQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export default function CreateQuizPage() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const quizId = searchParams.get('quizId');
  const [quiz, setQuiz] = useState<UserQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [
      {
        id: "1",
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correct: "A"
      }
    ]
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/user-quizzes/${quizId}?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data);
          
          // Convert correct answer text back to letter format for UI
          const questionsWithLetterFormat = data.questions.map((q: QuizQuestion) => {
            let correctLetter = "A"; // default
            if (q.correct === q.optionA) correctLetter = "A";
            else if (q.correct === q.optionB) correctLetter = "B";
            else if (q.correct === q.optionC) correctLetter = "C";
            else if (q.correct === q.optionD) correctLetter = "D";
            
            return {
              ...q,
              correct: correctLetter
            };
          });
          
          setFormData({
            title: data.title,
            description: data.description,
            questions: questionsWithLetterFormat
          });
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, user?.id, toast]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correct: "A"
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    
    setCurrentQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length <= 1) {
      toast({
        title: "Error",
        description: "You must have at least one question",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));

    if (currentQuestionIndex >= index) {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const saveQuiz = async () => {
    if (!user?.id) return;

    // Validate form
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz description",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        toast({
          title: "Error",
          description: `Please enter a question for question ${i + 1}`,
          variant: "destructive",
        });
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        toast({
          title: "Error",
          description: `Please fill all options for question ${i + 1}`,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      // Convert correct answer letters to actual answer text
      const questionsWithCorrectText = formData.questions.map(q => {
        const correctAnswerText = 
          q.correct === "A" ? q.optionA :
          q.correct === "B" ? q.optionB :
          q.correct === "C" ? q.optionC :
          q.correct === "D" ? q.optionD : q.optionA;
        
        return {
          ...q,
          correct: correctAnswerText
        };
      });

      const url = quizId ? `/api/user-quizzes/${quizId}` : '/api/user-quizzes';
      const method = quizId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title,
          description: formData.description,
          questions: questionsWithCorrectText
        }),
      });

      if (res.ok) {
        const savedQuiz = await res.json();
        toast({
          title: "Success",
          description: quizId ? "Quiz updated successfully!" : "Quiz created successfully!",
        });
        
        if (!quizId) {
          // Redirect to the edit page for the newly created quiz
          router.push(`/meetups/compete/create-quiz?quizId=${savedQuiz.id}`);
        }
      } else {
        throw new Error('Failed to save quiz');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDone = () => {
    router.push('/meetups/compete/quiz-library');
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

  const currentQuestion = formData.questions[currentQuestionIndex];

  return (
    <NextLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {quizId ? 'Edit Quiz' : 'Create Quiz'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={saveQuiz}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleDone}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Details */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quiz title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1}</h2>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              {/* Question Navigation */}
              {formData.questions.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Question Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div key={option}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option {option}
                      </label>
                      <input
                        type="text"
                        value={currentQuestion[`option${option}` as keyof QuizQuestion] as string}
                        onChange={(e) => updateQuestion(currentQuestionIndex, `option${option}` as keyof QuizQuestion, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter option ${option}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    value={currentQuestion.correct}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'correct', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                {formData.questions.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeQuestion(currentQuestionIndex)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NextLayout>
  );
} 