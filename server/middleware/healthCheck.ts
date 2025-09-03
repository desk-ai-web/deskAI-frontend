import { Request, Response } from 'express';
import { db } from '../db';
import logger from '../logger';

export const healthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    await db.execute('SELECT 1');
    const dbStatus = 'healthy';
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memoryStatus = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    };
    
    // Check uptime
    const uptime = process.uptime();
    
    // Check environment
    const environment = process.env.NODE_ENV || 'development';
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      environment,
      services: {
        database: dbStatus,
        memory: memoryStatus,
      },
      responseTime: `${Date.now() - startTime}ms`,
    };
    
    res.status(200).json(response);
    
    // Log health check
    logger.info('Health check passed', response);
    
  } catch (error) {
    const response = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - startTime}ms`,
    };
    
    res.status(503).json(response);
    
    // Log health check failure
    logger.error('Health check failed', response);
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Check if the application is ready to receive traffic
    await db.execute('SELECT 1');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed',
    });
  }
};
