import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import type { NextApiRequest, NextApiResponse } from "next";
import turso from "@/lib/turso";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

interface Response extends ApiResponse {
  token?: string;
}

type Payload = {
  id: string;
  email: string;
  role_id: string;
  scopes: string[];
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     responses:
 *       200:
 *         success: true
 *         message: string
 *         token: string
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'POST', req });

    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // check user
    const user = await turso.execute({
      sql: "SELECT * FROM users WHERE email = $email LIMIT 1",
      args: {
        email
      },
    });

    if (user.rows.length === 0) {
      throw new Error("User not found");
    }

    if (!bcrypt.compareSync(password, user.rows[0].password as string)) {
      throw new Error("Invalid password");
    }

    if (user.rows[0].status === 'turnoff') {
      throw new Error("User is not active");
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    const payload: Payload = {
      id: user.rows[0].id as string,
      email: user.rows[0].email as string,
      role_id: user.rows[0].role_id as string,
      scopes: []
    }

    const roles = await turso.execute({
      sql: 'SELECT id, title, scopes FROM roles WHERE id = $id LIMIT 1',
      args: {
        id: user.rows[0].role_id
      }
    });

    payload.scopes = roles.rows[0].scopes as unknown as string[];

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token: await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime('1h')
        .sign(secretKey)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
