"use client";
import { transactionSchema } from '@/app/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createTransaction, updateTransaction } from "@/actions/transaction"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectGroup, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import ReceiptScanner from './receipt-scanner';

type TransactionFormValues = z.infer<typeof transactionSchema>;

type Account = {
  id: string;
  name: string;
  balance: number | string;
  isDefault: boolean;
  [key: string]: any; // remove once you know the full shape
};

type Category = {
  id: string;
  name: string;
  type: string;
  [key: string]: any; // remove once you know the full shape
};

type InitialData = {
  type: string;
  amount: number | string;
  description?: string;
  accountId: string;
  date: string | Date;
  isRecurring: boolean;
  recurringInterval?: string;
  [key: string]: any;
};

const AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}: {
  accounts: Account[];
  categories: Category[];
  editMode?: boolean;
  initialData?: InitialData | null;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData ?
        {
          type: initialData.type,
          amount: initialData.amount.toString(),
          description: initialData.description,
          accountId: initialData.accountId,
          date: new Date(initialData.date),
          isRecurring: initialData.isRecurring,
          ...(initialData.recurringInterval && { recurringInterval: initialData.recurringInterval })
        } : {
          type: "EXPENSE",
          amount: "",
          description: "",
          accountId: accounts.find((ac) => ac.isDefault)?.id,
          date: new Date(),
          isRecurring: false,
        }
  } as any); // cast the whole config if TS still complains about defaultValues shape vs schema

  const handleScanComplete = (scannedData: any) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        const matchedCategory = categories.find((cat) => cat.id === scannedData.category || cat.name.toLowerCase() === scannedData.category.toLowerCase());
        if (matchedCategory) {
          setValue("category", matchedCategory.id);
        }
      }
    }
  };
  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction) as unknown as {
    loading: boolean;
    fn: (...args: any[]) => Promise<any>;
    data: { success?: boolean; data?: { accountId: string } } | undefined;
  };
  const type = watch("type");
  const isRecurring = watch('isRecurring');
  const date = watch("date");
  const category = watch("category");
  const filteredCategories = categories.filter((category) => category.type === type);
  const onSubmit = async (data: TransactionFormValues) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount as unknown as string),
    };
    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };
  useEffect(() => {
    console.log("transactionResult:", transactionResult, "loading:", transactionLoading);

    if (transactionResult?.success && !transactionLoading) {
      toast.success(editMode ? " Transaction updated successfully" : "Transaction created successfully");
      reset();
      router.push(`/account/${transactionResult.data?.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode])
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Type</label>
        <Select onValueChange={(value) => setValue("type", value as TransactionFormValues["type"])} defaultValue={type}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className='text-sm text-red-500'>{errors.type.message}</p>
        )}
      </div>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Amount</label>
          <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
          {errors.amount && (
            <p className='text-sm text-red-500'>{errors.amount.message}</p>
          )}
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Account</label>
          <Select onValueChange={(value) => setValue("accountId", value)} defaultValue={getValues("accountId")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (${parseFloat(account.balance as string).toFixed(2)})
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button variant="ghost" className='w-full select-none items-center text-sm outline-none'>Create Account</Button>
                </CreateAccountDrawer>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className='text-sm text-red-500'>{errors.accountId.message}</p>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Category</label>
        <Select onValueChange={(value) => setValue("category", value)} value={category}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className='text-sm text-red-500'>{errors.category.message}</p>
        )}
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className='w-full pl-3 text-left font-normal'>
              {" "}
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar mode='single' selected={date} onSelect={(date) => setValue("date", date as Date)} disabled={(date) => date > new Date() || date < new Date("1990-01-01")} />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className='text-sm text-red-500'>{errors.date.message}</p>
        )}
      </div>

      <div className='mt-3'>
        <label className='text-sm font-medium'> Description </label>
        <Input placeholder='Enter description....' {...register("description")}></Input>
        {errors.description && (
          <p className='text-sm text-red-500'>{errors.description.message}</p>
        )}
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3 mt-5">
        <div className="space-y-0.5">
          <label className="text-sm font-medium cursor-pointer">Recurring Transaction </label>
          <p className="text-sm text-muted-foreground">
            Set up a Recurring schedule for this transaction.
          </p>
        </div>

        <Switch checked={isRecurring} onCheckedChange={(checked) => setValue("isRecurring", checked)}></Switch>
      </div>

      {isRecurring &&
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Recurring Interval</label>
          <Select onValueChange={(value) => setValue("recurringInterval", value as any)} defaultValue={getValues("recurringInterval")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='DAILY'>Daily</SelectItem>
                <SelectItem value='WEEKLY'>Weekly</SelectItem>
                <SelectItem value='MONTHLY'>Monthly</SelectItem>
                <SelectItem value='YEARLY'>Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className='text-sm text-red-500'>{errors.recurringInterval.message}</p>
          )}
        </div>

      }
      <div>
        <Button type='button' variant="outline" className='w-full mt-5' onClick={() => router.back()}>Cancel</Button>
        <Button type='submit' className='w-full' disabled={transactionLoading} >
          {transactionLoading ? (
            <>
              {""}
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? ("Updating Transaction") : ("Creating Transaction")}
            </>
          ) : editMode ? ("Update Transaction") : ("Create Transaction")}
        </Button>
      </div>
    </form>
  )
}

export default AddTransactionForm