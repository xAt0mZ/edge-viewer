import { graphId } from './graphId';
import { Json, ScheduleNode } from './types';

export function getScheduleNodes(json: Json): ScheduleNode[] {
  return json.edge_update_schedule.map(({ id, edgeGroupIds }) => ({
    id: graphId('schedule', id),
    type: 'schedule',
    rawId: id,
    edgeGroupIds,
  }));
}
