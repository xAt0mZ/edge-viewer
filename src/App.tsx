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
import { Tooltip } from 'react-tooltip';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { LinkType, LinskNotes } from './types/link';
import { Collapsible } from './components/Collapsible';
import { Switch } from './components/Switch';

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
      <div className='absolute top-2.5 left-2.5 bg-white z-50 rounded p-2 flex flex-col gap-2'>
        <Collapsible trigger='Options' open>
          <OptionsPanel
            data={data}
            json={json}
            render={render}
            setData={setData}
            setJson={setJson}
          />
        </Collapsible>
        <Collapsible trigger='Relations'>
          <LinkOptionsPanel />
        </Collapsible>
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
      <Switch
        label='Enable 3D'
        enabled={options.use3d}
        onChange={() => setOptions({ use3d: !options.use3d })}
      />
      <Switch
        label='Show names'
        enabled={options.showNames}
        onChange={() => setOptions({ showNames: !options.showNames })}
      />
    </div>
  );
}

function LinkOptionsPanel() {
  const { linksConfig, setLinksConfig } = useLinksConfig();
  return (
    <div className='flex flex-col gap-2'>
      {Object.entries(linksConfig).map(([linkName, enabled], key) => (
        <div className='flex flex-row gap-2 items-center' key={key}>
          <QuestionMarkCircleIcon
            className='h-6'
            data-tooltip-id='note-tooltip'
            data-tooltip-content={LinskNotes[linkName as LinkType]}
            data-tooltip-place='right'
          />
          <Switch
            enabled={enabled}
            onChange={() => setLinksConfig({ [linkName]: !enabled })}
          />
          <span>{linkName.replace('-to-', ' -> ')}</span>
        </div>
      ))}
      <Tooltip id='note-tooltip' />
    </div>
  );
}
