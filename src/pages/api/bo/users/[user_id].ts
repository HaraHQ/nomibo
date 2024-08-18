import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";
import { Status } from "./list";
import { checkScope } from "@/lib/checkScope";

interface Response extends ApiResponse {
  user?: {
    id: string;
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    role_scopes: string[] | [];
    status: Status;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('users', req);

    const { user_id } = req.query;

    const user = await turso.execute({
      sql: 'select id, name, email, role_id, status from users where id = $id LIMIT 1',
      args: { id: user_id as string }
    })

    if (user.rows.length === 0) {
      throw new Error("User not found")
    }

    const roles = (await turso.execute({
      sql: `SELECT id, title, scopes FROM roles WHERE id = $role_id`,
      args: { role_id: user.rows[0].role_id as string }
    })).rows;

    res.status(200).json({
      success: true,
      message: "User request data Successful",
      user: {
        email: user.rows[0].email as string,
        id: user.rows[0].id as string,
        name: user.rows[0].name as string,
        role_id: user.rows[0].role_id as string,
        role_name: roles[0].title as string,
        role_scopes: JSON.parse(roles[0].scopes as string) as string[] || [],
        status: user.rows[0].status as Status
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
