import Layout from "@/components/Layout";
import MultiSelector from "@/components/MultiSelect";
import { Button, Input, Select, Select2, TextArea } from "@/components/styled";
import useAuth from "@/stores/useAuth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { set, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import styled from "styled-components";

const FlexContainerTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FlexContainerButton = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 4px;
`;

const StyledButton = styled(Link)`
  border: 1px solid #d1d5db; /* Neutral 300 */
  background-color: transparent;
  border-radius: 0.375rem; /* Rounded-md */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Shadow-md */
  font-size: 12px;
  color: inherit;
  padding: 0.5rem 1rem;
  text-decoration: none;

  &:hover {
    color: white;
    background-color: black;
  }
`;

const StyledSubmit = styled.button`
  border: 1px solid #d1d5db; /* Neutral 300 */
  background-color: transparent;
  border-radius: 0.375rem; /* Rounded-md */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Shadow-md */
  font-size: 12px;
  color: inherit;
  padding: 0.5rem 1rem;
  text-decoration: none;

  &:hover {
    color: white;
    background-color: red;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr); /* md:grid-cols-3 */
  }
`

const Grid1 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */
`

const DropzoneCard = styled.div`
  width: 100%;                /* w-full */
  height: 300px;              /* h-[300px] */
  position: relative;         /* relative */
  display: flex;              /* flex */
  justify-content: center;    /* justify-center */
  align-items: center;        /* items-center */
  background-color: #9ca3af;  /* bg-neutral-400 */
  color: black;               /* text-black */
  font-weight: 600;           /* font-semibold */
  font-size: 0.75rem;         /* text-xs */

  @media (min-width: 768px) {
    height: 400px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const CartContainer = styled.div`
  border: 1px solid #737373; /* neutral-500 */
  border-radius: 0.5rem; /* lg */
  padding: 0.5rem; /* p-2 */
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* gap-2 */
`;

const ProductItem = styled.div`
  padding: 0.375rem; /* p-1.5 */
  border: 1px solid #d4d4d4; /* neutral-300 */
  border-radius: 0.25rem; /* rounded */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* shadow-md */
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductDefinition = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem; /* gap-0.5 */
`;

const ProductDefinitionToCart = styled.div`
  display: flex;
  align-items: center;
  gap: 0.125rem; /* gap-0.5 */
`;

const AddToCartButton = styled(Button)`
  background-color: red;  /* bg-blue-600 */
  color: white;               /* text-white */
  border: none;

  &:hover {
    background-color: darkred; /* bg-blue-700 */
  }
`;

const RemoveFromCartButton = styled(Button)`
  background-color: black;  /* bg-blue-600 */
  color: white;               /* text-white */
  border: none;

  &:hover {
    background-color: darkgrey; /* bg-blue-700 */
  }
`;

const CenteredOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GradientBackground = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    to bottom right,
    rgba(233, 213, 255, 0.2), /* from-purple-200/20 */
    rgba(168, 85, 247, 0.2),  /* via-purple-400/20 */
    rgba(225, 29, 72, 0.2)    /* to-rose-600/20 */
  );
  z-index: 10;
`;

const Card = styled(motion.div)`
  background-color: white;     /* bg-white */
  padding-left: 1rem;               /* p-4 */
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.5rem;       /* rounded-lg */
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); /* shadow-lg */
  z-index: 20;
  width: 380px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

type Customer = {
  id: string;
  name: string;
  email: string;
}

type Product = {
  id: string;
  title: string;
  price: number;
  discount_type: string;
  discount_rate: number;
  quantity: number;
}

const ProductItems = ({ p, handleAddToCart }: { p: Product, handleAddToCart: (p: Product, q: number) => void }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <ProductItem key={p.id}>
      <ProductDefinition>
        <div style={{ fontSize: 12, fontWeight: 300 }}>{p.title}</div>
        <div style={{ fontSize: 10, fontWeight: 700 }}>Rp {p.price}</div>
      </ProductDefinition>
      <ProductDefinitionToCart>
        <Select2 onChange={(e) => setQuantity(e.target.value as unknown as number)}>
          {[...Array(20)].map((_, i: number) => (
            <option key={`value_${i}`} value={1+i} selected={quantity === 1+i ? true : false}>{1+i}</option>
          ))}
        </Select2>
        <AddToCartButton onClick={() => handleAddToCart(p, quantity)}>
          Add to Cart
        </AddToCartButton>
      </ProductDefinitionToCart>
    </ProductItem>
  )
}

const CreateProductPage: FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Product[]>([]);
  const [userSearch, setUserSearch] = useState(false);
  const [email, setEmail] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const { register, setValue, getValues, reset } = useForm({
    defaultValues: {
      cart: [],
      user_id: auth.getUID(),
      order_type: "INTERNAL_REQUEST",
      customer_id: "",
      customer_email: "",
      payment_type: "cash"
    }
  })

  const searchEmail = async () => {
    try {
      const res = await axios.get(`/api/bo/customers/search?email=${email}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      
      const data = res.data.data;
      setCustomer(data);

    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
      setCustomer(null);
    }
  }

  const handleCustomerSelection = (uuid: string, email: string) => {
    setValue('customer_id', uuid);
    setValue('customer_email', email);
    setUserSearch(false);
  }

  const handleAddToCart = (product: Product, quantity: number) => {
    // check if product already in cart
    const cartItem = cart.find((c) => c.id === product.id);

    if (cartItem) {
      const _cart = cart.map((c) => {
        if (c.id === product.id) {
          return {
            ...c,
            quantity: c.quantity + quantity
          }
        }
        return c;
      });

      setCart(_cart);
    } else {
      const payload = {
        ...product,
        quantity
      }
      setCart([
        ...cart,
        payload
      ]);
    }
  }

  useMemo(() => {
    const calculate = cart.map((c) => {
      return c.price * c.quantity;
    }).reduce((a, b) => a + b, 0)

    setTotal(calculate)
  }, [cart])

  const searchProduct = async () => {
    try {
      const res = await axios.get(`/api/bo/products/search?name=${product}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      
      const data = res.data.data;
      setProducts(data);

    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
      setProducts([]);
    }
  }

  const removeFromCart = (id: string) => {
    const _cart = cart.filter((c) => c.id !== id);
    setCart(_cart);
  }

  const create = useMutation({
    mutationKey: ['order', 'create'],
    mutationFn: async () => {
      const res = await axios.post(`/api/bo/orders/create`, {
        cart,
        user_id: auth.getUID(),
        order_type: "INTERNAL_REQUEST",
        customer_id: customer?.id,
        payment_type: getValues('payment_type')
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      if (res.status !== 200) {
        toast.error(res.data.message);
      }
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success('Order created');
      reset();
      setEmail(null);
      setCustomer(null);
      router.push('/orders')
    },
    onError: (error) => {
      toast.error('Failed to create order');
    }
  })

  useEffect(() => {
    if (!auth.checkScope('orders')) {
      router.push('/')
    }
  }, [auth, router])

  return (
    <Layout>
      <FlexContainerTitle>
        <h1>Create Order</h1>
        <FlexContainerButton>
          <StyledButton href={'/products'}>
            Back
          </StyledButton>
          <StyledSubmit onClick={() => create.mutate()}>
            {!create.isPending ? 'Create' : 'Creating...'}
          </StyledSubmit>
        </FlexContainerButton>
      </FlexContainerTitle>
      <GridContainer>
        <CartContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <Input placeholder='Search Product' style={{ width: '100%' }} onChange={(e) => setProduct(e.target.value)} />
            <button
              onClick={async () => await searchProduct()}
              style={{ display: 'flex', flexShrink: 0, justifyContent: 'center', alignItems: 'center', height: 34 }}>
              Search
            </button>
          </div>
          {products.map((p) => (
            <ProductItems key={p.id} p={p} handleAddToCart={handleAddToCart} />
          ))}
        </CartContainer>
        <div>
          <Field>
            <div>Order Type </div>
            <Input placeholder='Input Title' value={'INTERNAL_REQUEST'} />
          </Field>
          <Field>
            <div>Customer *</div>
            <Input placeholder='Search customer by email' readOnly {...register('customer_email')} onFocus={() => setUserSearch(true)} />
          </Field>
        </div>
        <div>
          <Field>
            <div>Total Price</div>
            <Input placeholder='Input Price' readOnly value={total} />
          </Field>
          <Field>
            <div>Payment Type *</div>
            <Select onChange={(e) => setValue('payment_type', e.target.value)}>
              <option value="cash">Cash</option>
              <option value="wallet">Wallet</option>
            </Select>
          </Field>
        </div>
      </GridContainer>
      <Grid1>
        <h3>Cart</h3>
        <div>
          {cart.map((c) => (
            <ProductItem key={c.id}>
              <ProductDefinition>
                <div style={{ fontSize: 12, fontWeight: 300 }}>{c.title}</div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Rp {c.price * c.quantity}</div>
              </ProductDefinition>
              <ProductDefinitionToCart>
                <Select2>
                  {[...Array(20)].map((_, i: number) => (
                    <option key={`value_${i}`} value={1+i} selected={c.quantity === 1+i}>{1+i}</option>
                  ))}
                </Select2>
                <RemoveFromCartButton onClick={() => removeFromCart(c.id)}>
                  Remove from Cart
                </RemoveFromCartButton>
              </ProductDefinitionToCart>
            </ProductItem>
          ))}
        </div>
      </Grid1>
      <AnimatePresence>
        {userSearch && (
          <CenteredOverlay>
            <GradientBackground
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setUserSearch(false);
              }}
            />
            <Card
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Find User by Email</h3>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
                <Input placeholder='Input customer email' onChange={(e) => setEmail(e.target.value as string)} />
                <Button onClick={async () => await searchEmail()}>
                  Search
                </Button>
              </div>
              <AnimatePresence>
                {customer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductItem style={{ marginBottom: 8 }}>
                      <ProductDefinition>
                        <div style={{ fontSize: 12, fontWeight: 300 }}>{customer.name}</div>
                        <div style={{ fontSize: 10, fontWeight: 700 }}>{customer.email}</div>
                      </ProductDefinition>
                      <ProductDefinitionToCart>
                        <AddToCartButton onClick={() => handleCustomerSelection(customer.id, customer.email)}>
                          Select This User
                        </AddToCartButton>
                      </ProductDefinitionToCart>
                    </ProductItem>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </CenteredOverlay>
        )}
      </AnimatePresence>
    </Layout>
  )
}

export default CreateProductPage;