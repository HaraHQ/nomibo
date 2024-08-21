import Layout from '@/components/Layout'
import { Input, PaginationButton } from '@/components/styled'
import useAuth from '@/stores/useAuth'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'
import { PiArrowArcLeft, PiArrowArcRight } from 'react-icons/pi'
import styled from 'styled-components'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale, // x-axis
  LinearScale, // y-axis
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Link from 'next/link'
import useDebounce from '@/lib/useDebounce'
import { useRouter } from 'next/router'

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const GridOrderContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`

const TransactionFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const TransactionItem = styled.div`
  padding: 0.5rem;              /* p-2 */
  border: 2px solid #d1d5db;    /* border-2 border-neutral-300 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* shadow-md */
  background-color: white;      /* bg-white */
  font-size: 0.875rem;          /* text-sm (14px) */
  display: flex;                /* flex */
  justify-content: space-between; /* justify-between */
  align-items: center;          /* items-center */
  cursor: pointer;              /* cursor-pointer */
  transition: background-color 0.3s; /* Smooth transition for hover effect */

  &:hover {
    background-color: #e5e7eb;  /* hover:bg-neutral-300 */
  }
`;

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

type ChartCount = {
  y: any,
  x: any,
  data: any[]
}

const ChartCount: FC<ChartCount> = ({ y, x, data }) => {
  const chartData = {
    labels: data.map((item: any) => item[x]), // x-axis labels
    datasets: [
      {
        label: 'Count',
        data: data.map((item: any) => item[y]), // y-axis data
        borderColor: 'rgba(75, 192, 192, 1)', // line color
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // fill color under the line
        fill: true,
        tension: 0.3, // line smoothness
      },
    ],
  };

  return <Line data={chartData} />
  // return <>{JSON.stringify(data)}</>
}

const OrdersPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [orderCode, setOrderCode] = useState('');
  const debounceCode = useDebounce(orderCode, 1000);

  const charts = useQuery({
    queryKey: ['charts'],
    queryFn: async () => {
      const res = await axios.get('/api/bo/orders/chart', {
        headers: { Authorization: 'Bearer ' + auth.token }
      })
      return await res.data.data;
    },
  });

  const orders = useQuery({
    queryKey: ['orders', page, debounceCode],
    queryFn: async () => {
      const res = await axios.get(`/api/bo/orders/list?page=${'page'}${debounceCode !== '' ? '&order_code='+debounceCode : ''}`, {
        headers: { Authorization: 'Bearer ' + auth.token }
      })
      return await res.data.data;
    },
  });

  const handlePagination = (act: '+' | '-') => {
    if (act === '+') setPage(page + 1)
    if (act === '-' && page > 1) setPage(page - 1)
  }

  useEffect(() => {
    if (!auth.checkScope('orders')) {
      router.push('/')
    }
  }, [])
  
  return (
    <Layout>
      <FlexContainerTitle>
        <h1>Orders</h1>
        <StyledButton href={'/orders/create'}>
          Create Manual Order
        </StyledButton>
      </FlexContainerTitle>
      <Wrapper>
        <GridContainer>
          <div>
            {charts.isSuccess && <ChartCount x='date' y='count' data={charts.data.order_count} />}
            <div style={{ paddingBottom: 20, textAlign: 'center' }}>Total Orders per day</div>
          </div>
          <div>
            {charts.isSuccess && <ChartCount x='date' y='omzet' data={charts.data.order_omzet} />}
            <div style={{ paddingBottom: 20, textAlign: 'center' }}>Total Omzet per day</div>
          </div>
        </GridContainer>
        <GridOrderContainer>
          <Input placeholder='Search Order' onChange={(e) => setOrderCode(e.target.value)} />
          {orders.isSuccess && orders.data.map((o: any) => (
            <TransactionItem key={o.id}>
              <TransactionFlex>
                <span><span style={{ fontWeight: 600 }}>Code:</span> {o.order_code}</span>
              </TransactionFlex>
              <TransactionFlex>
                <span>{o.status}</span>
              </TransactionFlex>
            </TransactionItem>
          ))}
        </GridOrderContainer>
        <div style={{ display: 'flex', justifyContent: 'end', paddingTop: 12, gap: 8 }}>
          <PaginationButton onClick={() => handlePagination('-')}>
            <PiArrowArcLeft /> Prev
          </PaginationButton>
          <PaginationButton onClick={() => handlePagination('+')}>
            Next <PiArrowArcRight />
          </PaginationButton>
        </div>
      </Wrapper>
    </Layout>
  )
}

export default OrdersPage
