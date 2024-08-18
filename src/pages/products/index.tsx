import Layout from '@/components/Layout'
import MultiSelector from '@/components/MultiSelect'
import { Input, PaginationButton, Select } from '@/components/styled'
import { PiArrowArcLeft, PiArrowArcRight, PiTrashDuotone, PiWrenchDuotone } from 'react-icons/pi'
import styled from 'styled-components'

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
`

export default function Products() {
  return (
    <Layout>
      <h1>Products</h1>
      <GridContainer>
        <Keyword>
          <div>Keyword</div>
          <Input placeholder='Search' />
        </Keyword>
        <SingleSpan>
          <div>Disc Type</div>
          <Select>
            <option value='none'>None</option>
            <option value='fixed'>FIXED</option>
            <option value='percentage'>PERCENTAGE</option>
          </Select>
        </SingleSpan>
        <SingleSpan>
          <div>Features</div>
          <MultiSelector />
        </SingleSpan>
        <SingleSpan>
          <div>Status</div>
          <Select>
            <option value=''>All</option>
            <option value='inactive'>InActive</option>
            <option value='active'>Active</option>
          </Select>
        </SingleSpan>
      </GridContainer>
      <GridContainer>
        {[...Array(19)].map((_, i) => (
          <StyledCard key={i}>
            <ImageContainer />
            <FlexContainer>
              <div style={{ fontWeight: 600 }}>Product Name</div>
              <div style={{ fontWeight: 300 }}>Rp. 100.000</div>
            </FlexContainer>
            <ItemButtons>
              <PiWrenchDuotone style={{ fontSize: 16, color: 'blue' }} />
              <PiTrashDuotone style={{ fontSize: 16, color: 'red' }} />
            </ItemButtons>
            <ItemStatus>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Active</div>
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
