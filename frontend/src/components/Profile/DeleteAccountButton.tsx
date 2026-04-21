"use client";

import React, { useState } from 'react';
import DeleteAccountModal from './DeleteAccountModal';
import styles from '@/styles/components/deleteAccountButton.module.css';
import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
}

export const DeleteAccountButton: React.FC<Props> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button onClick={() => setOpen(true)} className={`${styles.button} ${className ?? ''}`}>
        Удалить аккаунт
      </button>
      <DeleteAccountModal open={open} onClose={() => setOpen(false)} onDeleted={() => router.push('/auth')} />
    </>
  );
};

export default DeleteAccountButton;
