// TODO: Ensure all edge functions use shared validation and return consistent error structures.
/**
 * Validation utilities for edge functions
 */

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'uuid' | 'number' | 'positive' | 'range';
  min?: number;
  max?: number;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateInput = (data: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];
    const fieldName = rule.field;

    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          errors.push(rule.message || `${fieldName} is required`);
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(rule.message || `${fieldName} must be a valid email`);
        }
        break;

      case 'uuid':
        if (value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
          errors.push(rule.message || `${fieldName} must be a valid UUID`);
        }
        break;

      case 'number':
        if (value !== undefined && isNaN(Number(value))) {
          errors.push(rule.message || `${fieldName} must be a number`);
        }
        break;

      case 'positive':
        if (value !== undefined && Number(value) <= 0) {
          errors.push(rule.message || `${fieldName} must be positive`);
        }
        break;

      case 'range':
        if (value !== undefined) {
          const num = Number(value);
          if (rule.min !== undefined && num < rule.min) {
            errors.push(rule.message || `${fieldName} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(rule.message || `${fieldName} must be at most ${rule.max}`);
          }
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePropertyId = (propertyId: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(propertyId) && propertyId.length >= 3 && propertyId.length <= 50;
};

export const validateInvestmentAmount = (amount: number, minInvestment: number = 100): ValidationResult => {
  const errors: string[] = [];

  if (amount <= 0) {
    errors.push('Investment amount must be positive');
  }

  if (amount < minInvestment) {
    errors.push(`Minimum investment is ${minInvestment}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTokenAmount = (tokenAmount: number, availableSupply: number): ValidationResult => {
  const errors: string[] = [];

  if (tokenAmount <= 0) {
    errors.push('Token amount must be positive');
  }

  if (tokenAmount > availableSupply) {
    errors.push(`Insufficient tokens available. Available: ${availableSupply}, Requested: ${tokenAmount}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};