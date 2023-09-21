import { ChangeEvent } from 'react';

type Props = {
  id: string;
  onChange: (input: string) => void;
  className?: string;
};

export function Upload({ onChange, id, className }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
    }
  };
  return (
    <input
      className={className}
      type='file'
      id={id}
      onChange={(e) => handleChange(e)}
    />
  );
}
