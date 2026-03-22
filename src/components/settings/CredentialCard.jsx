import { useState } from 'react';
import { Pencil, Trash2, Key, Calendar, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const serviceBadgeColors = {
  whatsapp: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  telegram: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  youtube: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  openai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  gemini: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
  groq: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  deepseek: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
  google_sheets: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  google_docs: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  smtp: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  imap: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  slack: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
};

const typeLabels = {
  api_key: 'API Key',
  basic_auth: 'Auth',
  oauth2: 'OAuth2',
  webhook: 'Webhook',
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatServiceName = (service) => {
  if (!service) return 'Unknown';
  return service
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const CredentialCard = ({ credential, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const badgeColor =
    serviceBadgeColors[credential.service] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(credential._id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900 p-5 shadow-sm',
        'transition-shadow duration-200 hover:shadow-md'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950/50">
            <Key className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {credential.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {typeLabels[credential.type] || credential.type}
            </p>
          </div>
        </div>
      </div>

      {/* Service Badge */}
      <div className="mb-4">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            badgeColor
          )}
        >
          {formatServiceName(credential.service)}
        </span>
      </div>

      {/* Created Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
        <Calendar className="w-3.5 h-3.5" />
        <span>Created {formatDate(credential.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => onEdit(credential)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg',
            'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
            'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
          )}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleCancelDelete}
              disabled={deleting}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg',
                'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
                'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200',
                'disabled:opacity-50'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg',
                'text-white bg-red-600 hover:bg-red-700 transition-colors duration-200',
                'disabled:opacity-50'
              )}
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg ml-auto',
              'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
              'hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors duration-200'
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default CredentialCard;
