// Simple request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);
    
    // Log response time
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${timestamp} - ${method} ${url} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};

// Error logger
const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} - ERROR: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    next(err);
};

// Success response helper
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

// Error response helper
const errorResponse = (res, message, statusCode = 500, errorCode = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        errorCode,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    requestLogger,
    errorLogger,
    successResponse,
    errorResponse
};