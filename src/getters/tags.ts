import { parseInt } from 'lodash';

import { graphId } from '../utils/graphId';
import { Json } from '../types/json';
import { TagNode } from '../types/node';

export function getTagsNodes(json: Json): TagNode[] {
  return json.tags.map(({ ID, Name, Endpoints, EndpointGroups }) => ({
    graphId: graphId('tag', ID),
    visible: true,
    type: 'tag',
    name: Name,
    id: ID,
    endpointGroups: Object.keys(EndpointGroups).map(parseInt),
    endpoints: Object.keys(Endpoints).map(parseInt),
  }));
}
