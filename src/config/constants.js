// src/config/constants.js
export const NEWS_CATEGORIES = [
   // 'Mercados',
    'Tecnología', 
    'Economía',
    'Política',
    'Empresas'
  ]
  
  export const STORAGE_KEYS = {
    RECENTLY_VIEWED: 'recentlyViewed',
    NEWS_HISTORY: 'newsHistory'
  }
  
  export const API_ENDPOINTS = {
    NEWS: {
      TOP_HEADLINES: '/top-headlines',
      EVERYTHING: '/everything',
      SOURCES: '/sources'
    },
    ALPHA_VANTAGE: {
      QUOTE: 'GLOBAL_QUOTE',
      OVERVIEW: 'OVERVIEW',
      NEWS_SENTIMENT: 'NEWS_SENTIMENT'
    }
  }