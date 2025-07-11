import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CalculatorPage() {
  const navigate = useNavigate();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const onCalculationComplete = (amount: number, type: "income" | "expense") => {
    const params = new URLSearchParams();
    params.set("amount", amount.toString());
    params.set("type", type);
    params.set("from", "calculator");
    navigate({
      pathname: "/",
      search: params.toString(),
    });
  };

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const addAsIncome = () => {
    const value = parseFloat(display);
    if (!isNaN(value) && value > 0) {
      onCalculationComplete(value, 'income');
    }
  };

  const addAsExpense = () => {
    const value = parseFloat(display);
    if (!isNaN(value) && value > 0) {
      onCalculationComplete(value, 'expense');
    }
  };

  return (
    <div className="p-4">
        <Card className="p-6 bg-gradient-to-br from-card to-accent/20 shadow-lg max-w-md mx-auto">
        <div className="space-y-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>
            <div className="bg-background rounded-lg p-4 text-right">
            <div className="text-3xl font-mono font-bold text-foreground overflow-hidden">
                ₹{display}
            </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
            <Button variant="outline" onClick={clear} className="text-destructive">
                C
            </Button>
            <Button variant="outline" onClick={() => inputOperation('÷')}>
                ÷
            </Button>
            <Button variant="outline" onClick={() => inputOperation('×')}>
                ×
            </Button>
            <Button variant="outline" onClick={() => inputOperation('-')}>
                -
            </Button>

            <Button variant="ghost" onClick={() => inputNumber('7')}>
                7
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('8')}>
                8
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('9')}>
                9
            </Button>
            <Button variant="outline" onClick={() => inputOperation('+')} className="row-span-2">
                +
            </Button>

            <Button variant="ghost" onClick={() => inputNumber('4')}>
                4
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('5')}>
                5
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('6')}>
                6
            </Button>

            <Button variant="ghost" onClick={() => inputNumber('1')}>
                1
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('2')}>
                2
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('3')}>
                3
            </Button>
            <Button onClick={performCalculation} className="row-span-2 bg-primary text-primary-foreground">
                =
            </Button>

            <Button variant="ghost" onClick={() => inputNumber('0')} className="col-span-2">
                0
            </Button>
            <Button variant="ghost" onClick={() => inputNumber('.')}>
                .
            </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <Button onClick={addAsIncome} className="bg-success text-success-foreground hover:bg-success/90">
                Add as Income
            </Button>
            <Button onClick={addAsExpense} variant="destructive">
                Add as Expense
            </Button>
            </div>
        </div>
        </Card>
    </div>
  );
}