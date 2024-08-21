import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { v7 as uuidv7 } from 'uuid';
import { checkScope } from "@/lib/checkScope";

interface Response extends ApiResponse {
  token?: string;
  reference?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'POST', req });
    await checkToken(req);
    await checkScope('users', req);

    const { email, password, confirm_password, name, role_id, status } = req.body;
    if (!email || !password || !confirm_password || !name || !role_id) {
      throw new Error("All fields are required");
    }

    if (password !== confirm_password) {
      throw new Error("Passwords do not match");
    }

    // check if (email) already exists
    const checkEmail = turso.execute({
      sql: 'select count(*) as emailCount from users where email = $email',
      args: { email }
    });

    if ((await checkEmail).rows[0].emailCount as number > 0) {
      throw new Error("Email already exists");
    }

    const salt = bcrypt.genSaltSync(12);
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    // create here
    const payload = {
      email,
      password: bcrypt.hashSync(password, salt),
      name,
      role_id,
      status,
      id: uuidv7()
    }

    // submit here
    turso.execute({
      sql: 'insert into users (id, email, password, name, role_id, status) values ($id, $email, $password, $name, $role_id, $status)',
      args: { ...payload }
    })

    res.status(200).json({
      success: true,
      message: "Users creation Successful",
      reference: payload.id,
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