import fs from 'fs'
import path from 'path'

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

export interface LogLevel {
  ERROR: 'ERROR'
  WARN: 'WARN'
  INFO: 'INFO'
  DEBUG: 'DEBUG'
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
}

interface LogEntry {
  timestamp: string
  level: keyof LogLevel
  message: string
  data?: any
  stack?: string
}

class Logger {
  private logFile: string
  private authLogFile: string

  constructor() {
    const today = new Date().toISOString().split('T')[0]
    this.logFile = path.join(logsDir, `app-${today}.log`)
    this.authLogFile = path.join(logsDir, `auth-${today}.log`)
  }

  private writeToFile(filename: string, entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n'
    
    try {
      fs.appendFileSync(filename, logLine)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private createLogEntry(level: keyof LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : data) : undefined,
      stack: error?.stack
    }
  }

  error(message: string, data?: any, error?: Error) {
    const entry = this.createLogEntry('ERROR', message, data, error)
    this.writeToFile(this.logFile, entry)
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, data || '', error || '')
    }
  }

  warn(message: string, data?: any) {
    const entry = this.createLogEntry('WARN', message, data)
    this.writeToFile(this.logFile, entry)
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data || '')
    }
  }

  info(message: string, data?: any) {
    const entry = this.createLogEntry('INFO', message, data)
    this.writeToFile(this.logFile, entry)
    
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data || '')
    }
  }

  debug(message: string, data?: any) {
    const entry = this.createLogEntry('DEBUG', message, data)
    this.writeToFile(this.logFile, entry)
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  }

  // Specific method for authentication logging
  auth(level: keyof LogLevel, message: string, data?: any, error?: Error) {
    const entry = this.createLogEntry(level, message, data, error)
    this.writeToFile(this.authLogFile, entry)
    this.writeToFile(this.logFile, entry)
    
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level.toLowerCase() as 'error' | 'warn' | 'info' | 'debug'
      console[logMethod](`[AUTH-${level}] ${message}`, data || '', error || '')
    }
  }
}

export const logger = new Logger()

// Helper function to get recent logs
export function getRecentLogs(filename: 'app' | 'auth' = 'app', lines: number = 50): LogEntry[] {
  const today = new Date().toISOString().split('T')[0]
  const logFile = path.join(logsDir, `${filename}-${today}.log`)
  
  try {
    if (!fs.existsSync(logFile)) {
      return []
    }
    
    const content = fs.readFileSync(logFile, 'utf-8')
    const logLines = content.trim().split('\n').filter(line => line.length > 0)
    const recentLines = logLines.slice(-lines)
    
    return recentLines.map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return {
          timestamp: new Date().toISOString(),
          level: 'ERROR' as keyof LogLevel,
          message: 'Failed to parse log entry',
          data: line
        }
      }
    })
  } catch (error) {
    return [{
      timestamp: new Date().toISOString(),
      level: 'ERROR' as keyof LogLevel,
      message: 'Failed to read log file',
      data: error instanceof Error ? error.message : 'Unknown error'
    }]
  }
}