export type NodeType = 'endpoint' | 'container' | 'schedule';
export type Node = { id: string; type: NodeType };

export type Endpoint = { Id: number };
export type EndpointNode = Node & {
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
export type Snapshot = {
  EndpointId: number;
  Docker: { DockerSnapshotRaw: { Containers: Container[] } };
};

export type ContainerNode = Node & {
  rawId: string;
  name: string;
  endpoint: number;
  schedule: string;
  stack?: number;
};

export type Schedule = {
  created: number; // timestamp
  edgeGroupIds: number[];
  edgeStackId: number;
  environmentsPreviousVersions: { [endpointId: number]: string };
  version: string;
  id: number;
  name: string;
  type: number;
};
export type ScheduleNode = Node & {
  rawId: number;
  edgeGroupIds: number[];
};
export type Json = {
  endpoints: Endpoint[];
  snapshots: Snapshot[];
  edge_update_schedule: Schedule[];
};
