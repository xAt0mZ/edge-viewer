// JSON definition
export type Json = {
  endpoints: Endpoint[];
  endpoint_groups: EndpointGroup[];
  snapshots: Snapshot[];
  edge_update_schedule: Schedule[];
  edge_stack: EdgeStack[];
  edgegroups: EdgeGroup[];
  tags: Tag[];
};

// endpoint
type Endpoint = {
  Id: number;
  Name: string;
  TagIds: number[];
  GroupId: number;
};

// JSON container
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

// JSON schedule
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

// JSON edge stack
type EdgeStack = {
  EdgeGroups: number[];
  EdgeUpdateID: number;
  Id: number;
  Name: string;
};

// JSON edge group
type EdgeGroup = {
  Dynamic: boolean;
  Endpoints: number[];
  Id: number;
  Name: string;
  TagIds: number[] | null;
};

// JSON tag
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

// JSON endpoint group
type EndpointGroup = {
  Id: number;
  Name: string;
  TagIds: number[];
};
