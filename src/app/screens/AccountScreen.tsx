import type { ReactNode } from 'react';
import { Bell, Briefcase, CarFront, ChevronRight, CreditCard, House, Info, Languages, LayoutDashboard, Monitor, Moon, Plus, RotateCcw, ShieldCheck, Sun, Wallet } from 'lucide-react';
import { Link } from '../../components/Link';
import { recentStore, roleStore, themeStore, toast, useRole, useThemePref, type ThemePref } from '../store';
import { SoonButton } from '../ui';

const THEMES: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: 'system', label: 'Auto', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
];

const ADMIN_STATS = [
  { label: 'Bookings this week', value: '24' },
  { label: 'Revenue this week', value: '₦1.2m' },
  { label: 'Waiting for review', value: '3' },
  { label: 'Traffic reports today', value: '18' },
];

export function AccountScreen() {
  const admin = useRole() === 'admin';
  const theme = useThemePref();

  return (
    <div className="shell max-w-3xl py-7 lg:py-10">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-signal font-serif text-[28px] text-[#0E0F0C]">A</span>
        <div>
          <h1 className="font-serif text-[32px] leading-tight font-normal">Ada Okafor</h1>
          <p className="text-[14px] text-muted">Demo account · Yaba, Lagos · No password needed</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-muted" aria-hidden="true" />
            <div>
              <div className="text-[15px] font-semibold">ID and driver’s licence</div>
              <div className="text-[14px] text-muted">Not verified. You need this to drive a rented car or to list your own.</div>
            </div>
          </div>
          <SoonButton feature="Instant ID and licence checks" label="Verify" />
        </div>
      </Card>

      <Section title="Saved places">
        <SoonButton feature="Saved places" variant="row" icon={House}>Home <span className="text-muted">· Add your home</span></SoonButton>
        <SoonButton feature="Saved places" variant="row" icon={Briefcase}>Work <span className="text-muted">· Add your work</span></SoonButton>
      </Section>

      {/* Any account can list a car: owners are commuters whose car sits idle */}
      <section className="mt-8">
        <h2 className="caption px-1 text-muted">Your cars</h2>
        <div className="mt-2 rounded-[20px] bg-surface p-5 ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CarFront className="mt-0.5 h-5 w-5 text-muted" aria-hidden="true" />
              <div>
                <div className="text-[15px] font-semibold">Earn while your car sits at home</div>
                <div className="text-[14px] text-muted">Taking the BRT to work? List your car for the days you don’t need it. You set the price.</div>
              </div>
            </div>
            <SoonButton feature="Listing your car" label="List my car" icon={Plus} variant="accent" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <Stat label="Earned this month" value="₦0" />
            <Stat label="Cars listed" value="0" />
          </div>
        </div>
        <div className="mt-2 overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
          <SoonButton feature="Payouts" variant="row" icon={Wallet}>Payout bank account</SoonButton>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="caption px-1 text-muted">Appearance</h2>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-ink/5 p-1" role="group" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={theme === t.id}
              onClick={() => themeStore.set(t.id)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[14px] ${theme === t.id ? 'bg-surface font-medium shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
            </button>
          ))}
        </div>
      </section>

      <Section title="Settings">
        <SoonButton feature="Saved cards" variant="row" icon={CreditCard}>
          <span>
            <span className="block">Cards for car rentals</span>
            <span className="block text-[13px] text-muted">Pay rental fees and refundable deposits. Bus and danfo fares stay cash or Cowry.</span>
          </span>
        </SoonButton>
        <SoonButton feature="Trip alerts" variant="row" icon={Bell}>Notifications</SoonButton>
        <SoonButton feature="Pidgin, Yoruba, Igbo and Hausa" variant="row" icon={Languages}>Language <span className="text-muted">· English</span></SoonButton>
        <Link to="/" className="flex min-h-14 w-full items-center justify-between rounded-2xl px-4 text-[15px] hover:bg-ink/4">
          <span className="flex items-center gap-2"><Info className="h-4 w-4" aria-hidden="true" /> About Hop</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
        <button
          type="button"
          onClick={() => {
            recentStore.set([]);
            roleStore.set('commuter');
            toast('Demo data reset.');
          }}
          className="flex min-h-14 w-full items-center gap-2 rounded-2xl px-4 text-left text-[15px] text-signal-deep hover:bg-ink/4"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset demo data
        </button>
      </Section>

      <section className="mt-8">
        <h2 className="caption px-1 text-muted">Hop staff</h2>
        <label className="mt-2 flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[20px] bg-surface px-4 ring-1 ring-line">
          <span className="flex items-center gap-2 text-[15px]">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Staff view <span className="text-[13px] text-muted">· demo only</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={admin}
            onChange={(e) => {
              roleStore.set(e.target.checked ? 'admin' : 'commuter');
              toast(e.target.checked ? 'Staff view on.' : 'Staff view off.');
            }}
            className="h-5 w-5 accent-[var(--color-signal)]"
          />
        </label>
        {admin && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ADMIN_STATS.map((s) => <Stat key={s.label} label={s.label} value={s.value} />)}
            </div>
            <p className="mt-2 px-1 text-[12px] text-muted">Demo figures.</p>
            <SoonButton feature="The admin dashboard" label="Open the admin dashboard" icon={LayoutDashboard} variant="primary" className="mt-3 w-full" />
          </>
        )}
      </section>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="mt-6 rounded-[20px] bg-surface p-5 ring-1 ring-line">{children}</div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="caption px-1 text-muted">{title}</h2>
      <div className="mt-2 divide-y divide-line overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
      <div className="text-[12px] text-muted">{label}</div>
      <div className="num mt-1 text-[24px] font-light tracking-[-0.02em]">{value}</div>
    </div>
  );
}
