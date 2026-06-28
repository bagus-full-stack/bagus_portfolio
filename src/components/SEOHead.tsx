import { Helmet } from 'react-helmet-async'

interface SEOMeta {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article'
  structuredData?: object
}

const DEFAULT_IMAGE = 'https://assami.dev/og-image.png'
const SITE_NAME = 'Assami Baga — Portfolio'

export const SEOHead = ({ meta }: { meta: SEOMeta }) => {
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
      <link rel="canonical" href={meta.url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description"
        content={meta.description} />
      <meta property="og:url" content={meta.url} />
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
