import ResourceManagement from '../components/Admin/ResourceManagement';
import ManagerBroadcastPanel from '../components/Manager/ManagerBroadcastPanel';

export default function ManagerDashboard() {
  return (
    <div>
      <ManagerBroadcastPanel />
      <ResourceManagement canCreate={true} canDelete={false} roleLabel="Manager" />
    </div>
  );
}
