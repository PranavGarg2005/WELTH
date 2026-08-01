"use client";
import { Card, CardTitle, CardContent, CardFooter, CardHeader, CardAction, CardDescription } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react'
import { toast } from 'sonner';
import { updateDefaultAccount } from "@/actions/accounts"

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number | string;
  isDefault: boolean;
  [key: string]: any; // remove once you know the full shape
};

const AccountCard = ({ account }: { account: Account }) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount) as unknown as {
    loading: boolean;
    fn: (id: string) => Promise<any>;
    data: { success?: boolean } | undefined;
    error: any;
  };

  const handleDefaultChange = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need atleast one default account");
      return;
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully!");
    }
  }, [updatedAccount, updateDefaultLoading])
  return (
    <Card className="hover: shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
          <Switch checked={isDefault} onClick={handleDefaultChange} disabled={updateDefaultLoading} />
        </CardHeader>
        <CardContent >
          <div className='text-2xl font-bold'>
            ${parseFloat(balance as string).toFixed(2)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className='flex justify-between text-sm text-muted-foreground'>
          <div className='flex items-center'>
            <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
            Income
          </div>
          <div className='flex items-center'>
            <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

export default AccountCard