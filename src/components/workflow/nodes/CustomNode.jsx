import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import useNodeRegistryStore from '../../../store/nodeRegistryStore';
import runWorkflow from '../../../utils/executeWorkflow';
import {
  Play, MessageCircle, Send, Mail, Bot, FileText, Smile,
  Youtube, MapPin, GitBranch, GitMerge, GitPullRequest,
  Scissors, FileSpreadsheet, Table, Globe, Clock, Zap,
  CheckCircle2, XCircle, Loader2, AlertTriangle,
  Cpu, Database, Wrench, Plus, Webhook,
} from 'lucide-react';

const ICON_MAP = {
  play: Play, 'message-circle': MessageCircle, send: Send,
  mail: Mail, bot: Bot, 'file-text': FileText, smile: Smile,
  youtube: Youtube, 'map-pin': MapPin, 'git-branch': GitBranch,
  'git-merge': GitMerge, 'git-pull-request': GitPullRequest,
  scissors: Scissors, 'file-spreadsheet': FileSpreadsheet,
  table: Table, globe: Globe, clock: Clock, zap: Zap,
  webhook: Webhook,
  Play, MessageCircle, Send, Mail, Bot, FileText, Smile,
  Youtube, MapPin, GitBranch, GitMerge, GitPullRequest,
  Scissors, FileSpreadsheet, Table, Globe, Clock, Zap, Webhook,
};

const getIcon = (name) => ICON_MAP[name] || Zap;

const STATUS = {
  running: { icon: Loader2, cls: 'animate-spin' },
  success: { icon: CheckCircle2, cls: '' },
  error: { icon: XCircle, cls: '' },
};

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="white">
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const EmailIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const TRIGGER_CONFIG = {
  'manual-trigger':    { icon: Play,          color: '#6366f1', label: 'Test workflow',            fill: true },
  'whatsapp-receive':  { icon: WhatsAppIcon,  color: '#25D366', label: 'Receive WhatsApp message', fill: false, custom: true },
  'telegram-receive':  { icon: TelegramIcon,  color: '#0088cc', label: 'Receive Telegram message', fill: false, custom: true },
  'email-receive':     { icon: EmailIcon,     color: '#ef4444', label: 'Receive email',            fill: false, custom: true },
  'webhook-trigger':   { icon: Webhook,       color: '#f59e0b', label: 'Webhook trigger',          fill: false },
  'schedule-trigger':  { icon: Clock,         color: '#8b5cf6', label: 'Scheduled trigger',        fill: false },
};

const AGENT_SLOTS = [
  { id: 'chat-model', label: 'Chat Model', required: true },
  { id: 'memory', label: 'Memory' },
  { id: 'tool', label: 'Tool' },
];

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

const AgentNode = ({ data, selected }) => {
  const { label, nodeType, status = 'idle' } = data;
  const color = nodeType?.color || '#8b5cf6';
  const statusInfo = STATUS[status];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative w-[200px] rounded-2xl
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
        <div className="flex flex-col items-center py-4 px-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl mb-2"
            style={{ background: `${color}15` }}>
            <Bot className="w-6 h-6" style={{ color }} />
          </div>
          <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 text-center">
            {label}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Tools Agent</p>
          {statusInfo && (
            <statusInfo.icon className={`w-4 h-4 mt-1.5 ${statusInfo.cls}`}
              style={{ color: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#60a5fa' }} />
          )}
        </div>
        <Handle type="source" position={Position.Right}
          className="!w-[10px] !h-[10px] !border-[2px] !border-white dark:!border-[#1c1c28] !rounded-full"
          style={{ background: color, right: -6 }}
        />
      </div>
      <div className="flex items-start gap-6 mt-[-1px]">
        {AGENT_SLOTS.map((slot) => (
          <div key={slot.id} className="flex flex-col items-center">
            <div className="w-[1.5px] h-3 bg-gray-300 dark:bg-gray-600" />
            <span className={`text-[10px] font-medium mb-1
              ${slot.required ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {slot.label}{slot.required && '*'}
            </span>
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rotate-45 rounded-[3px] border-[1.5px] bg-white dark:bg-[#1c1c28]
                             border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-colors" />
              <Plus className="absolute inset-0 m-auto w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
              <Handle id={`agent-${slot.id}`} type="target" position={Position.Bottom}
                className="!w-5 !h-5 !bg-transparent !border-none !rounded-none !bottom-0 !left-0"
                style={{ transform: 'none' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TRIGGER_TYPES = new Set(Object.keys(TRIGGER_CONFIG));

const CustomNode = ({ data, selected }) => {
  const registryType = data?.registryType || data?.nodeType?.type || '';
  const liveMeta = useNodeRegistryStore.getState().nodeTypes
    .find((n) => n.type === registryType);
  const mergedData = { ...data, nodeType: { ...data.nodeType, ...(liveMeta || {}) } };

  if (TRIGGER_TYPES.has(registryType)) {
    return <TriggerNode data={mergedData} selected={selected} />;
  }
  if (registryType === 'ai-agent') {
    return <AgentNode data={mergedData} selected={selected} />;
  }
  return <StandardNode data={mergedData} selected={selected} />;
};

export default memo(CustomNode);
