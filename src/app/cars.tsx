import { CarFront } from 'lucide-react';
import type { CarsResponse } from '../../shared/types';
import { srcSet } from '../lib/ui';

export type Car = CarsResponse['cars'][number];

export function CarPhoto({ car, className = '' }: { car: Car; className?: string }) {
  if (car.image) {
    return <img src={car.image} srcSet={srcSet(car.image)} sizes="(min-width: 1024px) 30vw, 100vw" alt={`${car.year} ${car.name}`} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-[linear-gradient(135deg,#ECE8E0,#DCD6CA)] ${className}`} aria-label={`${car.year} ${car.name}, photo coming soon`} role="img">
      <CarFront className="h-12 w-12 text-ink/25" aria-hidden="true" />
    </div>
  );
}
