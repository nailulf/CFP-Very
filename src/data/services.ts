export interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

export const services: Service[] = [
  {
    id: 'discovery-call',
    name: '1-on-1 Discovery Call',
    duration: '30 min',
    price: 99000,
    description: '30-minute session with Aditya',
  },
  {
    id: 'consultation',
    name: 'Konsultasi Keuangan',
    duration: '60 min',
    price: 299000,
    description: '60-minute deep dive session',
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
