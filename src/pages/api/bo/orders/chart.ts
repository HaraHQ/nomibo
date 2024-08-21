import { ApiResponse } from "@/interface";
import { checkScope } from "@/lib/checkScope";
import { checkToken } from "@/lib/checkToken";
import { should } from "@/lib/should";
import turso from "@/lib/turso";
import type { NextApiRequest, NextApiResponse } from "next";

interface Response extends ApiResponse {
  data?: {
    order_count: OrderCount[],
    order_omzet: OrderOmzet[],
  };
}

type OrderCount = {
  count: number;
  date: string;
}

type OrderOmzet = {
  omzet: number;
  date: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) {
  try {
    should({ method: 'GET', req });
    await checkToken(req);
    await checkScope('orders', req);

    const count = await turso.execute(
      `SELECT
        order_code,
        created_at
      FROM
        orders
      ORDER BY
        created_at asc;`
    )

    const omzet = await turso.execute(
      `SELECT 
        o.created_at,
        oi.price,
        oi.quantity
      FROM 
        orders o      
      JOIN 
        order_items oi ON o.id = oi.order_id
      WHERE
        o.status = 'DONE'
      ORDER BY
        o.created_at asc;`
    )

    const groupCount = count.rows.reduce((acc: any, c) => {
      // Convert `created_at` to the local date string in `YYYY-MM-DD` format
      const formattedDate = new Date(c.created_at as number)
        .toLocaleDateString('id-ID'); // 'en-CA' is the locale for the Canadian English format (YYYY-MM-DD)
    
      // Find the existing entry for this date
      const existingEntry = acc.find((entry: any) => entry.date === formattedDate);
    
      if (existingEntry) {
        // If the date already exists, increment the count
        existingEntry.count += 1;
      } else {
        // Otherwise, create a new entry with count 1
        acc.push({
          date: formattedDate,
          count: 1,
        });
      }
    
      return acc;
    }, []);
    
    const groupedOmzet = omzet.rows.reduce((acc: any, row: any) => {
      // Convert `created_at` to the local date string in `YYYY-MM-DD` format
      const formattedDate = new Date(row.created_at as number)
        .toLocaleDateString('id-ID'); // 'en-CA' is the locale for the Canadian English format (YYYY-MM-DD)
    
      // Calculate the omzet for the current row
      const rowOmzet = row.price * row.quantity;
    
      // Find the existing entry for this date
      const existingEntry = acc.find((entry: any) => entry.date === formattedDate);
    
      if (existingEntry) {
        // If the date already exists, add the current row's omzet to the total
        existingEntry.omzet += rowOmzet;
      } else {
        // Otherwise, create a new entry with the current row's omzet
        acc.push({
          date: formattedDate,
          omzet: rowOmzet,
        });
      }
    
      return acc;
    }, []);    

    const data: any = {
      order_count: groupCount,
      order_omzet: groupedOmzet,
    }

    res.status(200).json({
      success: true,
      message: "Order request chart Successful",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || "An unknown error occurred",
    });
  }
}
