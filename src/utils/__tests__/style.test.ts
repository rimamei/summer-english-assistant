import { describe, it, expect } from 'vitest';
import { cn } from '../style';

describe('cn (className utility)', () => {
  describe('basic functionality', () => {
    it('should return empty string when no arguments provided', () => {
      expect(cn()).toBe('');
    });

    it('should return a single class name', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('should merge multiple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle multiple class names in a single string', () => {
      expect(cn('foo bar baz')).toBe('foo bar baz');
    });
  });

  describe('falsy values handling', () => {
    it('should filter out undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('should filter out null values', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar');
    });

    it('should filter out false values', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar');
    });

    it('should filter out empty strings', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar');
    });

    it('should handle all falsy values', () => {
      expect(cn('foo', undefined, null, false, '', 'bar')).toBe('foo bar');
    });

    it('should return empty string when all values are falsy', () => {
      expect(cn(undefined, null, false, '')).toBe('');
    });
  });

  describe('conditional classes (clsx functionality)', () => {
    it('should handle conditional classes with boolean', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    it('should filter out false conditions', () => {
      const isActive = false;
      expect(cn('base', isActive && 'active')).toBe('base');
    });

    it('should handle object syntax for conditional classes', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle mixed object and string syntax', () => {
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });

    it('should handle nested conditions', () => {
      const isActive = true;
      const isDisabled = false;
      expect(
        cn(
          'base',
          isActive && 'active',
          isDisabled && 'disabled',
          !isDisabled && 'enabled'
        )
      ).toBe('base active enabled');
    });
  });

  describe('array handling', () => {
    it('should handle array of class names', () => {
      expect(cn(['foo', 'bar', 'baz'])).toBe('foo bar baz');
    });

    it('should handle nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
    });

    it('should handle array with conditional values', () => {
      expect(cn(['foo', false, 'bar', undefined, 'baz'])).toBe('foo bar baz');
    });

    it('should handle array with objects', () => {
      expect(cn(['foo', { bar: true, baz: false }])).toBe('foo bar');
    });
  });

  describe('Tailwind CSS class conflicts (twMerge functionality)', () => {
    it('should merge conflicting padding classes', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    it('should merge conflicting margin classes', () => {
      expect(cn('m-2', 'm-4')).toBe('m-4');
    });

    it('should merge conflicting text size classes', () => {
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('should merge conflicting background color classes', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should merge conflicting width classes', () => {
      expect(cn('w-full', 'w-1/2')).toBe('w-1/2');
    });

    it('should merge conflicting height classes', () => {
      expect(cn('h-screen', 'h-full')).toBe('h-full');
    });

    it('should keep non-conflicting classes', () => {
      expect(cn('p-4', 'mt-2', 'text-lg')).toBe('p-4 mt-2 text-lg');
    });

    it('should merge multiple conflicting classes with non-conflicting ones', () => {
      expect(cn('p-4', 'p-8', 'mt-2', 'text-lg', 'text-sm')).toBe('p-8 mt-2 text-sm');
    });

    it('should handle directional conflicts correctly', () => {
      expect(cn('px-4', 'px-8')).toBe('px-8');
      expect(cn('py-2', 'py-4')).toBe('py-4');
      expect(cn('pt-4', 'pt-8')).toBe('pt-8');
      expect(cn('pr-4', 'pr-8')).toBe('pr-8');
      expect(cn('pb-4', 'pb-8')).toBe('pb-8');
      expect(cn('pl-4', 'pl-8')).toBe('pl-8');
    });

    it('should not remove non-conflicting directional classes', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
      expect(cn('pt-4', 'pb-2')).toBe('pt-4 pb-2');
    });
  });

  describe('complex real-world scenarios', () => {
    it('should handle button variants', () => {
      const isPrimary = true;
      const isDisabled = false;

      const result = cn(
        'px-4 py-2 rounded',
        isPrimary ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black',
        isDisabled && 'opacity-50 cursor-not-allowed'
      );

      expect(result).toBe('px-4 py-2 rounded bg-blue-500 text-white');
    });

    it('should handle component with base styles and overrides', () => {
      const baseStyles = 'flex items-center justify-center p-4 bg-white';
      const customStyles = 'p-8 bg-blue-500';

      expect(cn(baseStyles, customStyles)).toBe(
        'flex items-center justify-center p-8 bg-blue-500'
      );
    });

    it('should handle responsive classes with conflicts', () => {
      expect(cn('text-sm md:text-base', 'text-lg')).toBe('md:text-base text-lg');
    });

    it('should handle hover states with conflicts', () => {
      expect(cn('bg-blue-500 hover:bg-blue-600', 'bg-red-500')).toBe(
        'hover:bg-blue-600 bg-red-500'
      );
    });

    it('should handle dark mode with conflicts', () => {
      expect(cn('bg-white dark:bg-gray-900', 'bg-blue-500')).toBe(
        'dark:bg-gray-900 bg-blue-500'
      );
    });

    it('should handle complex card component', () => {
      const isHovered = true;
      const hasError = false;

      const result = cn(
        'rounded-lg shadow-md p-6',
        'bg-white dark:bg-gray-800',
        'border border-gray-200',
        isHovered && 'shadow-lg',
        hasError && 'border-red-500',
        { 'cursor-pointer': !hasError }
      );

      // twMerge merges shadow-md and shadow-lg, keeping the last one
      expect(result).toBe(
        'rounded-lg p-6 bg-white dark:bg-gray-800 border border-gray-200 shadow-lg cursor-pointer'
      );
    });

    it('should handle form input with states', () => {
      const isFocused = false;
      const hasError = true;
      const isDisabled = false;

      const result = cn(
        'px-3 py-2 border rounded',
        'focus:outline-none focus:ring-2',
        {
          'border-gray-300': !hasError && !isFocused,
          'border-red-500': hasError,
          'focus:border-blue-500': !hasError,
          'bg-gray-100': isDisabled,
          'bg-white': !isDisabled,
        }
      );

      expect(result).toBe(
        'px-3 py-2 border rounded focus:outline-none focus:ring-2 border-red-500 bg-white'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle only whitespace', () => {
      expect(cn('   ')).toBe('');
    });

    it('should handle class names with extra spaces', () => {
      expect(cn('foo  bar   baz')).toBe('foo bar baz');
    });

    it('should handle duplicate class names', () => {
      // Note: cn doesn't deduplicate non-Tailwind classes
      // This is expected behavior from clsx + twMerge
      expect(cn('foo', 'bar', 'foo')).toBe('foo bar foo');
    });

    it('should handle class names with special characters', () => {
      expect(cn('before:content-[""]', 'after:content-[""]')).toBe(
        'before:content-[""] after:content-[""]'
      );
    });

    it('should handle empty array', () => {
      expect(cn([])).toBe('');
    });

    it('should handle empty object', () => {
      expect(cn({})).toBe('');
    });

    it('should handle mixed empty values', () => {
      expect(cn('', [], {}, null, undefined, false)).toBe('');
    });
  });

  describe('performance and type safety', () => {
    it('should handle large number of classes', () => {
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...classes);

      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
    });

    it('should handle deeply nested arrays', () => {
      const result = cn(['foo', ['bar', ['baz', ['qux']]]]);
      expect(result).toBe('foo bar baz qux');
    });

    it('should handle complex object with multiple conditions', () => {
      const result = cn({
        foo: true,
        bar: false,
        baz: 1 > 0,
        qux: null,
        quux: undefined,
        corge: '',
      });

      expect(result).toBe('foo baz');
    });
  });

  describe('integration with common patterns', () => {
    it('should work with className prop pattern', () => {
      const baseClassName = 'button';
      const userClassName = 'custom-button bg-red-500';

      expect(cn(baseClassName, userClassName)).toBe('button custom-button bg-red-500');
    });

    it('should work with variants pattern', () => {
      const variants = {
        size: {
          sm: 'text-sm p-2',
          md: 'text-base p-4',
          lg: 'text-lg p-6',
        },
        variant: {
          primary: 'bg-blue-500 text-white',
          secondary: 'bg-gray-500 text-white',
        },
      };

      const size = 'md';
      const variant = 'primary';

      const result = cn(variants.size[size], variants.variant[variant]);
      expect(result).toBe('text-base p-4 bg-blue-500 text-white');
    });

    it('should work with conditional variants and overrides', () => {
      const baseClass = 'rounded border';
      const size = 'lg' as 'sm' | 'md' | 'lg';
      const isDisabled = false;
      const className = 'border-2 border-red-500';

      const result = cn(
        baseClass,
        size === 'sm' && 'p-2 text-sm',
        size === 'md' && 'p-4 text-base',
        size === 'lg' && 'p-6 text-lg',
        isDisabled && 'opacity-50',
        className
      );

      // border and border-2 conflict, so border is removed
      expect(result).toBe('rounded p-6 text-lg border-2 border-red-500');
    });
  });
});
