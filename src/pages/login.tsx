import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { Montserrat } from "next/font/google";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useAuth from "@/stores/useAuth";
import Loading from "@/components/Loading";
import { Input } from "@/components/styled";

const montserrat = Montserrat({ subsets: ["latin"] });

const Container = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    to bottom,
    white 0%,
    white 40.5%,
    red 45.5%,
    black 49.5%,
    red 55.5%,
    white 60.5%,
    white 100%
  );
`;

const Box = styled.div`
  width: 100%;
  background-color: white;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    width: 380px;
  }

  @media (min-width: 1024px) {
    width: 420px;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`

const SubmitButton = styled.button`
  padding: 0.5rem;
  background-color: red;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
`

const R = styled.span`
  color: red;
`

const LoginPage: FC = () => {
  const router = useRouter();
  const auth = useAuth();
  const [ready, setReady] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: { email: string; password: string }) => {
      try {
        const response = await axios.post('/api/auth/login', {
          email: data.email,
          password: data.password
        });
  
        if (response.data.success) {
          auth.setToken(response.data.token);
        } else {
          auth.clearToken();
        }
  
        return response;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw error.response;
        } else {
          throw error;
        }
      }
    },
    onError: (error: any) => {
      if (error?.data) {
        toast(error.data.message, {
          autoClose: 3000,
          type: 'error',
        })

        auth.clearToken();
      } else {
        console.log('Error message:', error.message);
      }
    },
  });
  

  const onSubmit = (data: { email: string; password: string }) => {
    login.mutate(data);
  };

  useEffect(() => {
    if (auth.validate()) {
      router.push('/');
    } else {
      setReady(true)
    }
  }, [auth.token])

  if (!ready) return (
    <Loading />
  );

  if (ready) return (
    <Container className={montserrat.className}>
      <Box>
        <Title>N<R>O</R>MIB<R>O</R></Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Email" {...register("email")} />
          <Input placeholder="Password" type="password" {...register("password")} />
          <SubmitButton type="submit">Login</SubmitButton>
        </Form>
      </Box>
    </Container>
  )
}

export default LoginPage;