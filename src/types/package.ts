export interface Package {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_country: string;
  gp_name: string;
  gp_phone: string;
  image_url?: string;
  status: 'en_attente' | 'chez_gp' | 'expedie' | 'recu';
  status_history: StatusHistoryEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface StatusHistoryEntry {
  status: string;
  date: string;
  timestamp: number;
}

export const STATUS_LABELS = {
  en_attente: 'En Attente',
  chez_gp: 'Chez le GP',
  expedie: 'Expédié',
  recu: 'Reçu'
} as const;

export const STATUS_COLORS = {
  en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  chez_gp: 'bg-blue-100 text-blue-800 border-blue-200',
  expedie: 'bg-purple-100 text-purple-800 border-purple-200',
  recu: 'bg-green-100 text-green-800 border-green-200'
} as const;