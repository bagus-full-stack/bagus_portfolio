import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, FileJson, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { importJSON, ImportData, ImportResult } from '../../services/import.service';
import { useNavigate } from 'react-router-dom';

export function ImportDataPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge');
  
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParseError(null);
      setParsedData(null);
      setResults(null);
      setSelectedSections([]);

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          if (!json.version) {
            setParseError('Le fichier JSON doit contenir une clé "version".');
            return;
          }
          setParsedData(json);
        } catch (e) {
          setParseError('Fichier JSON invalide.');
        }
      };
      reader.onerror = () => {
        setParseError('Erreur lors de la lecture du fichier.');
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  } as any);

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleImport = async () => {
    if (!parsedData || selectedSections.length === 0) return;
    
    setIsImporting(true);
    try {
      const res = await importJSON(parsedData, selectedSections, strategy);
      setResults(res);
    } catch (e) {
      console.error(e);
      setParseError("Une erreur est survenue lors de l'importation.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData(null);
    setParseError(null);
    setResults(null);
    setSelectedSections([]);
  };

  const getSectionCounts = () => {
    if (!parsedData) return {};
    return {
      profile: parsedData.profile ? 1 : 0,
      experiences: parsedData.experiences?.length || 0,
      projects: parsedData.projects?.length || 0,
      skills: parsedData.skills?.length || 0,
      certifications: parsedData.certifications?.length || 0,
      testimonials: parsedData.testimonials?.length || 0,
    };
  };

  const counts = getSectionCounts();
  const hasData = parsedData !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold text-text-primary">Importer des données</h1>
          <p className="text-text-muted mt-2">
            Importez un fichier JSON pour alimenter la base de données en une seule fois
          </p>
        </div>
        <a 
          href="/import-template.json" 
          download
          className="flex items-center gap-2 px-4 py-2 border border-border-color rounded-lg hover:border-accent-cyan/50 hover:bg-accent-cyan/10 transition-colors text-text-primary text-sm font-medium whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Télécharger le template JSON
        </a>
      </div>

      {results ? (
        <div className="bg-bg-card border border-border-color rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-space font-bold text-text-primary">Rapport d'importation</h2>
          
          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className="p-4 rounded-lg bg-bg-primary/50 border border-border-color">
                <div className="flex items-center gap-3 mb-2">
                  {res.success === res.total && res.total > 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
                  ) : res.success > 0 ? (
                    <AlertCircle className="w-5 h-5 text-accent-ocre" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="font-semibold text-text-primary">{res.section}</h3>
                  <span className="text-sm text-text-muted ml-auto">
                    {res.success} / {res.total} importés
                  </span>
                </div>
                
                {res.errors.length > 0 && (
                  <div className="mt-3 text-sm text-red-400 space-y-1 bg-red-500/10 p-3 rounded">
                    {res.errors.map((err, j) => (
                      <div key={j} className="flex gap-2">
                        <span>→</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-border-color">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-2 bg-bg-primary border border-border-color rounded-lg hover:border-accent-cyan/50 hover:text-accent-cyan transition-colors text-text-primary font-medium"
            >
              Voir le site
            </a>
            <button 
              onClick={resetForm}
              className="px-6 py-2 bg-bg-primary border border-border-color rounded-lg hover:bg-bg-card transition-colors text-text-primary font-medium"
            >
              Importer un autre fichier
            </button>
            <button 
              onClick={() => navigate('/admin')}
              className="px-6 py-2 bg-accent-cyan text-bg-primary rounded-lg hover:bg-accent-cyan/90 transition-colors font-medium ml-auto"
            >
              Aller au Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dropzone */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? 'border-accent-ocre bg-accent-ocre/10' : 
                file ? 'border-accent-cyan bg-accent-cyan/10' : 
                'border-[#8B94A3]/30 hover:border-accent-cyan/50 bg-bg-card'}`}
          >
            <input {...getInputProps()} />
            <FileJson className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-accent-ocre' : file ? 'text-accent-cyan' : 'text-text-muted'}`} />
            
            {file ? (
              <div className="space-y-2">
                <p className="text-text-primary font-medium">{file.name}</p>
                <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-text-primary font-medium">Glissez-déposez votre fichier JSON ici</p>
                <p className="text-sm text-text-muted">ou cliquez pour sélectionner un fichier (Max: 5MB)</p>
              </div>
            )}
          </div>

          {parseError && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{parseError}</p>
            </div>
          )}

          {/* Configuration Import */}
          {hasData && !parseError && (
            <div className="bg-bg-card border border-border-color rounded-xl p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div>
                <h2 className="text-xl font-space font-semibold text-text-primary mb-4">Données détectées</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'profile', label: 'Profil', count: counts.profile },
                    { id: 'experiences', label: 'Expériences', count: counts.experiences },
                    { id: 'projects', label: 'Projets', count: counts.projects },
                    { id: 'skills', label: 'Compétences', count: counts.skills },
                    { id: 'certifications', label: 'Certifications', count: counts.certifications },
                    { id: 'testimonials', label: 'Témoignages', count: counts.testimonials }
                  ].map(section => (
                    <label 
                      key={section.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                        ${selectedSections.includes(section.id) ? 'border-accent-cyan bg-accent-cyan/5' : 'border-border-color hover:border-text-muted'}
                        ${section.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input 
                        type="checkbox"
                        className="w-5 h-5 rounded border-text-muted text-accent-cyan focus:ring-accent-cyan bg-bg-primary"
                        checked={selectedSections.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        disabled={section.count === 0}
                      />
                      <div className="ml-3 flex-1">
                        <span className="block text-text-primary font-medium">{section.label}</span>
                        <span className="block text-sm text-text-muted">{section.count} item{section.count > 1 ? 's' : ''} détecté{section.count > 1 ? 's' : ''}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-space font-semibold text-text-primary mb-4">Stratégie d'import</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="merge" 
                        checked={strategy === 'merge'}
                        onChange={() => setStrategy('merge')}
                        className="w-5 h-5 border-text-muted text-accent-cyan focus:ring-accent-cyan bg-bg-primary"
                      />
                    </div>
                    <div>
                      <span className="block text-text-primary font-medium">Fusionner (Recommandé)</span>
                      <span className="block text-sm text-text-muted">Ajoute les nouvelles données ou met à jour l'existant sans rien supprimer.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="replace" 
                        checked={strategy === 'replace'}
                        onChange={() => setStrategy('replace')}
                        className="w-5 h-5 border-text-muted text-accent-cyan focus:ring-accent-cyan bg-bg-primary"
                      />
                    </div>
                    <div>
                      <span className="block text-text-primary font-medium">Remplacer</span>
                      <span className="block text-sm text-text-muted">Supprime toutes les données existantes des sections sélectionnées avant d'importer.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-border-color">
                <button
                  onClick={handleImport}
                  disabled={isImporting || selectedSections.length === 0}
                  className="w-full py-4 bg-accent-ocre text-bg-primary font-bold rounded-lg hover:bg-accent-ocre/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin"></div>
                      Importation en cours...
                    </>
                  ) : (
                    <>
                      Lancer l'importation
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
