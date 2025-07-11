import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Play, Pause, Image as ImageIcon, Calendar, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  time: string;
  type: 'income' | 'expense';
  audioUrl?: string;
  photoUrl?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audio] = useState<HTMLAudioElement | null>(
    transaction.audioUrl ? new Audio(transaction.audioUrl) : null
  );

  const handlePlayAudio = () => {
    if (!audio) return;

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(transaction.id);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-accent/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{transaction.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={transaction.type === 'income' ? 'default' : 'destructive'}
                className={transaction.type === 'income' ? 'bg-success text-success-foreground' : ''}
              >
                {transaction.type === 'income' ? 'Income' : 'Expense'}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">₹</span>
          <span className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
            {transaction.amount.toLocaleString()}
          </span>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{transaction.time}</span>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-3">
          {transaction.audioUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAudio}
              className="flex items-center gap-2"
            >
              {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              Audio
            </Button>
          )}
          
          {transaction.photoUrl && (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <img
                src={transaction.photoUrl}
                alt={transaction.name}
                className="w-16 h-16 object-cover rounded-md border"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}