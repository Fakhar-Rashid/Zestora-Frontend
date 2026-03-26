import { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import useNodeRegistryStore from '../../../store/nodeRegistryStore';
import useWorkflowStore from '../../../store/workflowStore';
import runWorkflow from '../../../utils/executeWorkflow';
import { ChatModelPanel, MemoryPanel, ToolPanel } from './AgentSubPanels';
import {
  Play, MessageCircle, Send, Mail, Bot, FileText, Smile,
  Youtube, MapPin, GitBranch, GitMerge, GitPullRequest,
  Scissors, FileSpreadsheet, Table, Globe, Clock, Zap,
  CheckCircle2, XCircle, Loader2, AlertTriangle,
  Cpu, Database, Wrench, Plus, Webhook, Brain, Shield,
  MessageSquare, BookOpen, Type,
} from 'lucide-react';

/* ─────────── Icon helpers ─────────── */

const ICON_MAP = {
  play: Play, 'message-circle': MessageCircle, send: Send,
  mail: Mail, bot: Bot, 'file-text': FileText, smile: Smile,
  youtube: Youtube, 'map-pin': MapPin, 'git-branch': GitBranch,
  'git-merge': GitMerge, 'git-pull-request': GitPullRequest,
  scissors: Scissors, 'file-spreadsheet': FileSpreadsheet,
  table: Table, globe: Globe, clock: Clock, zap: Zap,
  webhook: Webhook, type: Type,
  Play, MessageCircle, Send, Mail, Bot, FileText, Smile,
  Youtube, MapPin, GitBranch, GitMerge, GitPullRequest,
  Scissors, FileSpreadsheet, Table, Globe, Clock, Zap, Webhook, Type,
};

const getIcon = (name) => ICON_MAP[name] || Zap;

const STATUS = {
  running: { icon: Loader2, cls: 'animate-spin' },
  success: { icon: CheckCircle2, cls: '' },
  error: { icon: XCircle, cls: '' },
};

/* ─────────── Custom SVG Icons ─────────── */

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="white">
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const EmailIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

/* ─────────── Trigger configs ─────────── */

const TRIGGER_CONFIG = {
  'manual-trigger': { icon: Play, color: '#6366f1', label: 'Test workflow', fill: true },
  'whatsapp-receive': { icon: WhatsAppIcon, color: '#25D366', label: 'Receive WhatsApp message', fill: false, custom: true },
  'telegram-receive': { icon: TelegramIcon, color: '#0088cc', label: 'Receive Telegram message', fill: false, custom: true },
  'email-receive': { icon: EmailIcon, color: '#ef4444', label: 'Receive email', fill: false, custom: true },
  'webhook-trigger': { icon: Webhook, color: '#f59e0b', label: 'Webhook trigger', fill: false },
  'schedule-trigger': { icon: Clock, color: '#8b5cf6', label: 'Scheduled trigger', fill: false },
};

/* ─────────── Trigger Node ─────────── */

const TriggerNode = ({ data, selected }) => {
  const [running, setRunning] = useState(false);
  const registryType = data?.registryType || data?.nodeType?.type || '';
  const config = TRIGGER_CONFIG[registryType] || TRIGGER_CONFIG['manual-trigger'];
  const Icon = config.icon;
  const isManual = registryType === 'manual-trigger';
  const { status = 'idle' } = data;
  const statusInfo = STATUS[status];

  const handleClick = async (e) => {
    if (!isManual) return;
    e.stopPropagation();
    setRunning(true);
    await runWorkflow();
    setRunning(false);
  };

  const showStatus = !isManual && statusInfo;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <div
          onClick={isManual ? handleClick : undefined}
          className={`
            flex items-center justify-center w-16 h-16 rounded-full
            transition-all duration-200
            ${isManual ? 'cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95' : ''}
            ${selected ? 'ring-[3px] ring-offset-2 ring-offset-transparent' : ''}
            ${isManual && running ? 'shadow-lg' : ''}
          `}
          style={{
            background: config.color,
            boxShadow: selected ? `0 0 0 3px ${config.color}30` : undefined,
          }}
        >
          {isManual && running ? (
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          ) : showStatus ? (
            <statusInfo.icon
              className={`w-7 h-7 text-white ${statusInfo.cls}`}
            />
          ) : config.custom ? (
            <Icon className="w-7 h-7" />
          ) : (
            <Icon
              className="w-7 h-7 text-white"
              style={config.fill ? { fill: 'white' } : undefined}
            />
          )}
        </div>
        <Handle type="source" position={Position.Right}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: config.color, right: -6, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center max-w-[120px]">
        {config.label}
      </span>
    </div>
  );
};

/* ─────────── Send Node (play-button / triangle shape) ─────────── */

const SEND_CONFIG = {
  'whatsapp-send': { icon: WhatsAppIcon, color: '#25D366', label: 'Send WhatsApp message', custom: true },
  'telegram-send': { icon: TelegramIcon, color: '#0088cc', label: 'Send Telegram message', custom: true },
  'send-email': { icon: EmailIcon, color: '#ef4444', label: 'Send email', custom: true },
  'http-request': { icon: Globe, color: '#f59e0b', label: 'HTTP Request', custom: false },
};

const SendNode = ({ data, selected }) => {
  const { nodeType, status = 'idle' } = data;
  const registryType = data?.registryType || nodeType?.type || '';
  const config = SEND_CONFIG[registryType] || { icon: Send, color: '#6366f1', label: registryType, custom: false };
  const Icon = config.icon;
  const statusInfo = STATUS[status];
  const showStatus = statusInfo;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <Handle type="target" position={Position.Left}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: config.color, left: -6, top: '50%', transform: 'translateY(-50%)' }}
        />

        {/* Play-button / rounded triangle shape */}
        <svg width="72" height="72" viewBox="0 0 72 72"
          className={`transition-all duration-200 ${selected ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : ''}`}
        >
          <path
            d="M12 6 C8 6, 6 8, 6 12 L6 60 C6 64, 8 66, 12 66 L50 66 C53 66, 55 65, 57 62 L68 40 C70 37, 70 35, 68 32 L57 10 C55 7, 53 6, 50 6 Z"
            fill={config.color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingRight: '12%' }}>
          {showStatus ? (
            <statusInfo.icon
              className={`w-7 h-7 text-white ${statusInfo.cls}`}
            />
          ) : config.custom ? (
            <Icon className="w-7 h-7" />
          ) : (
            <Icon className="w-7 h-7 text-white" />
          )}
        </div>
      </div>
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center max-w-[130px]">
        {config.label}
      </span>
    </div>
  );
};

/* ─────────── Standard Node ─────────── */

const StandardNode = ({ data, selected }) => {
  const { label, nodeType, status = 'idle' } = data;
  const color = nodeType?.color || '#6366f1';
  const Icon = getIcon(nodeType?.icon);
  const inputs = nodeType?.inputs ?? 1;
  const outputs = nodeType?.outputs ?? 1;
  const statusInfo = STATUS[status];

  return (
    <div
      className={`
        group relative w-[220px] rounded-xl
        bg-white dark:bg-[#1c1c28]
        border-[1.5px] transition-all duration-150
        ${selected
          ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
          : 'border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'}
        shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]
        hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]
      `}
    >
      {inputs > 0 && (
        <Handle type="target" position={Position.Left}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: color, left: -6 }}
        />
      )}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: `${color}18` }}>
          <Icon className="w-[18px] h-[18px]" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">
            {label}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {nodeType?.description || nodeType?.category}
          </p>
        </div>
        {statusInfo && (
          <statusInfo.icon className={`w-4 h-4 shrink-0 ${statusInfo.cls}`}
            style={{ color: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#60a5fa' }} />
        )}
      </div>
      {outputs > 0 && (
        <Handle type="source" position={Position.Right}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: color, right: -6 }}
        />
      )}
    </div>
  );
};

/* ─────────── Agent Node (n8n-style with + buttons) ─────────── */

const AGENT_BUTTONS = [
  { id: 'chatModel', label: 'Chat Model', icon: Cpu, color: '#3b82f6', configKey: 'provider' },
  { id: 'memory', label: 'Memory', icon: Brain, color: '#f59e0b', configKey: 'memoryEnabled' },
  { id: 'tool', label: 'Tool', icon: Wrench, color: '#10b981', configKey: 'enableTools' },
];

const AgentNode = ({ data, selected, id }) => {
  const { label, nodeType, status = 'idle', config = {} } = data;
  const color = nodeType?.color || '#8b5cf6';
  const statusInfo = STATUS[status];
  const [openPanel, setOpenPanel] = useState(null);

  // Read latest config from store so panels get fresh data
  const liveNodes = useWorkflowStore((s) => s.nodes);
  const liveConfig = liveNodes.find((n) => n.id === id)?.data?.config || config;

  const togglePanel = useCallback((panelId) => {
    setOpenPanel((prev) => (prev === panelId ? null : panelId));
  }, []);

  const closePanel = useCallback(() => setOpenPanel(null), []);

  // Derive configured status
  const hasModel = !!liveConfig.provider && !!liveConfig.credentialId;
  const hasMemory = liveConfig.memoryEnabled !== false;
  const hasTools = liveConfig.enableTools !== false;

  const isConfigured = (btnId) => {
    if (btnId === 'chatModel') return hasModel;
    if (btnId === 'memory') return hasMemory;
    if (btnId === 'tool') return hasTools;
    return false;
  };

  return (
    <div className="flex flex-col items-center">
      {/* ── Main node card ── */}
      <div
        className={`
          relative w-[220px] rounded-2xl
          bg-white dark:bg-[#1c1c28]
          border-[1.5px] transition-all duration-150
          ${selected
            ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
            : 'border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'}
          shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]
        `}
      >
        <Handle type="target" position={Position.Left}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: color, left: -6 }}
        />

        {/* Agent header */}
        <div className="flex flex-col items-center py-3 px-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl mb-1.5"
            style={{ background: `${color}15` }}>
            <Bot className="w-5 h-5" style={{ color }} />
          </div>
          <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 text-center">
            {label}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {liveConfig.provider && liveConfig.credentialId
              ? `${liveConfig.provider}${liveConfig.model ? ` · ${liveConfig.model}` : ''}`
              : 'Tools Agent'}
          </p>
          {statusInfo && (
            <statusInfo.icon className={`w-4 h-4 mt-1 ${statusInfo.cls}`}
              style={{ color: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#60a5fa' }} />
          )}
        </div>

        <Handle type="source" position={Position.Right}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: color, right: -6 }}
        />
      </div>

      {/* ── Three + buttons (n8n style) ── */}
      <div className="flex items-start justify-center gap-6 mt-2">
        {AGENT_BUTTONS.map((btn) => {
          const BtnIcon = btn.icon;
          const configured = isConfigured(btn.id);
          const isOpen = openPanel === btn.id;

          return (
            <div key={btn.id} className="relative flex flex-col items-center">
              {/* Dotted connector line */}
              <div className="w-px h-3 border-l border-dashed border-gray-300 dark:border-gray-600" />

              {/* + Button */}
              <button
                data-agent-btn
                onClick={(e) => { e.stopPropagation(); togglePanel(btn.id); }}
                className={`
                  group relative flex items-center justify-center w-8 h-8 rounded-full
                  border-[1.5px] transition-all duration-200
                  ${configured
                    ? 'border-transparent shadow-md hover:shadow-lg hover:scale-110'
                    : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1c1c28] hover:border-solid hover:shadow-md hover:scale-110'}
                  ${isOpen ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#1c1c28] scale-110 shadow-lg' : ''}
                `}
                style={configured ? { background: btn.color, ...(isOpen ? { ringColor: btn.color } : {}) } : (isOpen ? { borderColor: btn.color, borderStyle: 'solid' } : {})}
                title={btn.label}
              >
                {configured ? (
                  <BtnIcon className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                )}
              </button>

              {/* Label */}
              <span className={`text-[9px] font-medium mt-1 whitespace-nowrap transition-colors
                ${configured ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {btn.label}
              </span>

              {/* ── Floating config panel ── */}
              {isOpen && btn.id === 'chatModel' && (
                <ChatModelPanel nodeId={id} config={liveConfig} onClose={closePanel} />
              )}
              {isOpen && btn.id === 'memory' && (
                <MemoryPanel nodeId={id} config={liveConfig} onClose={closePanel} />
              )}
              {isOpen && btn.id === 'tool' && (
                <ToolPanel nodeId={id} config={liveConfig} onClose={closePanel} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────── Text Output Node ─────────── */

const TextOutputNode = ({ data, selected, id }) => {
  const { label, nodeType, status = 'idle' } = data;
  const color = nodeType?.color || '#10b981';
  const statusInfo = STATUS[status];

  // Get output text from execution results
  const [displayText, setDisplayText] = useState('');
  const nodes = useWorkflowStore((s) => s.nodes);

  // Listen for execution output data
  useEffect(() => {
    const node = nodes.find((n) => n.id === id);
    const outputData = node?.data?.lastOutput;
    if (outputData) {
      const text = outputData.displayText || outputData.responseMessage || outputData.text || outputData.content || '';
      setDisplayText(text);
    }
  }, [nodes, id]);

  return (
    <div
      className={`
        group relative w-[260px] rounded-xl
        bg-white dark:bg-[#1c1c28]
        border-[1.5px] transition-all duration-150
        ${selected
          ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
          : 'border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'}
        shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]
      `}
    >
      <Handle type="target" position={Position.Left}
        className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
        style={{ background: color, left: -6 }}
      />
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: `${color}18` }}>
          <Type className="w-[18px] h-[18px]" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">
            {label}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
            Text Output
          </p>
        </div>
        {statusInfo && (
          <statusInfo.icon className={`w-4 h-4 shrink-0 ${statusInfo.cls}`}
            style={{ color: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#60a5fa' }} />
        )}
      </div>
      {/* Output display area */}
      <div className="px-3 py-2 min-h-[40px] max-h-[150px] overflow-y-auto">
        {displayText ? (
          <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {displayText}
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-gray-600 italic text-center py-2">
            Output will appear here after execution
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Right}
        className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
        style={{ background: color, right: -6 }}
      />
    </div>
  );
};

/* ─────────── Router ─────────── */

const TRIGGER_TYPES = new Set(Object.keys(TRIGGER_CONFIG));
const SEND_TYPES = new Set(Object.keys(SEND_CONFIG));

const CustomNode = ({ data, selected, id }) => {
  const registryType = data?.registryType || data?.nodeType?.type || '';
  const liveMeta = useNodeRegistryStore.getState().nodeTypes
    .find((n) => n.type === registryType);
  const mergedData = { ...data, nodeType: { ...data.nodeType, ...(liveMeta || {}) } };

  if (TRIGGER_TYPES.has(registryType)) {
    return <TriggerNode data={mergedData} selected={selected} />;
  }
  if (SEND_TYPES.has(registryType)) {
    return <SendNode data={mergedData} selected={selected} />;
  }
  if (registryType === 'ai-agent') {
    return <AgentNode data={mergedData} selected={selected} id={id} />;
  }
  if (registryType === 'text-output') {
    return <TextOutputNode data={mergedData} selected={selected} id={id} />;
  }
  return <StandardNode data={mergedData} selected={selected} />;
};

export default memo(CustomNode);
