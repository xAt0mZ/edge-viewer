import { NodeType } from '../types';

export function graphId(type: NodeType, id: number | string): string {
  return `${type}-${id}`;
}
