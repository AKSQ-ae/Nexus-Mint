import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });
});