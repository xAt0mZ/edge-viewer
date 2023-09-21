import { graphId } from '../utils/graphId';
import { Json, ScheduleNode } from '../types';

export function getScheduleNodes(json: Json): ScheduleNode[] {
  return json.edge_update_schedule.map(({ id, edgeGroupIds, name }) => ({
    graphId: graphId('schedule', id),
    type: 'schedule',
    name,
    id,
    edgeGroupIds,
  }));
}
