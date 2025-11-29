import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Lightbulb } from 'lucide-react';
import { Button } from './ui/Button.tsx';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: "Hello! I'm your AI-powered Digital Forensics Assistant.\n\n⚠️ **This feature is coming soon.**\n\nThe forensic assistant is currently being upgraded with enhanced capabilities. Please check back later for:\n\n🎯 **Direct QA**: Quick answers with citations\n📚 **Teaching**: Concept explanations with examples\n🔍 **Guided Walkthrough**: Step-by-step procedures\n\nThank you for your patience!",
  sender: 'bot',
  timestamp: new Date(),
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions] = useState<string[]>([
    'Show me ransomware-investigation artifacts',
    'How do I investigate insider data theft?',
    'Explain MFT analysis with examples',
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputFormRef = useRef<HTMLFormElement>(null);

  // Lock/unlock body scroll when chatbot opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const lenisInstance = window.__lenis;
      if (lenisInstance) lenisInstance.stop();
    } else {
      document.body.style.overflow = 'unset';
      const lenisInstance = window.__lenis;
      if (lenisInstance) lenisInstance.start();
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      const lenisInstance = window.__lenis;
      if (lenisInstance) lenisInstance.start();
    };
  }, [isOpen]);

  // Scroll to bottom only when new messages are added (not on typing or focus)
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 1) {
      const container = messagesContainerRef.current;
      // Use scrollTo with smooth behavior to avoid jarring jumps
      container.scrollTo({ 
        top: container.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages.length]); // Only trigger when message count changes

  // Handle iOS mobile keyboard viewport changes
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !('visualViewport' in window)) {
      return;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleViewportResize = () => {
      if (inputFormRef.current) {
        // Calculate keyboard offset (viewport height vs window height)
        const offsetY = window.innerHeight - visualViewport.height;
        
        // Use transform to adjust input position without reflow
        if (offsetY > 50) {
          // Keyboard is visible (threshold to avoid false positives)
          inputFormRef.current.style.transform = `translateY(-${offsetY}px)`;
        } else {
          // Keyboard is hidden
          inputFormRef.current.style.transform = 'translateY(0)';
        }
      }
    };

    visualViewport.addEventListener('resize', handleViewportResize);
    visualViewport.addEventListener('scroll', handleViewportResize);

    return () => {
      visualViewport.removeEventListener('resize', handleViewportResize);
      visualViewport.removeEventListener('scroll', handleViewportResize);
      if (inputFormRef.current) {
        inputFormRef.current.style.transform = 'translateY(0)';
      }
    };
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent, quickQuery?: string) => {
    e?.preventDefault();
    const query = quickQuery || inputValue;
    if (!query.trim()) return;

    // Static "Coming Soon" response text (defined once for consistency)
    const COMING_SOON_TEXT = "⚠️ **This feature is coming soon.**\n\nThe forensic assistant is currently being upgraded. Please check back later.";

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate brief processing delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsTyping(false);

    // Add static "Coming Soon" response with deduplication guard
    setMessages((prev) => {
      // Guard: Check if the last message is already the coming soon message
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === 'bot' && lastMessage.text === COMING_SOON_TEXT) {
        // Already added, skip duplicate
        return prev;
      }

      const comingSoonMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: COMING_SOON_TEXT,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      return [...prev, comingSoonMessage];
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(undefined, suggestion);
  };

  return (
    <>
      {/* Chatbot container - positioned at bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 chatbot-container-mobile">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="chatbot-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chatbot-title"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 sm:w-96 bg-[rgba(20,20,20,0.65)] backdrop-blur-xl border border-border-light/30 rounded-lg shadow-2xl overflow-hidden mb-4"
              style={{ 
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                height: 'clamp(480px, 80vh, 600px)',
                maxHeight: '80vh',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div className="relative bg-[rgba(30,30,30,0.7)] backdrop-blur-md p-4 border-b border-border-light/20" style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 p-2.5 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg-dark flex items-center justify-center"
                  style={{ zIndex: 15, width: '40px', height: '40px' }}
                  aria-label="Close chatbot"
                  tabIndex={0}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex justify-between items-start mb-2 pr-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 id="chatbot-title" className="font-bold text-white text-sm flex items-center gap-1.5">
                        Forensic AI Assistant
                        <span className="px-1.5 py-0.5 bg-accent-cyan/20 text-accent-cyan text-[10px] rounded font-medium" role="status">Coming Soon</span>
                      </h3>
                      <span className="text-xs text-text-secondary flex items-center gap-1" role="status">
                        Feature under development
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="chatbot-messages-container"
                data-lenis-prevent
                tabIndex={0}
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
                aria-atomic="false"
                style={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  padding: '1rem',
                  paddingBottom: '8rem',
                  overflowAnchor: 'none'
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? 'bg-accent-cyan/25 text-white rounded-tr-none border border-accent-cyan/40 backdrop-blur-sm'
                          : 'bg-[rgba(40,40,40,0.7)] text-text-primary rounded-tl-none border border-border-light/30 backdrop-blur-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-surface-light p-3 rounded-lg rounded-tl-none border border-border-light flex gap-1">
                      <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div 
                  className="px-4 py-2 bg-[rgba(20,20,20,0.7)] backdrop-blur-md border-t border-border-light/20"
                  style={{ 
                    flexShrink: 0, 
                    position: 'sticky',
                    bottom: '72px',
                    zIndex: 10,
                    overflowAnchor: 'none'
                  }}
                >
                  <div className="flex items-center gap-1 mb-2">
                    <Lightbulb className="w-3 h-3 text-accent-neon" />
                    <span className="text-xs text-text-secondary font-medium">Example queries:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSuggestionClick(suggestion);
                          }
                        }}
                        className="text-xs px-2 py-1.5 bg-surface-light border border-border-light rounded-md text-text-secondary hover:text-accent-cyan hover:border-accent-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                        style={{ minHeight: '32px' }}
                        aria-label={`Use example query: ${suggestion}`}
                        tabIndex={0}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form 
                ref={inputFormRef}
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(e); }} 
                className="p-4 bg-[rgba(30,30,30,0.8)] backdrop-blur-md border-t border-border-light/20"
                style={{
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                  overflowAnchor: 'none',
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={(e) => {
                      // Prevent auto-scroll on focus - keep input bar position stable
                      e.preventDefault();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Ask about tools, cases, concepts..."
                    role="search"
                    aria-label="Ask about tools, cases, concepts"
                    aria-describedby="chatbot-input-hint"
                    className="flex-1 bg-bg-dark border border-border-light rounded-md px-3 py-2 text-sm text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all"
                    style={{ minHeight: '40px' }}
                  />
                  <span id="chatbot-input-hint" className="sr-only">
                    Type your question and press Enter or click Send. Feature coming soon.
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="px-3"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    aria-label="Send message"
                    tabIndex={0}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot launcher button - only visible when chatbot is closed */}
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg-dark bg-accent-cyan text-bg-dark"
            aria-label="Open chatbot"
            aria-expanded={false}
            aria-controls="chatbot-panel"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    </>
  );
};

export default Chatbot;
