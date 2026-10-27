import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TailAdminLayout } from '../components/layout/TailAdminLayout';

describe('TailAdminLayout Auto-Hover & Pin Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders sidebar with navigation items and default collapsed state on desktop', () => {
    const handleTabChange = vi.fn();
    const handleSwitchToWorker = vi.fn();

    render(
      <TailAdminLayout
        activeTab="dashboard"
        onTabChange={handleTabChange}
        onSwitchToWorker={handleSwitchToWorker}
      >
        <div>Content Canvas</div>
      </TailAdminLayout>
    );

    expect(screen.getByTitle('Dashboard SHE')).toBeInTheDocument();
    expect(screen.getByTitle('Lapor Bahaya')).toBeInTheDocument();
    expect(screen.getByTitle('Laporan Mingguan')).toBeInTheDocument();
    expect(screen.getByTitle('Laporan Bulanan')).toBeInTheDocument();
  });

  it('expands sidebar on mouseEnter and collapses on mouseLeave', () => {
    const { container } = render(
      <TailAdminLayout
        activeTab="monthly"
        onTabChange={vi.fn()}
        onSwitchToWorker={vi.fn()}
      >
        <div>Canvas</div>
      </TailAdminLayout>
    );

    const aside = container.querySelector('aside')!;
    expect(aside.className).toContain('lg:w-[72px]');

    // Hover mouse on sidebar
    fireEvent.mouseEnter(aside);
    expect(aside.className).toContain('w-64');

    // Move mouse away
    fireEvent.mouseLeave(aside);
    expect(aside.className).toContain('lg:w-[72px]');
  });

  it('pins sidebar open when pin button is clicked', () => {
    const { container } = render(
      <TailAdminLayout
        activeTab="weekly"
        onTabChange={vi.fn()}
        onSwitchToWorker={vi.fn()}
      >
        <div>Canvas</div>
      </TailAdminLayout>
    );

    const aside = container.querySelector('aside')!;
    // Hover to reveal pin button
    fireEvent.mouseEnter(aside);

    const pinBtn = screen.getByLabelText(/Pin sidebar/i);
    fireEvent.click(pinBtn);

    // After mouseLeave, it remains pinned (w-64)
    fireEvent.mouseLeave(aside);
    expect(aside.className).toContain('w-64');
    expect(localStorage.getItem('ihazard_sidebar_pinned')).toBe('true');
  });
});
