export type LinkType =
  | 'container-to-endpoint'
  | 'schedule-to-container'
  | 'schedule-to-edgegroup'
  | 'schedule-to-edgestack'
  | 'edgestack-to-edgegroup'
  | 'edgegroup-to-endpoint'
  | 'edgegroup-to-tag'
  | 'tag-to-endpoint'
  | 'tag-to-endpointgroup'
  | 'endpointgroup-to-endpoint';
// edgestack-to-container

export type LinksConfig = {
  [v in LinkType]: boolean;
};

// graph lib definition
type LibLink = {
  source: string; // node.graphId
  target: string; // node.graphId
};

export type GraphLink = LibLink & {
  type: LinkType; // used to control the color based on type
  dots: number; // used to control the number of moving dots along the link
  visible: boolean; // used to control the visibility of a link
};