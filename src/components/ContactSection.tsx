import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Mail, Calendar, Linkedin, Github, Loader2 } from 'lucide-react';
import { ContactForm } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { useTranslation } from '../hooks/useTranslation';
import { BookingModal } from './BookingModal';

export function ContactSection() {
  const { t } = useTranslation();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '' // honeypot
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) return; // bot détecté, abandon silencieux

    setStatus('submitting');
    
    try {
      await SupabaseService.submitContactForm(formData);
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      
      setTimeout(() => setStatus('idle'), 5000); // Reset after 5s
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="py-24 bg-bg-primary border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="font-space text-3xl md:text-4xl font-bold text-text-primary mb-16">{t('contact.title')}</h2>
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column: Direct Info */}
          <div className="lg:w-1/3 flex flex-col space-y-10">
            <div>
              <h3 className="font-space text-xl font-semibold text-text-primary mb-4">{t('contact.subtitle')}</h3>
              
              <a 
                href="mailto:contact@example.com" 
                className="inline-flex items-center text-text-primary hover:text-accent-ocre transition-colors font-inter mb-6"
              >
                <Mail size={20} className="mr-3 text-accent-ocre" />
                contact@example.com
              </a>
              <br />
                <BookingModal 
                  isOpen={bookingModalOpen}
                  onClose={() => setBookingModalOpen(false)}
                />
              <button 
                onClick={() => setBookingModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E08A3E] text-white rounded-lg hover:bg-[#C97A35] transition-colors font-inter font-medium"
              >
                <Calendar size={18} />
                {t('contact.book')}
              </button>
            </div>
            
            <div className="pt-8 border-t border-white/5">
              <h4 className="font-inter text-sm text-text-muted mb-4 uppercase tracking-wider">Réseaux</h4>
              <div className="flex flex-col space-y-4">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center text-text-muted hover:text-text-primary transition-colors font-inter text-sm">
                  <Linkedin size={18} className="mr-3" /> LinkedIn
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center text-text-muted hover:text-text-primary transition-colors font-inter text-sm">
                  <Github size={18} className="mr-3" /> GitHub
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column: Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="bg-bg-card p-8 md:p-10 rounded-xl border border-white/5 flex flex-col space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="name" className="font-inter text-sm text-text-muted">{t('contact.form.name')} <span className="text-accent-ocre">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder={t('contact.form.placeholder.name')}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    className="bg-bg-primary border border-white/10 rounded-md px-4 py-3 text-text-primary font-inter focus:outline-none focus:border-accent-ocre transition-colors disabled:opacity-50"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="font-inter text-sm text-text-muted">{t('contact.form.email')} <span className="text-accent-ocre">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder={t('contact.form.placeholder.email')}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    className="bg-bg-primary border border-white/10 rounded-md px-4 py-3 text-text-primary font-inter focus:outline-none focus:border-accent-ocre transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label htmlFor="subject" className="font-inter text-sm text-text-muted">{t('contact.form.subject')}</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder={t('contact.form.placeholder.subject')}
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={status === 'submitting'}
                  className="bg-bg-primary border border-white/10 rounded-md px-4 py-3 text-text-primary font-inter focus:outline-none focus:border-accent-ocre transition-colors disabled:opacity-50"
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <label htmlFor="message" className="font-inter text-sm text-text-muted">{t('contact.form.message')} <span className="text-accent-ocre">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder={t('contact.form.placeholder.message')}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={status === 'submitting'}
                  className="bg-bg-primary border border-white/10 rounded-md px-4 py-3 text-text-primary font-inter focus:outline-none focus:border-accent-ocre transition-colors disabled:opacity-50 resize-none"
                />
              </div>
              
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={status === 'submitting' || status === 'success'}
                  className="w-full sm:w-auto px-8 py-3 bg-accent-ocre text-bg-primary font-inter font-medium rounded-md hover:bg-accent-ocre/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
                >
                  {status === 'submitting' && <Loader2 size={18} className="mr-2 animate-spin" />}
                  {status === 'idle' && t('contact.form.send')}
                  {status === 'submitting' && t('contact.form.sending')}
                  {status === 'success' && t('contact.form.success')}
                  {status === 'error' && t('contact.form.error')}
                </button>
                
                {status === 'success' && (
                  <span className="text-green-400 font-inter text-sm animate-in fade-in duration-300">
                    {t('contact.form.success')}
                  </span>
                )}
                {status === 'error' && (
                  <span className="text-red-400 font-inter text-sm animate-in fade-in duration-300">
                    {t('contact.form.error')}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
