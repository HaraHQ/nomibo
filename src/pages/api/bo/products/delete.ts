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
    should({ method: 'DELETE', req });
    await checkToken(req);
    await checkScope('products', req);

    const { product_id } = req.body;
    if (!product_id) {
      throw new Error("Product Id is required");
    }

    // check product status is inactive or not -> perma delete
    const product = await turso.execute({
      sql: "SELECT status FROM products WHERE id = ? LIMIT 1",
      args: [product_id],
    })

    if (product.rows[0].status === 'active') {
      throw new Error('Product is active, cannot delete')
    }

    await turso.execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [product_id],
    });

    res.status(200).json({
      success: true,
      message: "Product deletion Successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
