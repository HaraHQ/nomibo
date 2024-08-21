import { ApiResponse } from '@/interface'
import { checkScope } from '@/lib/checkScope'
import { checkToken } from '@/lib/checkToken'
import makeOrderCode from '@/lib/makeOrderCode'
import { should } from '@/lib/should'
import turso from '@/lib/turso'
import type { NextApiRequest, NextApiResponse } from 'next'
import { v7 as uuidv7 } from 'uuid'

interface Response extends ApiResponse {
  reference?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  try {
    should({ method: 'POST', req });
    await checkToken(req);
    await checkScope('orders', req);

    const { cart, user_id, order_type, customer_id, payment_type } = req.body
    if (!cart || cart.length === 0) {
      throw new Error('Cart items is required')
    }
    if (!user_id) {
      throw new Error('User ID is required')
    }
    if (!order_type) {
      throw new Error('Order Type is required')
    }
    if (!customer_id) {
      throw new Error('Customer ID is required')
    }
    if (!payment_type) {
      throw new Error('Payment Type is required')
    }

    // status: WAITING_PAYMENT, PAID, ON_DELIVERY, FINISHED
    const payload = {
      id: uuidv7(),
      cart: JSON.stringify(cart),
      user_id,
      order_type,
      customer_id,
      payment_type,
      status: 'WAITING_PAYMENT',
      created_at: new Date(),
      updated_at: new Date(),
    }

    // create order
    await turso.execute({
      sql: 'INSERT INTO orders (id, order_code, cart, user_id, order_type, customer_id, payment_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        payload.id,
        makeOrderCode(),
        payload.cart,
        payload.user_id,
        payload.order_type,
        payload.customer_id,
        payload.payment_type,
        payload.status,
        payload.created_at,
        payload.updated_at,
      ],
    })

    // place order items based on cart
    await cart.map(async (item: any) => {
      const payload_item = {
        id: uuidv7(),
        order_id: payload.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        created_at: new Date(),
        updated_at: new Date(),
      }
      await turso.execute({
        sql: 'INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [
          payload_item.id,
          payload.id,
          item.id,
          payload_item.quantity,
          payload_item.price,
          payload_item.created_at,
          payload_item.updated_at,
        ],
      })
    })

    res.status(200).json({
      success: true,
      message: 'Order creation Successful',
      reference: payload.id,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message || 'An unknown error occurred',
    })
  }
}
