import { graphId } from '../utils/graphId';
import { EndpointNode, Json } from '../types';

export function getEndpointsNodes(json: Json): EndpointNode[] {
  return json.endpoints.map(({ Id, Name }) => ({
    graphId: graphId('endpoint', Id),
    type: 'endpoint',
    name: Name,
    id: Id,
  }));
}
