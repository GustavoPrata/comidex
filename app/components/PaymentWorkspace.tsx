'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  X, 
  Minus, 
  Plus,
  Percent,
  Calculator,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

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
  setCalculatorDisplay: (display: string) => void;
  payments: any[];
  addPayment: (amount: number, method: string) => void;
  removePayment: (id: string) => void;
  handleCompletePayment: () => void;
  reopenTable?: () => void;
  selectedTable: any;
  loading: boolean;
}

export default function PaymentWorkspace({
  mode = 'modal',
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
  loading
}: PaymentWorkspaceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const remaining = calculateTotalWithDiscount() - payments.reduce((sum, p) => sum + p.amount, 0);
  const isFullyPaid = remaining <= 0.01;

  // Layout horizontal para modo embedded (70% da tela)
  if (mode === 'embedded') {
    return (
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Coluna Esquerda - Resumo e Descontos (4 colunas) */}
        <div className="col-span-4 flex flex-col gap-3">
          <Card className="bg-gray-800 border-gray-700 flex-1">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Resumo da Conta</span>
                <span className="text-orange-400">{formatCurrency(calculateSubtotal())}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <ScrollArea className="h-[280px]">
                <div className="space-y-1">
                  {groupedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/50 rounded text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.item?.name || 'Produto'}</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(item.unit_price)} × {
                            item.cancelledQuantity && item.cancelledQuantity > 0
                              ? `${item.quantity - item.cancelledQuantity}`
                              : item.quantity
                          }
                        </div>
                      </div>
                      <div className="text-orange-400 font-bold">
                        {formatCurrency(
                          item.cancelledQuantity && item.cancelledQuantity > 0
                            ? item.unit_price * (item.quantity - item.cancelledQuantity)
                            : item.total_price
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Card de Descontos e Totais */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-3">
              <div className="space-y-3">
                {/* Desconto */}
                <div>
                  <Label className="text-xs">Desconto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      onClick={() => setDiscountType('percentage')}
                      className={`h-7 ${discountType === 'percentage' ? 'bg-orange-600' : 'bg-gray-700'}`}
                    >
                      <Percent className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDiscountType('value')}
                      className={`h-7 ${discountType === 'value' ? 'bg-orange-600' : 'bg-gray-700'}`}
                    >
                      R$
                    </Button>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="flex-1 h-7 px-2 bg-gray-700 border border-gray-600 rounded text-sm"
                      placeholder={discountType === 'percentage' ? '0%' : 'R$ 0,00'}
                    />
                  </div>
                </div>

                {/* Totais */}
                <div className="space-y-1 text-sm">
                  {serviceTaxPercentage > 0 && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Taxa ({serviceTaxPercentage}%):</span>
                      <span>+{formatCurrency(serviceTaxValue)}</span>
                    </div>
                  )}
                  {discountValue > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Desconto:</span>
                      <span>
                        -{discountType === 'percentage' 
                          ? `${discountValue}%` 
                          : formatCurrency(discountValue)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                    <span>Total:</span>
                    <span className="text-orange-400">{formatCurrency(calculateTotalWithDiscount())}</span>
                  </div>
                </div>

                {/* Divisão */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">Dividir:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                      className="h-6 w-6 p-0 bg-gray-700"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-bold">{splitCount}</span>
                    <Button
                      size="sm"
                      onClick={() => setSplitCount(splitCount + 1)}
                      className="h-6 w-6 p-0 bg-gray-700"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {splitCount > 1 && (
                    <span className="text-xs text-gray-400">
                      {formatCurrency(calculateTotalWithDiscount() / splitCount)} cada
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Central - Calculadora (4 colunas) */}
        <div className="col-span-4">
          <Card className="bg-gray-800 border-gray-700 h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Calculadora</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="bg-black rounded p-2 text-right text-2xl font-mono text-green-400">
                {calculatorDisplay}
              </div>
              
              {/* Teclado */}
              <div className="grid grid-cols-3 gap-1 mt-3">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00', 'C'].map((key) => (
                  <Button
                    key={key}
                    onClick={() => {
                      if (key === 'C') {
                        setCalculatorDisplay('0');
                      } else if (calculatorDisplay === '0') {
                        setCalculatorDisplay(key);
                      } else {
                        setCalculatorDisplay(calculatorDisplay + key);
                      }
                    }}
                    className={`h-10 text-lg font-bold ${
                      key === 'C' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {key}
                  </Button>
                ))}
              </div>
              
              {/* Valores Rápidos */}
              <div className="grid grid-cols-4 gap-1 mt-3">
                {[10, 20, 50, 100].map((value) => (
                  <Button
                    key={value}
                    onClick={() => setCalculatorDisplay(value.toString())}
                    className="h-8 text-xs bg-gray-700 hover:bg-gray-600"
                  >
                    R${value}
                  </Button>
                ))}
              </div>
              
              {/* Métodos de Pagamento */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                  onClick={() => {
                    const amount = parseFloat(calculatorDisplay) || 0;
                    if (amount > 0) {
                      addPayment(amount, 'cash');
                      setCalculatorDisplay('0');
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 h-10"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Dinheiro
                </Button>
                <Button
                  onClick={() => {
                    const amount = parseFloat(calculatorDisplay) || 0;
                    if (amount > 0) {
                      addPayment(amount, 'credit');
                      setCalculatorDisplay('0');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 h-10"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Crédito
                </Button>
                <Button
                  onClick={() => {
                    const amount = parseFloat(calculatorDisplay) || 0;
                    if (amount > 0) {
                      addPayment(amount, 'debit');
                      setCalculatorDisplay('0');
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 h-10"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Débito
                </Button>
                <Button
                  onClick={() => {
                    const amount = parseFloat(calculatorDisplay) || 0;
                    if (amount > 0) {
                      addPayment(amount, 'pix');
                      setCalculatorDisplay('0');
                    }
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 h-10"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  PIX
                </Button>
              </div>

              {/* Botão Valor Total */}
              <Button
                onClick={() => setCalculatorDisplay(Math.ceil(remaining).toString())}
                className="w-full mt-2 bg-orange-600 hover:bg-orange-700 h-10"
                disabled={remaining <= 0}
              >
                Valor Restante: {formatCurrency(remaining)}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Pagamentos e Ações (4 colunas) */}
        <div className="col-span-4 flex flex-col gap-3">
          <Card className="bg-gray-800 border-gray-700 flex-1">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Pagamentos Realizados</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <ScrollArea className="h-[320px]">
                <div className="space-y-2">
                  {payments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum pagamento</p>
                    </div>
                  ) : (
                    payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                        <div>
                          <div className="text-sm font-medium">
                            {payment.method === 'cash' && 'Dinheiro'}
                            {payment.method === 'credit' && 'Crédito'}
                            {payment.method === 'debit' && 'Débito'}
                            {payment.method === 'pix' && 'PIX'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(payment.timestamp, 'HH:mm:ss')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-400">
                            {formatCurrency(payment.amount)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => removePayment(payment.id)}
                            className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Resumo e Ações */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-3">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Pago:</span>
                    <span className="font-bold text-green-400">
                      {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Restante:</span>
                    <span className={`font-bold ${remaining > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(Math.max(0, remaining))}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  {reopenTable && (
                    <Button
                      onClick={reopenTable}
                      variant="outline"
                      className="flex-1 text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Reabrir
                    </Button>
                  )}
                  <Button
                    onClick={handleCompletePayment}
                    disabled={!isFullyPaid || loading}
                    className={`flex-1 ${
                      isFullyPaid 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Layout vertical original para modo modal
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Implementação do modal original aqui se necessário */}
    </div>
  );
}