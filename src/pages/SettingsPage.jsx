import { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Key, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as credentialService from '../services/credentialService';
import CredentialCard from '../components/settings/CredentialCard';
import AddCredentialDialog from '../components/settings/AddCredentialDialog';
import { cn } from '../utils/cn';

const SettingsPage = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await credentialService.list();
      const data = response.data || response;
      setCredentials(Array.isArray(data) ? data : data.credentials || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleCreate = async (payload) => {
    try {
      await credentialService.create(payload);
      toast.success('Credential created');
      fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create credential');
      throw err;
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingCredential) return;
    try {
      await credentialService.update(editingCredential._id, {
        name: payload.name,
        data: payload.data,
      });
      toast.success('Credential updated');
      fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credential');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await credentialService.remove(id);
      toast.success('Credential deleted');
      setCredentials((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete credential');
      throw err;
    }
  };

  const handleEdit = (credential) => {
    setEditingCredential(credential);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCredential(null);
  };

  const handleDialogSubmit = async (payload) => {
    if (editingCredential) {
      await handleUpdate(payload);
    } else {
      await handleCreate(payload);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <button
          onClick={() => {
            setEditingCredential(null);
            setDialogOpen(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Credential
        </button>
      </div>

      {/* Credentials Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Credentials
          </h2>
          {!loading && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({credentials.length})
            </span>
          )}
        </div>

        {loading ? (
          <div className="card p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              Loading credentials...
            </span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800">
                <Key className="w-7 h-7 text-gray-400" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No credentials yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
              Add your API keys and service credentials to connect your workflows to external services.
            </p>
            <button
              onClick={() => {
                setEditingCredential(null);
                setDialogOpen(true);
              }}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Credential
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((cred) => (
              <CredentialCard
                key={cred._id}
                credential={cred}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <AddCredentialDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        editingCredential={editingCredential}
      />
    </div>
  );
};

export default SettingsPage;
