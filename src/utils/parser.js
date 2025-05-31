export function extractMetaContent(doc, name) {
  const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.getAttribute('content') : null;
}

export function extractAllMeta(doc) {
  const metaTags = {};
  const metas = doc.querySelectorAll('meta');
  
  metas.forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property');
    const content = meta.getAttribute('content');
    if (name && content) {
      metaTags[name] = content;
    }
  });
  
  return metaTags;
}

export function extractHeadings(doc) {
  const headings = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  };
  
  for (let i = 1; i <= 6; i++) {
    const elements = doc.querySelectorAll(`h${i}`);
    headings[`h${i}`] = Array.from(elements).map(el => el.textContent.trim());
  }
  
  return headings;
}

export function extractImages(doc) {
  const images = doc.querySelectorAll('img');
  return Array.from(images).map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    title: img.getAttribute('title'),
    width: img.getAttribute('width'),
    height: img.getAttribute('height'),
  }));
}

export function extractLinks(doc, baseUrl) {
  const links = doc.querySelectorAll('a[href]');
  return Array.from(links).map(link => {
    const href = link.getAttribute('href');
    const isExternal = href.startsWith('http') && !href.includes(new URL(baseUrl).hostname);
    
    return {
      href,
      text: link.textContent.trim(),
      isExternal,
      title: link.getAttribute('title'),
      rel: link.getAttribute('rel'),
    };
  });
}

export function extractStructuredData(doc) {
  const structuredData = [];
  
  // JSON-LD
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      structuredData.push({ type: 'JSON-LD', data });
    } catch (e) {
      console.error('Failed to parse JSON-LD:', e);
    }
  });
  
  // Microdata
  const microdataElements = doc.querySelectorAll('[itemscope]');
  if (microdataElements.length > 0) {
    structuredData.push({ 
      type: 'Microdata', 
      count: microdataElements.length,
      types: Array.from(microdataElements).map(el => el.getAttribute('itemtype')).filter(Boolean)
    });
  }
  
  // RDFa
  const rdfaElements = doc.querySelectorAll('[typeof], [property], [resource]');
  if (rdfaElements.length > 0) {
    structuredData.push({ 
      type: 'RDFa', 
      count: rdfaElements.length 
    });
  }
  
  return structuredData;
}

export function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
