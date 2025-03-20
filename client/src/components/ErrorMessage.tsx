import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorMessageProps {
  message: string;
  onTryAgain: () => void;
}

export default function ErrorMessage({ message, onTryAgain }: ErrorMessageProps) {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Error Processing Your Content</h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="mt-2">
                <Button onClick={onTryAgain}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
