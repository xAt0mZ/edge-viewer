import { graphId } from '../utils/graphId';
import { EndpointGroupNode, Json } from '../types';

export function getEndpointGroupsNodes(json: Json): EndpointGroupNode[] {
  return json.endpoint_groups.map(({ Id, Name, TagIds }) => ({
    graphId: graphId('endpointgroup', Id),
    type: 'endpointgroup',
    name: Name,
    id: Id,
    tags: TagIds,
  }));
}
