
import * as React from "react"
import { Controller } from "react-hook-form"
import type { FieldValues, UseFormReturn, ControllerRenderProps, ControllerFieldState, Path } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

interface ControlledFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  htmlId: string;
  description?: string;
  component: (field: ControllerRenderProps<T, Path<T>>, fieldState: ControllerFieldState) => React.ReactNode;
  className?: string;
}

function ControlledField<T extends FieldValues>({
  form,
  name,
  label,
  htmlId,
  description,
  component,
  className,
}: ControlledFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field className={className} data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={htmlId}>{label}</FieldLabel>}
          {component(field, fieldState)}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default ControlledField;