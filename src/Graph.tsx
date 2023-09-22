import { ComponentPropsWithRef } from 'react';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext';

import { GraphNode } from './types/node';
import { GraphLink } from './types/link';
import { useOptions } from './hooks/useOptions';
import { useWindowSize } from '@react-hook/window-size';

export type GraphData = Props2D['graphData'] | Props3D['graphData'];

type CommonKeys =
  | 'nodeId'
  | 'nodeLabel'
  | 'nodeAutoColorBy'
  | 'nodeVisibility'
  | 'linkAutoColorBy'
  | 'linkVisibility'
  | 'linkDirectionalParticles'
  | 'linkDirectionalParticleSpeed'
  | 'linkDirectionalArrowLength'
  | 'linkDirectionalArrowRelPos'
  | 'linkCurvature'
  | 'width'
  | 'height';
type CommonProps2D = Pick<Props2D, CommonKeys>;
type CommonProps3D = Pick<Props3D, CommonKeys>;
type CommonProps = CommonProps2D | CommonProps3D;

type NodeClickActions =
  | Pick<Props2D, 'onNodeClick' | 'onNodeRightClick'>
  | Pick<Props3D, 'onNodeClick' | 'onNodeRightClick'>;

type Props = NodeClickActions & {
  graphData: GraphData;
};
export function Graph({ graphData }: Props) {
  const { options } = useOptions();
  const [width, height] = useWindowSize();

  const commonProps: CommonProps = {
    nodeId: 'graphId',
    nodeLabel: (n: GraphNode) =>
      `<div style="display: flex; flex-direction: column;">
        <span>${n.graphId.slice(0, 30)}</span>
        <span>${n.name}</span>
      </div>`,
    nodeAutoColorBy: 'type',
    nodeVisibility: 'visible',
    linkAutoColorBy: 'type',
    linkVisibility: 'visible',
    linkDirectionalParticles: 'dots',
    linkDirectionalParticleSpeed: (l: GraphLink) => l.dots * 0.001,
    linkDirectionalArrowLength: 3.5,
    linkDirectionalArrowRelPos: 1,
    linkCurvature: 0,
    width,
    height,
  };

  return options.use3d ? (
    <Graph3D graphData={graphData} {...commonProps} />
  ) : (
    <Graph2D graphData={graphData} {...commonProps} />
  );
}

type Props2D = ComponentPropsWithRef<typeof ForceGraph2D<GraphNode, GraphLink>>;
function Graph2D(props: Props2D) {
  const { options } = useOptions();

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      {...props}
      nodeRelSize={options.showNames ? 1 : undefined}
      nodeCanvasObject={
        !options.showNames
          ? undefined
          : (node, ctx, globalScale) => {
              const label = node.name as string;
              const fontSize = 20 / globalScale;
              ctx.font = `${fontSize}px Sans-serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(
                (n) => n + fontSize * 0.2
              ); // some padding
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.lineWidth = 1 / globalScale;
              ctx.strokeRect(
                node.x! - bckgDimensions[0] / 2,
                node.y! - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );
              ctx.fillStyle = '#000000';
              ctx.fillRect(
                node.x! - bckgDimensions[0] / 2,
                node.y! - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color;
              ctx.fillText(label, node.x!, node.y!);

              node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            }
      }
      nodePointerAreaPaint={
        !options.showNames
          ? undefined
          : (node, color, ctx) => {
              ctx.fillStyle = color;
              const bckgDimensions: [number, number] = node.__bckgDimensions;
              bckgDimensions &&
                ctx.fillRect(
                  node.x! - bckgDimensions[0] / 2,
                  node.y! - bckgDimensions[1] / 2,
                  ...bckgDimensions
                );
            }
      }
    />
  );
}

type Props3D = ComponentPropsWithRef<typeof ForceGraph3D<GraphNode, GraphLink>>;
function Graph3D(props: Props3D) {
  const { options } = useOptions();

  return (
    <ForceGraph3D<GraphNode, GraphLink>
      {...props}
      linkOpacity={0.8} // default is 0.2 which is not bright enough
      nodeThreeObject={
        !options.showNames
          ? undefined
          : (node: { name: string; color: string }) =>
              new SpriteText(node.name, 8, node.color)
      }
    />
  );
}
