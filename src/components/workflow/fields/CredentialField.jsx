import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Loader2 } from 'lucide-react';
import * as credentialService from '../../../services/credentialService';

const CredentialField = ({ field, value, onChange }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCredentials = async () => {
      setLoading(true);
      try {
        const svc = Array.isArray(field.service) ? field.service.join(',') : field.service;
        const response = await credentialService.list(svc);
        const data = response.data || response.credentials || response;
        if (!cancelled) {
          setCredentials(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setCredentials([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCredentials();
    return () => {
      cancelled = true;
    };
  }, [field.service]);

  const handleAddNew = () => {
    // Navigate to settings / credentials page
    window.open('/settings?tab=credentials', '_blank');
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        {field.label || field.key}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading credentials...
          </div>
        ) : (
          <>
            <select
              value={value || ''}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  handleAddNew();
                  return;
                }
                onChange(field.key, e.target.value);
              }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         rounded-md text-gray-900 dark:text-gray-100 appearance-none
                         focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                         pr-8"
            >
              <option value="">Select credential...</option>
              {credentials.map((cred) => (
                <option key={cred._id || cred.id} value={cred._id || cred.id}>
                  {cred.name}
                </option>
              ))}
              <option value="__add_new__">+ Add New Credential</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </>
        )}
      </div>
      {field.description && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

export default CredentialField;
