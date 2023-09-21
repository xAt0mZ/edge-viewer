import { useCallback, useEffect, useState } from 'react';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext';

import { Json, Link, Node, Nodes } from './types';
import { generateLinks } from './utils/generateLinks';
import { Upload } from './components/Upload';
import { getContainersNodes } from './getters/containers';
import { getScheduleNodes } from './getters/schedules';
import { getEndpointsNodes } from './getters/endpoints';
import { getEdgeStacksNodes } from './getters/edgeStacks';
import { getEdgeGroupsNodes } from './getters/edgeGroups';
import { useWindowSize } from '@react-hook/window-size';
import { useOptions } from './hooks/useOptions';
import { useLinksConfig } from './hooks/useLinks';
import { getEndpointGroupsNodes } from './getters/endpointGroups';
import { getTagsNodes } from './getters/tags';

type GraphData =
  | Parameters<typeof ForceGraph2D<Node, Link>>['0']['graphData']
  | Parameters<typeof ForceGraph3D<Node, Link>>['0']['graphData'];

export function App() {
  const [width, height] = useWindowSize();
  const { options } = useOptions();
  const { linksConfig } = useLinksConfig();

  const [json, setJson] = useState<Json | undefined>(undefined);
  const [data, setData] = useState<GraphData>(undefined);
  const [nodes, setNodes] = useState<Nodes | undefined>(undefined);

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

  // useEffect(() => {}, [linksConfig]);

  const Component = options.use3d
    ? ForceGraph3D<Node, Link>
    : ForceGraph2D<Node, Link>;

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
      {data && data.links.length && (
        <Component
          width={width}
          height={height}
          graphData={data}
          nodeId='graphId'
          nodeLabel={(n: Node) =>
            `<div style="display: flex; flex-direction: column;">
              <span>${n.graphId.slice(0, 30)}</span>
              <span>${n.name}</span>
            </div>`
          }
          nodeAutoColorBy='type'
          nodeThreeObject={
            !(options.showNames && options.use3d)
              ? undefined
              : (node: { name: string; color: string }) => {
                  const sprite = new SpriteText(node.name);
                  sprite.color = node.color;
                  sprite.textHeight = 8;
                  return sprite;
                }
          }
          linkAutoColorBy='type'
          linkOpacity={0.8} // 3D specific
          linkDirectionalParticles='value'
          linkDirectionalParticleSpeed={(l: Link) => l.value * 0.001}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0}
          nodeRelSize={!options.use3d && options.showNames ? 1 : undefined}
          nodeCanvasObject={
            options.use3d || !options.showNames
              ? undefined
              : (node, ctx, globalScale) => {
                  const label = node.name as string;
                  const fontSize = 20 / globalScale;
                  ctx.font = `${fontSize}px Sans-serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions = [textWidth, fontSize].map(
                    (n) => n + fontSize * 0.2
                  ); // some padding
                  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                  ctx.lineWidth = 1 / globalScale;
                  ctx.strokeRect(
                    node.x! - bckgDimensions[0] / 2,
                    node.y! - bckgDimensions[1] / 2,
                    bckgDimensions[0],
                    bckgDimensions[1]
                  );
                  ctx.fillStyle = '#000000';
                  ctx.fillRect(
                    node.x! - bckgDimensions[0] / 2,
                    node.y! - bckgDimensions[1] / 2,
                    bckgDimensions[0],
                    bckgDimensions[1]
                  );
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.color;
                  ctx.fillText(label, node.x!, node.y!);

                  node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
                }
          }
          nodePointerAreaPaint={
            options.use3d || !options.showNames
              ? undefined
              : (node, color, ctx) => {
                  ctx.fillStyle = color;
                  const bckgDimensions: [number, number] =
                    node.__bckgDimensions;
                  bckgDimensions &&
                    ctx.fillRect(
                      node.x! - bckgDimensions[0] / 2,
                      node.y! - bckgDimensions[1] / 2,
                      ...bckgDimensions
                    );
                }
          }
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
