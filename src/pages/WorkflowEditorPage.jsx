import { useEffect, useState, useMemo } from 'react';
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
import ChatPanel from '../components/workflow/ChatPanel';

const WorkflowEditorContent = () => {
  const { id } = useParams();
  const { loadWorkflow, isLoading, selectedNode, reset, nodes } = useWorkflowStore();
  const [chatOpen, setChatOpen] = useState(false);
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

  const hasAgent = useMemo(
    () => nodes.some((n) => {
      const rt = n.data?.registryType || n.data?.nodeType?.type || '';
      return rt === 'ai-agent';
    }),
    [nodes]
  );

  useEffect(() => {
    if (hasAgent && !chatOpen) setChatOpen(true);
  }, [hasAgent]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <ReactFlowCanvas />
          </div>
          {hasAgent && chatOpen && (
            <ChatPanel onClose={() => setChatOpen(false)} />
          )}
        </div>
        {selectedNode && <PropertiesPanel />}
      </div>
      {hasAgent && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-full
                     bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25
                     hover:bg-indigo-600 hover:shadow-xl transition-all z-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
      )}
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
