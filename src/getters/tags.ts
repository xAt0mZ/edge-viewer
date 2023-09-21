import { graphId } from '../utils/graphId';
import { Json, TagNode } from '../types';
import { parseInt } from 'lodash';

export function getTagsNodes(json: Json): TagNode[] {
  return json.tags.map(({ ID, Name, Endpoints, EndpointGroups }) => ({
    graphId: graphId('tag', ID),
    type: 'tag',
    name: Name,
    id: ID,
    endpointGroups: Object.keys(EndpointGroups).map(parseInt),
    endpoints: Object.keys(Endpoints).map(parseInt),
  }));
}
