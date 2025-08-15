import { TextField } from '@mui/material';
import React from 'react';

interface Props { name: string; label: string; type?: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }

export default function InputField({ name, label, type = 'text', value, onChange }: Props) {
  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
    />
  );
}