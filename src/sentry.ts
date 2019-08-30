import config from './config';
import logger from './logger';
import * as Sentry from '@sentry/node';

const { dsn } = config.sentry;

export const isEnabled = () => !!dsn;

export function init() {
	if (isEnabled()) {
		logger.info(`Initializing Sentry for release ${config.sentry.release}`)
		Sentry.init({ dsn });
	} else {
		logger.info('Sentry is disabled: no DSN is provided.');
	}
}

export function capture(error: Error) {
	if (isEnabled()) {
		Sentry.captureException(error);
	}
}

export default { init, capture };
