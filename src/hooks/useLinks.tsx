import { PropsWithChildren, createContext, useContext, useState } from 'react';

/*
endpoint
container
schedule
edgegroups
edgestack
edgegroups
tag
envgroup

container -> endpoint

schedule -> edgestack

edgestack -> edgegroup

edgegroup -> endpoint (static)

edge group -> tag (dynamic)
tag -> endpoint (level 1)
tag -> envgroup (level 2.1)
envgroup -> endpoint (level 2.2)

*/
export type LinkType =
  | 'container-to-endpoint'
  | 'schedule-to-container'
  | 'schedule-to-edgestack'
  | 'edgestack-to-edgegroup'
  | 'edgegroup-to-endpoint';

type Links = {
  [v in LinkType]: boolean;
};

type LinksContext = {
  links: Links;
  setLinks(opts: Partial<Links>): void;
};

const Context = createContext<LinksContext | null>(null);

export function useLinks() {
  const options = useContext(Context);
  if (!options) {
    throw new Error('use inside provider');
  }
  return options;
}

export function LinksProvider({ children }: PropsWithChildren) {
  const [links, setLinks] = useState<Links>({
    'container-to-endpoint': true,
    'edgegroup-to-endpoint': true,
    'edgestack-to-edgegroup': true,
    'schedule-to-container': true,
    'schedule-to-edgestack': true,
  });
  return (
    <Context.Provider
      value={{
        links,
        setLinks: (opts) => setLinks((v) => ({ ...v, ...opts })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
