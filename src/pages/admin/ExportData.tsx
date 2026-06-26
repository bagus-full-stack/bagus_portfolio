import React, { useState, useEffect } from 'react';
import { Download, FileText, Database, Mail } from 'lucide-react';
import { supabase } from '../../services/supabase.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Profile, Experience, Skill, Certification } from '../../types';

export function ExportData() {
  const [pdfState, setPdfState] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [jsonState, setJsonState] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [csvState, setCsvState] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  
  const [csvPeriod, setCsvPeriod] = useState<'month' | '3months' | 'all'>('month');

  const [cvData, setCvData] = useState<{
    profile: Profile | null;
    experiences: Experience[];
    skills: Skill[];
    certifications: Certification[];
  }>({ profile: null, experiences: [], skills: [], certifications: [] });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('experiences').select('*').order('start_date', { ascending: false }),
      supabase.from('skills').select('*'),
      supabase.from('certifications').select('*')
    ]).then(([profileRes, expRes, skillsRes, certRes]) => {
      if (mounted) {
        setCvData({
          profile: profileRes.data,
          experiences: expRes.data || [],
          skills: skillsRes.data || [],
          certifications: certRes.data || []
        });
      }
    });
    return () => { mounted = false; };
  }, []);

  const handlePdfExport = async () => {
    setPdfState('generating');
    try {
      const printContent = document.getElementById('cv-preview');

      if (!printContent) {
        window.open('/?print=true', '_blank');
        setPdfState('idle');
        return;
      }

      // Rendre le div visible temporairement pour la capture
      printContent.style.display = 'block';

      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      printContent.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CV-Assami-Baga-${new Date().toISOString().split('T')[0]}.pdf`);

      localStorage.setItem('lastPdfExport', new Date().toISOString());
      
      setPdfState('success');
      toast.success('CV généré et prêt à télécharger');
    } catch (e) {
      setPdfState('error');
      toast.error('Échec de la génération PDF — Réessayer');
    }
  };

  const handleJsonExport = async () => {
    setJsonState('generating');
    try {
      const [profile, experiences, projects, skills, certs] = await Promise.all([
        supabase.from('profiles').select('*').single(),
        supabase.from('experiences').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('certifications').select('*')
      ]);

      const backup = {
        exportDate: new Date().toISOString(),
        profile: profile.data,
        experiences: experiences.data,
        projects: projects.data,
        skills: skills.data,
        certifications: certs.data
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setJsonState('success');
    } catch (e) {
      setJsonState('error');
    }
  };

  const handleCsvExport = async () => {
    setCsvState('generating');
    try {
      let query = supabase
        .from('messages')
        .select('created_at, name, email, subject, message, read')
        .order('created_at', { ascending: false });
        
      const now = new Date();
      if (csvPeriod === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        query = query.gte('created_at', monthAgo);
      } else if (csvPeriod === '3months') {
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
        query = query.gte('created_at', threeMonthsAgo);
      }

      const { data: messages } = await query;

      const headers = ['Date', 'Nom', 'Email', 'Sujet', 'Message', 'Lu'];
      const rows = messages?.map(m => [
        new Date(m.created_at).toLocaleDateString('fr-FR'),
        m.name,
        m.email,
        m.subject || '',
        m.message.slice(0, 100),
        m.read ? 'Oui' : 'Non'
      ]) || [];

      const csv = [headers, ...rows]
        .map(row => row.map(cell =>
          `"${String(cell).replace(/"/g, '""')}"`
        ).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `messages-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      setCsvState('success');
    } catch (e) {
      setCsvState('error');
    }
  };

  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent-ocre/10 flex items-center justify-center text-accent-ocre">
          <Download size={20} />
        </div>
        <h1 className="font-space text-3xl font-bold text-text-primary">Export & Sauvegarde</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Section 1: CV PDF */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-accent-cyan" size={24} />
            <h2 className="font-space font-bold text-xl">CV PDF</h2>
          </div>
          
          <div className="flex-1">
            <div className="bg-[var(--bg-primary)] rounded-lg h-32 mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden">
              <iframe 
                src="/" 
                className="w-[800px] h-[600px] scale-[0.2] transform origin-top-left absolute top-0 left-0 pointer-events-none opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <span className="font-mono text-sm text-white/80">Aperçu</span>
              </div>
            </div>
            
            <p className="font-mono text-xs text-text-muted mb-6">
              Généré le {today}
            </p>
          </div>

          <button 
            onClick={handlePdfExport}
            disabled={pdfState === 'generating'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent-ocre text-bg-primary font-space font-medium rounded-lg hover:bg-accent-ocre/90 transition-colors disabled:opacity-50"
          >
            {pdfState === 'generating' ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : pdfState === 'error' ? (
              'Échec de la génération — Réessayer'
            ) : (
              'Générer le PDF'
            )}
          </button>
          
          {pdfState === 'success' && (
            <p className="text-green-400 text-xs mt-3 text-center">CV généré et prêt à télécharger</p>
          )}
        </div>

        {/* Section 2: Export JSON */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-accent-ocre" size={24} />
            <h2 className="font-space font-bold text-xl">Export JSON</h2>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-text-muted mb-4">
              Sauvegarde complète des données du portfolio :
            </p>
            <ul className="text-sm text-text-primary space-y-2 mb-6 list-disc list-inside opacity-80">
              <li>Profil et infos de contact</li>
              <li>Expériences professionnelles</li>
              <li>Projets et réalisations</li>
              <li>Compétences et catégories</li>
              <li>Certifications</li>
            </ul>
            
            <p className="font-mono text-xs text-text-muted mb-6">
              Dernier export : {today}
            </p>
          </div>

          <button 
            onClick={handleJsonExport}
            disabled={jsonState === 'generating'}
            className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 text-text-primary font-space font-medium rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {jsonState === 'generating' ? (
              <>
                <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : jsonState === 'error' ? (
              'Échec de la génération — Réessayer'
            ) : (
              'Exporter tout'
            )}
          </button>
        </div>

        {/* Section 3: Export CSV */}
        <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-accent-cyan" size={24} />
            <h2 className="font-space font-bold text-xl">Export Messages</h2>
          </div>
          
          <div className="flex-1">
            <div className="flex bg-[var(--bg-primary)] rounded-lg p-1 mb-6">
              <button 
                onClick={() => setCsvPeriod('month')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${csvPeriod === 'month' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
              >
                Ce mois
              </button>
              <button 
                onClick={() => setCsvPeriod('3months')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${csvPeriod === '3months' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
              >
                3 mois
              </button>
              <button 
                onClick={() => setCsvPeriod('all')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${csvPeriod === 'all' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
              >
                Tout
              </button>
            </div>

            <p className="text-sm text-text-muted mb-4">
              Colonnes exportées :
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Date', 'Nom', 'Email', 'Sujet', 'Message', 'Lu'].map(col => (
                <span key={col} className="text-xs bg-white/5 px-2 py-1 rounded text-text-primary opacity-80">
                  {col}
                </span>
              ))}
            </div>

            <p className="font-mono text-xs text-text-muted mb-6">
              24 messages dans cette période
            </p>
          </div>

          <button 
            onClick={handleCsvExport}
            disabled={csvState === 'generating'}
            className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 text-text-primary font-space font-medium rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {csvState === 'generating' ? (
              <>
                <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : csvState === 'error' ? (
              'Échec de la génération — Réessayer'
            ) : (
              'Exporter les messages'
            )}
          </button>
        </div>

      </div>

      {/* Hidden div for PDF generation */}
      <div id="cv-preview" style={{ display: 'none', padding: '40px', backgroundColor: '#fff', color: '#000', fontFamily: 'sans-serif', width: '800px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{cvData.profile?.full_name || 'Assami Baga'}</h1>
        <p style={{ fontSize: '18px', color: '#555', marginBottom: '24px' }}>{cvData.profile?.title}</p>
        <p style={{ marginBottom: '32px' }}>{cvData.profile?.bio_short}</p>

        <h2 style={{ fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Expériences</h2>
        {cvData.experiences.map((exp, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>{exp.title}</h3>
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>{exp.organization} • {exp.start_date} - {exp.end_date}</p>
            <p style={{ margin: '0' }}>{exp.description}</p>
          </div>
        ))}

        <h2 style={{ fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '32px', marginBottom: '16px' }}>Compétences</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {cvData.skills.map((skill, idx) => (
            <span key={idx} style={{ padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '14px' }}>
              {skill.name}
            </span>
          ))}
        </div>

        {cvData.certifications.length > 0 && (
          <>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginTop: '32px', marginBottom: '16px' }}>Certifications</h2>
            {cvData.certifications.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>{cert.title}</h3>
                <p style={{ margin: '0', color: '#666' }}>{cert.issuer} • {cert.date}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
