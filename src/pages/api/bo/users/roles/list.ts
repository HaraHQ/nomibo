import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Role {
  id: string;
  title: string;
  scopes: string | string[];
}

interface Response extends ApiResponse {
  data?: Role[] | []
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('user-roles', req);

    // prepare extras
    let extras = '';
    if (req.query.keyword) {
      extras += ` AND title LIKE '%${req.query.keyword}%'`;
    }
    // get roles
    const roles = (await turso.execute(`SELECT id, title, scopes FROM roles WHERE 1=1${extras}`)).rows;

    if (roles.length < 1) {
      return res.status(404).json({
        success: true,
        message: "Roles request list Successful",
        data: []
      });
    }

    const data = roles.map((role) => {
      return {
        id: role.id as string,
        title: role.title as string,
        scopes: JSON.parse(role.scopes as string) as string[],
      };
    });

    res.status(200).json({
      success: true,
      message: "Roles request list Successful",
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
