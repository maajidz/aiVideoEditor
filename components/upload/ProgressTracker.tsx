import React from 'react';

interface ProgressStepProps {
  stepNumber: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ stepNumber, label, isActive, isCompleted }) => {
  let numberClasses = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-colors duration-300 ";
  let labelClasses = "text-xs font-medium transition-colors duration-300 ";

  if (isCompleted) {
    numberClasses += "bg-green-500 text-white";
    labelClasses += "text-slate-300";
  } else if (isActive) {
    numberClasses += "bg-primary text-white ring-4 ring-primary/30";
    labelClasses += "text-primary";
  } else {
    numberClasses += "bg-slate-700 text-slate-400";
    labelClasses += "text-slate-400";
  }

  return (
    <div className={`progress-step flex flex-col items-center ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className={numberClasses}>{isCompleted ? <i className="ri-check-line"></i> : stepNumber}</div>
      <span className={labelClasses}>{label}</span>
    </div>
  );
};

interface ProgressTrackerProps {
  currentStep: number; // 1-based index of the current active step
}

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Processing' },
  { number: 3, label: 'Enhancement' },
  { number: 4, label: 'Complete' },
];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep = 1 }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <ProgressStep
                stepNumber={step.number}
                label={step.label}
                isActive={currentStep === step.number}
                isCompleted={currentStep > step.number}
              />
              {index < steps.length - 1 && (
                <div className="progress-line flex-1 mx-2 h-0.5 bg-slate-700 relative overflow-hidden">
                  <div
                    className={`progress-line-active absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out`}
                    style={{ width: currentStep > step.number ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}; 