const cups = ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H', 'I', 'J'];

export function calculateBraSize(underbust: number, bust: number, unit: 'in' | 'cm') {
  const factor = unit === 'cm' ? 2.54 : 1;
  const under = underbust / factor;
  const over = bust / factor;
  if (!Number.isFinite(under) || !Number.isFinite(over) || under <= 0 || over <= 0) return { error: 'Please enter both measurements.' } as const;
  if (over < under) return { error: 'Your bust measurement should be larger than your underbust. Please check and try again.' } as const;
  const rounded = Math.round(under);
  const band = rounded + (rounded % 2 === 0 ? 4 : 5);
  const index = Math.min(Math.max(Math.round(over) - band, 0), cups.length - 1);
  return { band, cup: cups[index], size: `${band}${cups[index]}`, sisters: [`${band - 2}${cups[Math.min(index + 1, cups.length - 1)]}`, `${band + 2}${cups[Math.max(index - 1, 0)]}`] } as const;
}
