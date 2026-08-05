import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Splash } from './pages/Splash';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
  }),
}));

describe('Splash Page Component', () => {
  it('renders the application title and branding text', () => {
    render(<Splash />);
    expect(screen.getByText('FeedHope')).toBeDefined();
    expect(screen.getByText('Every Life Matters')).toBeDefined();
  });
});
