export type NodeType =
  | 'endpoint'
  | 'container'
  | 'schedule'
  | 'edgestack'
  | 'edgegroup';

type GraphNode = {
  graphId: string; // internal reference used by the graph lib to differenciate nodes
};
export type Node = GraphNode & {
  name: string; // displayed in the graph
  type: NodeType; // own type to color nodes by type
};

// JSON

export type Json = {
  endpoints: Endpoint[];
  snapshots: Snapshot[];
  edge_update_schedule: Schedule[];
  edge_stack: EdgeStack[];
  edgegroups: EdgeGroup[];
};

// ENDPOINT

type Endpoint = { Id: number; Name: string };
export type EndpointNode = Node & {
  id: number;
};

// CONTAINER

type Container = {
  Command: string;
  Created: number; // timestamp
  Id: string;
  Image: string;
  Names: string[];
  Labels: {
    [k: string]: string;
  };
};
type Snapshot = {
  EndpointId: number;
  Docker: { DockerSnapshotRaw: { Containers: Container[] } };
};

export type ContainerNode = Node & {
  id: string;
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
  id: number;
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
  id: number;
  schedule: number;
  edgeGroups: number[];
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
  id: number;
  endpoints: number[];
  tags: number[];
};
