import { Label } from "@/components/atoms/Label";
import { TextInput } from "@/components/atoms/TextInput";
import styles from "./SearchBox.module.scss";

type SearchBoxProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBox({
  id,
  label,
  value,
  onChange,
  placeholder,
}: SearchBoxProps) {
  return (
    <div className={styles.field}>
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
