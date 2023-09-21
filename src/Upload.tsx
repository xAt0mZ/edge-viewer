import { ChangeEvent } from 'react';

type Props = {
  id: string;
  onChange: (input: string) => void;
};

export function Upload({ onChange, id }: Props) {
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
    <div className='relative'>
      <input type='file' id={id} onChange={(e) => handleChange(e)} />
    </div>
  );
}
