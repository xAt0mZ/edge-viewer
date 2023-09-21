import { compact, parseInt } from 'lodash';
import { ContainerNode, EndpointNode, Json } from '../types';
import { graphId } from '../utils/graphId';

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
          type: 'container',
          name: Names[0].slice(1),
          id: Id,
          endpoint: snap.EndpointId,
          schedule: Labels['io.portainer.update.scheduleId'],
          edgeStack: parseInt(
            Labels['com.docker.compose.project.working_dir']?.split(
              '/edge_stacks/'
            )[2] || '-1'
          ),
        })
      );
    })
  );
}
