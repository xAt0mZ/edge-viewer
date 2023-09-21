import { graphId } from '../utils/graphId';
import { EdgeGroupNode, Json } from '../types';

export function getEdgeGroupsNodes(json: Json): EdgeGroupNode[] {
  return json.edgegroups.map(({ Id, Endpoints, Name, TagIds }) => ({
    id: graphId('edgegroup', Id),
    type: 'edgegroup',
    endpoints: Endpoints,
    name: Name,
    rawId: Id,
    tags: TagIds,
  }));
}
