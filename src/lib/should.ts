import { Should } from "@/interface";

export function should({ method, req }: Should) {
  console.log(req.method, method);
  if (req.method !== method) {
    throw new Error(`Method ${req.method} is not allowed`);
  }
}