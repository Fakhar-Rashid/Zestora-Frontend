import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Boxes,
  MoreVertical,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDate, truncate } from '../../utils/formatters';
import { useState, useRef, useEffect } from 'react';

const WorkflowCard = ({ workflow, onDelete, onToggleActive }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const id = workflow._id || workflow.id;
  const isActive = workflow.isActive;
  const nodeCount = workflow.nodes?.length || 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div
      onClick={() => navigate(`/workflows/${id}`)}
      className={cn(
        'group relative rounded-xl border bg-white dark:bg-gray-900 shadow-sm cursor-pointer',
        'transition-all duration-200 hover:shadow-md',
        isActive
          ? 'border-emerald-200 dark:border-emerald-900/50'
          : 'border-gray-200 dark:border-gray-800'
      )}
    >
      {/* Active indicator bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-colors',
          isActive
            ? 'bg-emerald-500'
            : 'bg-gray-200 dark:bg-gray-800'
        )}
      />

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/50'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              <GitBranch
                className={cn(
                  'w-5 h-5',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                )}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {workflow.name || 'Untitled Workflow'}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1',
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                )}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/workflows/${id}`);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleActive?.(id, isActive);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {isActive ? (
                    <>
                      <ToggleLeft className="w-3.5 h-3.5" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-3.5 h-3.5" />
                      Activate
                    </>
                  )}
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(id);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
          {truncate(workflow.description, 100) || 'No description'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Boxes className="w-3.5 h-3.5" />
              <span>{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(workflow.updatedAt || workflow.createdAt)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/workflows/${id}`)}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
