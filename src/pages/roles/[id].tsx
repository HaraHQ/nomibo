import Layout from "@/components/Layout"
import RoleScopeSelector from "@/components/RoleScopeSelector";
import { ColSpan2, Field, Input, Select } from "@/components/styled";
import useAuth from "@/stores/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { register } from "module";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import styled from "styled-components";

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

const UserDetailPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const { id } = router.query;
  const [selected, setSelected] = useState<string[]>([])

  const { register, setValue, getValues } = useForm({
    defaultValues: {
      id: '',
      title: '',
      description: '',
      scopes: [],
    },
  })

  useQuery({
    queryKey: ["role", id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/bo/users/roles/${id}`, {
          headers: { Authorization: 'Bearer ' + auth.token }
        });
        const data = response.data.role;
        console.log(data);
        setValue("id", data.id);
        setValue("title", data.title);
        setValue("description", data.description);
        setSelected(data.scopes);
        setValue("scopes", data.scopes);
        
        return data;

      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          console.log(error.message);
        }
        return {}
      }
    },
    enabled: router.isReady,
  })

  const update = useMutation({
    mutationFn: async () => {
      try {
        const payload = {
          role_id: getValues('id'),
          title: getValues('title'),
          description: getValues('description'),
          scopes: selected
        }

        await axios.put(`/api/bo/users/roles/update`, payload, {
          headers: { Authorization: 'Bearer ' + auth.token }
        });

        toast.success('Role is updated')
        router.push('/roles');
      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    },
    onError: () => {
      toast.error('Failed to update role')
    }
  })

  useEffect(() => {
    if (!auth.checkScope('user-roles')) {
      router.push('/')
    }
  }, [])

  return (
    <Layout>
      <FlexContainerTitle>
        <h1>Role Details</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StyledButton href={'/roles'}>
            Cancel
          </StyledButton>
          <StyledSubmit onClick={() => update.mutate()}>
            Update
          </StyledSubmit>
        </div>
      </FlexContainerTitle>
      <GridContainer>
        <Field>
          <div>Name *</div>
          <Input placeholder='Input Role Title' {...register('title', { required: true })} />
        </Field>
        <Field>
          <div>Description *</div>
          <Input placeholder='Input Description' {...register('description', { required: true })} />
        </Field>
        <ColSpan2>
          <Field>
            <div>Scopes *</div>
            <RoleScopeSelector selected={selected} setSelected={setSelected} />
          </Field>
        </ColSpan2>
      </GridContainer>
    </Layout>
  )
}

export default UserDetailPage