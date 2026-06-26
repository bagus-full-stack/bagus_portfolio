import { supabase } from './supabase.service';

export interface TimeSlot {
  start: string;
  end: string;
  label: string; // "09:30"
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
  meetLink: string;
  icsContent: string; // base64
}

export const getAvailableSlots = async (date: string) => {
  const { data, error } = await supabase.functions.invoke('calendar', {
    body: { action: 'slots', date }
  });
  
  if (error) throw error;
  return (data?.slots || []) as TimeSlot[];
};

export const bookSlot = async (booking: BookingRequest) => {
  const { data, error } = await supabase.functions.invoke('calendar', {
    body: booking
  });
  
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  
  return data as BookingConfirmation;
};
