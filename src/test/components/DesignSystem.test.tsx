import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GlassPanel from '../../components/ui/GlassPanel';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Accordion from '../../components/ui/Accordion';
import Tooltip from '../../components/ui/Tooltip';
import Badge from '../../components/ui/Badge';

describe('Design System Components', () => {
  describe('GlassPanel', () => {
    it('renders children correctly', () => {
      render(<GlassPanel>Test Content</GlassPanel>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies hover effect class when prop is true', () => {
      const { container } = render(<GlassPanel hoverEffect>Content</GlassPanel>);
      expect(container.firstChild).toHaveClass('hover:bg-surface-glass-hover');
    });
  });

  describe('Card', () => {
    it('renders title and subtitle', () => {
      render(<Card title="Card Title" subtitle="Card Subtitle">Content</Card>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(<Card footer={<span>Footer Content</span>}>Body</Card>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    const tabs = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
    ];

    it('renders all tab labels', () => {
      render(<Tabs tabs={tabs} />);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });

    it('shows active tab content and hides others', () => {
      render(<Tabs tabs={tabs} />);
      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.getByText('Content 2')).not.toBeVisible();
    });

    it('switches content on click', () => {
      render(<Tabs tabs={tabs} />);
      fireEvent.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 2')).toBeVisible();
      expect(screen.getByText('Content 1')).not.toBeVisible();
    });
  });

  describe('Accordion', () => {
    const items = [
      { id: 'item1', title: 'Item 1', content: 'Content 1' },
      { id: 'item2', title: 'Item 2', content: 'Content 2' },
    ];

    it('renders all items closed by default', () => {
      render(<Accordion items={items} />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      const contentWrapper = document.getElementById('accordion-content-item1');
      expect(contentWrapper).toHaveClass('max-h-0');
    });

    it('opens item on click', () => {
      render(<Accordion items={items} />);
      fireEvent.click(screen.getByText('Item 1'));
      const contentWrapper = document.getElementById('accordion-content-item1');
      expect(contentWrapper).toHaveClass('max-h-[1000px]');
    });

    it('toggles item closed on second click', () => {
      render(<Accordion items={items} />);
      const button = screen.getByText('Item 1');
      fireEvent.click(button); // Open
      fireEvent.click(button); // Close
      const contentWrapper = document.getElementById('accordion-content-item1');
      expect(contentWrapper).toHaveClass('max-h-0');
    });
  });

  describe('Tooltip', () => {
    it('renders children', () => {
      render(<Tooltip content="Tooltip text"><button>Hover me</button></Tooltip>);
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('shows tooltip on hover', () => {
      render(<Tooltip content="Tooltip text"><button>Hover me</button></Tooltip>);
      fireEvent.mouseEnter(screen.getByText('Hover me'));
      expect(screen.getByRole('tooltip')).toHaveClass('opacity-100');
    });
  });

  describe('Badge', () => {
    it('renders content', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('applies variant classes', () => {
      const { container } = render(<Badge variant="neon">Neon</Badge>);
      expect(container.firstChild).toHaveClass('text-accent-neon');
    });
  });
});
