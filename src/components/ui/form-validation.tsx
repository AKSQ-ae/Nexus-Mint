// TODO: Ensure all forms use FormValidationSummary and ValidatedInput for consistent error display and accessibility.
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validators = {
  required: (value: any, fieldName: string): ValidationResult => {
    const isValid = value !== null && value !== undefined && value !== '';
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} is required`]
    };
  },

  minAmount: (value: number, min: number, currency = 'USD'): ValidationResult => {
    const isValid = value >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Minimum amount is ${currency === 'USD' ? '$' : 'AED '}${min.toLocaleString()}`]
    };
  },

  maxAmount: (value: number, max: number, currency = 'USD'): ValidationResult => {
    const isValid = value <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Maximum amount is ${currency === 'USD' ? '$' : 'AED '}${max.toLocaleString()}`]
    };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid email address']
    };
  },

  wallet: (value: string): ValidationResult => {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    const isValid = walletRegex.test(value);
    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid wallet address (0x...)']
    };
  },

  phoneNumber: (value: string): ValidationResult => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    const isValid = phoneRegex.test(value);
    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid phone number']
    };
  }
};

interface ValidatedInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  validators: ((value: string | number) => ValidationResult)[];
  type?: 'text' | 'email' | 'number' | 'tel';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  hint?: string;
}

export function ValidatedInput({ 
  label, 
  value, 
  onChange, 
  validators: inputValidators,
  type = 'text',
  placeholder,
  disabled,
  required,
  className,
  hint
}: ValidatedInputProps) {
  const [touched, setTouched] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const validate = React.useCallback((val: any) => {
    const allErrors: string[] = [];
    
    for (const validator of inputValidators) {
      const result = validator(val);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
    
    setErrors(allErrors);
    return allErrors.length === 0;
  }, [inputValidators]);

  React.useEffect(() => {
    if (touched) {
      validate(value);
    }
  }, [value, touched, validate]);

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  const hasErrors = touched && errors.length > 0;
  const isValid = touched && errors.length === 0 && value !== '';

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={label.toLowerCase().replace(/\s+/g, '-')}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            hasErrors && 'border-red-500 focus:border-red-500',
            isValid && 'border-green-500 focus:border-green-500'
          )}
        />
        
        {isValid && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>

      {hint && !hasErrors && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}

      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

interface FormValidationSummaryProps {
  errors: string[];
  className?: string;
}

export function FormValidationSummary({ errors, className }: FormValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Please fix the following errors:</div>
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}