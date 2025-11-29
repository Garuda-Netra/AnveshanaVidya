import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Canvas3D from '../../../components/3d/Canvas3D';

// Mock Three.js components since we can't render WebGL in JSDOM
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas-mock">{children}</div>,
  useFrame: () => {},
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="perspective-camera" />,
  Float: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Stars: () => <div data-testid="stars" />,
}));

// Mock the models to avoid complex geometry rendering in tests
vi.mock('../../../components/3d/models/HDDModel', () => ({
  HDDModel: () => <div data-testid="hdd-model">HDD Model</div>,
}));

vi.mock('../../../components/3d/models/SSDModel', () => ({
  SSDModel: () => <div data-testid="ssd-model">SSD Model</div>,
}));

vi.mock('../../../components/3d/SceneLights', () => ({
  SceneLights: () => <div data-testid="scene-lights" />,
}));

describe('Canvas3D', () => {
  it('renders 3D view by default', () => {
    render(<Canvas3D scene="hdd" />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    expect(screen.getByTestId('hdd-model')).toBeInTheDocument();
  });

  it('renders correct model based on scene prop', () => {
    const { rerender } = render(<Canvas3D scene="hdd" />);
    expect(screen.getByTestId('hdd-model')).toBeInTheDocument();

    rerender(<Canvas3D scene="ssd" />);
    expect(screen.getByTestId('ssd-model')).toBeInTheDocument();
  });

  it('switches to 2D view when button is clicked', () => {
    render(<Canvas3D scene="hdd" />);
    
    const toggleButton = screen.getByText('Switch to 2D');
    fireEvent.click(toggleButton);

    expect(screen.queryByTestId('canvas-mock')).not.toBeInTheDocument();
    expect(screen.getByText('2D Visualization Mode')).toBeInTheDocument();
    expect(screen.getByText('Switch to 3D')).toBeInTheDocument();
  });

  it('switches back to 3D view', () => {
    render(<Canvas3D scene="hdd" />);
    
    // Switch to 2D
    fireEvent.click(screen.getByText('Switch to 2D'));
    
    // Switch back to 3D
    fireEvent.click(screen.getByText('Switch to 3D'));
    
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });
});
