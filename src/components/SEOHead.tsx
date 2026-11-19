import { Helmet } from 'react-helmet-async'
import { useTranslation } from '../hooks/useTranslation'

interface SEOMeta {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article'
  structuredData?: object
}

const DEFAULT_IMAGE = 'https://assamibaga.com/og-image.png'
const SITE_NAME = 'Assami Baga — Portfolio'
const ORIGIN = 'https://assamibaga.com'

export const SEOHead = ({ meta }: { meta: SEOMeta }) => {
  const { lang } = useTranslation()
  // meta.url is the French URL; the English page lives under /en
  const path = new URL(meta.url).pathname.replace(/\/$/, '')
  const frUrl = ORIGIN + path
  const enUrl = `${ORIGIN}/en${path || '/'}`
  const url = lang === 'en' ? enUrl : frUrl
  const fullTitle = meta.title.includes('Assami Baga')
    ? meta.title
    : `${meta.title} | Assami Baga`

  return (
    <Helmet>
      {/* Titre */}
      <title>{fullTitle}</title>
      <meta name="description"
        content={meta.description} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="fr" href={frUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={frUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description"
        content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'fr_FR'} />
      <meta property="og:image"
        content={meta.image || DEFAULT_IMAGE} />
      <meta property="og:type"
        content={meta.type || 'website'} />
      <meta property="og:site_name"
        content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description"
        content={meta.description} />
      <meta name="twitter:image"
        content={meta.image || DEFAULT_IMAGE} />

      {/* Données structurées par page */}
      {meta.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(meta.structuredData)}
        </script>
      )}
    </Helmet>
  )
}
