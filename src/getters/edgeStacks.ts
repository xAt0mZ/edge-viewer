import { Json } from '../types/json';
import { EdgeStackNode } from '../types/node';
import { graphId } from '../utils/graphId';

export function getEdgeStacksNodes(json: Json): EdgeStackNode[] {
  return json.edge_stack.map(({ Id, Name, EdgeGroups, EdgeUpdateID }) => {
    return {
      graphId: graphId('edgestack', Id),
      visible: true,
      type: 'edgestack',
      name: Name,
      id: Id,
      schedule: EdgeUpdateID,
      edgeGroups: EdgeGroups,
    };
  });
}
