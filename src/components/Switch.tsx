import { Switch as HeadlessSwitch } from '@headlessui/react';

type SwitchProps = {
  label?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};
export function Switch({ label, enabled, onChange }: SwitchProps) {
  return (
    <div className='flex gap-2'>
      {label && <span>{label}</span>}
      <HeadlessSwitch
        checked={enabled}
        onChange={onChange}
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-400'
        } relative inline-flex h-5 w-10 items-center rounded-full`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-3 w-3 transform rounded-full bg-white transition`}
        />
      </HeadlessSwitch>
    </div>
  );
}
