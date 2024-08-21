import Layout from "@/components/Layout";
import MultiSelector from "@/components/MultiSelect";
import { Input, Select, TextArea } from "@/components/styled";
import useAuth from "@/stores/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

const FlexContainerInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border: 1px solid #d1d5db; /* Neutral 300 */
  background-color: transparent;
  border-radius: 0.375rem; /* Rounded-md */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Shadow-md */
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

const GridInfoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */
  height: 200px;
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

const CreateProductPage: FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const [features, setFeatures] = useState<string[]>([]);

  const { register, setValue, getValues } = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discount_type: "none",
      discount_rate: 0,
      features: features,
      weight: 0,
      width: 0,
      height: 0,
      status: "active",
    }
  })

  useQuery({
    queryKey: ['product', router.query.id],
    queryFn: async () => {
      const res = await axios.get(`/api/bo/products/${router.query.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      if (res.status !== 200) {
        toast.error(res.data.message);
      }
      setValue('title', res.data.data.title);
      setValue('description', res.data.data.description);
      setValue('price', parseInt(res.data.data.price));
      setValue('discount_type', res.data.data.discount_type);
      setValue('discount_rate', parseInt(res.data.data.discount_rate));
      setValue('features', res.data.data.features);
      setValue('weight', parseInt(res.data.data.weight));
      setValue('width', res.data.data.dimension.width);
      setValue('height', res.data.data.dimension.height);
      setValue('status', res.data.data.status);

      return res.data.data;
    },
    refetchOnWindowFocus: false
  })

  const update = useMutation({
    mutationKey: ['product', 'update', router.query.id],
    mutationFn: async () => {
      const payload = {
        ...getValues(),
        dimension: {
          width: getValues('width') || 0,
          height: getValues('height') || 0
        },
        product_id: router.query.id,
        features: features
      }
      const res = await axios.put(`/api/bo/products/update`, payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      if (error.response) {
        const errorMessage = error.response.data?.message || 'An error occurred';
        toast.error(errorMessage);
        // Optionally return or log the entire error response
        return error.response;
      } else {
        // Handle network or other errors that don't have a response
        toast.error(error.message);
        return error;
      }
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
        <h1>Edit Product</h1>
        <FlexContainerButton>
          <StyledButton href={'/products'}>
            Back
          </StyledButton>
          <StyledSubmit onClick={() => update.mutate()}>
            {!update.isPending ? 'Update' : 'Updating...'}
          </StyledSubmit>
        </FlexContainerButton>
      </FlexContainerTitle>
      <GridContainer>
        <DropzoneCard>
          Click or put image here.
        </DropzoneCard>
        <div>
          <Field>
            <div>Title *</div>
            <Input placeholder='Input Title' {...register('title', { required: true })} />
          </Field>
          <Field>
            <div>Description *</div>
            <TextArea placeholder='Input Description' {...register('description', { required: true })} />
          </Field>
          <Field>
            <div>Price *</div>
            <Input placeholder='Input Price' {...register('price', { required: true })} />
          </Field>
          <Field>
            <div>Discount Type</div>
            <Select onChange={(e) => setValue('discount_type', e.target.value)}>
              <option value='none' selected={getValues('discount_type') === 'none' ? true : false}>None</option>
              <option value='fixed' selected={getValues('discount_type') === 'fixed' ? true : false}>FIXED</option>
              <option value='percentage' selected={getValues('discount_type') === 'percentage' ? true : false}>PERCENTAGE</option>
            </Select>
          </Field>
          <Field>
            <div>Discount Rate</div>
            <Input placeholder='Input Discount Rate' {...register('discount_rate')} />
          </Field>
          <Field>
            <div>Features <div style={{ fontSize: 12, color: 'darkred' }}>{features.length > 0 && features.join(', ')}</div></div>
            <MultiSelector selected={features} onSelect={setFeatures} />
          </Field>
          <Field>
            <div>Weight *</div>
            <Input placeholder='Input Weight' {...register('weight', { required: true })} />
          </Field>
          <Field>
            <div>Width *</div>
            <Input placeholder='Input Dimension (width)' {...register('width', { required: true })} />
          </Field>
          <Field>
            <div>Height *</div>
            <Input placeholder='Input Dimension (height)' {...register('height', { required: true })} />
          </Field>
          <Field>
            <div>Status *</div>
            <Select onChange={(e) => setValue('status', e.target.value)}>
              <option value='inactive' selected={getValues('status') === 'inactive' ? true : false}>InActive</option>
              <option value='active' selected={getValues('status') === 'active' ? true : false}>Active</option>
            </Select>
          </Field>
        </div>
        <GridInfoContainer>
          <FlexContainerInfo>
            <div>Total Sales:</div>
            <div>0</div>
          </FlexContainerInfo>
          <FlexContainerInfo>
            <div>Discount Price:</div>
            <div>0</div>
          </FlexContainerInfo>
          <FlexContainerInfo>
            <div>Created At:</div>
            <div>0</div>
          </FlexContainerInfo>
          <FlexContainerInfo>
            <div>Updated At:</div>
            <div>0</div>
          </FlexContainerInfo>
        </GridInfoContainer>
      </GridContainer>
    </Layout>
  )
}

export default CreateProductPage;