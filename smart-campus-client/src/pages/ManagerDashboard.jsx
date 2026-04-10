import ResourceManagement from '../components/Admin/ResourceManagement';

export default function ManagerDashboard() {
  return <ResourceManagement canCreate={true} canDelete={false} roleLabel="Manager" />;
}
