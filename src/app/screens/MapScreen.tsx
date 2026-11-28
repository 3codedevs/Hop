import { useState } from 'react';
import { Flag } from 'lucide-react';
import { CorridorCard } from '../Corridors';
import { lagosNow } from '../format';
import { HopMap } from '../HopMap';
import { MapLayout } from '../MapLayout';
import { useNetwork } from '../traffic';
import { SoonButton } from '../ui';

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toClock = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const FIRST = 5 * 60;
const LAST = 23 * 60;

/** The whole network on Hop's map, with traffic you can scrub through the day. */
export function MapScreen() {
  const [minutes, setMinutes] = useState(() => Math.min(LAST, Math.max(FIRST, Math.round(toMinutes(lagosNow()) / 15) * 15)));
  const time = toClock(minutes);
  const { data: net } = useNetwork(time);

  return (
    <MapLayout
      initialSnap="peek"
      map={(padding) => <HopMap time={time} padding={padding} />}
      header={
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[13px] text-muted">Lagos traffic at</p>
              <div className="num text-[34px] leading-none font-light tracking-[-0.02em]">{time}</div>
            </div>
            <SoonButton feature="Reporting traffic" label="Report" icon={Flag} />
          </div>
          <input
            type="range"
            min={FIRST}
            max={LAST}
            step={15}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Time of day"
            aria-valuetext={time}
            className="hop-range hop-range-light mt-4 w-full"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted">
            <span>05:00</span>
            <span>Morning rush</span>
            <span>Midday</span>
            <span>Evening rush</span>
            <span>23:00</span>
          </div>
        </div>
      }
    >
      <h2 className="text-[15px] font-semibold">Main roads at {time}</h2>
      <p className="mt-0.5 text-[13px] text-muted">Tap a direction to plan that trip. Traffic is simulated for the demo.</p>
      <div className="mt-3 grid gap-2">
        {net?.corridors.map((c) => <CorridorCard key={c.id} corridor={c} time={time} />)}
      </div>
    </MapLayout>
  );
}
