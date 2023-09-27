import { ComponentPropsWithRef, useRef } from 'react';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext';

import { GraphNode, NodeType } from './types/node';
import { GraphLink } from './types/link';
import { useOptions } from './hooks/useOptions';
import { useWindowSize } from '@react-hook/window-size';

export type GraphData = Props2D['graphData'] | Props3D['graphData'];

// type MatchingKeys<T, U> = {
//   [K in keyof T & keyof U]: T[K] extends U[K] ? K : never;
// };
// type CommonKeys = MatchingKeys<Props2D, Props3D>[keyof Props2D & keyof Props3D];

// type CommonKeys = Extract<keyof Props2D, keyof Props3D>;

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
export function Graph({ graphData, ...nodeClickActions }: Props) {
  const { options } = useOptions();
  const [width, height] = useWindowSize();

  const commonProps: CommonProps = {
    nodeId: 'graphId',
    nodeLabel: (n: GraphNode) =>
      `<div style="display: flex; flex-direction: column; align-items: center; background-color: black; padding: 0.5rem;">
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
    <Graph3D graphData={graphData} {...commonProps} {...nodeClickActions} />
  ) : (
    <Graph2D graphData={graphData} {...commonProps} {...nodeClickActions} />
  );
}

type Props2D = ComponentPropsWithRef<typeof ForceGraph2D<GraphNode, GraphLink>>;
function Graph2D(props: Props2D) {
  const fgRef: Props2D['ref'] = useRef();

  // useEffect(() => {
  //   const fg = fgRef.current;
  //   if (!fg) return;
  //   // const charge = fg.d3Force('charge');
  //   // fg.d3Force('charge', charge.)
  //   // fg.d3Force('link', () => ({}))
  //   // fg.d3Force('charge', () => ({}))
  //   // fg.d3Force('charge')!.strength(-1)
  //   fg.d3Force('link')!
  //     .distance((link: GraphLink) => link.distance)
  //     .strength((link: GraphLink) => link.strength);
  //   console.log('link', fg.d3Force('link'));
  //   console.log('charge', fg.d3Force('charge'));
  // }, []);

  const { options } = useOptions();

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      {...props}
      ref={fgRef}
      nodeRelSize={options.showNames ? 1 : undefined}
      nodeCanvasObject={
        !options.showNames
          ? undefined
          : (node, ctx, globalScale) => {
              const nodeType = node.type as string;
              const nodeName = node.name;

              const fontSize = 16 / globalScale;

              ctx.font = `${fontSize}px Sans-serif`;

              const bgDimensions = getBgDimensions(
                ctx,
                fontSize,
                nodeType,
                nodeName
              );

              // draw border
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.lineWidth = 1 / globalScale;
              ctx.strokeRect(
                node.x! - bgDimensions.x / 2,
                node.y! - bgDimensions.y / 2,
                bgDimensions.x,
                bgDimensions.y
              );

              // draw background
              ctx.fillStyle = '#000000';
              ctx.fillRect(
                node.x! - bgDimensions.x / 2,
                node.y! - bgDimensions.y / 2,
                bgDimensions.x,
                bgDimensions.y
              );

              // draw text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color;
              ctx.fillText(nodeType, node.x!, node.y! - fontSize / 2);
              ctx.fillText(nodeName, node.x!, node.y! + fontSize / 2);
            }
      }
      nodePointerAreaPaint={
        !options.showNames
          ? undefined
          : (node, color, ctx, globalScale) => {
              ctx.fillStyle = color;

              const fontSize = 16 / globalScale;
              const bgDimensions = getBgDimensions(
                ctx,
                fontSize,
                node.type as string,
                node.name
              );

              ctx.fillRect(
                node.x! - bgDimensions.x / 2,
                node.y! - bgDimensions.y / 2,
                bgDimensions.x,
                bgDimensions.y
              );
            }
      }
    />
  );
}

function getBgDimensions(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  nodeType: string,
  nodeName: string
) {
  const padding = fontSize * 0.2;

  const textWidth = Math.max(
    ctx.measureText(nodeType).width,
    ctx.measureText(nodeName).width
  );

  const bgDimensions = {
    x: textWidth + padding,
    y: (fontSize + padding) * 2, // 2 lines text
  };
  return bgDimensions;
}

type Props3D = ComponentPropsWithRef<typeof ForceGraph3D<GraphNode, GraphLink>>;
function Graph3D(props: Props3D) {
  const { options } = useOptions();

  return (
    <ForceGraph3D<GraphNode, GraphLink>
      {...props}
      linkOpacity={0.8} // default is 0.2 which is not bright enough
      nodeThreeObjectExtend={!!options.showNames}
      nodeThreeObject={
        !options.showNames
          ? undefined
          : (node: { name: string; color: string; type: NodeType }) => {
              const sprite = new SpriteText(
                `${node.type}\n${node.name}`,
                2,
                node.color
              );
              sprite.backgroundColor = '#000000';
              sprite.borderColor = '#ffffff';
              sprite.borderWidth = 0.4;
              sprite.borderRadius = 4;
              sprite.padding = 1;
              return sprite;
            }
      }
    />
  );
}
