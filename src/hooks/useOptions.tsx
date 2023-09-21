import { PropsWithChildren, createContext, useContext, useState } from 'react';

type Options = {
  use3d: boolean;
  showNames: boolean;
};

type OptionsContext = {
  options: Options;
  setOptions(opts: Partial<Options>): void;
};

const Context = createContext<OptionsContext | null>(null);

export function useOptions() {
  const options = useContext(Context);
  if (!options) {
    throw new Error('use inside provider');
  }
  return options;
}

export function OptionsProvider({ children }: PropsWithChildren) {
  const [options, setOptions] = useState<Options>({
    use3d: false,
    showNames: false,
  });
  return (
    <Context.Provider
      value={{
        options,
        setOptions: (opts) => setOptions((v) => ({ ...v, ...opts })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
