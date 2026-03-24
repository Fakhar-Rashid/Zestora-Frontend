import toast from 'react-hot-toast';

import * as workflowService from '../services/workflowService';
import useWorkflowStore from '../store/workflowStore';

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleOutputs = (steps) => {
  if (!steps) return;
  const { updateNodeData } = useWorkflowStore.getState();

  for (const step of steps) {
    if (step.status !== 'success' || !step.outputData) continue;
    const out = step.outputData;

    // CSV download
    if (step.nodeType === 'csv-export' && out.csv) {
      downloadFile(out.csv, out.filename || 'export.csv', 'text/csv');
    }
    if (step.nodeType === 'file-download' && out.content) {
      downloadFile(out.content, out.filename || 'output.txt', 'text/plain');
    }

    // Text Output — push data into the node so it displays on canvas
    if (step.nodeType === 'text-output') {
      updateNodeData(step.nodeId, { lastOutput: out });
    }
  }
};

const applyStepStatuses = (steps) => {
  if (!steps) return;
  const { setNodeStatus } = useWorkflowStore.getState();
  for (const step of steps) {
    const status = step.status === 'success' ? 'success'
      : step.status === 'failed' ? 'error' : 'idle';
    setNodeStatus(step.nodeId, status);
  }
};

const runWorkflow = async () => {
  const { workflowMeta, saveWorkflow, setAllNodesStatus } = useWorkflowStore.getState();
  if (!workflowMeta?.id) return null;

  await saveWorkflow();
  setAllNodesStatus('running');

  try {
    const result = await workflowService.execute(workflowMeta.id);
    const execution = result.data;
    applyStepStatuses(execution?.steps);

    if (execution?.status === 'failed') {
      const failedStep = execution.steps?.find((s) => s.status === 'failed');
      toast.error(failedStep?.errorMessage || 'Execution failed');
    } else {
      toast.success('Workflow executed successfully');
      handleOutputs(execution?.steps);
    }

    setTimeout(() => {
      useWorkflowStore.getState().setAllNodesStatus('idle');
    }, 4000);

    return execution;
  } catch (err) {
    setAllNodesStatus('error');
    setTimeout(() => {
      useWorkflowStore.getState().setAllNodesStatus('idle');
    }, 4000);
    toast.error(err.response?.data?.error || 'Failed to execute');
    return null;
  }
};

export default runWorkflow;
