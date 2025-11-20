import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/utils/style';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-gray-300 dark:border-zinc-600 text-accent dark:text-accent bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus-visible:border-accent dark:focus-visible:border-accent focus-visible:ring-accent/20 dark:focus-visible:ring-amber-400/30 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/30 aria-invalid:border-red-500 dark:aria-invalid:border-red-400 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-all duration-300 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-700',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-accent dark:fill-accent absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 transition-colors duration-300" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
