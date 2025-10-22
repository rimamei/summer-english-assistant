import { Label } from '@/components/ui/label';
import { Switch as SwitchUI } from '@/components/ui/switch';

interface SwitchProps {
  name?: string;
  label?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = ({ name, label, checked, onCheckedChange }: SwitchProps) => {
  return (
    <div>
      {label && <Label htmlFor={name}>{label}</Label>}
      <SwitchUI id={name} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export default Switch;
