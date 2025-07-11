import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ProfitLossDisplayProps {
  totalIncome: number;
  totalExpense: number;
}

export function ProfitLossDisplay({ totalIncome, totalExpense }: ProfitLossDisplayProps) {
  const netAmount = totalIncome - totalExpense;
  const isProfit = netAmount >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold text-success">₹{totalIncome.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-success" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Expense</p>
            <p className="text-2xl font-bold text-destructive">₹{totalExpense.toLocaleString()}</p>
          </div>
          <TrendingDown className="h-8 w-8 text-destructive" />
        </div>
      </Card>

      <Card className={`p-6 bg-gradient-to-br ${isProfit ? 'from-success/10 to-success/5 border-success/20' : 'from-destructive/10 to-destructive/5 border-destructive/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
            <p className={`text-2xl font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
              ₹{Math.abs(netAmount).toLocaleString()}
            </p>
            <p className={`text-sm font-medium ${isProfit ? 'text-success' : 'text-destructive'}`}>
              {isProfit ? 'Profit' : 'Loss'}
            </p>
          </div>
          <span className={`text-2xl font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>₹</span>
        </div>
      </Card>
    </div>
  );
}