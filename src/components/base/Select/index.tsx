import { Label } from '@/components/ui/label';
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';
import type { ControllerRenderProps, FieldError, FieldValues, Path } from 'react-hook-form';

interface SelectProps<T extends FieldValues = FieldValues> {
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  // React Hook Form props
  field?: ControllerRenderProps<T, Path<T>>;
  fieldState?: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
  };
}

const Select = <T extends FieldValues = FieldValues>(props: SelectProps<T>) => {
  const {
    options,
    defaultValue,
    placeholder = 'Select an option',
    label,
    disabled,
    required,
    name,
    className,
    onValueChange,
    field,
    fieldState,
  } = props;

  // Use field props if available (React Hook Form mode), otherwise use regular props
  const selectProps = field
    ? {
        name: field.name,
        value: field.value as string,
        onValueChange: (value: string) => {
          field.onChange(value);
          field.onBlur();
          onValueChange?.(value);
        },
        disabled: disabled || field.disabled,
      }
    : {
        name,
        defaultValue,
        onValueChange: onValueChange || (() => {}),
        disabled,
      };

  const hasError = fieldState?.error;

  return (
    <>
      {label && <Label>{label}</Label>}
      <SelectUI required={required} {...selectProps}>
        <SelectTrigger
          className={`${className || 'w-[180px]'} ${hasError ? 'border-red-500' : ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectUI>
    </>
  );
};

export default Select as <T extends FieldValues = FieldValues>(
  props: SelectProps<T>
) => React.JSX.Element;
