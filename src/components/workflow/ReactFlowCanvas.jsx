import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useWorkflowStore from '../../store/workflowStore';
import CustomNode from './nodes/CustomNode';

const nodeTypes = { custom: CustomNode };

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#6366f1', strokeWidth: 1.5 },
  animated: true,
};

const ReactFlowCanvas = () => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes, edges, onNodesChange, onEdgesChange,
    onConnect, selectNode, addNode,
  } = useWorkflowStore();

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    let nodeType;
    try { nodeType = JSON.parse(raw); } catch { return; }
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode('custom', position, {
      label: nodeType.label || nodeType.type,
      nodeType,
      registryType: nodeType.type,
      config: {},
      status: 'idle',
    });
  }, [screenToFlowPosition, addNode]);

  const onNodeClick = useCallback((_e, node) => selectNode(node), [selectNode]);
  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls
          showInteractive={false}
          className="!rounded-lg !border !border-gray-200 dark:!border-gray-700/50 !shadow-sm !overflow-hidden"
        />
        <MiniMap
          nodeColor={(n) => n.data?.nodeType?.color || '#6366f1'}
          maskColor="rgba(0,0,0,0.06)"
          className="!rounded-lg !border !border-gray-200 dark:!border-gray-700/50"
          pannable
          zoomable
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="var(--dot-color)"
        />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowCanvas;
