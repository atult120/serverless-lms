module.exports = {
  local: {
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASS: process.env.DB_PASS || '',
    DB_NAME: process.env.DB_NAME || 'lms',
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'local-pool-id',
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || 'local-client-id',
    AUTH_MODE: process.env.AUTH_MODE || 'local',
  },
  dev: {
    DB_HOST: "${ssm:/lms/dev/db_host}",
    DB_USER: "${ssm:/lms/dev/db_user}",
    DB_PASS: "${ssm:/lms/dev/db_pass}",
    DB_NAME: "${ssm:/lms/dev/db_name}",
    COGNITO_USER_POOL_ID: "${ssm:/lms/dev/cognito_user_pool_id}",
    COGNITO_CLIENT_ID: "${ssm:/lms/dev/cognito_client_id}",
    AUTH_MODE: "${ssm:/lms/dev/auth_mode}",
  },
};