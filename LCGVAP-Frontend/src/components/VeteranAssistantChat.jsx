import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUp,
  Bot,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../services/api';

const ASSISTANT_NAME = 'Veteran Assistant';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_HISTORY_MESSAGES = 6;

const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const starterPrompts = [
  'How do I register?',
  'What documents are required?',
  'Can you explain verification status?',
];

const rootStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2147483647,
  pointerEvents: 'none',
  isolation: 'isolate',
};

const launcherStyle = {
  position: 'absolute',
  right: 'clamp(1rem, 2vw, 1.5rem)',
  bottom: 'calc(clamp(1rem, 2vw, 1.5rem) + env(safe-area-inset-bottom))',
  pointerEvents: 'auto',
};

const desktopPanelStyle = {
  ...launcherStyle,
  width: 'min(420px, calc(100vw - 3rem))',
};

const mobilePanelStyle = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'auto',
};

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi, I'm Veteran Assistant. I can explain VCLGC registration, verification steps, public directory rules, privacy, and where to get human help.",
  policyLabel: 'Policy-guided',
};

const createMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createMessage = (role, content, details = {}) => ({
  id: createMessageId(),
  role,
  content,
  ...details,
});

const getHistory = (messages) => messages
  .filter((message) => message.id !== 'welcome')
  .filter((message) => ['user', 'assistant'].includes(message.role))
  .slice(-MAX_HISTORY_MESSAGES)
  .map(({ role, content }) => ({ role, content }));

const getPolicyLabel = (policy) => {
  const firstMatch = policy?.matches?.[0];
  return firstMatch?.title || 'Policy-guided';
};

const getErrorReply = (error) => {
  if (error?.name === 'AbortError') {
    return null;
  }

  if (!error?.response) {
    return "I can't connect right now. Check your internet connection and try again.";
  }

  return error.response.data?.error
    || 'Veteran Assistant could not answer right now. Please try again.';
};

const buildApiUrl = (path) => `${API_BASE_URL.replace(/\/$/, '')}${path}`;

const parseSseEvent = (rawEvent) => {
  const lines = String(rawEvent || '').split(/\r?\n/);
  const dataLines = [];
  let eventName = 'message';

  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  });

  const dataText = dataLines.join('\n').trim();

  if (!dataText || dataText === '[DONE]') {
    return null;
  }

  return {
    eventName,
    payload: JSON.parse(dataText),
  };
};

const readAssistantStream = async ({
  message,
  history,
  onDelta,
  onDone,
  onMeta,
  signal,
}) => {
  const response = await fetch(buildApiUrl('/ai/public-chat/stream'), {
    method:      'POST',
    credentials: 'include',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok || !response.body) {
    let details = 'Veteran Assistant stream is unavailable.';

    try {
      const payload = await response.json();
      details = payload?.error || details;
    } catch {
      // Keep the generic message if the response body is not JSON.
    }

    throw new Error(details);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload = null;

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() || '';

    for (const part of parts) {
      const event = parseSseEvent(part);
      if (!event) continue;

      if (event.eventName === 'meta') {
        onMeta?.(event.payload);
      }

      if (event.eventName === 'delta') {
        onDelta?.(event.payload?.delta || '');
      }

      if (event.eventName === 'done') {
        finalPayload = event.payload;
        onDone?.(event.payload);
      }

      if (event.eventName === 'error') {
        throw new Error(event.payload?.error || 'Veteran Assistant stream failed.');
      }
    }
  }

  return finalPayload;
};

const ThinkingIndicator = () => {
  const shouldReduceMotion = useReducedMotion();
  const dotAnimation = shouldReduceMotion ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] };
  const dotTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 1.1,
        ease: 'easeInOut',
        repeat: Infinity,
      };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-caption text-muted" role="status">
        <div className="flex items-center gap-2">
          <span>{ASSISTANT_NAME} is writing</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <MotionSpan
                key={dot}
                animate={dotAnimation}
                transition={{
                  ...dotTransition,
                  delay: shouldReduceMotion ? 0 : dot * 0.18,
                }}
                className="size-1.5 rounded-full bg-primary"
              />
            ))}
          </span>
        </div>
      </div>
    </MotionDiv>
  );
};

const VeteranAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const activeRequestRef = useRef(null);
  const launcherRef = useRef(null);
  const wasOpenRef = useRef(false);
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !isSending, [draft, isSending]);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const updateViewportState = () => setIsMobileViewport(mediaQuery.matches);

    updateViewportState();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewportState);
      return () => mediaQuery.removeEventListener('change', updateViewportState);
    }

    mediaQuery.addListener(updateViewportState);
    return () => mediaQuery.removeListener(updateViewportState);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen, isSending, isThinking]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobileViewport) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobileViewport]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      window.setTimeout(() => launcherRef.current?.focus(), 200);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const appendAssistantMessage = useCallback((message) => {
    setMessages((currentMessages) => [...currentMessages, message]);
  }, []);

  const sendMessage = useCallback(async (messageText = draft) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage || isSending) return;

    const history = getHistory(messages);
    const outgoingMessage = createMessage('user', cleanMessage);
    const requestController = new AbortController();
    let assistantMessageId = null;
    let pendingMeta = null;
    let receivedDelta = false;

    activeRequestRef.current = requestController;
    setMessages((currentMessages) => [...currentMessages, outgoingMessage]);
    setDraft('');
    setIsSending(true);
    setIsThinking(true);

    const ensureAssistantMessage = () => {
      if (assistantMessageId) return assistantMessageId;

      assistantMessageId = createMessageId();
      appendAssistantMessage({
        id:          assistantMessageId,
        role:        'assistant',
        content:     '',
        policyLabel: getPolicyLabel(pendingMeta?.policy),
        source:      pendingMeta?.source,
      });

      return assistantMessageId;
    };

    const updateAssistantMessage = (updater) => {
      setMessages((currentMessages) => currentMessages.map((message) => (
        message.id === assistantMessageId ? updater(message) : message
      )));
    };

    const applyFallbackResponse = async () => {
      const { data } = await api.post('/ai/public-chat', {
        message: cleanMessage,
        history,
      });

      appendAssistantMessage(createMessage('assistant', data?.reply || 'I could not prepare a reply right now.', {
        policyLabel: getPolicyLabel(data?.policy),
        source:      data?.source,
      }));
    };

    try {
      const finalPayload = await readAssistantStream({
        message: cleanMessage,
        history,
        signal: requestController.signal,
        onMeta: (payload) => {
          pendingMeta = payload;
        },
        onDelta: (delta) => {
          if (!delta) return;

          receivedDelta = true;
          setIsThinking(false);
          ensureAssistantMessage();
          updateAssistantMessage((message) => ({
            ...message,
            content: `${message.content}${delta}`,
          }));
        },
        onDone: (payload) => {
          pendingMeta = payload;
        },
      });

      setIsThinking(false);

      if (!receivedDelta) {
        await applyFallbackResponse();
      } else if (finalPayload && assistantMessageId) {
        updateAssistantMessage((message) => ({
          ...message,
          policyLabel: getPolicyLabel(finalPayload.policy),
          source:      finalPayload.source,
        }));
      }
    } catch (error) {
      setIsThinking(false);

      if (error.name === 'AbortError') {
        return;
      }

      try {
        await applyFallbackResponse();
      } catch (fallbackError) {
        const errorReply = getErrorReply(fallbackError);

        if (errorReply) {
          appendAssistantMessage(createMessage('assistant', errorReply, {
            policyLabel: 'Connection issue',
            retryText:   cleanMessage,
            source:      'error',
          }));
        }
      }
    } finally {
      if (activeRequestRef.current === requestController) {
        activeRequestRef.current = null;
      }

      setIsSending(false);
      setIsThinking(false);
    }
  }, [appendAssistantMessage, draft, isSending, messages]);

  const closeAssistant = () => {
    activeRequestRef.current?.abort();
    setIsOpen(false);
    setIsSending(false);
    setIsThinking(false);
  };

  const resetConversation = () => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setMessages([welcomeMessage]);
    setDraft('');
    setIsSending(false);
    setIsThinking(false);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 1;

  const chatMarkup = (
    <div style={rootStyle}>
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            id="veteran-assistant-panel"
            role="dialog"
            aria-labelledby="veteran-assistant-title"
            aria-modal={isMobileViewport ? 'true' : 'false'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            style={isMobileViewport ? mobilePanelStyle : desktopPanelStyle}
            className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-paper font-sans text-ink shadow-overlay sm:h-[640px] sm:max-h-[calc(100vh-3rem)] sm:rounded-panel"
          >
            {/* Header: no band, no rule. Just the name and a close button on paper. */}
            <header className="flex items-center gap-3 px-5 pt-5 pb-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <Bot className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="veteran-assistant-title" className="truncate font-display text-title font-semibold leading-tight text-ink">
                  {ASSISTANT_NAME}
                </h2>
                <p className="text-caption text-muted">VCLGC help, guidance only</p>
              </div>
              {!isEmpty && (
                <button
                  type="button"
                  onClick={resetConversation}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash hover:text-ink"
                  aria-label="Start a new conversation"
                  title="New conversation"
                >
                  <RotateCcw className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={closeAssistant}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash hover:text-ink"
                aria-label="Close Veteran Assistant"
              >
                <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </header>

            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
            >
              {isEmpty ? (
                <div className="flex min-h-full flex-col justify-end gap-6 pt-6">
                  <div>
                    <p className="font-display text-[1.75rem] font-semibold leading-tight text-ink">
                      How can I help?
                    </p>
                    <p className="mt-2 max-w-[32ch] text-body text-muted">
                      Ask about registration, verification, the public directory or privacy.
                    </p>
                  </div>

                  <ul className="space-y-1.5" aria-label="Common questions">
                    {starterPrompts.map((prompt) => (
                      <li key={prompt}>
                        <button
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          disabled={isSending}
                          className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-panel bg-wash px-4 py-3 text-left text-body font-medium text-ink transition-colors hover:bg-tint disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {prompt}
                          <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <p className="flex items-start gap-2 text-caption text-muted">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                    Answers come from approved VCLGC policy. Verification decisions are always made by people.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 pt-2">
                  <AnimatePresence initial={false}>
                    {messages.filter((message) => message.id !== 'welcome').map((message) => {
                      const isUser = message.role === 'user';

                      return (
                        <MotionDiv
                          key={message.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                          className={isUser ? 'flex justify-end' : ''}
                        >
                          {isUser ? (
                            <div className="max-w-[85%] rounded-panel bg-primary px-4 py-2.5 text-body leading-relaxed text-on-primary">
                              <span className="sr-only">You: </span>
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                          ) : (
                            <div className="pr-4">
                              <span className="sr-only">{ASSISTANT_NAME}: </span>
                              <p className="whitespace-pre-wrap break-words text-body leading-relaxed text-ink">{message.content}</p>
                              {message.policyLabel && (
                                <p className="mt-2 flex items-center gap-1.5 text-caption text-muted">
                                  <CheckCircle2 className="size-3.5 text-primary" strokeWidth={2} aria-hidden="true" />
                                  {message.policyLabel}
                                </p>
                              )}
                              {message.retryText && (
                                <button
                                  type="button"
                                  onClick={() => sendMessage(message.retryText)}
                                  className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-wash px-4 text-caption font-semibold text-primary hover:bg-tint"
                                >
                                  <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden="true" />
                                  Try again
                                </button>
                              )}
                            </div>
                          )}
                        </MotionDiv>
                      );
                    })}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isThinking && <ThinkingIndicator />}
                  </AnimatePresence>
                </div>
              )}

              <div ref={endOfMessagesRef} />
            </div>

            <form onSubmit={handleSubmit} className="px-4 pt-1 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="flex items-end gap-2 rounded-panel bg-wash p-1.5 transition-shadow focus-within:ring-2 focus-within:ring-focus">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={800}
                  placeholder="Ask a question"
                  className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-body text-ink placeholder:text-faint focus:outline-none"
                  aria-label="Message Veteran Assistant"
                  aria-describedby="veteran-assistant-hint"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-transparent disabled:text-faint"
                  aria-label="Send message"
                >
                  <ArrowUp className="size-5" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
              <p id="veteran-assistant-hint" className="sr-only">Enter to send, Shift and Enter for a new line.</p>
            </form>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <MotionButton
            ref={launcherRef}
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={launcherStyle}
            className="flex size-14 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-on-primary shadow-overlay transition-colors hover:bg-primary-hover sm:h-12 sm:w-auto sm:px-5"
            aria-expanded={isOpen}
            aria-controls="veteran-assistant-panel"
            aria-label="Open Veteran Assistant"
          >
            <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden text-caption sm:inline">Ask the assistant</span>
          </MotionButton>
        )}
      </AnimatePresence>
    </div>
  );

  if (!portalTarget) {
    return null;
  }

  return createPortal(chatMarkup, portalTarget);
};

export default VeteranAssistantChat;
