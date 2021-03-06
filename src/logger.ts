import winston from 'winston';
import config from './config';

const loggerConfig: winston.LoggerOptions = config.logging;

const logger = winston.createLogger(loggerConfig);

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
    );
}

export default logger;
