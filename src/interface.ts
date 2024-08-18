import { NextApiRequest } from "next";

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface Should {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH',
  req: NextApiRequest
}