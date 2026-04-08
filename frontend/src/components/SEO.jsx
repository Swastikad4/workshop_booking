import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, canonical, ogType, ogImage }) => {
  const siteName = 'FOSSEE Workshops';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'FOSSEE Workshops - Book and manage technical workshops by FOSSEE group, IIT Bombay. Hands-on learning with professional certification.';
  const defaultKeywords = 'FOSSEE, Workshops, IIT Bombay, Engineering, Technical Training, Python, Scilab, Open Source';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType || 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:site_name" content={siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Accessibility & Mobile */}
      <meta name="theme-color" content="#d2f932" />
    </Helmet>
  );
};

export default SEO;
