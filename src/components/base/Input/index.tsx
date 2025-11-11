import { Label } from '@/components/ui/label';
import { Input as InputUI } from '@/components/ui/input';
import React, { useState } from 'react';
import type { ControllerRenderProps, FieldError, FieldValues, Path } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps<T extends FieldValues = FieldValues> extends Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue'> {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
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

const Input = <T extends FieldValues = FieldValues>(props: InputProps<T>) => {
  const {
    label,
    placeholder,
    defaultValue,
    name,
    required,
    disabled,
    type = 'text',
    className,
    field,
    fieldState,
    onChange,
    onBlur,
    ...restProps
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  // Use field props if available (React Hook Form mode), otherwise use regular props
  const inputProps = field ? {
    name: field.name,
    value: field.value as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange(e);
      onChange?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      field.onBlur();
      onBlur?.(e);
    },
    disabled: disabled || field.disabled,
  } : {
    name,
    defaultValue,
    onChange,
    onBlur,
    disabled,
  };

  const hasError = fieldState?.error;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          {label}
        </Label>
      )}
      <div className="relative">
        <InputUI
          id={name}
          type={isPasswordField && showPassword ? 'text' : type}
          placeholder={placeholder}
          required={required}
          className={className}
          aria-invalid={hasError ? 'true' : 'false'}
          {...inputProps}
          {...restProps}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {hasError && (
        <span className="text-sm text-red-500">{hasError.message}</span>
      )}
    </div>
  );
};

export default Input as <T extends FieldValues = FieldValues>(props: InputProps<T>) => React.JSX.Element;
