import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '../components/ui/Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    render(<Button fullWidth>Wide Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /wide button/i });
    expect(buttonElement.className).toContain('w-full');
  });

  it('renders loading spinner when loading prop is true', () => {
    const { container } = render(<Button loading>Loading...</Button>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
