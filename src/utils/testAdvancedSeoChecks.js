const { analyzeDuplicateTitles, analyzeDuplicateMetaDescriptions, analyzeNoindexPages } = require('./advancedSeoChecks.js');
const { JSDOM } = require('jsdom');

const samplePages = [
  { url: 'https://example.com/page1', title: 'Title A', metaDescription: 'Desc A' },
  { url: 'https://example.com/page2', title: 'Title A', metaDescription: 'Desc B' },
  { url: 'https://example.com/page3', title: 'Title C', metaDescription: 'Desc A' }
];

const dom = new JSDOM('<html><head><meta name="robots" content="noindex"></head><body></body></html>');

console.log('Duplicate Titles:', analyzeDuplicateTitles(samplePages));
console.log('Duplicate Meta Descriptions:', analyzeDuplicateMetaDescriptions(samplePages));
console.log('Noindex Pages:', analyzeNoindexPages(dom.window.document));
