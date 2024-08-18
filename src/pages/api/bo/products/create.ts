import { ApiResponse } from '@/interface'
import { checkScope } from '@/lib/checkScope'
import { checkToken } from '@/lib/checkToken'
import { should } from '@/lib/should'
import turso from '@/lib/turso'
import type { NextApiRequest, NextApiResponse } from 'next'
import { v7 as uuidv7 } from 'uuid'

interface Response extends ApiResponse {
  reference?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  try {
    should({ method: 'POST', req })
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
      user_id,
      weight,
      dimension,
      status,
    } = req.body
    if (!title) {
      throw new Error('Title is required')
    }
    if (!price) {
      throw new Error('Price is required')
    }
    if (!user_id) {
      throw new Error('User ID is required')
    }
    if (!weight) {
      throw new Error('Weight is required')
    }
    if (!dimension) {
      throw new Error('Dimension is required')
    }
    if (!status) {
      throw new Error('Status is required')
    }

    const payload = {
      id: uuidv7(),
      title,
      description: description || '',
      price,
      discount_type: discount_type || '',
      discount_rate: discount_rate || 0,
      image_urls: image_urls || [],
      features: features || [],
      user_id,
      weight,
      dimension: JSON.stringify(dimension),
      status: status || 'inactive',
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    await turso.execute({
      sql: `INSERT INTO products (id, title, description, price, discount_type, discount_rate, image_urls, features, user_id, weight, dimension, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        payload.id,
        payload.title,
        payload.description,
        payload.price,
        payload.discount_type,
        payload.discount_rate,
        JSON.stringify(payload.image_urls),
        JSON.stringify(payload.features),
        payload.user_id,
        payload.weight,
        payload.dimension,
        payload.status,
        payload.created_at,
        payload.updated_at,
      ],
    })

    res.status(200).json({
      success: true,
      message: 'Product creation Successful',
      reference: payload.id,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || 'An unknown error occurred',
    })
  }
}
