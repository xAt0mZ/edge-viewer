import { Json } from '../types/json';
import { Nodes } from '../types/node';
import { getContainersNodes } from './containers';
import { getEdgeGroupsNodes } from './edgeGroups';
import { getEdgeStacksNodes } from './edgeStacks';
import { getEndpointGroupsNodes } from './endpointGroups';
import { getEndpointsNodes } from './endpoints';
import { getScheduleNodes } from './schedules';
import { getTagsNodes } from './tags';

export function generateNodes(json: Json): Nodes {
  const endpoints = getEndpointsNodes(json);
  const containers = getContainersNodes(json, endpoints);
  const schedules = getScheduleNodes(json);
  const edgeStacks = getEdgeStacksNodes(json);
  const edgeGroups = getEdgeGroupsNodes(json);
  const endpointGroups = getEndpointGroupsNodes(json);
  const tags = getTagsNodes(json);
  return {
    endpoints,
    containers,
    schedules,
    edgeStacks,
    edgeGroups,
    endpointGroups,
    tags,
  };
}
