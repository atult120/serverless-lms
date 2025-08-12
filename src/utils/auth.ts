import { AppDataSource } from "../database/database";
import { User } from "../entities/User";

export const getUserFromEvent = async (event: any) => {
   await AppDataSource.initialize();

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
    const cognitoSub = claims.sub;
    const email = claims.email;
    const name = claims.name || claims.email;

    const userRepo = AppDataSource.getRepository(User);

    // Try find user by cognitoSub
    let user = await userRepo.findOneBy({ cognitoSub });

    if (!user) {
      // Insert new user if not found
      user = userRepo.create({
        cognitoSub,
        email,
        name,
        role,
        isActive: true,
      });
      user = await userRepo.save(user);
    }
    
    return {
      cognitoSub: user.cognitoSub,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
};
