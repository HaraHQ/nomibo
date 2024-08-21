import Layout from "@/components/Layout"
import { Field, Input, Select } from "@/components/styled";
import useAuth from "@/stores/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { register } from "module";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
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

  const { register, setValue, getValues } = useForm({
    defaultValues: {
      id: "",
      name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "",
      role_id: "",
      status: "",
    },
  })

  useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/bo/users/${id}`, {
          headers: { Authorization: 'Bearer ' + auth.token }
        });
        const data = response.data.user;
        setValue("id", data.id);
        setValue("name", data.name);
        setValue("email", data.email);
        setValue("role", data.role_name);
        setValue("role_id", data.role_id);
        setValue("status", data.status);
        
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

  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/bo/users/roles/list`, {
          headers: { Authorization: 'Bearer ' + auth.token }
        });
        return response.data.data;
      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          console.log(error.message);
        }
        return []
      }
    },
  })

  const update = useMutation({
    mutationFn: async () => {
      try {
        const payload = {
          name: getValues('name'),
          role_id: getValues('role_id'),
          status: getValues('status'),
          user_id: getValues('id')
        }

        // if data.password is not empty
        if (getValues('password') !== '') {
          if (getValues('password') !== getValues('confirm_password')) {
            throw new Error('Password and Confirm Password do not match')
          } else {
            const payload_password = {
              password: getValues('password'),
              confirm_password: getValues('confirm_password'),
              user_id: getValues('id')
            }
    
            await axios.put(`/api/bo/users/change-password`, payload_password, {
              headers: { Authorization: 'Bearer ' + auth.token }
            })
  
            toast.success('User password is updated')
          }
        }

        await axios.put(`/api/bo/users/update`, payload, {
          headers: { Authorization: 'Bearer ' + auth.token }
        });

        toast.success('User is updated')
        router.push('/users');
      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    },
    onError: () => {
      toast.error('Failed to update user')
    }
  })

  useEffect(() => {
    if (!auth.checkScope('users')) {
      router.push('/')
    }
  }, [])

  return (
    <Layout>
      <FlexContainerTitle>
        <h1>User Details</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StyledButton href={'/users'}>
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
          <Input placeholder='Input User Name' {...register('name', { required: true })} />
        </Field>
        <Field>
          <div>Email *</div>
          <Input type="email" placeholder='Input User Email' readOnly {...register('email')} />
        </Field>
        <Field>
          <div>Password</div>
          <Input type="password" placeholder='Input User Password' {...register('password', { required: true })} />
        </Field>
        <Field>
          <div>Confirm Password (required if change password)</div>
          <Input type="password" placeholder='Input Password Confirmation' {...register('confirm_password', { required: true })} />
        </Field>
        <Field>
          <div>Role *</div>
          <Select onChange={(e) => {
            setValue('role_id', e.target.value)
          }}>
            {roles.isSuccess && roles.data.map((role: any) => (
              <option key={role.id} value={role.id} selected={getValues('role_id') === role.id}>{role.title}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <div>Status *</div>
          <Select onChange={(e) => setValue('status', e.target.value)}>
            <option value="active" selected={getValues('status') === 'active'}>Active</option>
            <option value="turnoff" selected={getValues('status') === 'turnoff'}>InActive</option>
          </Select>
        </Field>
      </GridContainer>
    </Layout>
  )
}

export default UserDetailPage