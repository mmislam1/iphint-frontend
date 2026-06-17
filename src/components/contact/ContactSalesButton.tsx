'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { openModal } from '@/lib/store/slices/contactModalSlice';

type ContactSalesButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function ContactSalesButton({
  children,
  onClick,
  type = 'button',
  ...props
}: ContactSalesButtonProps) {
  const dispatch = useAppDispatch();

  return (
    <button
      {...props}
      type={type}
      aria-haspopup="dialog"
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          dispatch(openModal());
        }
      }}
    >
      {children}
    </button>
  );
}