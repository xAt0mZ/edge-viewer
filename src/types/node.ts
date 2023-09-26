export type NodeType =
  | 'endpoint'
  | 'container'
  | 'schedule'
  | 'edgestack'
  | 'edgegroup'
  | 'endpointgroup'
  | 'tag';

// fields passed as string references to the graph lib
type LibNode = {
  graphId: string; // differenciate nodes (must be unique)
  visible: boolean; // controls the visibility of a node
  // weight: number;
};
export type GraphNode = LibNode & {
  name: string; // displayed in the graph
  type: NodeType; // own type to color nodes by type
};

// struct holding all the parsed nodes
export type Nodes = {
  endpoints: EndpointNode[];
  containers: ContainerNode[];
  schedules: ScheduleNode[];
  edgeStacks: EdgeStackNode[];
  edgeGroups: EdgeGroupNode[];
  endpointGroups: EndpointGroupNode[];
  tags: TagNode[];
};

// parsed schedule
export type ScheduleNode = GraphNode & {
  id: number;
  edgeGroupIds: number[];
};

// parsed endpoint group
export type EndpointGroupNode = GraphNode & {
  id: number;
  tags: number[];
};

// parsed tag
export type TagNode = GraphNode & {
  id: number;
  endpoints: number[];
  endpointGroups: number[];
};

// parsed edge group
export type EdgeGroupNode = GraphNode & {
  id: number;
  endpoints: number[];
  tags: number[] | null;
};

// parsed endpoint
export type EndpointNode = GraphNode & {
  id: number;
  tags: number[];
  endpointGroup: number;
};

// parsed container
export type ContainerNode = GraphNode & {
  id: string;
  endpoint: number;
  schedule: string;
  edgeStack: number;
};

// parsed edge stack
export type EdgeStackNode = GraphNode & {
  id: number;
  schedule: number;
  edgeGroups: number[];
};
