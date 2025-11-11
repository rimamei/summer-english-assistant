import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import React, { useEffect } from 'react';

type TChildren = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>['children'];
interface Props<TValues extends FieldValues = FieldValues> {
  children: TChildren | ((form: UseFormReturn<TValues>) => TChildren);
  className?: string;
  enableReinitialize?: boolean;
  form?: UseFormReturn<TValues>;
  initialValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => void;
  options?: Omit<UseFormProps<TValues>, 'defaultValues' | 'resolver'>;
  style?: React.CSSProperties;
  validation?: Resolver<TValues>;
}

function Form<TValues extends FieldValues = FieldValues>({
  children,
  form: customForm,
  onSubmit,
  initialValues,
  validation,
  options,
  className = '',
  style,
  enableReinitialize = true,
}: Props<TValues>) {
  const defaultForm = useForm<TValues>({
    defaultValues: initialValues,
    resolver: validation,
    mode: 'all',
    ...options,
  });
  const form = customForm ?? defaultForm;

  const child = typeof children === 'function' ? children(form) : children;

  useEffect(() => {
    if (enableReinitialize && !form.formState.isDirty) {
      form.reset(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, enableReinitialize]);

  return (
    <FormProvider {...form}>
      <form
        style={style}
        className={className}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {child}
      </form>
    </FormProvider>
  );
}

export default Form;
