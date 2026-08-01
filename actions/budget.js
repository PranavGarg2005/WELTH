"use server";
import { auth} from "@clerk/nextjs/server";
import {db} from "@/lib/prisma";
import { type } from "node:os";
import { revalidatePath } from "next/cache";
export async function getCurrentBudget(accountId) {
  try{
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {clerkUserId: userId},
    });

    if (!user) throw new Error("User not found");

    const budget = await db.budget.findFirst({
      where: { userId : user.id },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endofMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0);

    console.log("DEBUG accountId:", accountId);
    console.log("DEBUG date range:", startOfMonth, "to", endofMonth);

    const allTxForAccount = await db.transaction.findMany({
      where: { userId: user.id, accountId },
    });
    console.log("DEBUG all transactions for this account:", allTxForAccount);
    const sameMonthTx = allTxForAccount.filter(t => 
  t.date >= startOfMonth && t.date <= endofMonth
);
console.log("DEBUG same month tx count:", sameMonthTx.length);
console.log("DEBUG same month tx types:", sameMonthTx.map(t => t.type));

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endofMonth },
        accountId,
      },
      _sum:{ amount: true },
    });

    console.log("DEBUG expenses aggregate:", expenses);

    return {
      budget: budget ? {...budget , amount: budget.amount.toNumber()} : null, 
      currentExpenses: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0,
    }
  } catch(error){
    console.error("Error Fetching budget: ",error);
    throw error;
  }
}

export async function updateBudget(amount) {
    try{
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {clerkUserId: userId},
    });

    if (!user) throw new Error("User not found");

  //   const budget = await db.budget.findFirst({
  //   where: {
  //     userId : user.id,
  //   },
  // });
  const budget = await db.budget.upsert({
    where:{
      userId: user.id,
    },
    update: {
      amount,
    },
    create:{
      userId: user.id,
      amount,
    },
  });

  revalidatePath("/dashboard");
  return {
    success: true,
    data: { ...budget , amount: budget.amount.toNumber()},
  };
  }
  catch(error){
    console.error("Error updating budget:",error);
    return {success: false, error: error.message};
  }
}
