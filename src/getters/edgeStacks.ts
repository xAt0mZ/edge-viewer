import { graphId } from '../utils/graphId';
import { EdgeStackNode, Json } from '../types';

export function getEdgeStacksNodes(json: Json): EdgeStackNode[] {
  return json.edge_stack.map(({ Id, Name, EdgeGroups, EdgeUpdateID }) => {
    return {
      id: graphId('edgestack', Id),
      type: 'edgestack',
      name: Name,
      rawId: Id,
      schedule: EdgeUpdateID,
      edgeGroups: EdgeGroups,
    };
  });
}
