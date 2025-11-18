'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Wallet,
  Calculator,
  Check,
  X,
  Percent,
  Hash,
  Users,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Receipt,
  Home,
  Banknote
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
  setCalculatorDisplay: (value: string) => void;
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [step, setStep] = useState<'summary' | 'payment'>('summary');
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
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
    if (!selectedPaymentMethod) {
      toast.error('Selecione um método de pagamento');
      return;
    }

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

    // Limpar para próximo pagamento
    setCalculatorDisplay('0');
    setSelectedPaymentMethod('');
    
    // Se pagou tudo, avança automaticamente
    if (amount >= remaining - 0.01) {
      toast.success('Pagamento completo! Finalize a conta.');
    }
  };

  // Função para adicionar valor rápido
  const handleQuickAmount = (value: number) => {
    setCalculatorDisplay(value.toFixed(2));
  };

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: Banknote, color: 'bg-green-500' },
    { id: 'credit', name: 'Crédito', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit', name: 'Débito', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'pix', name: 'PIX', icon: Smartphone, color: 'bg-orange-500' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      {/* Header com Status */}
      <div className="bg-orange-600 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              Fechamento - Mesa {selectedTable?.number}
            </h2>
          </div>
          {reopenTable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reopenTable}
              className="text-white hover:bg-orange-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Reabrir Mesa
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6 overflow-auto">
        {step === 'summary' ? (
          /* Etapa 1: Resumo e Ajustes */
          <div className="space-y-6">
            {/* Resumo da Conta */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Resumo da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de itens */}
                <ScrollArea className="h-48 pr-4">
                  <div className="space-y-2">
                    {groupedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-white">{item.item?.name || 'Produto'}</div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(item.unit_price)} × {item.quantity}
                          </div>
                        </div>
                        <div className="text-orange-400 font-bold">
                          {formatCurrency(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="my-4 border-t border-gray-600" />
                
                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {serviceTaxPercentage > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Taxa de Serviço ({serviceTaxPercentage}%)</span>
                      <span className="font-mono">{formatCurrency(serviceTaxValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span className="font-mono text-orange-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desconto e Divisão lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              {/* Desconto */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Desconto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={discountType === 'percentage' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('percentage')}
                        className={cn(
                          "flex-1",
                          discountType === 'percentage' 
                            ? "bg-orange-600 hover:bg-orange-700" 
                            : "border-gray-600 text-gray-300"
                        )}
                      >
                        %
                      </Button>
                      <Button
                        size="sm"
                        variant={discountType === 'value' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('value')}
                        className={cn(
                          "flex-1",
                          discountType === 'value' 
                            ? "bg-orange-600 hover:bg-orange-700" 
                            : "border-gray-600 text-gray-300"
                        )}
                      >
                        R$
                      </Button>
                    </div>
                    
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />

                    {discountValue > 0 && (
                      <div className="text-sm text-green-400">
                        Desconto: {formatCurrency(
                          discountType === 'percentage'
                            ? (calculateTotal() * discountValue / 100)
                            : discountValue
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Divisão da Conta */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Dividir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      min="1"
                      value={splitCount}
                      onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    
                    {splitCount > 1 && (
                      <div className="p-2 bg-gray-700 rounded text-center">
                        <p className="text-xs text-gray-400">Por pessoa</p>
                        <p className="text-lg font-bold text-orange-400">
                          {formatCurrency(perPersonAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Final */}
            {(discountValue > 0 || splitCount > 1) && (
              <Card className="bg-orange-900/30 border-orange-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-white">Total Final</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {formatCurrency(totalWithDiscount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botão para Avançar */}
            <Button
              onClick={() => setStep('payment')}
              className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700"
            >
              Avançar para Pagamento
              <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          /* Etapa 2: Pagamento */
          <div className="space-y-6">
            {/* Resumo Compacto */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(totalWithDiscount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pago</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Restante</p>
                    <p className="text-lg font-bold text-orange-400">
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout em duas colunas */}
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna Esquerda - Métodos e Calculadora */}
              <div className="space-y-4">
                {/* Métodos de Pagamento */}
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Método de Pagamento
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <Button
                          key={method.id}
                          variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={cn(
                            "h-16 flex flex-col gap-1",
                            selectedPaymentMethod === method.id
                              ? method.color
                              : "border-gray-600 text-gray-300 hover:bg-gray-800"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{method.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Valores Rápidos */}
                {remaining > 0 && (
                  <div>
                    <Label className="text-gray-300 mb-2 block text-sm">
                      Valores Rápidos
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAmount(remaining)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Restante
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAmount(perPersonAmount)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        1 Pessoa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAmount(50)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        R$ 50
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAmount(100)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        R$ 100
                      </Button>
                    </div>
                  </div>
                )}

                {/* Calculadora */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Display */}
                      <div className="bg-gray-900 p-3 rounded">
                        <p className="text-2xl font-mono text-white text-right">
                          R$ {calculatorDisplay}
                        </p>
                      </div>

                      {/* Teclado Numérico */}
                      <div className="grid grid-cols-3 gap-1">
                        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '⌫'].map((btn) => (
                          <Button
                            key={btn}
                            variant="outline"
                            onClick={() => handleCalculatorInput(btn)}
                            className="h-10 text-sm border-gray-600 text-white hover:bg-gray-700"
                          >
                            {btn}
                          </Button>
                        ))}
                      </div>

                      {/* Botões de Ação */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleCalculatorInput('C')}
                          className="h-10 border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          Limpar
                        </Button>
                        <Button
                          onClick={handleAddPayment}
                          disabled={!selectedPaymentMethod || parseFloat(calculatorDisplay) <= 0}
                          className="h-10 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna Direita - Histórico de Pagamentos */}
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">
                      Pagamentos Registrados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2 pr-4">
                        {payments.length === 0 ? (
                          <div className="text-center py-8">
                            <Wallet className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                            <p className="text-gray-400">Nenhum pagamento registrado</p>
                          </div>
                        ) : (
                          payments.map((payment) => {
                            const method = paymentMethods.find(m => m.id === payment.method);
                            const Icon = method?.icon || Wallet;
                            
                            return (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn("p-2 rounded", method?.color || 'bg-gray-600')}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{method?.name}</p>
                                    <p className="text-xs text-gray-400">
                                      {formatCurrency(payment.amount)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removePayment(payment.id)}
                                  className="text-red-400 hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('summary')}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <Button
                onClick={handleCompletePayment}
                disabled={remaining > 0.01 || loading}
                className={cn(
                  "flex-1",
                  remaining > 0.01 
                    ? "bg-gray-600 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {loading ? (
                  <>Processando...</>
                ) : remaining > 0.01 ? (
                  <>Pagar Restante: {formatCurrency(remaining)}</>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Finalizar Conta
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}