-- Run this script in your Supabase SQL Editor to create the necessary tables

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  location TEXT NOT NULL,
  photo_url TEXT,
  cv_url TEXT
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('pro', 'education')),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT NOT NULL,
  stack TEXT[] DEFAULT '{}',
  location TEXT
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  stack TEXT[] DEFAULT '{}',
  context TEXT NOT NULL,
  technical_choices JSONB DEFAULT '[]',
  challenges TEXT[] DEFAULT '{}',
  results JSONB DEFAULT '[]',
  github_url TEXT,
  live_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('production', 'beta', 'archived')),
  architecture TEXT
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT NOT NULL,
  verify_url TEXT
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Insert sample data (optional)
INSERT INTO profiles (name, title, bio, location) VALUES (
  'Ingénieur Full-Stack', 
  'Ingénieur Full-Stack', 
  'Ingénieur logiciel full-stack expérimenté, je me spécialise dans la conception et le développement d''architectures web robustes et scalables. Fort d''une expertise solide en intégration de modèles d''intelligence artificielle, j''accompagne les entreprises dans la transformation de leurs systèmes d''information en solutions intelligentes et performantes.',
  'Île-de-France, France'
);

-- Note: Configure Row Level Security (RLS) policies in Supabase to secure your data.
-- Typically, you might want these tables to be publicly readable, but only writable by authenticated admin users.
