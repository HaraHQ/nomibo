import { ApiResponse } from '@/interface'
import { checkScope } from '@/lib/checkScope'
import { checkToken } from '@/lib/checkToken'
import { should } from '@/lib/should'
import turso from '@/lib/turso'
import type { NextApiRequest, NextApiResponse } from 'next'

interface Response extends ApiResponse {
  reference?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  try {
    should({ method: 'PUT', req })
    await checkToken(req)
    await checkScope('products', req)

    const {
      title,
      description,
      price,
      discount_type,
      discount_rate,
      image_urls,
      features,
      product_id,
      weight,
      dimension,
      status,
    } = req.body
    if (title === '' || !title) {
      throw new Error('Title is required')
    }
    if (description === '' || !description) {
      throw new Error('Description is required')
    }
    if (price <= 0 || !price) {
      throw new Error('Price is required')
    }
    if (product_id === '' || !product_id) {
      throw new Error('Product ID is required')
    }

    // check product_id is not exist
    const product = await turso.execute({
      sql: 'SELECT * FROM products WHERE id = ? LIMIT 1',
      args: [product_id],
    })

    if (product.rows.length === 0) {
      throw new Error('Product not found')
    }

    // check if product status is active or not, if active cannot update yet -> need to deactived first
    if (product.rows[0].status === 'active' && status !== 'inactive') {
      throw new Error('Product is active, cannot update')
    }

    const payload = {
      title: title || product.rows[0].title,
      description: description || product.rows[0].description,
      price: price || product.rows[0].price,
      discount_type: discount_type || product.rows[0].discount_type,
      discount_rate: discount_rate || product.rows[0].discount_rate,
      image_urls: JSON.stringify(image_urls) || product.rows[0].image_urls,
      features: JSON.stringify(features) || product.rows[0].features,
      weight: weight || product.rows[0].weigth,
      dimension: JSON.stringify(dimension) || product.rows[0].dimension,
      status: status || product.rows[0].status,
    }

    await turso.execute({
      sql: `UPDATE products SET title = ?, description = ?, price = ?, discount_type = ?, discount_rate = ?, image_urls = ?, features = ?, weight = ?, dimension = ?, status = ? WHERE id = ?`,
      args: [
        payload.title,
        payload.description,
        payload.price,
        payload.discount_type,
        payload.discount_rate,
        payload.image_urls,
        payload.features,
        payload.weight,
        payload.dimension,
        payload.status,
        product_id,
      ],
    })

    res.status(200).json({
      success: true,
      message: 'Product update Successful',
      reference: product_id,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || 'An unknown error occurred',
    })
  }
}
