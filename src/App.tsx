import { useCallback, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';

import { Json } from './types';
import { generateLinks } from './utils/generateLinks';
import { Upload } from './components/Upload';
import { getContainersNodes } from './getters/containers';
import { getScheduleNodes } from './getters/schedules';
import { getEndpointsNodes } from './getters/endpoints';
import { getEdgeStacksNodes } from './getters/edgeStacks';
import { getEdgeGroupsNodes } from './getters/edgeGroups';
import { useWindowSize } from '@react-hook/window-size';

type GraphData = Parameters<typeof ForceGraph2D>['0']['graphData'];

export function App() {
  const [raw, setRaw] = useState('');
  const [data, setData] = useState<GraphData | undefined>();
  const [width, height] = useWindowSize();

  const render = useCallback(() => {
    if (!raw) {
      return;
    }
    const json: Json = JSON.parse(raw);

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
  }, [raw]);

  return (
    <div className='relative bg-black h-screen w-screen'>
      <div className='absolute top-2.5 left-2.5 bg-white z-50 rounded p-2'>
        <div className='grid grid-cols-2 gap-2'>
          <Upload id='file-upload' className='col-span-2' onChange={setRaw} />
          <button
            disabled={!raw}
            className='rounded border border-black px-2 disabled:opacity-50'
            onClick={render}
          >
            Render
          </button>
          <button
            disabled={!raw || !data}
            className='rounded border border-black px-2 disabled:opacity-50'
            onClick={() => setData(undefined)}
          >
            Reset
          </button>
        </div>
      </div>
      {data && (
        <ForceGraph2D
          width={width}
          height={height}
          graphData={data}
          nodeLabel='id'
          nodeAutoColorBy='type'
          linkAutoColorBy='type'
          linkDirectionalParticles='value'
          linkDirectionalParticleSpeed={(d) => d.value * 0.001}
        />
      )}
    </div>
  );
}
