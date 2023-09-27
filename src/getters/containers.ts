import { compact } from 'lodash';

import { graphId } from '../utils/graphId';
import { Json } from '../types/json';
import { ContainerNode, EndpointNode } from '../types/node';

export function getContainersNodes(
  json: Json,
  endpoints: EndpointNode[]
): ContainerNode[] {
  return compact(
    endpoints.flatMap(({ id }) => {
      const snap = json.snapshots.find((s) => s.EndpointId === id);
      if (!snap || !snap.Docker) {
        return;
      }
      return snap.Docker.DockerSnapshotRaw.Containers.map(
        ({ Id, Labels, Names }): ContainerNode => ({
          graphId: graphId('container', Id),
          visible: true,
          type: 'container',
          name: Names[0].slice(1),
          id: Id,
          endpoint: snap.EndpointId,
          schedule: parseInt(Labels['io.portainer.update.scheduleId'] || '0'),
          edgeStack: parseInt(
            Labels['com.docker.compose.project.working_dir']?.split(
              '/edge_stacks/'
            )[1] || '0'
          ),
        })
      );
    })
  );
}
