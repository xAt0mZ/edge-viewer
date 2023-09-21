import { useCallback, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';

import { Json } from './types';
import { generateLinks } from './generateLinks';
import { Upload } from './Upload';
import { getContainersNodes } from './getContainersNodes';
import { getScheduleNodes } from './getSchedulesNodes';
import { getEndpointsNodes } from './getEndpointsNodes';

type GraphData = Parameters<typeof ForceGraph2D>['0']['graphData'];

export function App() {
  const [raw, setRaw] = useState('');
  const [data, setData] = useState<GraphData | undefined>();

  const render = useCallback(() => {
    if (!raw) {
      return;
    }
    const json: Json = JSON.parse(raw);

    const endpoints = getEndpointsNodes(json);
    const containers = getContainersNodes(json, endpoints);
    const schedules = getScheduleNodes(json);

    const data: GraphData = {
      nodes: [...endpoints, ...containers, ...schedules],
      links: generateLinks({ endpoints, containers, schedules }),
    };

    setData(data);
  }, [raw]);

  return (
    <div className='relative bg-black h-screen w-screen'>
      <div className='absolute top-2.5 left-2.5 bg-white z-50 rounded p-2'>
        <div className='flex flex-col gap-2 items-start'>
          <Upload id='file-upload' onChange={setRaw} />
          <button
            disabled={!raw}
            className='rounded border border-black px-2 disabled:opacity-50'
            onClick={render}
          >
            Render
          </button>
        </div>
      </div>
      {data && (
        <ForceGraph2D
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
