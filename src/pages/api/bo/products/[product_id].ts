import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";
import { Product } from "./list";

interface Response extends ApiResponse {
  data?: Product;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('products', req);

    const { product_id } = req.query;

    if (!product_id) {
      throw new Error("Product Id is required");
    }

    const product = (await turso.execute({
      sql: 'select * from products where id = $product_id LIMIT 1',
      args: { product_id: product_id as string }
    })).rows[0];

    const data = {
      id: product.id as string,
      title: product.title as string,
      description: product.description as string,
      price: product.price as number,
      discount_type: product.discount_type as string,
      discount_rate: product.discount_rate as number,
      image_urls: JSON.parse(product.image_urls as string) as string[],
      features: JSON.parse(product.features as string) as string[],
      user_id: product.user_id as string,
      weight: product.weight as number,
      dimension: JSON.parse(product.dimension as string),
      status: product.status as string,
      created_at: product.created_at as number,
      updated_at: product.updated_at as number,
    }

    res.status(200).json({
      success: true,
      message: "Products request data Successful",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
