import { Label } from '@/components/ui/label';
import { Switch as SwitchUI } from '@/components/ui/switch';
import { cn } from '@/utils/style';

interface SwitchProps {
  name?: string;
  label?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  isLeftLabel?: boolean;
  isRightLabel?: boolean;
}

const Switch = ({
  name,
  label,
  checked,
  onCheckedChange,
  className,
  isLeftLabel,
  isRightLabel,
}: SwitchProps) => {
  return (
    <div className={cn('flex space-x-2 items-center', className)}>
      {label && isLeftLabel && <Label htmlFor={name}>{label}</Label>}
      <SwitchUI id={name} checked={checked} onCheckedChange={onCheckedChange} />
      {label && isRightLabel && <Label htmlFor={name}>{label}</Label>}
    </div>
  );
};

export default Switch;
