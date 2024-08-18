import { ApiResponse } from "@/interface";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
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

    const { password, confirm_password, user_id } = req.body;
    if (!user_id) {
      throw new Error("User Id is required");
    }

    if (password && confirm_password && password !== confirm_password) {
      throw new Error("Passwords do not match");
    }

    // get user data
    const user = await turso.execute({
      sql: 'select password from users where id = $id LIMIT 1',
      args: { id: user_id }
    });

    if (password && bcrypt.compareSync(password, user.rows[0].password as string)) {
      throw new Error("New password cannot be the same as the old password");
    }

    const salt = bcrypt.genSaltSync(12);

    const payload = bcrypt.hashSync(password, salt)

    // update
    turso.execute({
      sql: `update users set password = $password where id = $id`,
      args: { password: payload, id: user_id }
    })

    res.status(200).json({
      success: true,
      message: "Users password update Successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
