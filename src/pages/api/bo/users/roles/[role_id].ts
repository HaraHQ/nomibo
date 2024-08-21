import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";
import { checkScope } from "@/lib/checkScope";

interface Response extends ApiResponse {
  role?: {
    id: string;
    title: string;
    description: string;
    scopes: any;
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

    const { role_id } = req.query;

    const roles = (await turso.execute({
      sql: `SELECT id, title, description, scopes FROM roles WHERE id = $role_id LIMIT 1`,
      args: { role_id: role_id as string }
    })).rows;

    res.status(200).json({
      success: true,
      message: "Role request data Successful",
      role: {
        id: roles[0].id as string,
        title: roles[0].title as string,
        description: roles[0].description as string,
        scopes: JSON.parse(roles[0].scopes as string) as string[],
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
