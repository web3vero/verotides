'use client';
import BiteTimesWidget from '@/components/verotide/BiteTimesWidget';

interface FishingClientProps {
  veroData?: any;
  sebastianData?: any;
}

export default function FishingClient({ veroData, sebastianData }: FishingClientProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <BiteTimesWidget lat={27.6386} lon={-80.3973} initialData={veroData} />
      <BiteTimesWidget lat={27.8603} lon={-80.4472} initialData={sebastianData} />
    </div>
  );
}
