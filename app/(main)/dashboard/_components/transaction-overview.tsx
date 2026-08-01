"use client"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

type Account = {
  id: string;
  name: string;
  isDefault: boolean;
  [key: string]: any; // remove once you know the full shape
};

type Transaction = {
  id: string;
  accountId: string;
  date: string | Date;
  description?: string;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  [key: string]: any; // remove once you know the full shape
};

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

const DashboardOverview = ({
  accounts,
  transactions,
}: {
  accounts: Account[];
  transactions: Transaction[];
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(
    accounts?.find((account) => account.isDefault)?.id || accounts[0]?.id
  );

  const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc: Record<string, number>, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className='text-base font-normal'>Recent Transactions</CardTitle>
          <Select value={selectedAccountId} onValueChange={(value) => setSelectedAccountId(value)}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentTransactions.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>No recent transactions</p>
            ) : (
              recentTransactions.map((transaction) => {
                return (
                  <div key={transaction.id} className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {transaction.description || "Untitled Transaction"}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                    <div>
                      <div className={cn("flex items-center", transaction.type === "EXPENSE" ? "text-red-500" : "text-green-500")}>
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className='mr-1 h-4 w-4' />
                        ) : (
                          <ArrowUpRight className='mr-1 h-4 w-4' />
                        )}
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {pieChartData.length === 0 ? (
            <p className='text-center text-muted-foreground py-4'>
              No expenses this month
            </p>
          ) : (
            <div className='h-[300px]'>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} fill='#8884d8' label={({ name, value }) => `${name} : $${(value as number).toFixed(2)}`}>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <Legend />
              </ResponsiveContainer>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardOverview