import { Project } from '../types';

export const setHomeMeta = () => ({
  title: "Assami Baga — Full Stack & AI Engineer",
  description: "Portfolio d'Assami Baga, ingénieur Full Stack & IA basé en Île-de-France. Disponible pour CDI.",
  image: "[URL_SUPABASE_OG_IMAGE]",
  url: "https://assami.dev"
});

export const setProjectMeta = (project: Project) => ({
  title: `${project.title} — Assami Baga`,
  description: project.description || "Portfolio d'Assami Baga",
  image: project.cover_image || "[URL_SUPABASE_OG_IMAGE]",
  url: `https://assami.dev/projects/${project.slug}`
});
