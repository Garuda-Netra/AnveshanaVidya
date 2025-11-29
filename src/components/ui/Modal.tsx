import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GlassPanel from './GlassPanel';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Pause Lenis smooth scrolling
      const lenisInstance = window.__lenis;
      if (lenisInstance) {
        lenisInstance.stop();
      }
      
      // Focus modal container
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Resume Lenis smooth scrolling
      const lenisInstance = window.__lenis;
      if (lenisInstance) {
        lenisInstance.start();
      }
      
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      const lenisInstance = window.__lenis;
      if (lenisInstance) {
        lenisInstance.start();
      }
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Glassmorphism Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[rgba(20,20,20,0.6)] backdrop-blur-[12px]"
          style={{ backdropFilter: 'blur(12px)' }}
        />
        
        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <GlassPanel className="flex flex-col max-h-full shadow-2xl border-accent-neon/30 bg-[rgba(20,20,20,0.85)] backdrop-blur-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border-glass bg-[rgba(30,30,30,0.7)]">
              <h3 
                id="modal-title"
                className="text-2xl font-bold text-white"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent-neon/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-neon/50"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-text-secondary hover:text-accent-neon transition-colors" />
              </button>
            </div>
            
            {/* Modal Body - Scrollable Content */}
            <div 
              className="custom-scroll flex-1 px-8 py-6 bg-[rgba(10,10,10,0.4)]"
              data-lenis-prevent
              style={{
                maxHeight: '100%',
              }}
            >
              <div className="min-h-full pb-4">
                {children}
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
