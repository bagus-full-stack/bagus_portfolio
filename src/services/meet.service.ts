import { supabase } from './supabase.service';

export interface TimeSlot {
  start: string;      // ISO 8601
  end: string;        // ISO 8601
  label: string;      // "09:30"
}

export interface BookingRequest {
  start: string;
  end: string;
  attendeeName: string;
  attendeeEmail: string;
  subject?: string;
  notes?: string;
}

export interface BookingConfirmation {
  eventId: string;
  meetLink: string;   // meet.google.com/xxx-xxx-xxx
  icsContent: string; // base64
}

export const getAvailableSlots = async (
  date: string
): Promise<TimeSlot[]> => {
  // Using POST because Supabase Functions SDK handles body better
  const { data, error } = await supabase.functions.invoke(
    'meet',
    {
      method: 'POST',
      body: { action: 'slots', date } 
    }
  );
  if (error) throw new Error('Impossible de charger les créneaux');
  if (data?.error) throw new Error(data.error);
  return data.slots;
};

export const createMeeting = async (
  booking: BookingRequest
): Promise<BookingConfirmation> => {
  const { data, error } = await supabase.functions.invoke(
    'meet',
    { body: booking }
  );
  if (error) throw new Error('Échec de la création du Meet');
  if (data?.error) throw new Error(data.error);
  return data;
};

// Télécharger le fichier .ics
export const downloadICS = (
  icsBase64: string,
  filename: string
) => {
  const blob = new Blob(
    [atob(icsBase64)],
    { type: 'text/calendar;charset=utf-8' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
