import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import useNodeRegistryStore from '../../store/nodeRegistryStore';
import { NODE_CATEGORIES } from '../../constants';
import DraggableNodeItem from './DraggableNodeItem';

const NodePaletteSidebar = () => {
  const { nodeTypes, loading, loaded, fetchRegistry } = useNodeRegistryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Fetch registry on mount
  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  // Expand all categories by default once loaded
  useEffect(() => {
    if (loaded && nodeTypes.length > 0) {
      const expanded = {};
      NODE_CATEGORIES.forEach((cat) => {
        expanded[cat.key] = true;
      });
      // Also expand any dynamic categories from the registry
      nodeTypes.forEach((nt) => {
        if (nt.category) expanded[nt.category] = true;
      });
      setExpandedCategories(expanded);
    }
  }, [loaded, nodeTypes]);

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodeTypes;
    const q = searchQuery.toLowerCase();
    return nodeTypes.filter(
      (n) =>
        n.label?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q)
    );
  }, [nodeTypes, searchQuery]);

  // Group filtered nodes by category
  const groupedNodes = useMemo(() => {
    const groups = {};
    filteredNodes.forEach((node) => {
      const cat = node.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(node);
    });
    return groups;
  }, [filteredNodes]);

  // Build ordered category list: known categories first, then any extra
  const orderedCategories = useMemo(() => {
    const knownKeys = NODE_CATEGORIES.map((c) => c.key);
    const categories = [];

    NODE_CATEGORIES.forEach((cat) => {
      if (groupedNodes[cat.key]) {
        categories.push({
          key: cat.key,
          label: cat.label,
          color: cat.color,
          nodes: groupedNodes[cat.key],
        });
      }
    });

    Object.keys(groupedNodes).forEach((key) => {
      if (!knownKeys.includes(key)) {
        categories.push({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: '#6366f1',
          nodes: groupedNodes[key],
        });
      }
    });

    return categories;
  }, [groupedNodes]);

  const toggleCategory = (key) => {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Nodes
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md
                       text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          </div>
        )}

        {!loading && orderedCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchQuery ? 'No nodes match your search.' : 'No nodes available.'}
            </p>
          </div>
        )}

        {orderedCategories.map((category) => (
          <div key={category.key} className="mb-1">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category.key)}
              className="flex items-center gap-2 w-full px-2 py-2 text-left rounded-md
                         hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              {expandedCategories[category.key] ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                {category.label}
              </span>
              <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                {category.nodes.length}
              </span>
            </button>

            {/* Category items */}
            {expandedCategories[category.key] && (
              <div className="ml-1 space-y-1.5 pb-2 pt-1">
                {category.nodes.map((nodeType) => (
                  <DraggableNodeItem key={nodeType.type} nodeType={nodeType} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePaletteSidebar;
