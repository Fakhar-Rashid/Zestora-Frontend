import {
  Play,
  MessageCircle,
  Send,
  Mail,
  Bot,
  FileText,
  Smile,
  Youtube,
  MapPin,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Scissors,
  FileSpreadsheet,
  Table,
  Globe,
  Clock,
  Webhook,
  Zap,
  Database,
  Filter,
  Code,
  Settings,
  Bell,
  Phone,
  Image,
  Link,
  Search,
  Hash,
  Key,
  Shield,
  Cpu,
  Brain,
  Wand2,
  Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  Play,
  MessageCircle,
  Send,
  Mail,
  Bot,
  FileText,
  Smile,
  Youtube,
  MapPin,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Scissors,
  FileSpreadsheet,
  Table,
  Globe,
  Clock,
  Webhook,
  Zap,
  Database,
  Filter,
  Code,
  Settings,
  Bell,
  Phone,
  Image,
  Link,
  Search,
  Hash,
  Key,
  Shield,
  Cpu,
  Brain,
  Wand2,
  Sparkles,
};

function getIcon(iconName) {
  if (!iconName) return Zap;
  return ICON_MAP[iconName] || Zap;
}

const DraggableNodeItem = ({ nodeType }) => {
  const { label, icon, color, type, description } = nodeType;
  const Icon = getIcon(icon);

  const onDragStart = (event) => {
    const payload = JSON.stringify(nodeType);
    event.dataTransfer.setData('application/reactflow', payload);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab
                 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50
                 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm
                 transition-all duration-150 group active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      title={description || label}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0
                    transition-transform duration-150 group-hover:scale-110"
        style={{ backgroundColor: `${color || '#6366f1'}15` }}
      >
        <Icon className="w-4 h-4" style={{ color: color || '#6366f1' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {label}
        </div>
        {description && (
          <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableNodeItem;
