import { compact, flattenDeep } from 'lodash';
import { Link, LinkType, LinksConfig, Node, Nodes } from '../types';

/*
endpoint
container
schedule
edgestack
tag
envgroup

container -> endpoint

schedule -> edgestack

edgestack -> edgegroup

edgegroup -> endpoint (static)

edge group -> tag (dynamic)
tag -> endpoint (level 1)
tag -> envgroup (level 2.1)
envgroup -> endpoint (level 2.2)

*/

type LinkerFunc = (nodes: Nodes, type: LinkType) => Link[];
const linkFuncs: {
  [k in LinkType]: LinkerFunc;
} = {
  'container-to-endpoint': containersToEndpoints,
  'edgegroup-to-endpoint': edgeGroupsToEndpoints,
  'edgestack-to-edgegroup': edgeStacksToEdgeGroups,
  'schedule-to-container': schedulesToContainers,
  'schedule-to-edgegroup': schedulesToEdgeGroups,
  'schedule-to-edgestack': schedulesToEdgeStacks,
};

export function generateLinks(nodes: Nodes, linksConfig: LinksConfig): Link[] {
  return Object.entries(linkFuncs).flatMap(([type, func]) =>
    linksConfig[type as LinkType] ? func(nodes, type as LinkType) : []
  );
}

function generate<S extends Node, T extends Node>(
  type: LinkType,
  sources: S[],
  targets: T[],
  targetFinderFunc: (source: S, target: T) => boolean,
  { value = 1, inverted = false }: { value?: number; inverted?: boolean } = {
    value: 1,
    inverted: false,
  }
): Link[] {
  return compact(
    flattenDeep(
      sources.map((source): Link | undefined => {
        const target = targets.find((target) =>
          targetFinderFunc(source, target)
        );
        if (!target) return;
        return {
          source: inverted ? target.graphId : source.graphId,
          target: inverted ? source.graphId : target.graphId,
          value: value,
          type,
        };
      })
    )
  );
}

function containersToEndpoints(
  { containers, endpoints }: Nodes,
  type: LinkType
) {
  return generate(
    type,
    containers,
    endpoints,
    (container, endpoint) => container.endpoint === endpoint.id,
    { value: 1 }
  );
}

function schedulesToContainers(
  { schedules, containers }: Nodes,
  type: LinkType
) {
  return generate(
    type,
    containers,
    schedules,
    (container, schedule) => schedule.id.toString() === container.schedule,
    { inverted: true }
  );
}

function schedulesToEdgeStacks(
  { schedules, edgeStacks }: Nodes,
  type: LinkType
) {
  return generate(
    type,
    edgeStacks,
    schedules,
    (stack, schedule) => stack.schedule === schedule.id,
    { inverted: true }
  );
}

function schedulesToEdgeGroups(
  { schedules, edgeGroups }: Nodes,
  type: LinkType
) {
  return compact<Link>(
    schedules.flatMap((s) =>
      s.edgeGroupIds.map((id): Link | undefined => {
        const group = edgeGroups.find((g) => g.id === id);
        if (!group) return;
        return {
          source: s.graphId,
          target: group.graphId,
          value: 1,
          type,
        };
      })
    )
  );
}

function edgeStacksToEdgeGroups(
  { edgeStacks, edgeGroups }: Nodes,
  type: LinkType
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
          type,
        };
      })
    )
  );
}

function edgeGroupsToEndpoints(
  { edgeGroups, endpoints }: Nodes,
  type: LinkType
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
          type,
        };
      })
    )
  );
}
