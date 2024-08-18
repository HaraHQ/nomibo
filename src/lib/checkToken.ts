import { NextApiRequest } from "next";
import { jwtVerify, JWTPayload } from 'jose';

export async function checkToken(req: NextApiRequest) {
  try {
    const token = req.headers.authorization?.split(" ")[1] as string;
    if (!token) {
      throw new Error("No token provided");
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
  
    const { payload } = await jwtVerify(token, secretKey);

    return payload  as JWTPayload;
  
  } catch (error) {
    throw new Error("Invalid token");
  }
}