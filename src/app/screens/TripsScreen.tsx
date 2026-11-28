import { useState, type ReactNode } from 'react';
import { ArrowRight, Bookmark, CarFront, ChevronRight, Route, Ticket } from 'lucide-react';
import { Link } from '../../components/Link';
import { usePlaces } from '../api';
import { planPath } from '../paths';
import { recentStore, useRecent } from '../store';
import { PageTitle, SoonButton } from '../ui';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'recent', label: 'Recent' },
  { id: 'saved', label: 'Saved' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export function TripsScreen() {
  const [tab, setTab] = useState<TabId>('upcoming');
  const recent = useRecent();
  const { data: places = [] } = usePlaces();
  const name = (id: string) => places.find((p) => p.id === id)?.name ?? '…';

  return (
    <div className="shell max-w-3xl py-7 lg:py-10">
      <PageTitle kicker="Bookings and journeys" title="Your trips" />

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-full bg-ink/5 p-1" role="tablist" aria-label="Trips">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full text-[14px] ${tab === t.id ? 'bg-surface font-medium shadow-sm' : 'text-muted'}`}
          >
            {t.label}
            {t.id === 'recent' && recent.length > 0 && <span className="num ml-1.5 text-muted">{recent.length}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {tab === 'upcoming' && (
          <Empty icon={Ticket} title="No bookings yet" body="Car rentals and live trips you start will show up here, with pickup details and receipts.">
            <Link to="/app/rent" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-paper">
              <CarFront className="h-4 w-4" /> Rent a car
            </Link>
            <Link to="/app" className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[15px] font-medium">
              <Route className="h-4 w-4" /> Plan a trip
            </Link>
          </Empty>
        )}

        {tab === 'recent' &&
          (recent.length ? (
            <>
              <ul className="divide-y divide-line overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
                {recent.map((r) => (
                  <li key={`${r.from}-${r.to}`}>
                    <Link to={planPath({ ...r, prefer: 'best' })} className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 hover:bg-ink/3">
                      <span>
                        <span className="block text-[15px] font-medium">
                          {name(r.from)} <span className="font-normal text-muted">to</span> {name(r.to)}
                        </span>
                        <span className="num block text-[13px] text-muted">Leaving {r.t}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => recentStore.set([])} className="mt-3 inline-flex min-h-11 items-center px-1 text-[14px] text-muted hover:text-ink">
                Clear recent trips
              </button>
            </>
          ) : (
            <Empty icon={Route} title="Nothing searched yet" body="Trips you plan are kept here so you can check them again tomorrow morning.">
              <Link to="/app" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-paper">
                Plan a trip <ArrowRight className="h-4 w-4" />
              </Link>
            </Empty>
          ))}

        {tab === 'saved' && (
          <Empty icon={Bookmark} title="Save the routes you take every day" body="Hop will warn you before you leave when one of them is jammed or flooded.">
            <SoonButton feature="Saved routes and alerts" label="Save a route" icon={Bookmark} />
          </Empty>
        )}
      </div>
    </div>
  );
}

function Empty({ icon: Icon, title, body, children }: { icon: typeof Ticket; title: string; body: string; children: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-ink/20 px-6 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/5">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-serif text-[24px] font-normal">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">{body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  );
}
