import { useCallback, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

import { generateLinks } from './utils/generateLinks';
import { Upload } from './components/Upload';
import { useOptions } from './hooks/useOptions';
import { useLinksConfig } from './hooks/useLinks';
import { GraphNode, Nodes } from './types/node';
// import { GraphLink } from './types/link';
import { Json } from './types/json';
import { LinkType, LinskNotes } from './types/link';
import { Collapsible } from './components/Collapsible';
import { Switch } from './components/Switch';
import { generateNodes } from './getters/generateNodes';
import { Graph, GraphData } from './Graph';

export function App() {
  const { linksConfig } = useLinksConfig();

  const [json, setJson] = useState<Json | undefined>(undefined);
  const [nodes, setNodes] = useState<Nodes | undefined>(undefined);
  // const [links, setLinks] = useState<GraphLink[] | undefined>(undefined);

  const [data, setData] = useState<GraphData>(undefined);
  // const [selectedNode, setSelectedNode] = useState<GraphNode | undefined>(
  //   undefined
  // );

  useEffect(() => {
    if (!json) {
      return;
    }
    const nodes = generateNodes(json);

    const data: GraphData = {
      nodes: Object.values(nodes).reduce(
        (acc, v) => acc.concat(v),
        [] as GraphNode[]
      ),
      links: [],
    };

    setData(data);
    setNodes(nodes);
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
        <OptionsPanel
          data={data}
          json={json}
          render={render}
          setData={setData}
          setJson={setJson}
        />
        <Collapsible trigger='Relations'>
          <LinkOptionsPanel />
        </Collapsible>
      </div>
      {data && data.links.length && (
        <Graph
          graphData={data}
          // onNodeClick={} onNodeRightClick={}
        />
      )}
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
    <>
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
      </div>
      <Collapsible trigger='Options'>
        <div className='grid grid-cols-2'>
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
      </Collapsible>
    </>
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
