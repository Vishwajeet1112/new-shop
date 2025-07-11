import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AddProduct } from "./pages/AddProduct";
import { CalculatorPage } from "./pages/CalculatorPage";
import { AddTransactionPage } from "./pages/AddTransactionPage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useToast } from "./hooks/use-toast";
import { sampleProducts } from "./data/sampleProducts";
import { Product } from "./components/ProductCatalog";
import { Transaction } from "./components/TransactionCard";

const queryClient = new QueryClient();

const App = () => {
  const [products, setProducts] = useLocalStorage<Product[]>(
    "pocket-fortune-products",
    sampleProducts.map((product, index) => ({
      ...product,
      id: (index + 1).toString(),
    }))
  );
  const { toast } = useToast();
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "pocket-fortune-transactions",
    []
  );

  const handleAddProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    toast({
      title: "Product added",
      description: `${productData.name} has been added to your catalog.`,
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Product deleted",
      description: "Product has been removed from your catalog.",
    });
  };

  const handleBuyProduct = (product: Product) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Purchase: ${product.name}`,
      amount: product.price,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      type: "expense",
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    toast({
      title: "Product Purchased",
      description: `${product.name} has been added to your expenses.`,
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  products={products}
                  onDeleteProduct={handleDeleteProduct}
                  onBuyProduct={handleBuyProduct}
                  transactions={transactions}
                  setTransactions={setTransactions}
                />
              }
            />
            <Route
              path="/add-product"
              element={<AddProduct onAddProduct={handleAddProduct} />}
            />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route
              path="/add-transaction"
              element={
                <AddTransactionPage
                  setTransactions={setTransactions}
                  transactions={transactions}
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
