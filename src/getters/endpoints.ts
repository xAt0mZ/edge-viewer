import { Json } from '../types/json';
import { EndpointNode } from '../types/node';
import { graphId } from '../utils/graphId';

export function getEndpointsNodes(json: Json): EndpointNode[] {
  return json.endpoints.map(
    ({ Id, Name, TagIds, GroupId }): EndpointNode => ({
      graphId: graphId('endpoint', Id),
      visible: true,
      type: 'endpoint',
      name: Name,
      id: Id,
      tags: TagIds,
      endpointGroup: GroupId,
    })
  );
}
