import { graphId } from './graphId';
import { EndpointNode, Json } from './types';

export function getEndpointsNodes(json: Json): EndpointNode[] {
  return json.endpoints.map(({ Id }) => ({
    rawId: Id,
    type: 'endpoint',
    id: graphId('endpoint', Id),
  }));
}
