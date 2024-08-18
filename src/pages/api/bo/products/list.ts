import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  data?: Product[] | [];
}

export type Dimension = {
  width: number;
  height: number;
}

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_type: string;
  discount_rate: number;
  image_urls: string[];
  features: string[];
  user_id: string;
  weight: number;
  dimension: Dimension;
  status: string;
  created_at: number;
  updated_at: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('products', req);

    let extras = '';
    if (req.query.keyword) {
      extras += ` AND name LIKE '%${req.query.keyword}%' OR email LIKE '%${req.query.keyword}%'`;
    }
    if (req.query.discount_type) {
      extras += ` AND discount_type = '${req.query.discount_type}'`;
    }
    if (req.query.features) {
      extras += ` AND features LIKE '%${req.query.features}%'`;
    }
    if (req.query.status) {
      extras += ` AND status = '${req.query.status}'`;
    }
    // get users
    const products = (await turso.execute(`SELECT * FROM products WHERE 1=1${extras}`));

    if (products.rows.length < 1) {
      return res.status(404).json({
        success: true,
        message: "Products request list Successful",
        data: []
      });
    }

    const data = products.rows.map((product) => {
      return {
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
        dimension: JSON.parse(product.dimension as string) as Dimension,
        status: product.status as string,
        created_at: product.created_at as number,
        updated_at: product.updated_at as number,
      }
    })

    res.status(200).json({
      success: true,
      message: "Products request list Successful",
      data: data || []
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
