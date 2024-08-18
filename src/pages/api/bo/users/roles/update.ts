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
    should({ method: 'PUT', req });
    await checkToken(req);
    await checkScope('user-roles', req);

    const { title, description, scopes, role_id } = req.body;
    if (!title) {
      throw new Error("Title is required");
    }
    if (!description) {
      throw new Error("Description is required");
    }
    if (!scopes) {
      throw new Error("Scopes is required");
    }
    if (!role_id) {
      throw new Error("Role ID is required");
    }

    const payload = {
      title,
      description, 
      scopes: JSON.stringify(scopes),
      id: role_id
    }

    // submit here
    turso.execute({
      sql: 'update roles set title = $title, description = $description, scopes = $scopes where id = $id',
      args: { ...payload }
    })

    res.status(200).json({
      success: true,
      message: "User role update Successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
