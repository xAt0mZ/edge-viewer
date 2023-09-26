import { compact, flattenDeep } from 'lodash';
import { GraphNode, Nodes } from '../types/node';
import { GraphLink, LinkType, LinksConfig } from '../types/link';

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

type LinkerFunc = (nodes: Nodes, type: LinkType) => GraphLink[];
const linkFuncs: {
  [k in LinkType]: LinkerFunc;
} = {
  [LinkType.CONTAINER_TO_ENDPOINT]: containersToEndpoints,
  [LinkType.EDGESTACK_TO_EDGEGROUP]: edgeStacksToEdgeGroups,
  [LinkType.SCHEDULE_TO_CONTAINER]: schedulesToContainers,
  [LinkType.SCHEDULE_TO_EDGEGROUP]: schedulesToEdgeGroups,
  [LinkType.SCHEDULE_TO_EDGESTACK]: schedulesToEdgeStacks,
  [LinkType.EDGEGROUP_TO_ENDPOINT]: edgeGroupsToEndpoints,
  [LinkType.EDGEGROUP_TO_TAG]: edgeGroupsToTags,
  [LinkType.TAG_TO_ENDPOINT]: tagsToEndpoints,
  [LinkType.TAG_TO_ENDPOINTGROUP]: tagsToEndpointGroups,
  [LinkType.ENDPOINTGROUP_TO_ENDPOINT]: endpointGroupsToEndpoints,
  [LinkType.EDGESTACK_TO_CONTAINER]: edgeStacksToContainers,
};

export function generateLinks(
  nodes: Nodes,
  linksConfig: LinksConfig
): GraphLink[] {
  return Object.entries(linkFuncs).flatMap(([type, func]) =>
    linksConfig[type as LinkType] ? func(nodes, type as LinkType) : []
  );
}

type GenerateOptions = Pick<GraphLink, 'strength' | 'distance'> & {
  inverted?: boolean;
};
function generate<S extends GraphNode, T extends GraphNode>(
  type: LinkType,
  sources: S[],
  targets: T[],
  targetFinderFunc: (source: S, target: T) => boolean,
  { strength = 1, inverted = false, distance = 1 }: Partial<GenerateOptions> = {
    inverted: false,
    strength: 1,
    distance: 1
  }
): GraphLink[] {
  return compact(
    flattenDeep(
      sources.map((source): GraphLink | undefined => {
        const target = targets.find((target) =>
          targetFinderFunc(source, target)
        );
        if (!target) return;
        return {
          source: inverted ? target.graphId : source.graphId,
          target: inverted ? source.graphId : target.graphId,
          dots: 1,
          visible: true,
          type,
          strength,
          distance
        };
      })
    )
  );
}

function edgeGroupsToTags(
  { edgeGroups, tags }: Nodes,
  type: LinkType
): GraphLink[] {
  return compact(
    edgeGroups.flatMap((group) =>
      group.tags?.map((id): GraphLink | undefined => {
        const tag = tags.find((t) => t.id === id);
        if (!tag) return;
        return {
          source: group.graphId,
          target: tag.graphId,
          dots: 1,
          visible: true,
          type,
          distance: 1,
          strength: 1
        };
      })
    )
  );
}

function tagsToEndpoints(
  { tags, endpoints }: Nodes,
  type: LinkType
): GraphLink[] {
  return compact(
    flattenDeep(
      endpoints.map((e) =>
        e.tags.map((id): GraphLink | undefined => {
          const tag = tags.find((t) => t.id === id);
          if (!tag) return;
          return {
            source: tag.graphId,
            target: e.graphId,
            dots: 1,
            visible: true,
            type,
            distance: 1,
            strength: 1
          };
        })
      )
    )
  );
}

function tagsToEndpointGroups(
  { tags, endpointGroups }: Nodes,
  type: LinkType
): GraphLink[] {
  return compact(
    flattenDeep(
      endpointGroups.map((e) =>
        e.tags.map((id): GraphLink | undefined => {
          const tag = tags.find((t) => t.id === id);
          if (!tag) return;
          return {
            source: tag.graphId,
            target: e.graphId,
            dots: 1,
            visible: true,
            type,
            distance: 1,
            strength: 1
          };
        })
      )
    )
  );
}

function endpointGroupsToEndpoints(
  { endpointGroups, endpoints }: Nodes,
  type: LinkType
): GraphLink[] {
  return compact(
    flattenDeep(
      endpoints.map((e): GraphLink | undefined => {
        const group = endpointGroups.find((g) => g.id === e.endpointGroup);
        if (!group) return;
        return {
          source: group.graphId,
          target: e.graphId,
          dots: 1,
          visible: true,
          type,
          distance: 1,
          strength: 1
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
    { strength: 1, distance: 1 }
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
  return compact<GraphLink>(
    schedules.flatMap((s) =>
      s.edgeGroupIds.map((id): GraphLink | undefined => {
        const group = edgeGroups.find((g) => g.id === id);
        if (!group) return;
        return {
          source: s.graphId,
          target: group.graphId,
          dots: 1,
          visible: true,
          type,
          distance: 1,
          strength: 1
        };
      })
    )
  );
}

function edgeStacksToEdgeGroups(
  { edgeStacks, edgeGroups }: Nodes,
  type: LinkType
) {
  return compact<GraphLink>(
    edgeStacks.flatMap((s) =>
      s.edgeGroups.map((e): GraphLink | undefined => {
        const group = edgeGroups.find((g) => g.id === e);
        if (!group) return;
        return {
          source: s.graphId,
          target: group.graphId,
          dots: 1,
          visible: true,
          type,
          distance: 1,
          strength: 1
        };
      })
    )
  );
}

function edgeStacksToContainers(
  { edgeStacks, containers }: Nodes,
  type: LinkType
) {
  return generate(
    type,
    containers,
    edgeStacks,
    (c, e) => c.edgeStack === e.id,
    { inverted: true }
  );
}

function edgeGroupsToEndpoints(
  { edgeGroups, endpoints }: Nodes,
  type: LinkType
) {
  return compact<GraphLink>(
    edgeGroups.flatMap((g) =>
      g.endpoints.map((e): GraphLink | undefined => {
        const endpoint = endpoints.find((i) => i.id === e);
        if (!endpoint) return;
        return {
          source: g.graphId,
          target: endpoint.graphId,
          dots: 1,
          visible: true,
          type,
          distance: 1,
          strength: 1
        };
      })
    )
  );
}
