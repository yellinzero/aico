export const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AICO',
  url: 'https://the-aico.com',
  logo: 'https://the-aico.com/logo.png',
  description: 'AI Employee Framework - Build AI teams in seconds',
  sameAs: ['https://github.com/yellinzero/aico'],
};

export const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AICO',
  url: 'https://the-aico.com',
  description:
    'AI Employee Framework - Build AI teams in seconds, start working immediately',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://the-aico.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const jsonLdSoftwareApplication = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'aico',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'AI Employee Framework - Manage AI collaborators like managing employees',
};
