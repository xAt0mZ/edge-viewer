import { useCallback, useState } from 'react';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';

import { Json } from './types';
import { generateLinks } from './utils/generateLinks';
import { Upload } from './components/Upload';
import { getContainersNodes } from './getters/containers';
import { getScheduleNodes } from './getters/schedules';
import { getEndpointsNodes } from './getters/endpoints';
import { getEdgeStacksNodes } from './getters/edgeStacks';
import { getEdgeGroupsNodes } from './getters/edgeGroups';
import { useWindowSize } from '@react-hook/window-size';
import { useOptions } from './hooks/useOptions';

type GraphData = Parameters<typeof ForceGraph2D>['0']['graphData'];

export function App() {
  const [width, height] = useWindowSize();
  const { options } = useOptions();

  const [json, setJson] = useState<Json | undefined>(undefined);
  const [data, setData] = useState<GraphData>(undefined);

  const render = useCallback(() => {
    if (!json) {
      return;
    }

    const endpoints = getEndpointsNodes(json);
    const containers = getContainersNodes(json, endpoints);
    const schedules = getScheduleNodes(json);
    const edgeStacks = getEdgeStacksNodes(json);
    const edgeGroups = getEdgeGroupsNodes(json);

    const data: GraphData = {
      nodes: [
        ...endpoints,
        ...containers,
        ...schedules,
        ...edgeStacks,
        ...edgeGroups,
      ],
      links: generateLinks({
        endpoints,
        containers,
        schedules,
        edgeStacks,
        edgeGroups,
      }),
    };

    setData(data);
  }, [json]);

  const Component = options.use3d ? ForceGraph3D : ForceGraph2D;

  return (
    <div className='relative bg-black h-screen w-screen'>
      <div className='absolute top-2.5 left-2.5 bg-white z-50 rounded p-2'>
        <Options
          data={data}
          json={json}
          render={render}
          setData={setData}
          setJson={setJson}
        />
      </div>
      {data && (
        <Component
          width={width}
          height={height}
          graphData={data}
          nodeId='graphId'
          nodeLabel='graphId'
          nodeAutoColorBy='type'
          linkAutoColorBy='type'
          linkDirectionalParticles='value'
          linkDirectionalParticleSpeed={0.001}
          nodeCanvasObject={
            !options.showNames
              ? undefined
              : (node, ctx, globalScale) => {
                  const label = node.name as string;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgDimensions: [number, number] = [
                    textWidth + fontSize * 0.2,
                    fontSize + fontSize * 0.2,
                  ]; // some padding

                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = node.color;
                  ctx.fillText(label, node.x!, node.y!);

                  node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
                }
          }
          nodePointerAreaPaint={
            !options.showNames
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

type OptionsProps = {
  json?: Json;
  setJson(v: Json): void;
  data: GraphData;
  setData(v: GraphData): void;
  render(): void;
};
function Options({ json, setJson, data, setData, render }: OptionsProps) {
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
        onClick={() => setData(undefined)}
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
          disabled
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
