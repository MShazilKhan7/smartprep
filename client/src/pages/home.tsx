import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import StepIndicator from "@/components/StepIndicator";
import FileUpload from "@/components/FileUpload";
import ConfigureQuiz from "@/components/ConfigureQuiz";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import QuizResults from "@/components/QuizResults";
import ErrorMessage from "@/components/ErrorMessage";
import Footer from "@/components/Footer";
import { FileWithPreview, QuizConfig, QuizData } from "@/lib/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const uploadFilesMutation = useMutation({
    mutationFn: async (files: FileWithPreview[]) => {
      const formData = new FormData();
      
      files.forEach(fileWithPreview => {
        formData.append("files", fileWithPreview.file);
      });
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      // Update the files with server-generated IDs from the response
      const updatedFiles = files.map((file, index) => {
        // Ensure we have a corresponding server file
        if (data[index]) {
          return {
            ...file,
            id: data[index].id.toString() // Store the server-generated ID
          };
        }
        return file;
      });
      
      setFiles(updatedFiles);
      setCurrentStep(2);
    },
    onError: (err: Error) => {
      setError(err.message);
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  const generateQuizMutation = useMutation({
    mutationFn: async (config: QuizConfig) => {
      // We would normally send both file references and config
      const response = await apiRequest("POST", "/api/generate-quiz", {
        config,
        fileIds: files.map(f => f.id)
      });
      return response.json();
    },
    onSuccess: (data: QuizData) => {
      setQuizData(data);
      setCurrentStep(3);
    },
    onError: (err: Error) => {
      setError(err.message);
      toast({
        title: "Quiz Generation Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (uploadedFiles: FileWithPreview[]) => {
    setFiles(uploadedFiles);
    uploadFilesMutation.mutate(uploadedFiles);
  };

  const handleGenerateQuiz = (config: QuizConfig) => {
    setQuizConfig(config);
    generateQuizMutation.mutate(config);
  };

  const handleBackToUpload = () => {
    setCurrentStep(1);
  };

  const handleBackToConfiguration = () => {
    setCurrentStep(2);
  };

  const handleCreateNewQuiz = () => {
    setFiles([]);
    setQuizConfig(null);
    setQuizData(null);
    setCurrentStep(1);
  };

  const handleTryAgain = () => {
    setError(null);
    setCurrentStep(1);
  };

  const isLoading = uploadFilesMutation.isPending || generateQuizMutation.isPending;

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Generate Quizzes from Your Content</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your PDFs, images, or videos, and QuizGen will automatically extract the content 
            and generate customizable quizzes and exams.
          </p>
        </section>
        
        <StepIndicator currentStep={currentStep} />
        
        {currentStep === 1 && !isLoading && !error && (
          <FileUpload onContinue={handleFileUpload} />
        )}
        
        {currentStep === 2 && !isLoading && !error && (
          <ConfigureQuiz 
            files={files} 
            onBack={handleBackToUpload} 
            onGenerate={handleGenerateQuiz} 
          />
        )}
        
        {isLoading && (
          <ProcessingIndicator 
            step={currentStep === 1 ? "Uploading Files" : "Generating Quiz"}
          />
        )}
        
        {currentStep === 3 && quizData && !error && (
          <QuizResults 
            quizData={quizData}
            onEditConfiguration={handleBackToConfiguration}
            onCreateNew={handleCreateNewQuiz}
          />
        )}
        
        {error && (
          <ErrorMessage 
            message={error} 
            onTryAgain={handleTryAgain}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
