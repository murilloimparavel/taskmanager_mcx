import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProjects } from '@/app/actions/project';
import { getTasks } from '@/app/actions/task';
import Sidebar from '@/components/Sidebar';
import TaskBoard from '@/components/TaskBoard';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const { projectId } = await searchParams;
  const projects = await getProjects();
  const tasks = await getTasks(projectId);

  const selectedProject = projects.find((p: { id: string; name: string }) => p.id === projectId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar projects={projects} selectedProjectId={projectId} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TaskBoard
          tasks={tasks}
          projectId={projectId}
          projectName={selectedProject?.name}
        />
      </main>
    </div>
  );
}
