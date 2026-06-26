import { useEffect, useRef } from 'react';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { SkillsSection } from '../components/SkillsSection';
import { ExperiencesSection } from '../components/ExperiencesSection';
import { CertificationsSection } from '../components/CertificationsSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { ContactSection } from '../components/ContactSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { setHomeMeta } from '../services/meta.service';
import { SEOHead } from '../components/SEOHead';
import { usePresentationMode } from '../hooks/usePresentationMode';
import { PresentationControls } from '../components/PresentationControls';

export function Home() {
  const { isActive } = usePresentationMode();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      document.body.classList.add('presentation-mode');
    } else {
      document.body.classList.remove('presentation-mode');
    }
    return () => { 
      document.body.classList.remove('presentation-mode');
    };
  }, [isActive]);

  const containerClasses = isActive 
    ? "h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar" 
    : "";
    
  const sectionClasses = isActive 
    ? "h-screen w-full snap-start overflow-hidden flex flex-col justify-center" 
    : "";

  return (
    <div ref={containerRef} className={containerClasses}>
      <SEOHead meta={setHomeMeta()} />
      <div id="hero" className={sectionClasses}><HeroSection /></div>
      <div id="about" className={sectionClasses}><AboutSection /></div>
      <div id="skills" className={sectionClasses}><SkillsSection /></div>
      <div id="experiences" className={sectionClasses}><ExperiencesSection /></div>
      <div id="testimonials" className={sectionClasses}><TestimonialsSection /></div>
      <div id="certifications" className={sectionClasses}><CertificationsSection /></div>
      <div id="projects" className={sectionClasses}><ProjectsSection /></div>
      <div id="contact" className={sectionClasses}><ContactSection /></div>
      <PresentationControls />
    </div>
  );
}
