import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";
import { v7 as uuidv7 } from 'uuid';

interface Response extends ApiResponse {
  reference?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'POST', req });
    await checkToken(req);
    await checkScope('user-roles', req);

    const { title, description, scopes } = req.body;
    if (!title) {
      throw new Error("Title is required");
    }
    if (!description) {
      throw new Error("Description is required");
    }
    if (!scopes) {
      throw new Error("Scopes is required");
    }

    // check first for prevent duplicate title
    const checkTitle = await turso.execute({
      sql: 'select title from roles where title = $title',
      args: { title }
    });

    if (checkTitle.rows.length > 0) {
      throw new Error("Title already exists");
    }

    // create here
    const payload = {
      title,
      description, 
      scopes: JSON.stringify(scopes),
      id: uuidv7()
    }

    // submit here
    turso.execute({
      sql: 'insert into roles (id, title, description, scopes) values ($id, $title, $description, $scopes)',
      args: { ...payload }
    })

    res.status(200).json({
      success: true,
      message: "Users role creation Successful",
      reference: payload.id
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
