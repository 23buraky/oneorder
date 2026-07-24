// All money math happens in floating point, then gets rounded to cents at
// each externally-visible boundary — good enough at this scale, and far
// simpler than threading a Decimal type through every call site. Revisit if
// this ever needs to survive an audit.
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}
