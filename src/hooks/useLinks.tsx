import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { LinkType, LinksConfig } from '../types/link';

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
    [LinkType.SCHEDULE_TO_EDGEGROUP]: true,
    [LinkType.SCHEDULE_TO_EDGESTACK]: true,
    [LinkType.EDGESTACK_TO_EDGEGROUP]: true,
    [LinkType.EDGEGROUP_TO_ENDPOINT]: true,
    [LinkType.EDGEGROUP_TO_TAG]: true,
    [LinkType.TAG_TO_ENDPOINT]: true,
    [LinkType.TAG_TO_ENDPOINTGROUP]: true,
    [LinkType.ENDPOINTGROUP_TO_ENDPOINT]: true,
    [LinkType.SCHEDULE_TO_CONTAINER]: true,
    [LinkType.EDGESTACK_TO_CONTAINER]: true,
    [LinkType.CONTAINER_TO_ENDPOINT]: true,
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
