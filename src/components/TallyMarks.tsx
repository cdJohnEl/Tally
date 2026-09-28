import type { ReactElement } from 'react'

const MAX_MARKS = 30

function jitter(i: number): number {
  return ((i * 53) % 7) - 3
}

export default function TallyMarks({ done, total }: { done: number; total: number }) {
  const shown = Math.min(done, MAX_MARKS)
  const bundles: ReactElement[] = []
  let mark = 0

  for (let remaining = shown; remaining > 0; ) {
    const fill = Math.min(remaining, 5)
    remaining -= fill
    const lines: ReactElement[] = []
    for (let i = 0; i < Math.min(fill, 4); i++) {
      const j = jitter(mark)
      const x = 4 + i * 7
      lines.push(
        <line
          key={i}
          x1={x + j * 0.4}
          y1={3 + jitter(mark + 11) * 0.4}
          x2={x + j * 0.4 + j * 0.5}
          y2={15 + jitter(mark + 17) * 0.3}
          pathLength={1}
          style={{ animationDelay: `${mark * 45}ms` }}
        />,
      )
      mark++
    }
    if (fill === 5) {
      lines.push(
        <line
          key="slash"
          x1={2}
          y1={14}
          x2={30}
          y2={4}
          pathLength={1}
          style={{ animationDelay: `${mark * 45}ms` }}
        />,
      )
    }
    bundles.push(
      <svg
        key={bundles.length}
        className="tally-bundle"
        width={fill === 5 ? 34 : 4 + fill * 7}
        height={18}
        aria-hidden="true"
      >
        {lines}
      </svg>,
    )
  }

  return (
    <div className="tally" role="img" aria-label={`${done} of ${total} tasks done`}>
      <span className="tally-label">
        <strong>{done}</strong> of {total} done
      </span>
      {done === 0 ? (
        <span className="tally-zero">none yet</span>
      ) : (
        <div className="tally-marks">
          {bundles}
          {done > MAX_MARKS && <span className="tally-zero">+{done - MAX_MARKS}</span>}
        </div>
      )}
    </div>
  )
}
