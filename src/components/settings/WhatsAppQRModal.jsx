import { useEffect, useRef, useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import * as credentialService from '../../services/credentialService';
import { cn } from '../../utils/cn';

const WhatsAppQRModal = ({ open, credentialId, onClose, onConnected }) => {
  const [status, setStatus] = useState('connecting');
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (!open || !credentialId) return undefined;

    let cancelled = false;
    setStatus('connecting');
    setQrDataUrl(null);
    setPhoneNumber(null);
    setError(null);

    const startConnect = async () => {
      try {
        await credentialService.whatsappConnect(credentialId);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to start WhatsApp session');
          setStatus('failed');
        }
        return;
      }
      if (cancelled) return;

      const poll = async () => {
        try {
          const res = await credentialService.whatsappStatus(credentialId);
          const payload = res.data || res;
          if (cancelled) return;
          setStatus(payload.status || 'connecting');
          setQrDataUrl(payload.qrDataUrl || null);
          if (payload.phoneNumber) setPhoneNumber(payload.phoneNumber);
          if (payload.status === 'ready') {
            clearInterval(pollRef.current);
            closeTimerRef.current = setTimeout(() => {
              if (onConnected) onConnected(payload);
              onClose();
            }, 1500);
          }
          if (payload.status === 'failed') {
            clearInterval(pollRef.current);
            setError('Authentication failed. Try again.');
          }
        } catch (err) {
          if (!cancelled) {
            setError(err.response?.data?.message || 'Status check failed');
          }
        }
      };

      poll();
      pollRef.current = setInterval(poll, 2000);
    };

    startConnect();

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open, credentialId, onClose, onConnected]);

  if (!open) return null;

  const handleCancel = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    try { await credentialService.whatsappDisconnect(credentialId); } catch (_) { /* ignore */ }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Link WhatsApp
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {status === 'connecting' && !qrDataUrl && (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Starting WhatsApp session...
              </p>
            </div>
          )}

          {status === 'qr' && qrDataUrl && (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <img src={qrDataUrl} alt="WhatsApp QR" className="w-64 h-64" />
              </div>
              <ol className="mt-5 text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Open WhatsApp on your phone</li>
                <li>Tap Menu / Settings → <b>Linked Devices</b></li>
                <li>Tap <b>Link a Device</b> and scan this code</li>
              </ol>
            </div>
          )}

          {status === 'authenticating' && (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                Authenticated — finishing setup...
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                Connected{phoneNumber ? ` as +${phoneNumber}` : ''}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Closing automatically...
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                {error || 'Connection failed'}
              </p>
              <button
                onClick={handleCancel}
                className={cn(
                  'mt-5 px-4 py-2 text-xs font-medium rounded-lg',
                  'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
                  'text-gray-700 dark:text-gray-200'
                )}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppQRModal;
