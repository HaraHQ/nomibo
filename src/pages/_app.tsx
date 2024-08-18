import "@/styles/globals.css";
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from 'react-toastify';

const client = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={client}>
      <Component {...pageProps} />
      <ToastContainer />
    </QueryClientProvider>
  );
}
