import { NextApiRequest } from "next";
import { jwtVerify, JWTPayload } from 'jose';

export async function checkScope(scope: string, req: NextApiRequest) {
  try {
    const token = req.headers.authorization?.split(" ")[1] as string;
    if (!token) {
      throw new Error("No token provided");
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
  
    const { payload } = await jwtVerify(token, secretKey);

    if (!((payload as JWTPayload).scopes as string[]).includes(scope)) {
      throw new Error("Invalid scope");
    }

    return true;
  
  } catch (error) {
    throw new Error(`Invalid Scope, require: ${scope}`);
  }
}