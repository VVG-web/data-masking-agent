const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir) {
    this.logDir = logDir;
    this.currentLogFile = null;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Create new log file for this session
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(this.logDir, `masking-log-${timestamp}.json`);
    
    // Initialize log file
    this.writeLog({
      session_start: new Date().toISOString(),
      entries: []
    });
  }
  
  writeLog(data) {
    try {
      fs.writeFileSync(this.currentLogFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }
  
  readLog() {
    try {
      if (fs.existsSync(this.currentLogFile)) {
        return JSON.parse(fs.readFileSync(this.currentLogFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading log:', error);
    }
    return { entries: [] };
  }
  
  logMaskingOperation(operation) {
    const log = this.readLog();
    
    const entry = {
      timestamp: new Date().toISOString(),
      ...operation
    };
    
    log.entries.push(entry);
    this.writeLog(log);
    
    // Also create a human-readable log
    this.writeHumanReadableLog(entry);
  }
  
  writeHumanReadableLog(entry) {
    const readableLogFile = this.currentLogFile.replace('.json', '.txt');
    
    let logText = `\n[${entry.timestamp}] ${entry.operation.toUpperCase()}\n`;
    logText += '='.repeat(80) + '\n';
    
    switch (entry.operation) {
      case 'mask_prompt':
        logText += `Original: ${entry.original}\n`;
        logText += `Masked: ${entry.masked}\n`;
        logText += `Forbidden Words: ${entry.forbiddenWords.join(', ')}\n`;
        logText += `Mappings:\n`;
        Object.entries(entry.mappings).forEach(([token, original]) => {
          logText += `  ${token} => ${original}\n`;
        });
        break;
        
      case 'llm_response':
        logText += `Provider: ${entry.provider}\n`;
        logText += `Model: ${entry.model}\n`;
        logText += `Response (masked): ${entry.masked}\n`;
        break;
        
      case 'unmask_response':
        logText += `Masked: ${entry.masked}\n`;
        logText += `Unmasked: ${entry.unmasked}\n`;
        logText += `Mappings:\n`;
        Object.entries(entry.mappings).forEach(([token, original]) => {
          logText += `  ${token} => ${original}\n`;
        });
        break;
    }
    
    try {
      fs.appendFileSync(readableLogFile, logText);
    } catch (error) {
      console.error('Error writing readable log:', error);
    }
  }
  
  logError(error) {
    this.logMaskingOperation({
      operation: 'error',
      ...error
    });
  }
  
  getLatestLogs(count = 10) {
    const log = this.readLog();
    return log.entries.slice(-count);
  }
}

module.exports = { Logger };
