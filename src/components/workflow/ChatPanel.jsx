import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import * as workflowService from '../../services/workflowService';
import useWorkflowStore from '../../store/workflowStore';

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 700;
const DEFAULT_HEIGHT = 340;

const ChatPanel = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [sessionId] = useState(() => `test-${Date.now()}`);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = height;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [height]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const delta = startY.current - e.clientY;
      const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startH.current + delta));
      setHeight(next);
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const { workflowMeta, saveWorkflow } = useWorkflowStore.getState();
    if (!workflowMeta?.id) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      await saveWorkflow();
      const result = await workflowService.chat(workflowMeta.id, text, sessionId);
      if (!result.success) {
        setMessages((prev) => [...prev, { role: 'error', content: result.message || result.error || 'Something went wrong' }]);
      } else {
        const response = result.data?.response || 'No response';
        setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to get response';
      setMessages((prev) => [...prev, { role: 'error', content: errMsg }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111118]"
      style={{ height }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className="shrink-0 flex items-center justify-center h-2 cursor-row-resize group hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
      >
        <div className="w-8 h-[3px] rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-500 transition-colors" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f17] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Chat</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
            Test
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMessages([])} title="Clear chat"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} title="Close chat"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Send a message to test your AI Agent
            </p>
            <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">
              Messages are passed directly to the agent node
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'bg-indigo-500 text-white rounded-br-sm'
                : msg.role === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-bl-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none max-h-[80px]"
            style={{ minHeight: '20px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
