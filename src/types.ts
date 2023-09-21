export type NodeType = 'endpoint' | 'container' | 'schedule' | 'edgestack' | 'edgegroup';
export type Node = { id: string; type: NodeType };

// JSON

export type Json = {
  endpoints: Endpoint[];
  snapshots: Snapshot[];
  edge_update_schedule: Schedule[];
  edge_stack: EdgeStack[];
  edgegroups: EdgeGroup[];
};

// ENDPOINT

type Endpoint = { Id: number };
export type EndpointNode = Node & {
  rawId: number;
};

// CONTAINER

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

export type ContainerNode = Node & {
  rawId: string;
  name: string;
  endpoint: number;
  schedule: string;
  edgeStack: number;
};

// SCHEDULE

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
export type ScheduleNode = Node & {
  rawId: number;
  edgeGroupIds: number[];
};

// EDGE STACK

type EdgeStack = {
  EdgeGroups: number[];
  EdgeUpdateID: number;
  Id: number;
  Name: string;
};
export type EdgeStackNode = Node & {
  rawId: number;
  schedule: number;
  edgeGroups: number[];
  name: string;
};

// EDGE GROUP

type EdgeGroup = {
  Dynamic: boolean;
  Endpoints: number[];
  Id: number;
  Name: string;
  TagIds: number[];
};
export type EdgeGroupNode = Node & {
  rawId: number;
  endpoints: number[];
  name: string;
  tags: number[];
};
