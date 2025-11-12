"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  LogOut, 
  FileText, 
  RotateCcw, 
  User, 
  Truck, 
  Coffee,
  MapPin,
  CreditCard as CardIcon,
  Package,
  Users,
  Home,
  ShoppingCart,
  X,
  Check,
  Delete,
  ArrowLeft
} from "lucide-react";

const supabase = createClient();

interface Item {
  id: number;
  name: string;
  price: number;
  category_id?: number;
}

interface CartItem {
  item: Item;
  quantity: number;
  total: number;
}

interface RestaurantTable {
  id: number;
  number: string;
  capacity: number;
  type?: string;
  active: boolean;
}

export default function POSPage() {
  const [inputValue, setInputValue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<string>("Mesa");
  const [items, setItems] = useState<Item[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [activeInput, setActiveInput] = useState<"code" | "quantity">("code");
  const [loading, setLoading] = useState(true);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
    // Focus on code input by default
    codeInputRef.current?.focus();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load items
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('active', true)
        .eq('available', true);
      
      setItems(itemsData || []);

      // Load tables
      const { data: tablesData } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('active', true)
        .order('number');

      setTables(tablesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle numpad input
  const handleNumpadClick = (value: string) => {
    if (activeInput === "code") {
      setInputValue(prev => prev + value);
    } else {
      setQuantity(prev => prev + value);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (activeInput === "code") {
      setInputValue(prev => prev.slice(0, -1));
    } else {
      setQuantity(prev => prev.slice(0, -1) || "1");
    }
  };

  // Handle clear
  const handleClear = () => {
    if (activeInput === "code") {
      setInputValue("");
    } else {
      setQuantity("1");
    }
  };

  // Handle confirm (add to cart)
  const handleConfirm = () => {
    if (!inputValue) {
      toast.error("Digite o código do produto");
      return;
    }

    // Find item by code or name
    const item = items.find(i => 
      i.id.toString() === inputValue || 
      i.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    if (!item) {
      toast.error("Produto não encontrado");
      return;
    }

    const qty = parseInt(quantity) || 1;
    
    // Add to cart
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => 
          c.item.id === item.id 
            ? { ...c, quantity: c.quantity + qty, total: (c.quantity + qty) * c.item.price }
            : c
        );
      } else {
        return [...prev, {
          item,
          quantity: qty,
          total: item.price * qty
        }];
      }
    });

    toast.success(`${item.name} adicionado`);
    setInputValue("");
    setQuantity("1");
    codeInputRef.current?.focus();
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
    toast.success("Item removido");
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace('.', ',');
  };

  // Action buttons configuration
  const actionButtons = [
    { icon: LogOut, label: "Sair", onClick: () => window.location.href = "/" },
    { icon: FileText, label: "Fechar contas", onClick: () => toast.info("Fechar contas") },
    { icon: RotateCcw, label: "Estornar ult. venda", onClick: () => toast.info("Estornar venda") },
    { icon: User, label: "Trocar vendedor", onClick: () => toast.info("Trocar vendedor") },
    { icon: Truck, label: "Mudar p/ delivery", onClick: () => setCurrentTable("Delivery") },
    { icon: Coffee, label: "Mudar p/ balcão", onClick: () => setCurrentTable("Balcão") },
    { icon: MapPin, label: "Abrir mapa", onClick: () => toast.info("Abrir mapa") },
    { icon: CardIcon, label: "Mudar p/ ficha crédito", onClick: () => toast.info("Ficha crédito") },
    { icon: Package, label: "Consultar material", onClick: () => toast.info("Consultar material") },
    { icon: Home, label: "Mudar p/ mesa", onClick: () => setCurrentTable("Mesa") },
    { icon: Users, label: "Consultar preço", onClick: () => toast.info("Consultar preço") },
    { icon: ShoppingCart, label: "Procurar pedido", onClick: () => toast.info("Procurar pedido") },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-white border-white">
            {currentTable}
          </Badge>
          <span className="text-sm text-gray-400">ComideX POS</span>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Products and Input */}
        <div className="flex-1 flex flex-col p-4">
          {/* Input Section */}
          <Card className="bg-gray-900 border-gray-700 mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Código do Item</label>
                  <Input
                    ref={codeInputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setActiveInput("code")}
                    onKeyPress={(e) => e.key === "Enter" && handleConfirm()}
                    className="bg-gray-800 border-gray-600 text-white text-2xl h-14"
                    placeholder="Digite ou escaneie"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Qtd</label>
                  <div className="flex gap-2">
                    <Input
                      ref={quantityInputRef}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      onFocus={() => setActiveInput("quantity")}
                      onKeyPress={(e) => e.key === "Enter" && handleConfirm()}
                      className="bg-gray-800 border-gray-600 text-white text-2xl h-14 w-24 text-center"
                      type="number"
                      min="1"
                    />
                    <Button 
                      onClick={() => setQuantity(prev => (parseInt(prev) + 1).toString())}
                      className="h-14 px-4 bg-gray-700 hover:bg-gray-600"
                    >
                      ▲
                    </Button>
                    <Button 
                      onClick={() => setQuantity(prev => Math.max(1, parseInt(prev) - 1).toString())}
                      className="h-14 px-4 bg-gray-700 hover:bg-gray-600"
                    >
                      ▼
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card className="flex-1 bg-gray-900 border-gray-700 overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>(Não há itens vendidos)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.item.name}</div>
                          <div className="text-sm text-gray-400">
                            {item.quantity} x R$ {formatCurrency(item.item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">
                            R$ {formatCurrency(item.total)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-700 pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-xl">
                  <span>Subtotal:</span>
                  <span>R$ {formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-orange-400">
                  <span>Total:</span>
                  <span>R$ {formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Numpad */}
        <div className="w-96 p-4 flex flex-col gap-4">
          {/* Numpad */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {/* Row 1 */}
                <Button
                  onClick={() => handleNumpadClick("7")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  7
                </Button>
                <Button
                  onClick={() => handleNumpadClick("8")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  8
                </Button>
                <Button
                  onClick={() => handleNumpadClick("9")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  9
                </Button>

                {/* Row 2 */}
                <Button
                  onClick={() => handleNumpadClick("4")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  4
                </Button>
                <Button
                  onClick={() => handleNumpadClick("5")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  5
                </Button>
                <Button
                  onClick={() => handleNumpadClick("6")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  6
                </Button>

                {/* Row 3 */}
                <Button
                  onClick={() => handleNumpadClick("1")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  1
                </Button>
                <Button
                  onClick={() => handleNumpadClick("2")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  2
                </Button>
                <Button
                  onClick={() => handleNumpadClick("3")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  3
                </Button>

                {/* Row 4 */}
                <Button
                  onClick={() => handleBackspace()}
                  className="h-16 text-xl bg-gray-700 hover:bg-gray-600"
                >
                  <ArrowLeft className="h-6 w-6 mx-auto" />
                </Button>
                <Button
                  onClick={() => handleNumpadClick("0")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  0
                </Button>
                <Button
                  onClick={() => handleNumpadClick(".")}
                  className="h-16 text-2xl bg-gray-700 hover:bg-gray-600"
                >
                  .
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                  onClick={handleClear}
                  className="h-16 bg-red-600 hover:bg-red-700 text-xl"
                >
                  <X className="h-8 w-8" />
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="h-16 bg-green-600 hover:bg-green-700 text-xl"
                >
                  <Check className="h-8 w-8" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 space-y-2">
              <div className="text-sm text-gray-400">Operador: Admin</div>
              <div className="text-sm text-gray-400">Terminal: 001</div>
              <div className="text-sm text-gray-400">
                Itens no carrinho: {cart.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-gray-900 border-t border-gray-700 p-2">
        <div className="flex gap-1 overflow-x-auto">
          {actionButtons.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="flex-shrink-0 h-20 px-3 bg-gray-700 hover:bg-gray-600 flex flex-col items-center justify-center gap-1"
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs text-center leading-tight max-w-[60px]">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black px-4 py-1 flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-4">
          <span>ID: A1014</span>
          <span>Loja 1 RESTAURANTE FILIAL</span>
          <span>Term: 001</span>
        </div>
        <div className="flex gap-4">
          <span>Usuário: Admin</span>
          <span>DB novo: {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}