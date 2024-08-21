import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  data?: Product[];
}

type Product = {
  id: string;
  title: string;
  price: number;
  discount_type: string;
  discount_rate: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('orders', req);

    const { name } = req.query;

    if (name === '' || !name) {
      throw new Error("Product name is required");
    }

    const products = await turso.execute(`SELECT id, title, price, discount_type, discount_rate FROM products WHERE title LIKE '%${name}%' LIMIT 5`);

    if (products.rows.length === 0) {
      throw new Error("Product not found");
    }

    const data: Product[] = []
    products.rows.forEach((product) => {
      data.push({
        id: product.id as string,
        title: product.title as string,
        price: product.price as number,
        discount_type: product.discount_type as string,
        discount_rate: product.discount_rate as number,
      })
    })

    res.status(200).json({
      success: true,
      message: "Product(s) for order request Successful",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
