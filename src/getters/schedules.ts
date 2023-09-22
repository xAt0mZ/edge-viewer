import { Json } from '../types/json';
import { ScheduleNode } from '../types/node';
import { graphId } from '../utils/graphId';

export function getScheduleNodes(json: Json): ScheduleNode[] {
  return json.edge_update_schedule.map(({ id, edgeGroupIds, name }) => ({
    graphId: graphId('schedule', id),
    visible: true,
    type: 'schedule',
    name,
    id,
    edgeGroupIds,
  }));
}
