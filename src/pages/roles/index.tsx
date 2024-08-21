import Layout from "@/components/Layout"
import { PaginationButton } from "@/components/styled";
import Link from "next/link";
import router from "next/router";
import { PiWrenchDuotone, PiTrashDuotone, PiArrowArcLeft, PiArrowArcRight } from "react-icons/pi";
import styled from "styled-components";
import { Product } from "../api/bo/products/list";
import useConfirm from "@/stores/useConfirm";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import useAuth from "@/stores/useAuth";
import { toast } from "react-toastify";
import useDebounce from "@/lib/useDebounce";

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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
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

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);

  const confirm = useConfirm();
  const auth = useAuth();

  const roles = useQuery({
    queryKey: ['roles', debounceSearch],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/bo/users/roles/list${debounceSearch !== '' ? `?keyword=${debounceSearch}` : ''}`, {
          headers: { Authorization: 'Bearer ' + auth.token }
        });
        return res.data.data
      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message)
        } else {
          console.log(error.message)
        }
      }
    },
  })

  const deleteRole = useMutation({
    mutationFn: async (role_id: string) => {
      try {
        const res = await axios.delete(`/api/bo/users/roles/delete`, {
          data: {
            role_id,
          },
          headers: { Authorization: 'Bearer ' + auth.token }
        });
        
        toast.success('Role is deleted')

        return res.data.reference;

      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message)
        } else {
          console.log(error.message)
        }
      }
    },
    onSuccess: () => {
      roles.refetch();
      confirm.clear();
    },
  })

  const handlePagination = (act: '+' | '-') => {
    if (act === '+') setPage(page + 1)
    if (act === '-' && page > 1) setPage(page - 1)
  }

  useEffect(() => {
    if (!auth.checkScope('user-roles')) {
      router.push('/')
    }
  }, [])

  return (
    <Layout>
      <FlexContainerTitle>
        <h1>Roles</h1>
        <StyledButton href={'/roles/create'}>
          Create
        </StyledButton>
      </FlexContainerTitle>
      <GridContainer>
        {roles.isSuccess && roles.data.map((role: any) => (
          <StyledCard key={role.id}>
            <ImageContainer />
            <FlexContainer>
                <div style={{ fontWeight: 600 }}>{role.title}</div>
                <div style={{ fontWeight: 300 }}>{role.scopes.join(', ')}</div>
              </FlexContainer>
              <ItemButtons>
                <PiWrenchDuotone style={{ fontSize: 16, color: 'blue' }} onClick={() => router.push(`/roles/${role.id}`)} />
                <PiTrashDuotone style={{ fontSize: 16, color: 'red' }} onClick={() => confirm.setOpen(true, {
                  title: 'Are you sure you want to delete this role?',
                  onSubmit: () => deleteRole.mutate(role.id),
                  onCancel: () => confirm.clear()
                })} />
              </ItemButtons>
          </StyledCard>
        ))}
      </GridContainer>
      <div style={{ display: 'flex', justifyContent: 'end', paddingTop: 12, gap: 8 }}>
        <PaginationButton onClick={() => handlePagination('-')}>
          <PiArrowArcLeft /> Prev
        </PaginationButton>
        <PaginationButton onClick={() => handlePagination('+')}>
          Next <PiArrowArcRight />
        </PaginationButton>
      </div>
    </Layout>
  )
}

export default UsersPage;