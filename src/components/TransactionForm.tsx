import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Camera, X, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from './TransactionCard';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  initialType?: 'income' | 'expense';
  initialAmount?: number;
}

export function TransactionForm({ onSubmit, onCancel, initialType = 'expense', initialAmount = 0 }: TransactionFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(initialAmount.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Audio recording in progress..."
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Audio saved successfully"
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoUrl(undefined);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removeAudio = () => {
    setAudioUrl(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      name: name.trim(),
      amount: parseFloat(amount),
      date,
      time,
      type,
      audioUrl,
      photoUrl
    });

    // Reset form
    setName('');
    setAmount('0');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setAudioUrl(undefined);
    setPhotoUrl(undefined);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Transaction</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Type Selection */}
        <div className="space-y-2">
          <Label>Transaction Type</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
              className={type === 'income' ? 'bg-success text-success-foreground' : ''}
            >
              Income
            </Button>
            <Button
              type="button"
              variant={type === 'expense' ? 'destructive' : 'outline'}
              onClick={() => setType('expense')}
            >
              Expense
            </Button>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="name">Transaction Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter transaction name"
            required
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Audio Recording */}
        <div className="space-y-2">
          <Label>Audio Recording</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Stop Recording' : 'Record Audio'}
            </Button>
            {audioUrl && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Audio recorded</Badge>
                <Button type="button" variant="ghost" size="sm" onClick={removeAudio}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photo</Label>
          <div className="space-y-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Upload Photo
            </Button>
            {photoUrl && (
              <div className="relative inline-block">
                <img
                  src={photoUrl}
                  alt="Transaction"
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Add Transaction
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}