import { Amplify } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
const identityPoolId = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID;
const bucket = process.env.NEXT_PUBLIC_S3_BUCKET;
const region = process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1";

if (!userPoolId || !userPoolClientId) {
  throw new Error("Missing Cognito configuration.");
}

const cognito = identityPoolId
  ? { userPoolId, userPoolClientId, identityPoolId }
  : { userPoolId, userPoolClientId };

Amplify.configure({
  Auth: { Cognito: cognito },
  ...(bucket ? { Storage: { S3: { bucket, region } } } : {}),
});