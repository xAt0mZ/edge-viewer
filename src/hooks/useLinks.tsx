import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { LinksConfig } from '../types/link';

type LinksContext = {
  linksConfig: LinksConfig;
  setLinksConfig(opts: Partial<LinksConfig>): void;
};

const Context = createContext<LinksContext | null>(null);

export function useLinksConfig() {
  const options = useContext(Context);
  if (!options) {
    throw new Error('use inside provider');
  }
  return options;
}

export function LinksProvider({ children }: PropsWithChildren) {
  const [linksConfig, setLinksConfig] = useState<LinksConfig>({
    'container-to-endpoint': true,
    'edgegroup-to-endpoint': true,
    'edgestack-to-edgegroup': true,
    'schedule-to-container': true,
    'schedule-to-edgestack': true,
    'schedule-to-edgegroup': true,
    'edgegroup-to-tag': true,
    'tag-to-endpoint': true,
    'tag-to-endpointgroup': true,
    'endpointgroup-to-endpoint': true,
  });
  return (
    <Context.Provider
      value={{
        linksConfig,
        setLinksConfig: (opts) => setLinksConfig((v) => ({ ...v, ...opts })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
