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

type TypedNode<T extends NodeType> = LibNode & {
  name: string; // displayed in the graph
  type: T; // own type to color nodes by type
};

export type GraphNode =
  | EndpointNode
  | ContainerNode
  | ScheduleNode
  | EdgeStackNode
  | EdgeGroupNode
  | EndpointGroupNode
  | TagNode;

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
export type ScheduleNode = TypedNode<'schedule'> & {
  id: number;
  edgeGroupIds: number[];
};

// parsed endpoint group
export type EndpointGroupNode = TypedNode<'endpointgroup'> & {
  id: number;
  tags: number[];
};

// parsed tag
export type TagNode = TypedNode<'tag'> & {
  id: number;
  endpoints: number[];
  endpointGroups: number[];
};

// parsed edge group
export type EdgeGroupNode = TypedNode<'edgegroup'> & {
  id: number;
  endpoints: number[];
  tags: number[] | null;
};

// parsed endpoint
export type EndpointNode = TypedNode<'endpoint'> & {
  id: number;
  tags: number[];
  endpointGroup: number;
};

// parsed container
export type ContainerNode = TypedNode<'container'> & {
  type: 'container';
  id: string;
  endpoint: number;
  schedule: number;
  edgeStack: number;
};

// parsed edge stack
export type EdgeStackNode = TypedNode<'edgestack'> & {
  id: number;
  schedule: number;
  edgeGroups: number[];
};
