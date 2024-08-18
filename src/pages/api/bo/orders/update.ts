import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  reference?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'PUT', req });
    await checkToken(req);
    await checkScope('orders', req);

    const { order_id, status } = req.body;
    if (order_id === '' || !order_id) {
      throw new Error("Order ID is required");
    }
    if (status === '' || !status) {
      throw new Error("Status is required");
    }

    await turso.execute({
      sql: "UPDATE orders SET status = ? WHERE id = ?",
      args: [status, order_id],
    })

    res.status(200).json({
      success: true,
      message: "Order status update Successful",
      reference: order_id
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
