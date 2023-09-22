import { NodeType } from '../types/node';

export function graphId(type: NodeType, id: number | string): string {
  return `${type}-${id}`;
}
