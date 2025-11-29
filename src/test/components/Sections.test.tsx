import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Hero from '../../components/sections/Hero';
import TopicsGrid from '../../components/sections/TopicsGrid';
import ToolsShowcase from '../../components/sections/ToolsShowcase';
import CaseStudies from '../../components/sections/CaseStudies';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Section Components', () => {
  it('Hero renders correctly', () => {
    render(<Hero />);
    expect(screen.getByText('DIGITAL FORENSICS')).toBeInTheDocument();
    expect(screen.getByText('START INVESTIGATION')).toBeInTheDocument();
  });

  it('TopicsGrid renders topics', () => {
    render(<TopicsGrid />);
    expect(screen.getByText('Investigation Modules')).toBeInTheDocument();
    // Check for a known topic title from json
    expect(screen.getByText('Computer Forensics Fundamentals')).toBeInTheDocument();
  });

  it('ToolsShowcase renders tools', () => {
    render(<ToolsShowcase />);
    expect(screen.getByText('Forensic Arsenal')).toBeInTheDocument();
    // Check for a known tool - might be multiple because of "All" tab and specific category tab
    const autopsyElements = screen.getAllByText('Autopsy');
    expect(autopsyElements.length).toBeGreaterThan(0);
    expect(autopsyElements[0]).toBeInTheDocument();
  });

  it('CaseStudies renders cases', () => {
    render(<CaseStudies />);
    expect(screen.getByText('Real-World Cases')).toBeInTheDocument();
    // Check for a known case scenario text (partial) - might be in title and content
    const caseElements = screen.getAllByText(/ransomware attack/i);
    expect(caseElements.length).toBeGreaterThan(0);
    expect(caseElements[0]).toBeInTheDocument();
  });
});
