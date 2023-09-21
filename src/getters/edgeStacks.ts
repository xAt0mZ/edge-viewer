import { graphId } from '../utils/graphId';
import { EdgeStackNode, Json } from '../types';

export function getEdgeStacksNodes(json: Json): EdgeStackNode[] {
  return json.edge_stack.map(({ Id, Name, EdgeGroups, EdgeUpdateID }) => {
    return {
      graphId: graphId('edgestack', Id),
      type: 'edgestack',
      name: Name,
      id: Id,
      schedule: EdgeUpdateID,
      edgeGroups: EdgeGroups,
    };
  });
}
