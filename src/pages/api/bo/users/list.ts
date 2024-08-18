import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

export type Status = 'active' | 'turnoff';

interface Response extends ApiResponse {
  data?: {
    id: string;
    email: string;
    name: string;
    role_id: string;
    role_name: string;
    status: Status
  }[] | []
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('users', req);

    // extra is: search by keyword, filter [field] asc desc, filter by role_id
    // collect role first
    const roles = await turso.execute('SELECT id, title FROM roles');
    // prepare extras
    let extras = '';
    if (req.query.keyword) {
      extras += ` AND name LIKE '%${req.query.keyword}%' OR email LIKE '%${req.query.keyword}%'`;
    }
    if (req.query.role_id) {
      extras += ` AND role_id = ${req.query.role_id}`;
    }
    if (req.query.status) {
      extras += ` AND status = '${req.query.status}'`;
    }
    // get users
    const users = (await turso.execute(`SELECT id, email, name, status, role_id FROM users WHERE 1=1${extras}`)).rows;

    if (users.length < 1) {
      return res.status(404).json({
        success: true,
        message: "Users request list Successful",
        data: []
      });
    }

    const data = users.map((user) => {
      const role = roles.rows.find((role) => role.id === user.role_id);
      return {
        id: user.id as string,
        email: user.email as string,
        name: user.name as string,
        role_id: user.role_id as string,
        role_name: role?.title as string || '',
        status: user.status as Status
      };
    });

    res.status(200).json({
      success: true,
      message: "Users request list Successful",
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
