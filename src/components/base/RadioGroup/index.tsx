import { Label } from '@/components/ui/label';
import {
  RadioGroup as RadioGroupUI,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import React from 'react';
import type { ControllerRenderProps, FieldError, FieldValues, Path } from 'react-hook-form';

interface RadioGroupProps<T extends FieldValues = FieldValues> {
  options: { value: string; label: string; disabled?: boolean }[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  // React Hook Form props
  field?: ControllerRenderProps<T, Path<T>>;
  fieldState?: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
  };
}

const RadioGroup = <T extends FieldValues = FieldValues>({
  options,
  defaultValue,
  onValueChange,
  className,
  field,
  fieldState,
}: RadioGroupProps<T>) => {
  // Use field props if available (React Hook Form mode), otherwise use regular props
  const radioGroupProps = field ? {
    value: field.value as string,
    onValueChange: (value: string) => {
      field.onChange(value);
      field.onBlur();
      onValueChange?.(value);
    },
  } : {
    defaultValue,
    onValueChange: onValueChange || (() => {}),
  };

  const hasError = fieldState?.error;

  return (
    <RadioGroupUI
      className={`${className} ${hasError ? 'border-red-500' : ''}`}
      {...radioGroupProps}
    >
      {options.map((option) => {
        const isDisabled = option.disabled || false;
        return (
          <div 
            className={`flex items-center space-x-2 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`} 
            key={option.value}
          >
            <RadioGroupItem
              value={option.value}
              id={option.value}
              disabled={isDisabled}
            />
            <Label 
              htmlFor={option.value}
              className={isDisabled ? 'text-gray-400 cursor-not-allowed' : ''}
            >
              {option.label}
            </Label>
          </div>
        );
      })}
    </RadioGroupUI>
  );
};

export default RadioGroup as <T extends FieldValues = FieldValues>(props: RadioGroupProps<T>) => React.JSX.Element;
