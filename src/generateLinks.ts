import { compact } from 'lodash';
import { ContainerNode, EndpointNode, ScheduleNode } from './types';

type LinkType = 'container-to-endpoint' | 'schedule-to-container';
type Link = {
  source: string;
  target?: string;
  value: number;
  type: LinkType;
};
export function generateLinks({
  endpoints,
  containers,
  schedules,
}: {
  endpoints: EndpointNode[];
  containers: ContainerNode[];
  schedules: ScheduleNode[];
}): Link[] {
  return [
    ...compact(
      containers.map((c): Link | undefined => {
        const endpoint = endpoints.find(
          ({ rawId }) => rawId === c.endpoint
        )?.id;
        if (!endpoint) {
          return;
        }
        return {
          source: c.id,
          target: endpoint,
          value: 1,
          type: 'container-to-endpoint',
        };
      })
    ),
    ...compact(
      containers.map((c): Link | undefined => {
        const schedule = schedules.find(
          ({ rawId }) => rawId.toString() === c.schedule
        )?.id;
        if (!schedule) {
          return;
        }
        return {
          source: schedule,
          target: c.id,
          value: 2,
          type: 'schedule-to-container',
        };
      })
    ),
  ];
}
