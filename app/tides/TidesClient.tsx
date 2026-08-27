'use client';
import TideWidget from '@/components/verotide/TideWidget';

interface TidesClientProps {
  veroData?: unknown;
  sebastianData?: unknown;
}

export default function TidesClient({ veroData, sebastianData }: TidesClientProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <TideWidget station="8722125" stationName="Vero Beach (Intracoastal), FL" initialData={veroData} />
      <TideWidget station="8722004" stationName="Sebastian Inlet, FL" initialData={sebastianData} />
    </div>
  );
}
