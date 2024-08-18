import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  data?: Order;
}

type Order = {
  id: string;
  user_id: string;
  order_type: string;
  customer_id: string;
  payment_type: string;
  status: string;
  created_at: number;
  updated_at: number;
  items: OrderItem[];
}

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: number;
  updated_at: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'POST', req });
    await checkToken(req);
    await checkScope('orders', req);

    const { order_id } = req.query;

    if (order_id === '' || !order_id) {
      throw new Error("Order ID is required");
    }

    const order = await turso.execute({
      sql: `SELECT * FROM orders WHERE id = ? LIMIT 1`,
      args: [order_id as string],
    });

    const data: Order = {
      id: order.rows[0].id as string,
      user_id: order.rows[0].user_id as string,
      order_type: order.rows[0].order_type as string,
      customer_id: order.rows[0].customer_id as string,
      payment_type: order.rows[0].payment_type as string,
      status: order.rows[0].status as string,
      created_at: order.rows[0].created_at as number,
      updated_at: order.rows[0].updated_at as number,
      items: []
    }

    const order_items = await turso.execute({
      sql: `SELECT * FROM order_items WHERE order_id = ?`,
      args: [order_id as string],
    });

    data.items = order_items.rows.map((item) => {
      return {
        id: item.id as string,
        order_id: item.order_id as string,
        product_id: item.product_id as string,
        quantity: item.quantity as number,
        price: item.price as number,
        created_at: item.created_at as number,
        updated_at: item.updated_at as number,
      }
    })

    res.status(200).json({
      success: true,
      message: "Order request data Successful",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
