'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Calculator,
  Check,
  X,
  Percent,
  Users,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Receipt,
  Banknote,
  Wallet,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentWorkspaceProps {
  mode?: 'embedded' | 'modal';
  groupedItems: any[];
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  calculateTotalWithDiscount: () => number;
  serviceTaxPercentage: number;
  serviceTaxValue: number;
  discountType: 'percentage' | 'value';
  setDiscountType: (type: 'percentage' | 'value') => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  splitCount: number;
  setSplitCount: (count: number) => void;
  calculatorDisplay: string;
  setCalculatorDisplay: (value: string | ((prev: string) => string)) => void;
  payments: any[];
  addPayment: (payment: any) => void;
  removePayment: (id: string) => void;
  handleCompletePayment: () => void;
  reopenTable?: () => void;
  selectedTable?: any;
  loading?: boolean;
}

export default function PaymentWorkspace({
  mode = 'embedded',
  groupedItems,
  calculateSubtotal,
  calculateTotal,
  calculateTotalWithDiscount,
  serviceTaxPercentage,
  serviceTaxValue,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  splitCount,
  setSplitCount,
  calculatorDisplay,
  setCalculatorDisplay,
  payments,
  addPayment,
  removePayment,
  handleCompletePayment,
  reopenTable,
  selectedTable,
  loading = false
}: PaymentWorkspaceProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number, isRodizioItem: boolean = false) => {
    if (value === 0 && isRodizioItem) {
      return 'Incluso';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const totalWithDiscount = calculateTotalWithDiscount();
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalWithDiscount - totalPaid);
  const perPersonAmount = totalWithDiscount / splitCount;

  // Função para processar entrada da calculadora
  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
    } else if (value === '⌫') {
      setCalculatorDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (value === '.') {
      if (!calculatorDisplay.includes('.')) {
        setCalculatorDisplay(prev => prev + '.');
      }
    } else {
      setCalculatorDisplay(prev => prev === '0' ? value : prev + value);
    }
  };

  // Função para adicionar pagamento
  const handleAddPayment = () => {
    const amount = parseFloat(calculatorDisplay) || 0;
    if (amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (amount > remaining + 0.01) {
      toast.error('Valor excede o restante a pagar');
      return;
    }

    addPayment({
      id: Date.now().toString(),
      method: selectedPaymentMethod,
      amount: amount,
      timestamp: new Date()
    });

    setCalculatorDisplay('0');
    
    if (amount >= remaining - 0.01) {
      toast.success('Pagamento completo! Clique em Finalizar.');
    }
  };

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: Banknote, color: 'bg-green-500' },
    { id: 'credit', name: 'Crédito', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit', name: 'Débito', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'pix', name: 'PIX', icon: Smartphone, color: 'bg-orange-500' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header com Totais - Fixo no topo */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-white" />
            <h2 className="text-lg font-bold text-white">Mesa {selectedTable?.number}</h2>
          </div>
          
          {/* Totais principais */}
          <div className="flex items-center gap-6 text-white">
            <div className="text-right">
              <p className="text-xs opacity-80">Total</p>
              <p className="font-bold">{formatCurrency(totalWithDiscount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Pago</p>
              <p className="font-bold text-green-300">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Restante</p>
              <p className="font-bold text-yellow-300">{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 3 colunas */}
      <div className="flex-1 grid grid-cols-[1.2fr_1fr_0.8fr] gap-4 p-4 overflow-hidden">
        
        {/* Coluna Esquerda - Resumo dos Itens */}
        <div className="flex flex-col h-full">
          <Card className="bg-gray-800 border-gray-700 flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <CardHeader className="py-3 flex-shrink-0">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Itens da Conta</span>
                <span className="text-orange-400">{groupedItems.length} itens</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 overflow-hidden" style={{ height: 'calc(100vh - 320px)' }}>
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2 pr-1">
                  {groupedItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`relative flex justify-between items-center p-2 rounded-lg transition-colors ${
                        item.status === 'cancelled' 
                          ? 'bg-red-900/30 border border-red-800/50 opacity-75' 
                          : 'bg-gray-700/50 hover:bg-gray-700/70'
                      }`}
                    >
                      {/* Horário - centralizado */}
                      {item.launched_at && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <div className={`${item.status === 'cancelled' ? 'text-red-400' : 'text-green-400'} flex flex-col items-center justify-center opacity-60`}>
                            <Clock className="h-2 w-2 mb-0.5" />
                            <div className="flex items-center">
                              {(() => {
                                const date = new Date(item.launched_at);
                                const hours = date.getHours().toString().padStart(2, '0');
                                const minutes = date.getMinutes().toString().padStart(2, '0');
                                const seconds = date.getSeconds().toString().padStart(2, '0');
                                return (
                                  <>
                                    <span className="text-[10px] font-medium">{hours}:{minutes}</span>
                                    <span className="text-[8px] font-normal opacity-80">:{seconds}</span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 px-2">
                        <div className={`font-medium text-sm ${
                          item.status === 'cancelled' ? 'text-red-400 line-through' : 'text-white'
                        }`}>
                          {item.item?.name || 'Produto'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(item.unit_price, true)} × {item.quantity}
                          {item.status === 'cancelled' && (
                            <span className="ml-2 text-red-400">(Cancelado)</span>
                          )}
                        </div>
                      </div>
                      <div className={`font-bold text-sm px-2 ${
                        item.status === 'cancelled' ? 'text-red-400 line-through' : 'text-orange-400'
                      }`}>
                        {formatCurrency(item.total_price, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Central - Ajustes e Calculadora */}
        <div className="flex flex-col gap-3">
          {/* Desconto e Divisão */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-3">
              <div className="space-y-3">
                {/* Desconto */}
                <div>
                  <Label className="text-xs text-gray-400">Desconto</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      size="sm"
                      onClick={() => setDiscountType('percentage')}
                      className={cn(
                        "h-7 px-2",
                        discountType === 'percentage' ? "bg-orange-600" : "bg-gray-700"
                      )}
                    >
                      %
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDiscountType('value')}
                      className={cn(
                        "h-7 px-2",
                        discountType === 'value' ? "bg-orange-600" : "bg-gray-700"
                      )}
                    >
                      R$
                    </Button>
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="h-7 flex-1 bg-gray-700 border-gray-600 text-white text-sm"
                      placeholder="0"
                    />
                  </div>
                  {discountValue > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      Desconto: {formatCurrency(
                        discountType === 'percentage'
                          ? (calculateTotal() * discountValue / 100)
                          : discountValue
                      )}
                    </p>
                  )}
                </div>

                {/* Divisão */}
                <div>
                  <Label className="text-xs text-gray-400">Dividir em</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="1"
                      value={splitCount}
                      onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-7 w-20 bg-gray-700 border-gray-600 text-white text-sm"
                    />
                    <span className="text-xs text-gray-400">pessoas</span>
                    {splitCount > 1 && (
                      <span className="text-xs text-orange-400 ml-auto">
                        {formatCurrency(perPersonAmount)} cada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculadora */}
          <Card className="bg-gray-800 border-gray-700 flex-1">
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Calculadora</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {/* Display */}
              <div className="bg-black rounded p-2 mb-2">
                <p className="text-xl font-mono text-green-400 text-right">
                  R$ {calculatorDisplay}
                </p>
              </div>

              {/* Valores Rápidos */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                <Button
                  size="sm"
                  onClick={() => setCalculatorDisplay(remaining.toFixed(2))}
                  className="h-7 text-xs bg-gray-700 hover:bg-gray-600"
                  disabled={remaining <= 0}
                >
                  Restante
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCalculatorDisplay('50.00')}
                  className="h-7 text-xs bg-gray-700 hover:bg-gray-600"
                >
                  R$ 50
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCalculatorDisplay('100.00')}
                  className="h-7 text-xs bg-gray-700 hover:bg-gray-600"
                >
                  R$ 100
                </Button>
              </div>

              {/* Teclado Numérico */}
              <div className="grid grid-cols-3 gap-1">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '⌫'].map((btn) => (
                  <Button
                    key={btn}
                    size="sm"
                    onClick={() => handleCalculatorInput(btn)}
                    className={cn(
                      "h-8 text-sm font-bold",
                      btn === '⌫' ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
                    )}
                  >
                    {btn}
                  </Button>
                ))}
              </div>

              {/* Limpar */}
              <Button
                size="sm"
                onClick={() => handleCalculatorInput('C')}
                className="w-full h-7 mt-1 bg-gray-700 hover:bg-gray-600 text-xs"
              >
                Limpar
              </Button>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <div className="grid grid-cols-2 gap-1">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.id}
                  size="sm"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={cn(
                    "h-10 flex flex-col gap-0 py-1",
                    selectedPaymentMethod === method.id
                      ? method.color
                      : "bg-gray-700 hover:bg-gray-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{method.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Botão Adicionar Pagamento */}
          <Button
            onClick={handleAddPayment}
            disabled={parseFloat(calculatorDisplay) <= 0 || remaining <= 0}
            className="h-10 bg-green-600 hover:bg-green-700 font-bold"
          >
            <Check className="h-4 w-4 mr-1" />
            Adicionar Pagamento
          </Button>
        </div>

        {/* Coluna Direita - Histórico e Finalizar */}
        <div className="flex flex-col gap-3">
          {/* Histórico de Pagamentos */}
          <Card className="bg-gray-800 border-gray-700 flex-1 flex flex-col">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 py-2 overflow-hidden">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p className="text-xs text-gray-400">Nenhum pagamento</p>
                    </div>
                  ) : (
                    payments.map((payment) => {
                      const method = paymentMethods.find(m => m.id === payment.method);
                      const Icon = method?.icon || Wallet;
                      
                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-2 bg-gray-700 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded", method?.color || 'bg-gray-600')}>
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-white">{method?.name}</p>
                              <p className="text-xs text-gray-400">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePayment(payment.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Resumo Final */}
          {payments.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Pago</span>
                    <span className="font-bold text-green-400">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Restante</span>
                    <span className={cn(
                      "font-bold",
                      remaining > 0 ? "text-red-400" : "text-green-400"
                    )}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  {remaining <= 0 && totalPaid > totalWithDiscount && (
                    <div className="flex justify-between pt-2 border-t border-gray-600">
                      <span className="text-gray-400">Troco</span>
                      <span className="font-bold text-yellow-400">
                        {formatCurrency(totalPaid - totalWithDiscount)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão Finalizar - Sempre visível no final */}
          <Button
            onClick={handleCompletePayment}
            disabled={remaining > 0.01 || loading}
            className={cn(
              "h-12 font-bold text-base",
              remaining > 0.01 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 animate-pulse"
            )}
          >
            {loading ? (
              <>Processando...</>
            ) : remaining > 0.01 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Falta {formatCurrency(remaining)}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Finalizar Conta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}