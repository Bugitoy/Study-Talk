"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import NextLayout from "@/components/NextLayout";
import { ArrowLeft, Plus, Save, Check, AlertTriangle, Shield, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  validateQuizData, 
  sanitizeInput, 
  rateLimiter, 
  generateCSRFToken, 
  validateCSRFToken,
  logSecurityEvent,
  SECURITY_CONFIG,
  createDebouncedValidator,
  cleanupMemory
} from "@/lib/security-utils";

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
  const settingsId = searchParams.get('settings');
  const [quiz, setQuiz] = useState<UserQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Accessibility refs
  const mainContentRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const skipToContentRef = useRef<HTMLAnchorElement>(null);
  
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

  // Performance-optimized debounced validation
  const debouncedValidator = useMemo(() => 
    createDebouncedValidator(SECURITY_CONFIG.DEBOUNCE_DELAY_MS), 
    []
  );

  // Generate CSRF token on component mount
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  // Fetch user information to check plan and question limits
  const fetchUserInfo = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`/api/user?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setUserLoading(false);
    }
  }, [user?.id]);

  // Calculate question limits based on user plan
  const questionLimits = useMemo(() => {
    if (!userInfo) return { maxQuestions: 20, currentQuestions: 1, isFreeUser: true };
    
    const isFreeUser = userInfo.plan === 'free';
    const isPlusUser = userInfo.plan === 'plus';
    const isPremiumUser = userInfo.plan === 'premium';
    const maxQuestions = isFreeUser ? 20 : isPlusUser ? 50 : Infinity; // Free: 20, Plus: 50, Premium: unlimited
    const currentQuestions = formData.questions.length;
    
    return { maxQuestions, currentQuestions, isFreeUser, isPlusUser, isPremiumUser };
  }, [userInfo, formData.questions.length]);

  const hasReachedQuestionLimit = useMemo(() => {
    return (questionLimits.isFreeUser || questionLimits.isPlusUser) && questionLimits.currentQuestions >= questionLimits.maxQuestions;
  }, [questionLimits]);

  // Focus management for accessibility
  useEffect(() => {
    if (!loading && mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [loading]);

  // Fetch user info on component mount
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Memory cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMemory();
    };
  }, []);

  // Enhanced fetch quiz with security checks
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId || !user?.id) {
        setLoading(false);
        return;
      }

      try {

        const res = await fetch(`/api/user-quizzes/${quizId}?userId=${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
        });

        if (res.ok) {
          const data = await res.json();
          
          // Sanitize all data before setting state
          const sanitizedData = {
            ...data,
            title: sanitizeInput(data.title),
            description: sanitizeInput(data.description),
            questions: data.questions.map((q: QuizQuestion) => ({
              ...q,
              question: sanitizeInput(q.question),
              optionA: sanitizeInput(q.optionA),
              optionB: sanitizeInput(q.optionB),
              optionC: sanitizeInput(q.optionC),
              optionD: sanitizeInput(q.optionD),
            }))
          };
          
          setQuiz(sanitizedData);
          
          // Convert correct answer text back to letter format for UI
          const questionsWithLetterFormat = sanitizedData.questions.map((q: QuizQuestion) => {
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
            title: sanitizedData.title,
            description: sanitizedData.description,
            questions: questionsWithLetterFormat
          });
        } else if (res.status === 403) {
          logSecurityEvent('FORBIDDEN_QUIZ_ACCESS', user.id, { quizId });
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this quiz",
            variant: "destructive",
          });
          router.push('/meetups/compete/quiz-library');
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logSecurityEvent('QUIZ_FETCH_ERROR', user?.id || 'unknown', { quizId, error: errorMessage });
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
  }, [quizId, user?.id, csrfToken, router, toast]);

  // Performance-optimized debounced validation
  useEffect(() => {
    debouncedValidator(formData, (result) => {
      setValidationErrors(result.errors);
    });
  }, [formData, debouncedValidator]);

  // Clean up error messages for better UX
  const cleanErrorMessage = useCallback((error: string): string => {
    // Remove technical field paths and make messages user-friendly
    return error
      .replace(/^questions\.\d+\./, '') // Remove "questions.0." prefix
      .replace(/^title: /, '') // Remove "title: " prefix
      .replace(/^description: /, '') // Remove "description: " prefix
      .replace(/^question: /, '') // Remove "question: " prefix
      .replace(/^optionA: /, '') // Remove "optionA: " prefix
      .replace(/^optionB: /, '') // Remove "optionB: " prefix
      .replace(/^optionC: /, '') // Remove "optionC: " prefix
      .replace(/^optionD: /, '') // Remove "optionD: " prefix
      .replace(/^correct: /, '') // Remove "correct: " prefix
      .replace(/^questions: /, '') // Remove "questions: " prefix
      .replace(/^Invalid enum value\. Expected 'A' \| 'B' \| 'C' \| 'D'/, 'Please select a correct answer')
      .replace(/^Correct answer is required/, 'Please provide a correct answer')
      .replace(/^Required/, 'This field is required');
  }, []);

  // Validation function that shows toast on action
  const validateAndShowErrors = useCallback(() => {
    const validation = validateQuizData(formData);
    setValidationErrors(validation.errors);
    
    if (validation.errors.length > 0) {
      const firstError = cleanErrorMessage(validation.errors[0]);
      toast({
        title: "Please fix the form",
        description: firstError,
        variant: "destructive",
      });
    }
    
    return validation.isValid;
  }, [formData, toast, cleanErrorMessage]);

  const addQuestion = useCallback(() => {
    // Check for validation errors before adding question
    if (!validateAndShowErrors()) {
      return;
    }
    
    // Check plan-based question limit
    if (hasReachedQuestionLimit) {
      toast({
        title: "Question Limit Reached",
        description: `${questionLimits.isFreeUser ? 'Free' : 'Plus'} users can only create ${questionLimits.maxQuestions} questions. ${questionLimits.isFreeUser ? 'Upgrade to Plus or Premium' : 'Upgrade to Premium'} to create more questions.`,
        variant: "destructive",
      });
      return;
    }
    
    if (formData.questions.length >= SECURITY_CONFIG.MAX_QUESTIONS) {
      toast({
        title: "Limit Reached",
        description: `Maximum ${SECURITY_CONFIG.MAX_QUESTIONS} questions allowed`,
        variant: "destructive",
      });
      return;
    }

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
  }, [formData.questions.length, validateAndShowErrors, toast, hasReachedQuestionLimit, questionLimits]);

  const removeQuestion = useCallback((index: number) => {
    if (formData.questions.length <= SECURITY_CONFIG.MIN_QUESTIONS) {
      toast({
        title: "Error",
        description: `You must have at least ${SECURITY_CONFIG.MIN_QUESTIONS} question`,
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
  }, [formData.questions.length, currentQuestionIndex, toast]);

  // Performance-optimized input update without real-time sanitization
  const updateQuestion = useCallback((index: number, field: keyof QuizQuestion, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  }, []);

  const saveQuiz = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to save your quiz",
        variant: "destructive",
      });
      return;
    }

    // Rate limiting check
    if (rateLimiter.isRateLimited(user.id, 'save_quiz')) {
      toast({
        title: "Rate Limited",
        description: "Please wait before saving again",
        variant: "destructive",
      });
      return;
    }

    // Validate form data and show errors if invalid
    if (!validateAndShowErrors()) {
        return;
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
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title,
          description: formData.description,
          questions: questionsWithCorrectText
        }),
      });

      if (res.ok) {
        const savedQuiz = await res.json();
        
        // Log successful save
        logSecurityEvent('QUIZ_SAVED', user.id, { 
          quizId: savedQuiz.id, 
          questionCount: formData.questions.length 
        });
        
        toast({
          title: "Success",
          description: quizId ? "Quiz updated successfully!" : "Quiz created successfully!",
        });
        
        if (!quizId) {
          // Redirect to the edit page for the newly created quiz, preserving settings
          const settingsParam = settingsId ? `&settings=${settingsId}` : '';
          router.push(`/meetups/compete/create-quiz?quizId=${savedQuiz.id}${settingsParam}`);
        }
        
        // Reset rate limiter on successful save
        rateLimiter.reset(user.id, 'save_quiz');
      } else if (res.status === 403) {
        logSecurityEvent('UNAUTHORIZED_QUIZ_SAVE', user.id, { quizId });
        toast({
          title: "Access Denied",
          description: "You don't have permission to save this quiz",
          variant: "destructive",
        });
      } else if (res.status === 429) {
        toast({
          title: "Rate Limited",
          description: "Too many save attempts. Please wait and try again.",
          variant: "destructive",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save quiz');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logSecurityEvent('QUIZ_SAVE_ERROR', user.id, { quizId, error: errorMessage });
      
      if (error instanceof TypeError && errorMessage.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } else {
      toast({
          title: "Save Failed",
          description: errorMessage || "Failed to save quiz",
        variant: "destructive",
      });
      }
    } finally {
      setSaving(false);
    }
  }, [user?.id, formData, quizId, csrfToken, settingsId, router, toast, validateAndShowErrors]);

  const handleDone = useCallback(() => {
    // Check for validation errors before navigating away
    if (!validateAndShowErrors()) {
      return;
    }
    
    // Preserve the settings parameter when navigating back to quiz library
    const settingsParam = settingsId ? `?settings=${settingsId}` : '';
    router.push(`/meetups/compete/quiz-library${settingsParam}`);
  }, [settingsId, router, validateAndShowErrors]);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveQuiz();
    }
    
    // Ctrl/Cmd + Enter to add new question (doesn't conflict with browser)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      addQuestion();
    }
    
    // Escape to go back
    if (e.key === 'Escape') {
      router.back();
    }
  }, [saveQuiz, addQuestion, router]);

  // Security warning component
  const SecurityWarningsComponent = useMemo(() => {
    if (securityWarnings.length === 0) return null;
    
    return (
      <div 
        className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-yellow-600" aria-hidden="true" />
          <span className="text-sm font-medium text-yellow-800">Security Warnings</span>
        </div>
        <ul className="text-xs text-yellow-700 space-y-1">
          {securityWarnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      </div>
    );
  }, [securityWarnings]);

  if (loading) {
    return (
      <NextLayout>
        <div 
          className="flex items-center justify-center min-h-screen"
          role="status"
          aria-live="polite"
        >
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
            aria-label="Loading quiz editor"
          ></div>
          <span className="sr-only">Loading quiz editor...</span>
        </div>
      </NextLayout>
    );
  }

  const currentQuestion = formData.questions[currentQuestionIndex];

  return (
    <NextLayout>
      {/* Skip to main content link for screen readers */}
      <a
        ref={skipToContentRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      <div 
        ref={mainContentRef}
        id="main-content"
        className="max-w-6xl mx-auto p-6"
        role="main"
        aria-label="Quiz editor"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Security Warnings */}
        {SecurityWarningsComponent}
        
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          {/* Back button - above everything on small screens */}
          <div className="mb-4 sm:mb-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
          </div>
          
          {/* Title and action buttons - on same row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {quizId ? 'Edit Quiz' : 'Create Quiz'}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4" role="toolbar" aria-label="Quiz actions">
              <button
                onClick={saveQuiz}
                disabled={saving || validationErrors.length > 0}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={saving ? 'Saving quiz...' : 'Save quiz'}
              >
                {saving ? (
                  <div 
                    className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"
                    aria-hidden="true"
                  ></div>
                ) : (
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleDone}
                className="flex items-center justify-center gap-2 bg-blue-400 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-300 transition-colors text-sm sm:text-base flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Finish editing and return to quiz library"
              >
                <Check className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Quiz Details */}
          <section className="lg:col-span-1" aria-labelledby="quiz-details-heading">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h2 id="quiz-details-heading" className="text-xl font-semibold mb-4">Quiz Details</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label 
                    htmlFor="quiz-title"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Quiz Title
                  </label>
                  <input
                    ref={titleInputRef}
                    id="quiz-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 sm:text-base"
                    placeholder="Enter quiz title"
                    maxLength={SECURITY_CONFIG.TITLE_MAX_LENGTH}
                    aria-describedby="title-character-count"
                    aria-required="true"
                    spellCheck="false"
                  />
                  <div 
                    id="title-character-count"
                    className="text-xs text-gray-500 mt-1"
                    aria-live="polite"
                  >
                    {formData.title.length}/{SECURITY_CONFIG.TITLE_MAX_LENGTH} characters
                  </div>
                </div>
                
                <div>
                  <label 
                    htmlFor="quiz-description"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="quiz-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 sm:text-base"
                    rows={6}
                    placeholder="Enter quiz description"
                    maxLength={SECURITY_CONFIG.DESCRIPTION_MAX_LENGTH}
                    aria-describedby="description-character-count"
                    aria-required="true"
                    spellCheck="false"
                  />
                  <div 
                    id="description-character-count"
                    className="text-xs text-gray-500 mt-1"
                    aria-live="polite"
                  >
                    {formData.description.length}/{SECURITY_CONFIG.DESCRIPTION_MAX_LENGTH} characters
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Question Editor */}
          <section className="lg:col-span-2" aria-labelledby="question-editor-heading">
            {/* Question limit warning for free and plus users */}
            {(questionLimits.isFreeUser || questionLimits.isPlusUser) && formData.questions.length > 0 && (
              <div className={`mb-4 p-3 rounded-lg border ${
                hasReachedQuestionLimit 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : questionLimits.isFreeUser 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    hasReachedQuestionLimit 
                      ? 'bg-red-200' 
                      : questionLimits.isFreeUser 
                        ? 'bg-yellow-200'
                        : 'bg-blue-200'
                  }`}>
                    <svg className={`w-2.5 h-2.5 ${
                      hasReachedQuestionLimit 
                        ? 'text-red-600' 
                        : questionLimits.isFreeUser 
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium">
                      {hasReachedQuestionLimit 
                        ? `Question limit reached (${questionLimits.maxQuestions} questions)`
                        : `${questionLimits.currentQuestions} of ${questionLimits.maxQuestions} questions used`
                      }
                    </p>
                    <p className="text-xs mt-0.5">
                      {hasReachedQuestionLimit 
                        ? `${questionLimits.isFreeUser ? 'Free' : 'Plus'} users are limited to ${questionLimits.maxQuestions} questions. ${questionLimits.isFreeUser ? 'Upgrade to Plus or Premium' : 'Upgrade to Premium'} to create more questions.`
                        : `${questionLimits.isFreeUser ? 'Free' : 'Plus'} users are limited to ${questionLimits.maxQuestions} questions.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
                <h2 id="question-editor-heading" className="text-lg sm:text-xl font-semibold">
                  Question {currentQuestionIndex + 1} of {formData.questions.length}
                </h2>
                <button
                  onClick={addQuestion}
                  disabled={hasReachedQuestionLimit || formData.questions.length >= SECURITY_CONFIG.MAX_QUESTIONS || userLoading}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    hasReachedQuestionLimit || formData.questions.length >= SECURITY_CONFIG.MAX_QUESTIONS || userLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-400 text-white hover:bg-blue-300 focus:ring-blue-500'
                  }`}
                  aria-label={hasReachedQuestionLimit ? `Question limit reached. ${questionLimits.isFreeUser ? 'Free' : 'Plus'} users can only create ${questionLimits.maxQuestions} questions.` : "Add new question"}
                  aria-describedby={hasReachedQuestionLimit || formData.questions.length >= SECURITY_CONFIG.MAX_QUESTIONS ? 'max-questions-reached' : undefined}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>{hasReachedQuestionLimit ? 'Question Limit Reached' : 'Add Question'}</span>
                </button>
                {(hasReachedQuestionLimit || formData.questions.length >= SECURITY_CONFIG.MAX_QUESTIONS) && (
                  <div id="max-questions-reached" className="sr-only">
                    {hasReachedQuestionLimit ? `Question limit reached for ${questionLimits.isFreeUser ? 'free' : 'plus'} users` : 'Maximum number of questions reached'}
                  </div>
                )}
              </div>

              {/* Question Navigation */}
              {formData.questions.length > 1 && (
                <nav className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6" aria-label="Question navigation">
                  {formData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-label={`Go to question ${index + 1}`}
                      aria-current={index === currentQuestionIndex ? 'page' : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              )}

              {/* Question Form */}
              <form className="space-y-4 sm:space-y-6" aria-labelledby="question-form-heading">
                <h3 id="question-form-heading" className="sr-only">Question {currentQuestionIndex + 1} form</h3>
                
                <div>
                  <label 
                    htmlFor="question-text"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Question
                  </label>
                  <textarea
                    ref={questionInputRef}
                    id="question-text"
                    value={currentQuestion.question}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 sm:text-base"
                    rows={6}
                    placeholder="Enter your question"
                    maxLength={SECURITY_CONFIG.QUESTION_MAX_LENGTH}
                    aria-describedby="question-character-count"
                    aria-required="true"
                    spellCheck="false"
                  />
                  <div 
                    id="question-character-count"
                    className="text-xs text-gray-500 mt-1"
                    aria-live="polite"
                  >
                    {currentQuestion.question.length}/{SECURITY_CONFIG.QUESTION_MAX_LENGTH} characters
                  </div>
                </div>

                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <legend className="sr-only">Answer options</legend>
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div key={option}>
                      <label 
                        htmlFor={`option-${option}`}
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Option {option}
                      </label>
                      <textarea
                        id={`option-${option}`}
                        value={currentQuestion[`option${option}` as keyof QuizQuestion] as string}
                        onChange={(e) => updateQuestion(currentQuestionIndex, `option${option}` as keyof QuizQuestion, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 sm:text-base"
                        rows={3}
                        placeholder={`Enter option ${option}`}
                        maxLength={SECURITY_CONFIG.OPTION_MAX_LENGTH}
                        aria-describedby={`option-${option}-character-count`}
                        aria-required="true"
                        spellCheck="false"
                      />
                      <div 
                        id={`option-${option}-character-count`}
                        className="text-xs text-gray-500 mt-1"
                        aria-live="polite"
                      >
                        {(currentQuestion[`option${option}` as keyof QuizQuestion] as string).length}/{SECURITY_CONFIG.OPTION_MAX_LENGTH} characters
                      </div>
                    </div>
                  ))}
                </fieldset>

                <div>
                  <label 
                    htmlFor="correct-answer"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    Correct Answer
                  </label>
                  <select
                    id="correct-answer"
                    value={currentQuestion.correct}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'correct', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    aria-describedby="correct-answer-help"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                  <div id="correct-answer-help" className="text-xs text-gray-500 mt-1">
                    Select the correct answer for this question
                  </div>
                </div>

                {formData.questions.length > SECURITY_CONFIG.MIN_QUESTIONS && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeQuestion(currentQuestionIndex)}
                      className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                      aria-label={`Remove question ${currentQuestionIndex + 1}`}
                    >
                      Remove Question
                    </button>
                  </div>
                )}
              </form>
            </div>
          </section>
          </div>

        {/* Keyboard shortcuts help */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg" role="complementary" aria-labelledby="keyboard-shortcuts-heading">
          <h3 id="keyboard-shortcuts-heading" className="text-sm font-semibold text-gray-700 mb-2">
            Keyboard Shortcuts
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl/Cmd + S</kbd> Save quiz</li>
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl/Cmd + Enter</kbd> Add new question</li>
            <li><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Escape</kbd> Go back</li>
          </ul>
        </div>
      </div>
    </NextLayout>
  );
} 