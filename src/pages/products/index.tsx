import Layout from '@/components/Layout'
import MultiSelector from '@/components/MultiSelect'
import { Input, PaginationButton, Select } from '@/components/styled'
import useAuth from '@/stores/useAuth'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PiArrowArcLeft, PiArrowArcRight, PiTrashDuotone, PiWrenchDuotone } from 'react-icons/pi'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Product } from '../api/bo/products/list'
import { useEffect, useState } from 'react'
import useDebounce from '@/lib/useDebounce'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useConfirm from '@/stores/useConfirm'

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr); /* md:grid-cols-3 */
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(5, 1fr); /* xl:grid-cols-5 */
  }
`

const StyledCard = styled.div`
  background-color: #efefef; /* bg-neutral-200 */
  border-radius: 0.5rem; /* rounded-lg */
  border: 1px solid #737373; /* border-neutral-500 */
  padding: 0.5rem; /* p-2 */
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  position: relative;
`

const ImageContainer = styled.div`
  width: 2rem; /* w-24 (24 * 0.25rem) */
  height: 2rem; /* h-24 */
  background-image: url('/dummy.jpg');
  background-size: cover; /* object-contain */
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0.5rem; /* rounded-lg */
  flex-shrink: 0; /* shrink-0 */
`

const FlexContainer = styled.div`
  width: 100%; /* w-full */
  height: 100%; /* h-full */
  display: flex;
  flex-direction: column; /* flex-col */
  overflow: hidden;
  text-overflow: ellipsis; /* truncate */
  white-space: nowrap; /* truncate */
`

const Keyword = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: span 1 / span 1; /* col-span-1 */

  @media (min-width: 768px) {
    grid-column: span 3 / span 3; /* xl:col-span-2 */
  }

  @media (min-width: 1280px) {
    grid-column: span 2 / span 2; /* xl:col-span-2 */
  }
`

const SingleSpan = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: span 1 / span 1; /* col-span-1 */
`

const ItemButtons = styled.div`
  position: absolute;
  heigth: 100%;
  top: 0;
  right: 0;
  padding: 0.25rem; /* p-1 */
  display: flex;
  justify-content: flex-end; /* justify-end */
  gap: 0.5rem; /* gap-2 */
  flex-shrink: 0; /* shrink-0 */
`;

const ItemStatus = styled.div`
  position: absolute;
  bottom: 1px;
  right: 1px;
  padding: 0.25rem; /* p-1 */
  border-radius: 0.5rem; /* rounded-lg */
  text-transform: capitalize;
`

const FlexContainerTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

export default function Products() {
  const auth = useAuth();
  const router = useRouter();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [discountType, setDiscountType] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const ps = useQuery({
    queryKey: ['products', debouncedSearch, discountType, features, status],
    queryFn: async () => {
      let url = `/api/bo/products/list?1=1`;
      if (search) {
        url += `&keyword=${search}`;
      }
      if (discountType) {
        url += `&discount_type=${discountType}`;
      }
      if (features.length > 0) {
        url += `&features=${features.map(encodeURIComponent).join(',')}`;
      }
      if (status) {
        url += `&status=${status}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + auth.token
        }
      })
      if (res.status !== 200) {
        toast.error(res.data.message);
      }
      return await res.data.data;
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/bo/products/delete`, {
        data: {
          product_id: id
        },
        headers: {
          Authorization: 'Bearer ' + auth.token
        }
      })
      if (res.status !== 200) {
        toast.error(res.data.message);
      }
      return await res.data.data;
    },
    onSuccess: () => {
      ps.refetch();
      confirm.clear();
    },
    onError: (error: any) => {
      const errorMessage = error.response.data?.message || 'An error occurred';
      toast.error(errorMessage);
      confirm.clear();
    }
  })

  useEffect(() => {
    if (!auth.checkScope('products')) {
      router.push('/')
    }
  }, [])

  return (
    <Layout>
      <FlexContainerTitle>
        <h1>Products</h1>
        <StyledButton href={'/products/create'}>
          Create
        </StyledButton>
      </FlexContainerTitle>
      <GridContainer>
        <Keyword>
          <div>Keyword</div>
          <Input placeholder='Search' onChange={(e) => setSearch(e.target.value)} />
        </Keyword>
        <SingleSpan>
          <div>Disc Type</div>
          <Select onChange={(e) => {
            if (e.target.value === 'none') {
              setDiscountType('')
            } else {
              setDiscountType(e.target.value)
            }
          }}>
            <option value='none'>None</option>
            <option value='fixed'>FIXED</option>
            <option value='percentage'>PERCENTAGE</option>
          </Select>
        </SingleSpan>
        <SingleSpan>
          <div>Features</div>
          <MultiSelector selected={features} onSelect={setFeatures} />
        </SingleSpan>
        <SingleSpan>
          <div>Status</div>
          <Select onChange={(e) => {
            if (e.target.value === '') {
              setStatus('')
            } else {
              setStatus(e.target.value)
            }
          }}>
            <option value=''>All</option>
            <option value='inactive'>InActive</option>
            <option value='active'>Active</option>
          </Select>
        </SingleSpan>
      </GridContainer>
      <GridContainer>
        {ps.isSuccess && ps.data.map((product: Product, i: number) => (
          <StyledCard key={product.id + '_' +i}>
            <ImageContainer />
            <FlexContainer>
              <div style={{ fontWeight: 600 }}>{product.title}</div>
              <div style={{ fontWeight: 300 }}>Rp. {product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
            </FlexContainer>
            <ItemButtons>
              <PiWrenchDuotone style={{ fontSize: 16, color: 'blue' }} onClick={() => router.push(`/products/${product.id}`)} />
              <PiTrashDuotone style={{ fontSize: 16, color: 'red' }} onClick={() => confirm.setOpen(true, {
                title: 'Are you sure you want to delete this product?',
                onSubmit: () => deleteProduct.mutate(product.id),
                onCancel: () => confirm.clear()
              })} />
            </ItemButtons>
            <ItemStatus>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{product.status}</div>
            </ItemStatus>
          </StyledCard>
        ))}
      </GridContainer>
      <div style={{ display: 'flex', justifyContent: 'end', paddingTop: 12, gap: 8 }}>
        <PaginationButton>
          <PiArrowArcLeft /> Prev
        </PaginationButton>
        <PaginationButton>
          Next <PiArrowArcRight />
        </PaginationButton>
      </div>
    </Layout>
  )
}
