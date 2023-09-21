import { compact } from 'lodash';
import {
  ContainerNode,
  EdgeGroupNode,
  EdgeStackNode,
  EndpointNode,
  ScheduleNode,
} from '../types';
import { LinkType } from '../hooks/useLinks';

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
    ...edgeGroupsToEndpoints(edgeGroups, endpoints),
  ];
}

function containersToEndpoints(
  containers: ContainerNode[],
  endpoints: EndpointNode[]
) {
  return compact<Link>(
    containers.map((c) => {
      const endpoint = endpoints.find((e) => e.id === c.endpoint);
      if (!endpoint) return;
      return {
        source: c.graphId,
        target: endpoint.graphId,
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
      const schedule = schedules.find((s) => s.id.toString() === c.schedule);
      if (!schedule) return;
      return {
        source: schedule.graphId,
        target: c.graphId,
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
      const schedule = schedules.find((s) => s.id === e.schedule);
      if (!schedule) return;
      return {
        source: schedule.graphId,
        target: e.graphId,
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
        const group = edgeGroups.find((g) => g.id === e);
        if (!group) return;
        return {
          source: s.graphId,
          target: group.graphId,
          value: 1,
          type: 'edgestack-to-edgegroup',
        };
      })
    )
  );
}

function edgeGroupsToEndpoints(
  edgeGroups: EdgeGroupNode[],
  endpoints: EndpointNode[]
) {
  return compact<Link>(
    edgeGroups.flatMap((g) =>
      g.endpoints.map((e): Link | undefined => {
        const endpoint = endpoints.find((i) => i.id === e);
        if (!endpoint) return;
        return {
          source: g.graphId,
          target: endpoint.graphId,
          value: 1,
          type: 'edgegroup-to-endpoint',
        };
      })
    )
  );
}
