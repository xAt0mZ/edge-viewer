import { GraphNode } from './node';

export enum LinkType {
  CONTAINER_TO_ENDPOINT = 'container-to-endpoint',
  SCHEDULE_TO_CONTAINER = 'schedule-to-container',
  SCHEDULE_TO_EDGEGROUP = 'schedule-to-edgegroup',
  SCHEDULE_TO_EDGESTACK = 'schedule-to-edgestack',
  EDGESTACK_TO_EDGEGROUP = 'edgestack-to-edgegroup',
  EDGEGROUP_TO_ENDPOINT = 'edgegroup-to-endpoint',
  EDGEGROUP_TO_TAG = 'edgegroup-to-tag',
  TAG_TO_ENDPOINT = 'tag-to-endpoint',
  TAG_TO_ENDPOINTGROUP = 'tag-to-endpointgroup',
  ENDPOINTGROUP_TO_ENDPOINT = 'endpointgroup-to-endpoint',
  EDGESTACK_TO_CONTAINER = 'edgestack-to-container',
}

export const LinskNotes: { [v in LinkType]: string } = {
  [LinkType.CONTAINER_TO_ENDPOINT]: 'Retrieved from snapshot',
  [LinkType.SCHEDULE_TO_CONTAINER]:
    "Retrieved from containers label 'io.portainer.update.scheduleId'",
  [LinkType.SCHEDULE_TO_EDGEGROUP]: 'Set by user when creating the schedule',
  [LinkType.SCHEDULE_TO_EDGESTACK]: 'Created by us when creating the schedule',
  [LinkType.EDGESTACK_TO_EDGEGROUP]:
    'Set by us when creating a schedule stack. Otherwise set by user when deploying an edge stack.',
  [LinkType.EDGEGROUP_TO_ENDPOINT]: 'Static edge group definition',
  [LinkType.EDGEGROUP_TO_TAG]: 'Dynamic edge group definition',
  [LinkType.TAG_TO_ENDPOINT]: 'Endpoint configuration',
  [LinkType.TAG_TO_ENDPOINTGROUP]: 'Endpoint group configuration',
  [LinkType.ENDPOINTGROUP_TO_ENDPOINT]: 'Endpoint group configuration',
  [LinkType.EDGESTACK_TO_CONTAINER]:
    "Retrieved from containers label 'com.docker.compose.project.working_dir' if it contains '/edge_stacks/'",
};

export type LinksConfig = {
  [v in LinkType]: boolean;
};

// graph lib definition
type LibLink = {
  source: GraphNode;
  target: GraphNode;
  strength: number;
  distance: number;
};

export type GraphLink = LibLink & {
  type: LinkType; // used to control the color based on type
  dots: number; // used to control the number of moving dots along the link
  visible: boolean; // used to control the visibility of a link
};

type MandatoryLinkProps = Pick<GraphLink, 'source' | 'target' | 'type'>;
export type OptionalGraphLinkProps = Omit<GraphLink, keyof MandatoryLinkProps>;

export function GraphLink({
  source,
  target,
  type,
  distance = 1,
  dots = 1,
  strength = 1,
  visible = true,
}: MandatoryLinkProps & Partial<OptionalGraphLinkProps>): GraphLink {
  return {
    source,
    target,
    type,
    distance,
    dots,
    strength,
    visible,
  };
}
