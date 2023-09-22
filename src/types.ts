export type NodeType =
  | 'endpoint'
  | 'container'
  | 'schedule'
  | 'edgestack'
  | 'edgegroup'
  | 'endpointgroup'
  | 'tag';

type GraphNode = {
  graphId: string; // internal reference used by the graph lib to differenciate nodes
};
export type Node = GraphNode & {
  name: string; // displayed in the graph
  type: NodeType; // own type to color nodes by type
};

export type LinkType =
  | 'container-to-endpoint'
  | 'schedule-to-container'
  | 'schedule-to-edgegroup'
  | 'schedule-to-edgestack'
  | 'edgestack-to-edgegroup'
  | 'edgegroup-to-endpoint'
  | 'edgegroup-to-tag'
  | 'tag-to-endpoint'
  | 'tag-to-endpointgroup'
  | 'endpointgroup-to-endpoint';
  // edgestack-to-container

export type LinksConfig = {
  [v in LinkType]: boolean;
};

export type Link = {
  source: string;
  target: string;
  value: number;
  type: LinkType;
};

export type Nodes = {
  endpoints: EndpointNode[];
  containers: ContainerNode[];
  schedules: ScheduleNode[];
  edgeStacks: EdgeStackNode[];
  edgeGroups: EdgeGroupNode[];
  endpointGroups: EndpointGroupNode[];
  tags: TagNode[];
};

// JSON

export type Json = {
  endpoints: Endpoint[];
  endpoint_groups: EndpointGroup[];
  snapshots: Snapshot[];
  edge_update_schedule: Schedule[];
  edge_stack: EdgeStack[];
  edgegroups: EdgeGroup[];
  tags: Tag[];
};

// ENDPOINT

type Endpoint = {
  Id: number;
  Name: string;
  TagIds: number[];
  GroupId: number;
};
export type EndpointNode = Node & {
  id: number;
  tags: number[];
  endpointGroup: number;
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
  TagIds: number[] | null;
};
export type EdgeGroupNode = Node & {
  id: number;
  endpoints: number[];
  tags: number[] | null;
};

// TAGS

type Tag = {
  EndpointGroups: {
    [id: number]: true;
  };
  Endpoints: {
    [id: number]: true;
  };
  ID: number;
  Name: string;
};

export type TagNode = Node & {
  id: number;
  endpoints: number[];
  endpointGroups: number[];
};

// ENDPOINT GROUP

type EndpointGroup = {
  Id: number;
  Name: string;
  TagIds: number[];
};

export type EndpointGroupNode = Node & {
  id: number;
  tags: number[];
};
