import { useState, useCallback } from 'react';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToastVariant = 'default' | 'destructive';

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
};

type ToastInput = Omit<Toast, 'id'>;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${count}`;
}

const listeners: Array<(state: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function dispatch(toast: Toast) {
  memoryState = [toast, ...memoryState].slice(0, TOAST_LIMIT);
  listeners.forEach((l) => l(memoryState));
}

function toast(input: ToastInput) {
  const id = genId();
  dispatch({ ...input, id });
  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.id !== id);
    listeners.forEach((l) => l(memoryState));
  }, TOAST_REMOVE_DELAY);
  return id;
}

function useToast() {
  const [state, setState] = useState<Toast[]>(memoryState);

  useCallback(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, [])();

  return {
    toasts: state,
    toast,
    dismiss: (toastId: string) => {
      memoryState = memoryState.filter((t) => t.id !== toastId);
      listeners.forEach((l) => l(memoryState));
    },
  };
}

export { useToast, toast };
