interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, color, width = 220, height = 50 }: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const path = `M ${points.join(' L ')}`;

  const areaPoints = [
    `M ${0},${height}`,
    `L ${points.join(' L ')}`,
    `L ${(data.length - 1) * step},${height}`,
    'Z',
  ].join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={path} className="sparkline" stroke={color} />
    </svg>
  );
}
