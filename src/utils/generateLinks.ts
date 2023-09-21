import { compact } from 'lodash';
import {
  ContainerNode,
  EdgeGroupNode,
  EdgeStackNode,
  EndpointNode,
  ScheduleNode,
} from '../types';

/* 
endpoint
container
schedule
edgegroups
edgestack
edgegroups
tag
envgroup

container -> endpoint

schedule -> edgestack

edgestack -> edgegroup (static)

edgestack -> tag (dynamic)
tag -> endpoint
tag -> envgroup
envgroup -> endpoint



*/
type LinkType =
  | 'container-to-endpoint'
  | 'schedule-to-container'
  | 'schedule-to-edgestack'
  | 'edgestack-to-edgegroup'
  | 'edgegroup-to-endpoint';
type Link = {
  source: string;
  target: string;
  value: number;
  type: LinkType;
};

type GenerateProps = {
  endpoints: EndpointNode[];
  containers: ContainerNode[];
  schedules: ScheduleNode[];
  edgeStacks: EdgeStackNode[];
  edgeGroups: EdgeGroupNode[];
};
export function generateLinks({
  endpoints,
  containers,
  schedules,
  edgeStacks,
  edgeGroups,
}: GenerateProps): Link[] {
  return [
    ...containersToEndpoints(containers, endpoints),
    ...schedulesToContainers(schedules, containers),
    ...schedulesToEdgeStacks(schedules, edgeStacks),
    ...edgeStacksToEdgeGroups(edgeStacks, edgeGroups),
  ];
}

function containersToEndpoints(
  containers: ContainerNode[],
  endpoints: EndpointNode[]
) {
  return compact<Link>(
    containers.map((c) => {
      const endpoint = endpoints.find(({ rawId }) => rawId === c.endpoint);
      if (!endpoint) {
        return;
      }
      return {
        source: c.id,
        target: endpoint.id,
        value: 1,
        type: 'container-to-endpoint',
      };
    })
  );
}

function schedulesToContainers(
  schedules: ScheduleNode[],
  containers: ContainerNode[]
) {
  return compact<Link>(
    containers.map((c) => {
      const schedule = schedules.find(
        ({ rawId }) => rawId.toString() === c.schedule
      );
      if (!schedule) {
        return;
      }
      return {
        source: schedule.id,
        target: c.id,
        value: 1,
        type: 'schedule-to-container',
      };
    })
  );
}

function schedulesToEdgeStacks(
  schedules: ScheduleNode[],
  edgeStacks: EdgeStackNode[]
) {
  return compact<Link>(
    edgeStacks.map((e): Link | undefined => {
      const schedule = schedules.find((s) => s.rawId === e.schedule);
      if (!schedule) return;
      return {
        source: schedule.id,
        target: e.id,
        type: 'schedule-to-edgestack',
        value: 1,
      };
    })
  );
}

function edgeStacksToEdgeGroups(
  edgeStacks: EdgeStackNode[],
  edgeGroups: EdgeGroupNode[]
) {
  return compact<Link>(
    edgeStacks.flatMap((s) =>
      s.edgeGroups.map((e): Link | undefined => {
        const group = edgeGroups.find((g) => g.rawId === e);
        if (!group) return;
        return {
          source: s.id,
          target: group.id,
          value: 1,
          type: 'edgestack-to-edgegroup',
        };
      })
    )
  );
}
