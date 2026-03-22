import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import useWorkflowStore from '../store/workflowStore';
import useNodeRegistryStore from '../store/nodeRegistryStore';
import EditorToolbar from '../components/workflow/EditorToolbar';
import NodePaletteSidebar from '../components/workflow/NodePaletteSidebar';
import ReactFlowCanvas from '../components/workflow/ReactFlowCanvas';
import PropertiesPanel from '../components/workflow/PropertiesPanel';

const WorkflowEditorContent = () => {
  const { id } = useParams();
  const { loadWorkflow, isLoading, selectedNode, reset } = useWorkflowStore();
  const { fetchRegistry } = useNodeRegistryStore();

  // Load workflow and registry on mount
  useEffect(() => {
    const init = async () => {
      await fetchRegistry(true);
      if (id) {
        const result = await loadWorkflow(id);
        if (!result.success) {
          toast.error(result.error || 'Failed to load workflow');
        }
      }
    };
    init();

    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const { saveWorkflow } = useWorkflowStore.getState();
        saveWorkflow().then((result) => {
          if (result.success) {
            toast.success('Workflow saved');
          } else {
            toast.error(result.error || 'Failed to save');
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <EditorToolbar />
      <div className="flex-1 flex overflow-hidden">
        <NodePaletteSidebar />
        <ReactFlowCanvas />
        {selectedNode && <PropertiesPanel />}
      </div>
    </div>
  );
};

const WorkflowEditorPage = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
};

export default WorkflowEditorPage;
