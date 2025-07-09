class TokenMasker {
    constructor() {
      this.tokenMap = new Map();
      this.counter = 0;
      
      // Patterns for automatic detection
      this.patterns = {
        creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        phone: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        // Pattern for person names (both Latin and Cyrillic)
        personName: /\b([A-Z][a-z]+\s+[A-Z][a-z]+|[А-Я][а-я]+\s+[А-Я][а-я]+)\b/g
      };
    }
    
    mask(text, forbiddenWords = []) {
      if (!text) return text;
      
      let maskedText = text;
      this.tokenMap.clear();
      this.counter = 0;
      
      // First, mask forbidden words
      forbiddenWords.forEach(word => {
        if (!word.trim()) return;
        
        const regex = new RegExp(`\\b${this.escapeRegex(word.trim())}\\b`, 'gi');
        maskedText = maskedText.replace(regex, (match) => {
          const token = `__FORBIDDEN_${this.counter++}__`;
          this.tokenMap.set(token, match);
          console.log(`Masked forbidden word: "${match}" -> "${token}"`);
          return token;
        });
      });
      
      // Then, mask patterns (credit cards, phones, emails, names)
      Object.entries(this.patterns).forEach(([type, pattern]) => {
        maskedText = maskedText.replace(pattern, (match) => {
          // Check if already masked as forbidden word
          if (match.includes('__FORBIDDEN_')) return match;
          
          const token = `__${type.toUpperCase()}_${this.counter++}__`;
          this.tokenMap.set(token, match);
          console.log(`Masked ${type}: "${match}" -> "${token}"`);
          return token;
        });
      });
      
      return maskedText;
    }
    
    unmask(text) {
      if (!text) return text;
      
      let unmaskedText = text;
      
      // Sort tokens by length (descending) to avoid partial replacements
      const sortedTokens = Array.from(this.tokenMap.entries())
        .sort((a, b) => b[0].length - a[0].length);
      
      sortedTokens.forEach(([token, original]) => {
        const regex = new RegExp(this.escapeRegex(token), 'g');
        unmaskedText = unmaskedText.replace(regex, original);
        console.log(`Unmasked: "${token}" -> "${original}"`);
      });
      
      return unmaskedText;
    }
    
    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    getMappings() {
      return Object.fromEntries(this.tokenMap);
    }
    
    getStats() {
      const stats = {
        total: this.tokenMap.size,
        byType: {
          forbidden: 0,
          creditCard: 0,
          phone: 0,
          email: 0,
          personName: 0
        }
      };
      
      this.tokenMap.forEach((value, token) => {
        if (token.includes('FORBIDDEN')) stats.byType.forbidden++;
        else if (token.includes('CREDITCARD')) stats.byType.creditCard++;
        else if (token.includes('PHONE')) stats.byType.phone++;
        else if (token.includes('EMAIL')) stats.byType.email++;
        else if (token.includes('PERSONNAME')) stats.byType.personName++;
      });
      
      return stats;
    }
  }
  
  module.exports = { TokenMasker };
  