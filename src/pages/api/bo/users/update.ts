import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import type { NextApiRequest, NextApiResponse } from "next";
import turso from "@/lib/turso";
import { checkScope } from "@/lib/checkScope";

interface Response extends ApiResponse {
  token?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'PUT', req });
    await checkToken(req);
    await checkScope('users', req);

    const { name, role_id, user_id, status } = req.body;
    if (!user_id) {
      throw new Error("User Id is required");
    }

    if (status && !['active', 'turnoff'].includes(status)) {
      throw new Error("Invalid status value");
    }

    const payload = {
      status: ['active', 'turnoff'].includes(status) ? status : 'turnoff',
      name,
      role_id
    }

    // update
    turso.execute({
      sql: `update users set name = $name, role_id = $role_id, status = $status where id = $id`,
      args: { ...payload, id: user_id }
    })

    res.status(200).json({
      success: true,
      message: "Users update Successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
