import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QuizData } from "@/lib/types";
import { format } from "date-fns";

interface QuizResultsProps {
  quizData: QuizData;
  onEditConfiguration: () => void;
  onCreateNew: () => void;
}

export default function QuizResults({ quizData, onEditConfiguration, onCreateNew }: QuizResultsProps) {
  // Add state to track user's answers
  const [userAnswers, setUserAnswers] = useState<{[questionId: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    // For this demo, we'll just show a method that could be expanded upon
    alert("PDF download functionality would be implemented here.");
  };
  
  // Handle answer selection for any question type
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };
  
  // Calculate the score once the user submits their answers
  const calculateScore = () => {
    setShowResults(true);
  };

  const getQuestionTypeElement = (question: { id: string; type: string; text: string; choices?: string[]; correctAnswer: string }) => {
    if (question.type === "multiple-choice" && question.choices) {
      return (
        <div className="mt-3 space-y-2">
          {question.choices.map((choice, idx) => (
            <div key={idx} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`q-${question.id}-${idx}`}
                  name={`q-${question.id}`}
                  type="radio"
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  checked={userAnswers[question.id] === choice}
                  onChange={() => handleAnswerSelect(question.id, choice)}
                />
              </div>
              <label
                htmlFor={`q-${question.id}-${idx}`}
                className="ml-2 text-gray-700 cursor-pointer"
              >
                {choice}
              </label>
            </div>
          ))}
        </div>
      );
    } else if (question.type === "true-false") {
      return (
        <div className="mt-3 space-y-2">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`q-${question.id}-true`}
                name={`q-${question.id}`}
                type="radio"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                checked={userAnswers[question.id] === "True"}
                onChange={() => handleAnswerSelect(question.id, "True")}
              />
            </div>
            <label htmlFor={`q-${question.id}-true`} className="ml-2 text-gray-700 cursor-pointer">True</label>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`q-${question.id}-false`}
                name={`q-${question.id}`}
                type="radio"
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                checked={userAnswers[question.id] === "False"}
                onChange={() => handleAnswerSelect(question.id, "False")}
              />
            </div>
            <label htmlFor={`q-${question.id}-false`} className="ml-2 text-gray-700 cursor-pointer">False</label>
          </div>
        </div>
      );
    } else {
      // Short answer question
      return (
        <div className="mt-3">
          <Input 
            type="text" 
            placeholder="Type your answer here" 
            value={userAnswers[question.id] || ''}
            onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
            className="w-full mt-2"
          />
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              Generated Quiz: {quizData.title}
            </h2>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrint} size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download PDF
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Quiz Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Type: <span className="text-gray-800">{quizData.type}</span></p>
                  <p className="text-gray-600">Total Questions: <span className="text-gray-800">{quizData.questions.length}</span></p>
                </div>
                <div>
                  <p className="text-gray-600">Difficulty: <span className="text-gray-800">{quizData.difficulty}</span></p>
                  <p className="text-gray-600">Created: <span className="text-gray-800">{format(new Date(), 'MMMM d, yyyy')}</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Questions</h3>
            
            <div className="space-y-6">
              {quizData.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex">
                    <span className="flex-shrink-0 font-medium text-gray-700 mr-2">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{question.text}</p>
                      
                      {getQuestionTypeElement(question)}
                      
                      {quizData.includeAnswerKey && (
                        <div className="mt-3 text-sm text-primary">
                          <span className="font-medium">Correct Answer:</span> {question.correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Score section that shows up after submission */}
          {showResults && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Quiz Results</h3>
              <p className="text-gray-700">
                Thank you for completing the quiz! In a full implementation, this would calculate and display your score.
              </p>
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={onEditConfiguration}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Edit Configuration
            </Button>
            
            <div className="space-x-2">
              {!showResults && (
                <Button variant="primary" onClick={calculateScore}>
                  Submit Answers
                </Button>
              )}
              <Button onClick={onCreateNew}>
                Create New Quiz
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
