import TallyMarks from './TallyMarks'

const QUOTES: { text: string; author: string }[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'Either you run the day, or the day runs you.', author: 'Jim Rohn' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'Do the hard jobs first. The easy jobs will take care of themselves.', author: 'Dale Carnegie' },
  { text: 'The best way out is always through.', author: 'Robert Frost' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  { text: 'Amateurs sit and wait for inspiration. The rest of us get up and go to work.', author: 'Stephen King' },
  { text: 'You do not have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Lost time is never found again.', author: 'Benjamin Franklin' },
  { text: 'What we fear doing most is usually what we most need to do.', author: 'Tim Ferriss' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
]

function quoteOfTheDay(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0)
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return QUOTES[day % QUOTES.length]
}

interface MastheadProps {
  totalCount: number
  doneCount: number
  synced: boolean
  loading: boolean
}

function eyebrowFor(now: Date): string {
  const wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(now)
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(now)
  const mo = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(now)
  return `${wd} · ${day} ${mo}`.toUpperCase()
}

export default function Masthead({ totalCount, doneCount, synced, loading }: MastheadProps) {
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(now)
  const active = totalCount - doneCount
  const quote = quoteOfTheDay(now)

  let sub: string
  if (loading) {
    sub = 'Opening your page…'
  } else if (totalCount === 0) {
    sub = 'A clean page. Write your first task below.'
  } else if (active === 0) {
    sub = 'All clear — everything on the page is done.'
  } else {
    sub = `${active} task${active === 1 ? '' : 's'} open, ${doneCount} crossed off.`
  }

  return (
    <header className="masthead rise">
      <div className="masthead-top">
        <span className="brand">
          Tally<span className="brand-dot">.</span>
        </span>
        <span className={`sync${synced ? '' : ' is-offline'}`}>
          <span className="sync-dot" aria-hidden="true" />
          {synced ? 'Synced' : 'Offline'}
        </span>
      </div>
      <div className="masthead-grid">
        <div>
          <p className="eyebrow">
            {eyebrowFor(now)} — <em>{doneCount} done</em>
          </p>
          <h1>{weekday}</h1>
          <p className="masthead-quote">
            “{quote.text}” <span className="quote-author">— {quote.author}</span>
          </p>
          <p className="masthead-sub">{sub}</p>
        </div>
        <TallyMarks done={doneCount} total={totalCount} />
      </div>
    </header>
  )
}
