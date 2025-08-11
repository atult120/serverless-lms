export const getUserFromEvent = async (event: any) => {
const isLocal = process.env.AUTH_MODE === 'local';
  if (isLocal) {
    return {
      cognitoSub: 'local-sub-id',
      id: 1, // your local DB user ID
      email: 'local.user@example.com',
      name: 'Local User',
      role: 'admin' // change to 'student' or 'instructor' for testing
    };
  }
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims) return null;
  const role = (claims['cognito:groups'] || '').split(',')[0] || 'student';
  // If you store sub mapping in DB, you can upsert user on first login:
  return {
    cognitoSub: claims.sub,
    id: undefined, // optionally look up in users table to get internal id
    email: claims.email,
    name: claims.name || claims.email,
    role
  }
};
