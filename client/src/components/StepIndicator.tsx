interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 3 }: StepIndicatorProps) {
  const progressPercentage = `${(currentStep / totalSteps) * 100}%`;
  
  const steps = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Configure" },
    { number: 3, label: "Generate" }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: progressPercentage }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-3 text-sm font-medium">
        {steps.map((step) => (
          <div 
            key={step.number}
            className={step.number <= currentStep ? "text-primary font-semibold" : "text-gray-500"}
          >
            <div className="flex flex-col items-center">
              <span 
                className={`flex h-8 w-8 items-center justify-center rounded-full mb-1 ${
                  step.number <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.number}
              </span>
              <span>{step.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
