const AMQP_TEST_URL = process.env.CI ? process.env.RABBITMQ_URL : 'amqp://devuser:devuser@localhost:5672';

export const AMQP_TEST_URLS = [AMQP_TEST_URL];
