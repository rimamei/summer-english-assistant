import React from 'react';
import {
  Controller,
  type Control,
  type FieldError,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import {
  Field,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from '@/components/ui/field';

type FieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends React.ComponentType<any> = React.ComponentType<any>
> = Omit<React.ComponentProps<T>, ''> & {
  component: T;
  control?: Control<TFieldValues>;
  componentRef?: React.ComponentProps<T>['ref'];
  externalError?: string;
  fieldClassName?: string;
  disableDefaultOnChange?: boolean;
  positionError?: 'absolute';
  name: TName;
  renderError?: (
    error?: FieldError | { [key: string]: FieldError },
    value?: FieldPathValue<TFieldValues, TName>,
    externalError?: string
  ) => React.JSX.Element;
  shouldUnregister?: boolean;
  label?: string;
};

function ControlledField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends React.ComponentType<any> = React.ComponentType<any>
>({
  component,
  name,
  shouldUnregister = false,
  positionError,
  control,
  renderError,
  externalError,
  fieldClassName,
  disableDefaultOnChange = false,
  label,
  ...restProps
}: FieldProps<TFieldValues, TName, T>) {
  // Throw error if not provided name or component, or name & component is falsy
  if (!name || !component) {
    throw new Error(
      'ControlledField component requires "name" and "component" props.'
    );
  }

  const generateError = (
    error?: FieldError | { [key: string]: FieldError }
  ): string | undefined => {
    if (!error) return externalError;

    // Handle standard FieldError with message
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    // Handle nested errors (e.g., for select fields with {value: {message}, label: {message}})
    const nestedError = error as { [key: string]: FieldError };
    if (nestedError.value?.message) {
      return nestedError.value.message as string;
    }
    if (nestedError.label?.message) {
      return nestedError.label.message as string;
    }

    return externalError;
  };
  return (
    <Controller
      control={control}
      name={name}
      shouldUnregister={shouldUnregister}
      render={({
        field,
        fieldState,
      }) => {
        const { invalid, error } = fieldState;
        const { onChange, onBlur } = field;
        return (
          <Field
            className={cn(
              'field w-full',
              positionError && 'relative',
              fieldClassName
            )}
          >
            {label && <FieldLabel htmlFor={name + 'Id'}>{label}</FieldLabel>}
            {React.createElement(component, {
              isError: (error && invalid) || externalError,
              ...restProps,
              field,
              fieldState,
              onChange: (e: React.ChangeEvent | FieldPathValue<TFieldValues, TName>) => {
                if (!disableDefaultOnChange) {
                  onChange(e);
                }
                restProps?.onChange?.(e);
              },
              onBlur: (e: React.FocusEvent) => {
                onBlur();
                restProps?.onBlur?.(e);
              },
            })}
          {(externalError || (error && invalid)) &&
            (renderError?.(error, field.value, externalError) || (
              <FieldErrorComponent>{generateError(error)}</FieldErrorComponent>
            ))}
        </Field>
      );
      }}
    />
  );
}

export default ControlledField;