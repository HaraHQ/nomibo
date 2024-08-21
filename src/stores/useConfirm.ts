import { create } from "zustand";

interface ConfirmStore {
  open: boolean;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
  setOpen: (open: boolean, { title, onSubmit, onCancel }: any) => void;
  clear: () => void;
}

const useConfirm = create<ConfirmStore>((set) => ({
  open: false,
  title: '',
  onSubmit: () => { },
  onCancel: () => { },
  setOpen: (open: boolean, { title, onSubmit, onCancel }: any) => set({ open, title, onSubmit, onCancel }),
  clear: () => set({ open: false, title: '', onSubmit: () => { }, onCancel: () => { } })
}))

export default useConfirm