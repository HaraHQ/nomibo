import Layout from '@/components/Layout'
import RoleScopeSelector from '@/components/RoleScopeSelector'
import { Button, ColSpan2, Field, Input, Select } from '@/components/styled'
import useAuth from '@/stores/useAuth'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { register } from 'module'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import styled from 'styled-components'

const FlexContainerTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

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
`

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
`

const RoleCreatePage = () => {
  const router = useRouter()
  const auth = useAuth()

  const [selected, setSelected] = useState<string[]>([])

  const { register, getValues } = useForm({
    defaultValues: {
      title: '',
      description: '',
      scopes: [],
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      try {
        const payload = {
          title: getValues('title'),
          description: getValues('description'),
          scopes: selected,
        }

        await axios.post(`/api/bo/users/roles/create`, payload, {
          headers: { Authorization: 'Bearer ' + auth.token },
        })

        toast.success('Role is created')
        router.push('/roles')
      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message)
        } else {
          toast.error(error.message)
        }
      }
    },
    onError: () => {
      toast.error('Failed to create role')
    },
  })

  useEffect(() => {
    if (!auth.checkScope('user-roles')) {
      router.push('/')
    }
  }, [])

  return (
    <Layout>
      <FlexContainerTitle>
        <h1>Create User</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StyledButton href={'/roles'}>Cancel</StyledButton>
          <StyledSubmit onClick={() => create.mutate()}>Create</StyledSubmit>
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

export default RoleCreatePage
