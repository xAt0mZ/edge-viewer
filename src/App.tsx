import { useCallback, useState } from 'react';
import { Upload } from './Upload';
import { ForceGraph2D } from 'react-force-graph';
import { compact } from 'lodash';

type GraphData = Parameters<typeof ForceGraph2D>['0']['graphData'];
type NodeType = 'endpoint' | 'container' | 'schedule';
type Node = { id: string; type: NodeType };

type Endpoint = { Id: number };
type EndpointNode = Node & {
  rawId: number;
};

type Container = {
  Command: string;
  Created: number; // timestamp
  Id: string;
  Image: string;
  Labels: {
    [k: string]: string;
  };
};
type Snapshot = {
  EndpointId: number;
  Docker: { DockerSnapshotRaw: { Containers: Container[] } };
};

type ContainerNode = Node & {
  rawId: string;
  name: string;
  endpoint: number;
  schedule: string;
  stack?: number;
};

type Schedule = {
  created: number; // timestamp
  edgeGroupIds: number[];
  edgeStackId: number;
  environmentsPreviousVersions: { [endpointId: number]: string };
  version: string;
  id: number;
  name: string;
  type: number;
};
type ScheduleNode = Node & {
  rawId: number;
  edgeGroupIds: number[];
};

type Json = {
  endpoints: Endpoint[];
  snapshots: Snapshot[];
  edge_update_schedule: Schedule[];
};

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
      <div className='absolute top-0 left-0 bg-white z-50'>
        <Upload id='file-upload' onChange={setRaw} />
        <button
          disabled={!raw}
          className='rounded border px-2 disabled:opacity-50'
          onClick={render}
        >
          Render
        </button>
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

function getEndpointsNodes(json: Json): EndpointNode[] {
  return json.endpoints.map(({ Id }) => ({
    rawId: Id,
    type: 'endpoint',
    id: graphId('endpoint', Id),
  }));
}

function getContainersNodes(
  json: Json,
  endpoints: EndpointNode[]
): ContainerNode[] {
  return compact(
    endpoints.flatMap(({ rawId }) => {
      const snap = json.snapshots.find((s) => s.EndpointId === rawId);
      if (!snap || !snap.Docker) {
        return;
      }
      return snap.Docker.DockerSnapshotRaw.Containers.map(
        ({ Id, Command, Labels }): ContainerNode => ({
          id: graphId('container', Id),
          type: 'container',
          rawId: Id,
          endpoint: snap.EndpointId,
          name: Command,
          schedule: Labels['io.portainer.update.scheduleId'],
        })
      );
    })
  );
}

function getScheduleNodes(json: Json): ScheduleNode[] {
  return json.edge_update_schedule.map(({ id, edgeGroupIds }) => ({
    id: graphId('schedule', id),
    type: 'schedule',
    rawId: id,
    edgeGroupIds,
  }));
}

function graphId(type: NodeType, id: number | string): string {
  return `${type}-${id}`;
}

type Link = {
  source: string;
  target?: string;
  value: number;
};
function generateLinks({
  endpoints,
  containers,
  schedules,
}: {
  endpoints: EndpointNode[];
  containers: ContainerNode[];
  schedules: ScheduleNode[];
}): Link[] {
  return [
    ...compact(
      containers.map((c) => {
        const endpoint = endpoints.find(
          ({ rawId }) => rawId === c.endpoint
        )?.id;
        if (!endpoint) {
          return;
        }
        return {
          source: c.id,
          target: endpoint,
          value: 1,
        };
      })
    ),
    ...compact(
      containers.map((c) => {
        const schedule = schedules.find(
          ({ rawId }) => rawId.toString() === c.schedule
        )?.id;
        if (!schedule) {
          return;
        }
        return {
          source: schedule,
          target: c.id,
          value: 2,
        };
      })
    ),
  ];
}
