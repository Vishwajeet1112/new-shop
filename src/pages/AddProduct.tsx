import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, Camera, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Product } from '@/components/ProductCatalog';

interface AddProductProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

const categories = {
  Biscuit: [
    "Good Day", "Butter & Bake", "Monaco Magic", "Dream Lite", "Hide & Seek", "Marie Gold", "Parle-G"
  ],
  Kurkura: [
    "Rude Bhujia", "Bhujia Dal", "Moon Dal", "Mastana Khush", "Kacha Aam", "Royal Use", "Tooya Chips", "Lage"
  ],
  Cigarette: [
    "Gold Flake", "Super Star", "Advance", "Four Square", "Indie Mint", "Indie Clove", "Gold Flake King",
    "Charm", "Charm King", "Editions", "Black Fite", "Royal White"
  ],
  Pani: ["Bisleri", "Kinley", "Aquafina", "Local Water"], // Example additions
  "Karga Diye Hai": ["Zeera", "Sprite", "Thums Up", "Other"]
};


const brands = [
  "Britannia", "Parle", "Cadbury", "ITC", "PepsiCo", "Coca Cola", "Bisleri", "Local"
];

export function AddProduct({ onAddProduct }: AddProductProps) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: '',
    subcategory: '',
    brand: '',
    description: '',
    inStock: true,
    image: '',
    audioRecording: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price > 0 && newProduct.category) {
      onAddProduct(newProduct);
      navigate(-1);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setNewProduct(prev => ({ ...prev, audioRecording: url }));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6">
      <Card className="p-6">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="mb-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
          <h3 className="text-lg font-semibold">Add New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
            />
            <Input
              type="number"
              placeholder="Price"
              value={newProduct.price || ''}
              onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
              required
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value, subcategory: ''})}
              required
            >
              <option value="">Select Category</option>
              {Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newProduct.subcategory}
              onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})}
            >
              <option value="">Select Subcategory</option>
              {newProduct.category && categories[newProduct.category as keyof typeof categories]?.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newProduct.brand}
              onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <Input
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              className="md:col-span-2"
            />
          </div>
          
          {/* Audio Recording */}
          <div className="space-y-2">
            <h4 className="font-medium">Audio Recording</h4>
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center gap-2"
              >
                <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              {newProduct.audioRecording && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const audio = new Audio(newProduct.audioRecording);
                    audio.play();
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <h4 className="font-medium">Photo</h4>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Upload Photo
              </Button>
              {newProduct.image && (
                <img src={newProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded" />
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}