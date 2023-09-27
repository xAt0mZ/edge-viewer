import { compact, flattenDeep, merge } from 'lodash';
import { GraphNode, Nodes, TagNode } from '../types/node';
import {
  GraphLink,
  LinkType,
  LinksConfig,
  OptionalGraphLinkProps,
} from '../types/link';

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

type LinkerFuncReturn = [GraphLink[], Partial<Nodes>];

const linkFuncs: {
  [k in LinkType]: (nodes: Nodes, type: LinkType) => LinkerFuncReturn;
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
): [GraphLink[], Nodes] {
  const generated = Object.entries(linkFuncs).map(
    ([type, func]): LinkerFuncReturn =>
      linksConfig[type as LinkType] ? func(nodes, type as LinkType) : [[], {}]
  );

  const { links, nodes: newNodes } = generated.reduce(
    ({ links, nodes }, [l, n]) => ({
      links: links.concat(l),
      nodes: merge(nodes, n),
    }),
    {
      links: [],
      nodes,
    } as { links: GraphLink[]; nodes: Nodes }
  );

  return [links, newNodes];
}

type Values<V extends GraphNode> = {
  type: V['type'];
  values: V[];
  filter?: (v: V) => boolean;
};

type GenerateProps<S extends GraphNode, T extends GraphNode> = {
  type: LinkType;
  sources: Values<S>;
  targets: Values<T>;
  find: (source: S, target: T) => boolean;
  inverted?: boolean;
  linkOptions?: Partial<OptionalGraphLinkProps>;
};

function generate<S extends GraphNode, T extends GraphNode>({
  type,
  sources,
  targets,
  find,
  inverted,
  linkOptions,
}: GenerateProps<S, T>): LinkerFuncReturn {
  const filteredSources = sources.values.filter(sources.filter ?? (() => true));
  const filteredTargets = targets.values.filter(targets.filter ?? (() => true));

  return [
    compact(
      filteredSources.flatMap((source): GraphLink | undefined => {
        const target = filteredTargets.find((target) => find(source, target));
        if (!target) {
          console.log(
            `${inverted ? targets.type : sources.type} -> ${
              inverted ? sources.type : targets.type
            } not found`,
            source
          );
          return;
        }
        return GraphLink({
          source: inverted ? target : source,
          target: inverted ? source : target,
          type,
          ...linkOptions,
        });
      })
    ),
    {},
  ];
}

function edgeGroupsToTags(
  { edgeGroups, tags }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return [
    compact(
      edgeGroups.flatMap((group) =>
        group.tags?.map((id): GraphLink | undefined => {
          const tag = tags.find((t) => t.id === id);
          if (!tag) {
            console.log('edgegroup -> tag relation not found');
            return;
          }
          return GraphLink({
            source: group,
            target: tag,
            type,
          });
        })
      )
    ),
    {},
  ];
}

function tagsToEndpoints(
  { tags, endpoints }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return [
    compact(
      flattenDeep(
        endpoints.map((e) =>
          e.tags.map((id): GraphLink | undefined => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) {
              console.log('tag -> endpoint relation not found');
              const node: TagNode = {
                id,
                name: '',
                type: 'tag',
                visible: true,
                graphId: '',
                endpointGroups: [],
                endpoints: [],
              };
              return GraphLink({
                source: node,
                target: e,
                type,
              });
            }
            return GraphLink({
              source: tag,
              target: e,
              type,
            });
          })
        )
      )
    ),
    {},
  ];
}

function tagsToEndpointGroups(
  { tags, endpointGroups }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return [
    compact(
      flattenDeep(
        endpointGroups.map((e) =>
          e.tags.map((id): GraphLink | undefined => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) {
              console.log('tag -> endpoint group relation not found');
              return;
            }
            return GraphLink({
              source: tag,
              target: e,
              type,
            });
          })
        )
      )
    ),
    {},
  ];
}

function endpointGroupsToEndpoints(
  { endpointGroups, endpoints }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return generate({
    type,
    sources: {
      values: endpoints,
      type: 'endpoint',
    },
    targets: {
      values: endpointGroups,
      type: 'endpointgroup',
    },
    find: (e, g) => e.endpointGroup === g.id,
    inverted: true,
  });
}

function containersToEndpoints(
  { containers, endpoints }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return generate({
    type,
    sources: {
      values: containers,
      type: 'container',
    },
    targets: {
      values: endpoints,
      type: 'endpoint',
    },
    find: (container, endpoint) => container.endpoint === endpoint.id,
  });
}

function schedulesToContainers(
  { schedules, containers }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return generate({
    type,
    sources: {
      values: containers,
      type: 'container',
      filter: (container) => container.schedule !== 0,
    },
    targets: {
      values: schedules,
      type: 'schedule',
    },
    find: (container, schedule) => schedule.id === container.schedule,
    inverted: true,
  });
}

function schedulesToEdgeStacks(
  { schedules, edgeStacks }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return generate({
    type,
    sources: {
      values: edgeStacks,
      type: 'edgestack',
      filter: (stack) => stack.schedule !== 0,
    },
    targets: {
      values: schedules,
      type: 'schedule',
    },
    find: (stack, schedule) => stack.schedule === schedule.id,
    inverted: true,
  });
}

function schedulesToEdgeGroups(
  { schedules, edgeGroups }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return [
    compact<GraphLink>(
      schedules.flatMap((s) =>
        s.edgeGroupIds.map((id): GraphLink | undefined => {
          const group = edgeGroups.find((g) => g.id === id);
          if (!group) {
            console.log('schedule -> edgegroup relation not found');
            return;
          }
          return GraphLink({
            source: s,
            target: group,
            type,
          });
        })
      )
    ),
    {},
  ];
}

function edgeStacksToEdgeGroups(
  { edgeStacks, edgeGroups }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return [
    compact<GraphLink>(
      edgeStacks.flatMap((s) =>
        s.edgeGroups.map((e): GraphLink | undefined => {
          const group = edgeGroups.find((g) => g.id === e);
          if (!group) {
            console.log('edgestack -> edgegroup relation not found');
            return;
          }
          return GraphLink({
            source: s,
            target: group,
            type,
          });
        })
      )
    ),
    {},
  ];
}

function edgeStacksToContainers(
  { edgeStacks, containers }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return generate({
    type,
    sources: {
      values: containers,
      type: 'container',
      filter: (container) => container.edgeStack !== 0,
    },
    targets: {
      values: edgeStacks,
      type: 'edgestack',
    },
    find: (c, e) => c.edgeStack === e.id,
    inverted: true,
  });
}

function edgeGroupsToEndpoints(
  { edgeGroups, endpoints }: Nodes,
  type: LinkType
): LinkerFuncReturn {
  return [
    compact<GraphLink>(
      edgeGroups.flatMap((g) =>
        g.endpoints.map((e): GraphLink | undefined => {
          const endpoint = endpoints.find((i) => i.id === e);
          if (!endpoint) {
            console.log('edgegroup -> endpoint relation not found');
            return;
          }
          return GraphLink({
            source: g,
            target: endpoint,
            type,
          });
        })
      )
    ),
    {},
  ];
}
