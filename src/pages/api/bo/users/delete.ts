import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";
import { decodeJwt } from "jose";
import { checkScope } from "@/lib/checkScope";

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
    await checkScope('users', req);

    const decode = decodeJwt(req.headers.authorization as string);

    const { user_id } = req.body;
    if (!user_id) {
      throw new Error("User Id is required");
    }

    if (decode.id === user_id) {
      throw new Error("You can't delete yourself");
    }

    // check user status is disabled or not -> perma delete
    const checkUser = await turso.execute({
      sql: 'select * from users where id = $id LIMIT 1',
      args: { id: user_id }
    });

    if (checkUser.rows.length === 0) {
      throw new Error("User not found");
    }

    let perma = false;

    if (checkUser.rows[0].status === 'turnoff') {
      await turso.execute({
        sql: 'delete from users where id = $id',
        args: { id: user_id }
      });

      perma = true;
    } else {
      await turso.execute({
        sql: 'update users set status = "turnoff" where id = $id',
        args: { id: user_id }
      });
    }

    res.status(200).json({
      success: true,
      message: perma ? "Users permanent delete is Successful" : "Users deletion Successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
