import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  token?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'DELETE', req });
    await checkToken(req);
    await checkScope('user-roles', req);

    const { role_id } = req.body;
    if (!role_id) {
      throw new Error("Role Id is required");
    }

    await turso.execute({
      sql: 'delete from roles where id = $role_id', args: { role_id }
    });

    res.status(200).json({
      success: true,
      message: "Users role deletion Successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
