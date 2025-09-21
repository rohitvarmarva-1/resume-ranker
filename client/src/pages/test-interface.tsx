import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TestInterface() {
  const { testId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: test, isLoading } = useQuery({
    queryKey: ["/api/tests", testId],
    enabled: !!testId,
  });

  const submitTestMutation = useMutation({
    mutationFn: async (data: { answers: Record<string, string>; timeSpent: number; flaggedQuestions: string[] }) => {
      const res = await apiRequest("POST", `/api/tests/${testId}/submit`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Submitted",
        description: "Your test has been submitted successfully.",
      });
      setLocation("/candidate");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize timer
  useEffect(() => {
    if (test?.timeLimit) {
      setTimeLeft(test.timeLimit * 60); // Convert minutes to seconds
    }
  }, [test]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = test?.questions?.[currentQuestionIndex];
  const progress = test?.questions ? ((currentQuestionIndex + 1) / test.questions.length) * 100 : 0;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleNavigateQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (test?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    if (!test) return;
    
    const timeSpent = Math.round((test.timeLimit * 60 - timeLeft) / 60); // Convert to minutes
    
    submitTestMutation.mutate({
      answers,
      timeSpent,
      flaggedQuestions,
    });
  };

  const getQuestionStatus = (index: number, questionId: string) => {
    if (index === currentQuestionIndex) return "current";
    if (flaggedQuestions.includes(questionId)) return "flagged";
    if (answers[questionId]) return "answered";
    return "unanswered";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Test not found or access denied</p>
            <Button onClick={() => setLocation("/candidate")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Test Header */}
        <Card className="mb-8" data-testid="card-test-header">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  {test.job?.title || "Assessment"} Test
                </h1>
                <p className="text-muted-foreground">
                  {test.questions.length} questions • {test.timeLimit} minutes
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-destructive" data-testid="text-timer">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground">Time Remaining</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm text-muted-foreground" data-testid="text-progress">
                  {currentQuestionIndex + 1} of {test.questions.length}
                </span>
              </div>
              <Progress value={progress} className="w-full" data-testid="progress-test" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-8" data-testid="card-question">
            <CardContent className="p-8">
              {/* Question Number */}
              <div className="flex items-center space-x-2 mb-6">
                <Badge data-testid="badge-question-number">
                  Question {currentQuestionIndex + 1}
                </Badge>
                <Badge variant="secondary" data-testid="badge-question-type">
                  {currentQuestion.type.replace("_", " ")}
                </Badge>
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-semibold text-card-foreground mb-6" data-testid="text-question">
                {currentQuestion.question}
              </h2>

              {/* Code Example */}
              {currentQuestion.codeExample && (
                <div className="mt-6 p-4 bg-muted rounded-lg border border-border mb-6" data-testid="code-example">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    <code>{currentQuestion.codeExample}</code>
                  </pre>
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-4" data-testid="answer-options">
                {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`}
                          data-testid={`radio-option-${index}`}
                        />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer p-3 border border-border rounded-lg hover:bg-accent"
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                          <span className="ml-2">{option}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    placeholder="Enter your answer here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="min-h-[150px]"
                    data-testid="textarea-answer"
                  />
                )}
              </div>

              {/* Question Actions */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => handleFlagQuestion(currentQuestion.id)}
                  className={flaggedQuestions.includes(currentQuestion.id) ? "text-orange-600" : ""}
                  data-testid="button-flag-question"
                >
                  <i className={`fas fa-flag mr-2 ${flaggedQuestions.includes(currentQuestion.id) ? "text-orange-600" : ""}`}></i>
                  {flaggedQuestions.includes(currentQuestion.id) ? "Unflag" : "Mark for Review"}
                </Button>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    data-testid="button-previous"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>Previous
                  </Button>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === test.questions.length - 1}
                    data-testid="button-next"
                  >
                    Next<i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Navigation */}
        <Card data-testid="card-question-navigation">
          <CardContent className="p-6">
            <h3 className="font-semibold text-card-foreground mb-4">Question Navigation</h3>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {test.questions.map((question, index) => {
                const status = getQuestionStatus(index, question.id);
                return (
                  <Button
                    key={question.id}
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      status === "current" ? "bg-primary text-primary-foreground" :
                      status === "answered" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                      status === "flagged" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                      "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                    onClick={() => handleNavigateQuestion(index)}
                    data-testid={`nav-question-${index + 1}`}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-green-100"></div>
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-primary"></div>
                <span className="text-muted-foreground">Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-yellow-100"></div>
                <span className="text-muted-foreground">Flagged</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-muted"></div>
                <span className="text-muted-foreground">Not Answered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Test Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => {
              if (confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
                handleSubmitTest();
              }
            }}
            disabled={submitTestMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg"
            data-testid="button-submit-test"
          >
            <i className="fas fa-check mr-2"></i>
            {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
          </Button>
        </div>
      </div>
    </div>
  );
}
