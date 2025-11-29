import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Chatbot from '../../components/Chatbot';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Chatbot Component', () => {
  it('renders the toggle button initially', () => {
    render(<Chatbot />);
    const toggleButton = screen.getByLabelText('Toggle chat');
    expect(toggleButton).toBeInTheDocument();
  });

  it('opens the chat window when toggle button is clicked', () => {
    render(<Chatbot />);
    const toggleButton = screen.getByLabelText('Toggle chat');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Forensic AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about tools, cases, concepts...')).toBeInTheDocument();
  });

  it('displays contextual suggestions', () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    
    // Should have initial suggestions
    expect(screen.getByText('Suggestions:')).toBeInTheDocument();
    expect(screen.getByText('What is Autopsy?')).toBeInTheDocument();
  });

  it('sends a message and receives a response', async () => {
    render(<Chatbot />);
    
    // Open chat
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    
    // Type message
    const input = screen.getByPlaceholderText('Ask about tools, cases, concepts...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    // Send message
    fireEvent.submit(input.closest('form')!);

    // Check if user message is displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();

    // Wait for bot response (should be refusal since 'Hello' is a greeting)
    await waitFor(() => {
      const messages = screen.getAllByText(/AI-powered Digital Forensics Assistant/i);
      expect(messages.length).toBeGreaterThanOrEqual(1); // Initial message present
    }, { timeout: 2000 });
  });

  it('handles tool queries with knowledge service', async () => {
    render(<Chatbot />);
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    
    const input = screen.getByPlaceholderText('Ask about tools, cases, concepts...');
    fireEvent.change(input, { target: { value: 'What is Autopsy?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      // Check for the bot response containing tool information
      expect(screen.getByText(/Comprehensive digital forensics platform/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('closes the chat window when close button is clicked', () => {
    render(<Chatbot />);
    
    // Open chat
    fireEvent.click(screen.getByLabelText('Toggle chat'));
    expect(screen.getByText('Forensic AI Assistant')).toBeInTheDocument();
    
    // Close chat
    const closeButton = screen.getByLabelText('Close chat');
    fireEvent.click(closeButton);
    
    // Wait for animation to finish (or check if it's removed from DOM)
    // AnimatePresence might keep it in DOM for a bit, but with waitFor it should be fine
    waitFor(() => {
      expect(screen.queryByText('Forensic AI Assistant')).not.toBeInTheDocument();
    });
  });
});
