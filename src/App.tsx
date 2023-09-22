import { useCallback, useEffect, useState } from 'react';

import { generateLinks } from './utils/generateLinks';
import { Upload } from './components/Upload';
import { getContainersNodes } from './getters/containers';
import { getScheduleNodes } from './getters/schedules';
import { getEndpointsNodes } from './getters/endpoints';
import { getEdgeStacksNodes } from './getters/edgeStacks';
import { getEdgeGroupsNodes } from './getters/edgeGroups';

import { useOptions } from './hooks/useOptions';
import { useLinksConfig } from './hooks/useLinks';
import { getEndpointGroupsNodes } from './getters/endpointGroups';
import { getTagsNodes } from './getters/tags';
import { Nodes } from './types/node';
// import { GraphLink } from './types/link';
import { Json } from './types/json';
import { Graph, GraphData } from './Graph';

export function App() {
  const { linksConfig } = useLinksConfig();

  const [json, setJson] = useState<Json | undefined>(undefined);
  const [nodes, setNodes] = useState<Nodes | undefined>(undefined);
  // const [links, setLinks] = useState<GraphLink[] | undefined>(undefined);

  const [data, setData] = useState<GraphData>(undefined);

  useEffect(() => {
    if (!json) {
      return;
    }
    const endpoints = getEndpointsNodes(json);
    const containers = getContainersNodes(json, endpoints);
    const schedules = getScheduleNodes(json);
    const edgeStacks = getEdgeStacksNodes(json);
    const edgeGroups = getEdgeGroupsNodes(json);
    const endpointGroups = getEndpointGroupsNodes(json);
    const tags = getTagsNodes(json);

    const data: GraphData = {
      nodes: [
        ...endpoints,
        ...containers,
        ...schedules,
        ...edgeStacks,
        ...edgeGroups,
        ...endpointGroups,
        ...tags,
      ],
      links: [],
    };

    setData(data);
    setNodes({
      endpoints,
      containers,
      schedules,
      edgeStacks,
      edgeGroups,
      endpointGroups,
      tags,
    });
  }, [json]);

  const render = useCallback(() => {
    if (!json || !nodes || !data) {
      return;
    }

    const links = generateLinks(nodes, linksConfig);
    setData({ ...data, links });
  }, [json, nodes, data, linksConfig]);

  return (
    <div className='relative bg-black h-screen w-screen'>
      <div className='absolute top-2.5 left-2.5 bg-white z-50 rounded p-2'>
        <OptionsPanel
          data={data}
          json={json}
          render={render}
          setData={setData}
          setJson={setJson}
        />
        <LinkOptionsPanel />
      </div>
      {data && data.links.length && <Graph graphData={data} />}
    </div>
  );
}

type OptionsPanelProps = {
  json?: Json;
  setJson(v: Json): void;
  data: GraphData;
  setData(v: GraphData): void;
  render(): void;
};
function OptionsPanel({
  json,
  setJson,
  data,
  setData,
  render,
}: OptionsPanelProps) {
  const { options, setOptions } = useOptions();

  return (
    <div className='grid grid-cols-2 gap-2'>
      <Upload
        id='file-upload'
        className='col-span-2'
        onChange={(v) => setJson(JSON.parse(v))}
      />
      <button
        disabled={!json}
        className='rounded border border-black px-2 disabled:opacity-50'
        onClick={render}
      >
        Render
      </button>
      <button
        disabled={!json || !data}
        className='rounded border border-black px-2 disabled:opacity-50'
        onClick={() => setData({ nodes: data?.nodes || [], links: [] })}
      >
        Reset
      </button>
      <div className='flex gap-2'>
        <label htmlFor='3d'>Enable 3D</label>
        <input
          type='checkbox'
          checked={options.use3d}
          onChange={() => setOptions({ use3d: !options.use3d })}
          id='3d'
        />
      </div>
      <div className='flex gap-2'>
        <label htmlFor='display-names'>Show names</label>
        <input
          type='checkbox'
          checked={options.showNames}
          onChange={() => setOptions({ showNames: !options.showNames })}
          id='display-names'
        />
      </div>
    </div>
  );
}

function LinkOptionsPanel() {
  const { linksConfig, setLinksConfig } = useLinksConfig();
  return (
    <div className='mt-2'>
      <span className='font-bold'>Relations</span>
      <div className='flex flex-col'>
        {Object.entries(linksConfig).map(([linkName, enabled], key) => (
          <div className='flex flex-row gap-2' key={key}>
            <input
              type='checkbox'
              id={linkName}
              checked={enabled}
              onChange={() => setLinksConfig({ [linkName]: !enabled })}
            />
            <label htmlFor={linkName}>{linkName.replace('-to-', ' -> ')}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
