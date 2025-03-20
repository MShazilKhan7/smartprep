import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileWithPreview, QuizConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ConfigureQuizProps {
  files: FileWithPreview[];
  onBack: () => void;
  onGenerate: (config: QuizConfig) => void;
}

export default function ConfigureQuiz({ files, onBack, onGenerate }: ConfigureQuizProps) {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: "",
    type: "multiple-choice",
    numberOfQuestions: 10,
    difficulty: "medium",
    topics: "",
    includeAnswerKey: true,
    shuffleQuestions: false,
    includeImages: true
  });
  
  const handleChange = (field: keyof QuizConfig, value: string | number | boolean) => {
    setQuizConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = () => {
    onGenerate(quizConfig);
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Configure Your Quiz</CardTitle>
          <p className="text-gray-600">
            Customize quiz parameters to fit your requirements.
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">Quiz Title</Label>
              <Input
                id="quizTitle"
                placeholder="Enter a title for your quiz"
                value={quizConfig.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quizType">Quiz Type</Label>
              <Select
                value={quizConfig.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="mixed">Mixed Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numberOfQuestions">Number of Questions</Label>
              <Input
                id="numberOfQuestions"
                type="number"
                min={1}
                max={50}
                value={quizConfig.numberOfQuestions}
                onChange={(e) => handleChange("numberOfQuestions", parseInt(e.target.value) || 10)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={quizConfig.difficulty}
                onValueChange={(value) => handleChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="topics">Topics to Focus On (Optional)</Label>
              <Textarea
                id="topics"
                placeholder="Enter specific topics to focus on, separated by commas"
                value={quizConfig.topics}
                onChange={(e) => handleChange("topics", e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Advanced Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAnswerKey"
                  checked={quizConfig.includeAnswerKey}
                  onCheckedChange={(checked) => handleChange("includeAnswerKey", !!checked)}
                />
                <Label htmlFor="includeAnswerKey">Include Answer Key</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffleQuestions"
                  checked={quizConfig.shuffleQuestions}
                  onCheckedChange={(checked) => handleChange("shuffleQuestions", !!checked)}
                />
                <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeImages"
                  checked={quizConfig.includeImages}
                  onCheckedChange={(checked) => handleChange("includeImages", !!checked)}
                />
                <Label htmlFor="includeImages">Include Images in Questions (when available)</Label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onBack}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </Button>
            
            <Button onClick={handleSubmit}>
              Generate Quiz
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
