import { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MessageCircle,
  Send,
  Youtube,
  Brain,
  Sparkles,
  Zap,
  FileSpreadsheet,
  FileText,
  Mail,
  Inbox,
  Hash,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ── Service definitions ───────────────────────────────────────────────
const services = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-blue-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'openai', name: 'OpenAI', icon: Brain, color: 'text-emerald-500' },
  { id: 'gemini', name: 'Gemini', icon: Sparkles, color: 'text-indigo-500' },
  { id: 'groq', name: 'Groq', icon: Zap, color: 'text-orange-500' },
  { id: 'deepseek', name: 'DeepSeek', icon: Brain, color: 'text-cyan-500' },
  { id: 'google_sheets', name: 'Google Sheets', icon: FileSpreadsheet, color: 'text-green-600' },
  { id: 'google_docs', name: 'Google Docs', icon: FileText, color: 'text-blue-600' },
  { id: 'smtp', name: 'SMTP', icon: Mail, color: 'text-amber-500' },
  { id: 'imap', name: 'IMAP', icon: Inbox, color: 'text-violet-500' },
  { id: 'slack', name: 'Slack', icon: Hash, color: 'text-purple-500' },
];

// ── Field schemas per service ─────────────────────────────────────────
const serviceFields = {
  whatsapp: [
    { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'e.g. 123456789' },
    { key: 'accessToken', label: 'Access Token', placeholder: 'Permanent access token', sensitive: true },
  ],
  telegram: [
    { key: 'botToken', label: 'Bot Token', placeholder: 'e.g. 123456:ABC-DEF...', sensitive: true },
  ],
  youtube: [
    { key: 'apiKey', label: 'API Key', placeholder: 'YouTube Data API key', sensitive: true },
  ],
  openai: [
    { key: 'apiKey', label: 'API Key', placeholder: 'sk-...', sensitive: true },
  ],
  gemini: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Gemini API key', sensitive: true },
  ],
  groq: [
    { key: 'apiKey', label: 'API Key', placeholder: 'gsk_...', sensitive: true },
  ],
  deepseek: [
    { key: 'apiKey', label: 'API Key', placeholder: 'DeepSeek API key', sensitive: true },
  ],
  google_sheets: [
    { key: 'accessToken', label: 'Access Token', placeholder: 'OAuth access token', sensitive: true },
  ],
  google_docs: [
    { key: 'accessToken', label: 'Access Token', placeholder: 'OAuth access token', sensitive: true },
  ],
  smtp: [
    { key: 'host', label: 'Host', placeholder: 'smtp.example.com' },
    { key: 'port', label: 'Port', placeholder: '587', type: 'number' },
    { key: 'user', label: 'Username', placeholder: 'you@example.com' },
    { key: 'pass', label: 'Password', placeholder: 'App password', sensitive: true },
  ],
  imap: [
    { key: 'host', label: 'Host', placeholder: 'imap.example.com' },
    { key: 'port', label: 'Port', placeholder: '993', type: 'number' },
    { key: 'user', label: 'Username', placeholder: 'you@example.com' },
    { key: 'pass', label: 'Password', placeholder: 'App password', sensitive: true },
  ],
  slack: [
    { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' },
  ],
};

const getTypeForService = (serviceId) => {
  if (serviceId === 'smtp' || serviceId === 'imap') return 'basic_auth';
  if (serviceId === 'slack') return 'webhook';
  return 'api_key';
};

// ── Dialog Component ──────────────────────────────────────────────────
const AddCredentialDialog = ({ open, onClose, onSubmit, editingCredential }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editingCredential;

  // Reset state when dialog opens/closes or editing changes
  useEffect(() => {
    if (open) {
      if (editingCredential) {
        setSelectedService(editingCredential.service);
        setFormData({ name: editingCredential.name });
        setStep(2);
      } else {
        setStep(1);
        setSelectedService(null);
        setFormData({ name: '' });
      }
      setErrors({});
      setSubmitting(false);
    }
  }, [open, editingCredential]);

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    setFormData({ name: '' });
    setErrors({});
    setStep(2);
  };

  const handleBack = () => {
    if (isEditing) {
      onClose();
    } else {
      setStep(1);
      setSelectedService(null);
      setFormData({ name: '' });
      setErrors({});
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    const fields = serviceFields[selectedService] || [];
    // When editing, fields are optional (server keeps encrypted values)
    if (!isEditing) {
      fields.forEach((f) => {
        if (!formData[f.key]?.toString().trim()) {
          newErrors[f.key] = `${f.label} is required`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fields = serviceFields[selectedService] || [];
      const data = {};
      fields.forEach((f) => {
        if (formData[f.key] !== undefined && formData[f.key] !== '') {
          data[f.key] = formData[f.key];
        }
      });

      await onSubmit({
        name: formData.name,
        type: getTypeForService(selectedService),
        service: selectedService,
        data,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const fields = serviceFields[selectedService] || [];
  const selectedServiceMeta = services.find((s) => s.id === selectedService);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl',
          'overflow-hidden',
          step === 1 ? 'max-w-2xl' : 'max-w-lg'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing
                ? 'Edit Credential'
                : step === 1
                  ? 'Select a Service'
                  : `Add ${selectedServiceMeta?.name || ''} Credential`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Service Grid */}
        {step === 1 && (
          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose the service you want to connect:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {services.map((svc) => {
                const Icon = svc.icon;
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border',
                      'border-gray-200 dark:border-gray-800',
                      'hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20',
                      'transition-all duration-200 group'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg',
                        'bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-950/40',
                        'transition-colors duration-200'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', svc.color)} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {svc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Service indicator */}
            {selectedServiceMeta && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <selectedServiceMeta.icon className={cn('w-4 h-4', selectedServiceMeta.color)} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedServiceMeta.name}
                </span>
              </div>
            )}

            {/* Name field */}
            <div>
              <label
                htmlFor="cred-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Credential Name
              </label>
              <input
                id="cred-name"
                type="text"
                placeholder="e.g. My Production Key"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={cn(
                  'input-field',
                  errors.name && 'border-red-500 focus:ring-red-500 focus:border-red-500'
                )}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Dynamic service fields */}
            {fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`cred-${field.key}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  {field.label}
                </label>
                <input
                  id={`cred-${field.key}`}
                  type={field.sensitive ? 'password' : field.type || 'text'}
                  placeholder={
                    isEditing && field.sensitive
                      ? 'Leave blank to keep existing value'
                      : field.placeholder
                  }
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={cn(
                    'input-field',
                    errors[field.key] && 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  )}
                />
                {errors[field.key] && (
                  <p className="mt-1 text-xs text-red-500">{errors[field.key]}</p>
                )}
              </div>
            ))}

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Credential' : 'Create Credential'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddCredentialDialog;
