import { Card, CardContent } from "@/components/ui/card";

interface ProcessingIndicatorProps {
  step?: string;
}

export default function ProcessingIndicator({ step = "Analyzing Content" }: ProcessingIndicatorProps) {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing Your Content</h2>
            <p className="text-gray-600">
              We're analyzing your files and generating questions. This might take a few moments.
            </p>
            <div className="w-full max-w-md mt-6">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-primary/20">
                  <div className="w-1/3 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary animate-pulse"></div>
                </div>
                <div className="text-right text-sm text-gray-500">{step}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
