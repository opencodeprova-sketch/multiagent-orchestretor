import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Sparkline from './Sparkline';

describe('Sparkline', () => {
  const data = [10, 20, 30, 15, 25];
  const color = '#3b82f6';

  it('renderizza svg', () => {
    const { container } = render(<Sparkline data={data} color={color} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('usa dimensioni default se non specificate', () => {
    const { container } = render(<Sparkline data={data} color={color} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '220');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('accetta dimensioni custom', () => {
    const { container } = render(<Sparkline data={data} color={color} width={100} height={30} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '30');
  });

  it('gestisce array singolo', () => {
    const { container } = render(<Sparkline data={[42]} color={color} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('genera path con dati validi', () => {
    const { container } = render(<Sparkline data={data} color={color} />);
    const path = container.querySelector('path.sparkline');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toContain('M');
  });
});
