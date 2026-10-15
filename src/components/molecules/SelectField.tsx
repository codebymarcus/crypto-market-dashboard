import { Label } from "@/components/atoms/Label";
import { Select } from "@/components/atoms/Select";
import styles from "./SelectField.module.scss";

type SelectFieldProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <div className={styles.field}>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={value} options={options} onChange={onChange} />
    </div>
  );
}
