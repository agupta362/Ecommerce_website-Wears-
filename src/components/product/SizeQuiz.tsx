import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface SizeQuizProps {
  onSizeRecommended: (size: string) => void;
}

type Step = 'height' | 'weight' | 'result';

interface Answers {
  height: string;
  weight: string;
}

// Size matrix based on user requirements
const SIZE_MATRIX: Record<string, Record<string, string>> = {
  // 4'9" - 5'4" (145-163 cm)
  'short': {
    '50-60': 'M',
    '60-65': 'L',
    '65-70': 'XL',
    '70-80': 'XXL',
    '80+': 'XXL',
  },
  // 5'5" - 5'8" (165-173 cm)
  'medium': {
    '50-60': 'M',
    '55-65': 'L',
    '65-70': 'XL',
    '70-80': 'XXL',
    '80+': 'XXL',
  },
  // 5'9" - 6'0" (175-183 cm)
  'tall': {
    '50-60': 'L',
    '60-65': 'L',
    '65-70': 'XL',
    '70-80': 'XL',
    '80+': 'XXXL',
  },
  // 6'1" - 6'4" (185-193 cm)
  'very_tall': {
    '50-60': 'XL',
    '60-65': 'XL',
    '65-70': 'XXL',
    '70-80': 'XXL',
    '80+': 'XXXL',
  },
};

const HEIGHT_OPTIONS = [
  { value: 'short', label: "4'9\" - 5'4\"", sublabel: '145-163 cm' },
  { value: 'medium', label: "5'5\" - 5'8\"", sublabel: '165-173 cm' },
  { value: 'tall', label: "5'9\" - 6'0\"", sublabel: '175-183 cm' },
  { value: 'very_tall', label: "6'1\" - 6'4\"", sublabel: '185-193 cm' },
];

const WEIGHT_OPTIONS: Record<string, { value: string; label: string; sublabel: string }[]> = {
  'short': [
    { value: '50-60', label: '50-60 kg', sublabel: '110-132 lbs' },
    { value: '60-65', label: '60-65 kg', sublabel: '132-143 lbs' },
    { value: '65-70', label: '65-70 kg', sublabel: '143-154 lbs' },
    { value: '70-80', label: '70-80 kg', sublabel: '154-176 lbs' },
    { value: '80+', label: '80+ kg', sublabel: '176+ lbs' },
  ],
  'medium': [
    { value: '50-60', label: '50-60 kg', sublabel: '110-132 lbs' },
    { value: '55-65', label: '55-65 kg', sublabel: '121-143 lbs' },
    { value: '65-70', label: '65-70 kg', sublabel: '143-154 lbs' },
    { value: '70-80', label: '70-80 kg', sublabel: '154-176 lbs' },
    { value: '80+', label: '80+ kg', sublabel: '176+ lbs' },
  ],
  'tall': [
    { value: '50-60', label: '50-60 kg', sublabel: '110-132 lbs' },
    { value: '60-65', label: '60-65 kg', sublabel: '132-143 lbs' },
    { value: '65-70', label: '65-70 kg', sublabel: '143-154 lbs' },
    { value: '70-80', label: '70-80 kg', sublabel: '154-176 lbs' },
    { value: '80+', label: '80+ kg', sublabel: '176+ lbs' },
  ],
  'very_tall': [
    { value: '50-60', label: '50-60 kg', sublabel: '110-132 lbs' },
    { value: '60-65', label: '60-65 kg', sublabel: '132-143 lbs' },
    { value: '65-70', label: '65-70 kg', sublabel: '143-154 lbs' },
    { value: '70-80', label: '70-80 kg', sublabel: '154-176 lbs' },
    { value: '80+', label: '80+ kg', sublabel: '176+ lbs' },
  ],
};

const SizeQuiz = ({ onSizeRecommended }: SizeQuizProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('height');
  const [answers, setAnswers] = useState<Answers>({
    height: '',
    weight: '',
  });

  const calculateSize = (): string => {
    const { height, weight } = answers;
    if (!height || !weight) return 'M';
    return SIZE_MATRIX[height]?.[weight] || 'L';
  };

  const handleNext = () => {
    if (step === 'height') setStep('weight');
    else if (step === 'weight') setStep('result');
  };

  const handleReset = () => {
    setStep('height');
    setAnswers({ height: '', weight: '' });
  };

  const handleApplySize = () => {
    const recommendedSize = calculateSize();
    onSizeRecommended(recommendedSize);
    setIsOpen(false);
    handleReset();
  };

  const canProceed = () => {
    if (step === 'height') return answers.height !== '';
    if (step === 'weight') return answers.weight !== '';
    return true;
  };

  const currentWeightOptions = answers.height ? WEIGHT_OPTIONS[answers.height] : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) handleReset();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          Find My Size
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl uppercase tracking-wider flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Size Finder
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['height', 'weight', 'result'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s 
                      ? 'bg-primary text-primary-foreground' 
                      : ['height', 'weight', 'result'].indexOf(step) > i
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-8 h-0.5 ${['height', 'weight', 'result'].indexOf(step) > i ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Height Step */}
          {step === 'height' && (
            <div className="space-y-4">
              <h3 className="font-medium text-center">What's your height?</h3>
              <RadioGroup
                value={answers.height}
                onValueChange={(value) => setAnswers({ ...answers, height: value, weight: '' })}
                className="grid grid-cols-2 gap-3"
              >
                {HEIGHT_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers.height === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Weight Step */}
          {step === 'weight' && (
            <div className="space-y-4">
              <h3 className="font-medium text-center">What's your weight?</h3>
              <RadioGroup
                value={answers.weight}
                onValueChange={(value) => setAnswers({ ...answers, weight: value })}
                className="space-y-3"
              >
                {currentWeightOptions.map((option) => (
                  <Label
                    key={option.value}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers.weight === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.sublabel}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-medium">Your Recommended Size</h3>
              <div className="text-5xl font-display font-bold text-primary">
                {calculateSize()}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your height and weight, we recommend size {calculateSize()} for the best fit.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {step !== 'result' ? (
            <>
              {step !== 'height' && (
                <Button variant="outline" onClick={() => setStep('height')}>
                  Back
                </Button>
              )}
              <Button 
                className="flex-1 btn-hero" 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Start Over
              </Button>
              <Button className="flex-1 btn-hero" onClick={handleApplySize}>
                Select Size {calculateSize()}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeQuiz;
