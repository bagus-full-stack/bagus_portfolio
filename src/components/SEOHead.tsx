import { Helmet } from 'react-helmet-async';

export interface MetaData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const SEOHead = ({ meta }: { meta: MetaData }) => (
  <Helmet>
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:image" content={meta.image} />
    <meta property="og:url" content={meta.url} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={meta.title} />
    <meta name="twitter:image" content={meta.image} />
  </Helmet>
);
