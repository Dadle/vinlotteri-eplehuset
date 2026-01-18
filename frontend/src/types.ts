/**
 * Type definitions for the Wine Lottery application.
 */

export interface Participant {
  id?: number;
  name: string;
  ticket_count: number;
  is_winner?: boolean;
}

export interface Wine {
  id: number;
  name: string;
  producer: string;
  wine_type: WineType;
  country: string;
  region: string;
  vintage: number | null;
  grape_variety: string;
  price: number | null;
  description: string;
  image_url: string;
  vinmonopolet_id: string;
  is_active: boolean;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface WineListItem {
  id: number;
  name: string;
  producer: string;
  wine_type: WineType;
  vintage: number | null;
  display_name: string;
}

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified';

export interface WineTypeInfo {
  key: WineType;
  name: string;
}

export interface CreateWinePayload {
  name: string;
  producer?: string;
  wine_type: WineType;
  country?: string;
  region?: string;
  vintage?: number | null;
  grape_variety?: string;
  price?: number | null;
  description?: string;
  image_url?: string;
  vinmonopolet_id?: string;
  is_active?: boolean;
}

export interface Draw {
  id: number;
  name: string;
  algorithm_used: AlgorithmKey;
  wine: number | null;
  wine_details: WineListItem | null;
  wine_name: string;
  wine_description: string;
  wine_image_url: string;
  created_at: string;
  performed_at: string | null;
  voided_at: string | null;
  winner_name: string;
  participants: Participant[];
  can_void: boolean;
  is_performed: boolean;
  is_voided: boolean;
}

export interface DrawListItem {
  id: number;
  name: string;
  algorithm_used: AlgorithmKey;
  wine: number | null;
  wine_details: WineListItem | null;
  wine_name: string;
  winner_name: string;
  created_at: string;
  performed_at: string | null;
  voided_at: string | null;
  participant_count: number;
  can_void: boolean;
}

export interface CreateDrawPayload {
  name?: string;
  algorithm_used?: AlgorithmKey;
  wine?: number | null;
  wine_name?: string;
  wine_description?: string;
  wine_image_url?: string;
  participants: Omit<Participant, 'id' | 'is_winner'>[];
}

export interface PerformDrawPayload {
  algorithm?: AlgorithmKey;
}

export interface PreviewResult {
  preview: boolean;
  algorithm: AlgorithmKey;
  winner_name: string;
  message: string;
}

export interface Algorithm {
  key: AlgorithmKey;
  name: string;
  description: string;
}

export type AlgorithmKey = 
  | 'pure_random'
  | 'weighted_losses'
  | 'round_robin'
  | 'equal_chance';

export interface ParticipantStats {
  name: string;
  wins: number;
  total_participations: number;
  total_tickets: number;
  win_rate: number;
}

export interface Statistics {
  participants: ParticipantStats[];
  totals: {
    total_draws: number;
    total_participations: number;
    unique_participants: number;
  };
}

export interface ParticipantTemplate {
  id: string;
  name: string;
  participants: Omit<Participant, 'id' | 'is_winner'>[];
  createdAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Vinmonopolet search results
export interface VinmonopoletWine {
  vinmonopolet_id: string;
  name: string;
  producer: string;
  wine_type: WineType;
  country: string;
  region: string;
  vintage: number | null;
  grape_variety: string;
  price: number | null;
  description: string;
  image_url: string | null;
  volume_ml: number | null;
  alcohol_percent: number | null;
}

export interface VinmonopoletSearchResult {
  count: number;
  total: number;
  wines: VinmonopoletWine[];
}
