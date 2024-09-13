import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  BASE_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  // Postgres configuration
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB_NAME: Joi.string().required(),
  POSTGRES_SYNCHRONIZE: Joi.boolean().required(),
  POSTGRES_AUTOLOADENTITIES: Joi.boolean().required(),
  // JWT configuration
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_MS: Joi.number().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_MS: Joi.number().required(),
});
