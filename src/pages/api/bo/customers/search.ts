import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  data?: Customer;
}

type Customer = {
  id: string;
  name: string;
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('orders', req);

    const { email } = req.query;

    if (email === '' || !email) {
      throw new Error("Email is required");
    }

    const customer = await turso.execute(`SELECT id, name, email FROM customers WHERE email LIKE '%${email}%' LIMIT 1`);

    if (customer.rows.length === 0) {
      throw new Error("Customer not found");
    }

    const data: Customer = {
      id: customer.rows[0].id as string,
      name: customer.rows[0].name as string,
      email: customer.rows[0].email as string,
    }

    res.status(200).json({
      success: true,
      message: "Customer email request Successful",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
