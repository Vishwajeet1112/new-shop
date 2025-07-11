import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calculator as CalculatorIcon, Package, TrendingUp } from 'lucide-react';
import { ProfitLossDisplay } from '@/components/ProfitLossDisplay';
import { TransactionCard, type Transaction } from '@/components/TransactionCard';
import { ProductCatalog, type Product } from '@/components/ProductCatalog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface IndexProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onBuyProduct: (product: Product) => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Index: React.FC<IndexProps> = ({ products, onDeleteProduct, onBuyProduct, transactions, setTransactions }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('from') === 'add-transaction') {
      setActiveTab('transactions');
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  // Calculate totals
  const { totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpense += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions]);


  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction deleted",
      description: "Transaction has been removed successfully."
    });
  };




  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
{/*               <h1 className="text-3xl font-bold">Pocket Fortune Keeper</h1> */}
              <h1 className="text-3xl font-bold">Shop</h1>
{/*               <p className="text-primary-foreground/80">Track your expenses, income, and manage your product catalog</p> */}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/calculator')}
                className="flex items-center gap-2"
              >
                <CalculatorIcon className="h-4 w-4" />
                Calculator
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/add-transaction')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profit/Loss Display */}
        <div className="mb-8">
          <ProfitLossDisplay totalIncome={totalIncome} totalExpense={totalExpense} />
        </div>


        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Transactions</h2>
              <div className="text-sm text-muted-foreground">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <CalculatorIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="mb-4">Start by adding your first income or expense</p>
                  <Button onClick={() => navigate('/add-transaction')} className="mx-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Transaction
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {transactions.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="catalog">
            <ProductCatalog
              products={products}
              onDeleteProduct={onDeleteProduct}
              onBuyProduct={onBuyProduct}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
