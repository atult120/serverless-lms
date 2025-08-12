import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username and password are required' }),
      };
    }

    console.log('COGNITO_CLIENT_ID', process.env.COGNITO_CLIENT_ID)
    const params: InitiateAuthCommandInput = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);

    if (!response.AuthenticationResult) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authentication failed' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        accessToken: response.AuthenticationResult.IdToken!,
      }),
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  }
};