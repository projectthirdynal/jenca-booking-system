import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPHP, formatTime } from '@/lib/utils';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {service.image_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <img
            src={service.image_url}
            alt={service.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-neutral-900">
          {service.name}
        </h3>
        {service.description && (
          <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
            {service.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {service.duration_minutes} min
          </span>
          <span className="font-medium text-brand-700">
            {formatPHP(service.price_php)}
          </span>
        </div>
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <Link href={`/book?service=${service.id}`} className="block">
            <Button className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Book this treatment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
