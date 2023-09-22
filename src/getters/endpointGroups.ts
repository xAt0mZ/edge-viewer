import { Json } from '../types/json';
import { EndpointGroupNode } from '../types/node';
import { graphId } from '../utils/graphId';

export function getEndpointGroupsNodes(json: Json): EndpointGroupNode[] {
  return json.endpoint_groups.map(({ Id, Name, TagIds }) => ({
    graphId: graphId('endpointgroup', Id),
    visible: true,
    type: 'endpointgroup',
    name: Name,
    id: Id,
    tags: TagIds,
  }));
}
