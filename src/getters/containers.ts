import { compact, parseInt } from 'lodash';
import { ContainerNode, EndpointNode, Json } from '../types';
import { graphId } from '../utils/graphId';

export function getContainersNodes(
  json: Json,
  endpoints: EndpointNode[]
): ContainerNode[] {
  return compact(
    endpoints.flatMap(({ rawId }) => {
      const snap = json.snapshots.find((s) => s.EndpointId === rawId);
      if (!snap || !snap.Docker) {
        return;
      }
      return snap.Docker.DockerSnapshotRaw.Containers.map(
        ({ Id, Command, Labels }): ContainerNode => ({
          id: graphId('container', Id),
          type: 'container',
          rawId: Id,
          endpoint: snap.EndpointId,
          name: Command,
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
