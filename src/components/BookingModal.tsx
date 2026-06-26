import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Calendar as CalendarIcon, Video } from 'lucide-react';
import { TimeSlot, getAvailableSlots, createMeeting, downloadICS } from '../services/meet.service';
import { toast } from 'sonner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    notes: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [confirmationData, setConfirmationData] = useState<{ meetLink?: string, icsContent?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
      setStatus('idle');
      setFormData({ name: '', email: '', subject: '', notes: '' });
      setConfirmationData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate && step === 2) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          const slots = await getAvailableSlots(formattedDate);
          setAvailableSlots(slots);
        } catch (error) {
          toast.error('Erreur lors de la récupération des créneaux');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, step]);

  if (!isOpen) return null;

  // Generate 7 days for the calendar starting today
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const handleDateSelect = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) return; // Weekend
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setStatus('submitting');
    try {
      const res = await createMeeting({
        start: selectedSlot.start,
        end: selectedSlot.end,
        attendeeName: formData.name,
        attendeeEmail: formData.email,
        subject: formData.subject,
        notes: formData.notes
      });
      setConfirmationData(res);
      setStatus('success');
      setStep(4);
    } catch (err) {
      setStatus('error');
      toast.error('Erreur lors de la réservation');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F14]/80 backdrop-blur-sm" onClick={handleOverlayClick}>
      <div className="bg-[#141B22] border border-[#8B94A3]/30 rounded-xl w-full max-w-[480px] p-8 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-space text-2xl font-bold text-white mb-1">Réserver un appel</h2>
            <p className="font-inter text-[#8B94A3] text-sm">30 minutes — Visio ou téléphone</p>
          </div>
          <button onClick={onClose} className="text-[#8B94A3] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Stepper Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#8B94A3]/30 z-0"></div>
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s 
                    ? 'bg-[#E08A3E] text-white' 
                    : step > s 
                      ? 'bg-[#2DD4BF] text-[#0B0F14]' 
                      : 'bg-[#141B22] border-2 border-[#8B94A3]/50 text-[#8B94A3]'
                }`}
              >
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter font-medium text-white">Choisissez une date</h3>
              <span className="text-xs text-[#8B94A3] bg-[#0B0F14] px-2 py-1 rounded">Europe/Paris</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dates.map((date, idx) => {
                const day = date.getDay();
                const isWeekend = day === 0 || day === 6;
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const formattedDate = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                
                return (
                  <button
                    key={idx}
                    disabled={isWeekend}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-lg border text-left font-mono text-sm transition-colors ${
                      isWeekend 
                        ? 'opacity-30 border-white/5 cursor-not-allowed text-[#8B94A3]' 
                        : isSelected
                          ? 'bg-[#E08A3E] border-[#E08A3E] text-white'
                          : 'border-[#8B94A3]/30 hover:border-[#E08A3E] text-white bg-[#141B22]'
                    }`}
                  >
                    {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                  </button>
                );
              })}
            </div>
            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedDate}
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-[#E08A3E] hover:bg-[#C97A35] disabled:opacity-50 disabled:hover:bg-[#E08A3E] text-white font-medium rounded-lg transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-inter font-medium text-white">Choisissez une heure</h3>
              <span className="text-xs text-[#8B94A3] bg-[#0B0F14] px-2 py-1 rounded">Europe/Paris</span>
            </div>
            
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="h-11 bg-white/5 animate-pulse rounded-lg border border-white/5"></div>
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-center py-8 text-[#8B94A3]">Aucun créneau disponible à cette date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {availableSlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-3 rounded-lg border font-mono text-sm transition-colors text-center ${
                        isSelected
                          ? 'bg-[#E08A3E] border-[#E08A3E] text-white'
                          : 'border-[#8B94A3]/30 hover:border-[#E08A3E] text-white bg-[#141B22]'
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-[#8B94A3] hover:text-white transition-colors"
              >
                ← Retour
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-[#E08A3E] hover:bg-[#C97A35] disabled:opacity-50 disabled:hover:bg-[#E08A3E] text-white font-medium rounded-lg transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Form */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-inter font-medium text-white mb-2">Vos informations</h3>

            <div className="bg-[#0B0F14] rounded-lg p-3 mb-4 font-mono text-sm text-white">
              {selectedDate?.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())} à {selectedSlot?.label} — 30 minutes
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Prénom & Nom *"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#8B94A3]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E08A3E] transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#8B94A3]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E08A3E] transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Sujet de l'appel (optionnel)"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#8B94A3]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E08A3E] transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="Notes (optionnel)"
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#8B94A3]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E08A3E] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-[#8B94A3] hover:text-white transition-colors"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex-1 py-3 bg-[#E08A3E] hover:bg-[#C97A35] text-white font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {status === 'submitting' ? <Loader2 className="animate-spin" size={20} /> : 'Confirmer la réservation'}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] animate-in zoom-in duration-300">
              <CheckCircle2 size={32} />
            </div>
            
            <div>
              <h3 className="font-space text-2xl font-bold text-white mb-2">Votre appel est confirmé !</h3>
              <p className="font-inter text-[#8B94A3] text-sm">
                Un email de confirmation avec le lien Meet a été envoyé à {formData.email}
              </p>
            </div>

            <div className="bg-[#0B0F14] border border-[#8B94A3]/30 rounded-lg p-4 w-full text-left font-mono text-sm space-y-3">
              <div className="flex items-center text-[#8B94A3]">
                <CalendarIcon size={16} className="mr-3" />
                <span className="text-white">
                  {selectedDate?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} 
                  {' à '}{selectedSlot?.label}
                </span>
              </div>
              {confirmationData?.meetLink && (
                <div className="flex items-center text-[#8B94A3] pt-3 border-t border-[#8B94A3]/20">
                  <Video size={16} className="mr-3" />
                  <a href={confirmationData.meetLink} target="_blank" rel="noreferrer" className="text-[#2DD4BF] hover:underline break-all truncate block">
                    Rejoindre le Meet : {confirmationData.meetLink.replace('https://', '')}
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col w-full gap-3 pt-4">
              {confirmationData?.icsContent && (
                <button
                  onClick={() => downloadICS(confirmationData.icsContent!, 'appel.ics')}
                  className="w-full py-3 bg-transparent border border-[#8B94A3]/30 hover:border-[#8B94A3] text-[#8B94A3] hover:text-white font-medium rounded-lg transition-colors"
                >
                  Télécharger l'invitation .ics
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#E08A3E] hover:bg-[#C97A35] text-white font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
