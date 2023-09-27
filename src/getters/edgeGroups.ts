import { Json } from '../types/json';
import { EdgeGroupNode } from '../types/node';
import { graphId } from '../utils/graphId';

export function getEdgeGroupsNodes(json: Json): EdgeGroupNode[] {
  return json.edgegroups.map(
    ({ Id, Endpoints, Name, TagIds }): EdgeGroupNode => ({
      graphId: graphId('edgegroup', Id),
      visible: true,
      type: 'edgegroup',
      endpoints: Endpoints,
      name: Name,
      id: Id,
      tags: TagIds,
    })
  );
}
