import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  data?: Order[] | [];
}

type Order = {
  id: string;
  order_code: string;
  order_type: string;
  payment_type: string;
  status: string;
  created_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('orders', req);

    let pageOffset = 0; // (page x 10) - 1 || 0
    let extras = '';
    
    if (req.query.page) {
      const page = parseInt(req.query.page as string);
      if (page > 1) {
        pageOffset = ((page - 1) * 10);
      } else {
        pageOffset = 0;
      }
    }

    if (req.query.order_code) {
      extras += ` AND order_code LIKE '%${req.query.keyword}%'`;
    }
    if (req.query.order_type) {
      extras += ` AND order_type = '${req.query.keyword}'`;
    }
    if (req.query.payment_type) {
      extras += ` AND payment_type = '${req.query.keyword}'`;
    }
    if (req.query.status) {
      extras += ` AND status = '${req.query.status}'`;
    }

    const orders = await turso.execute(`SELECT * FROM orders WHERE 1=1${extras} LIMIT 10 OFFSET ${pageOffset}`)

    const data = orders.rows.map((order) => {
      return {
        id: order.id as string,
        order_code: order.order_code as string,
        order_type: order.order_type as string,
        payment_type: order.payment_type as string,
        status: order.status as string,
        created_at: order.created_at as string,
      }
    })

    res.status(200).json({
      success: true,
      message: "Order request list Successful",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
