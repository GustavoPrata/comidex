'use client';

import { useState, useEffect } from 'react';
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
  const [calcMemory, setCalcMemory] = useState<number>(0);
  const [calcOperation, setCalcOperation] = useState<string>('');
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [lastOperation, setLastOperation] = useState<string>('');
  const [operand2, setOperand2] = useState<number>(0);
  
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

  // Função de calculadora real
  const performOperation = () => {
    const inputValue = parseFloat(calculatorDisplay);
    
    if (calcOperation === '') {
      setCalcMemory(inputValue);
    } else {
      const newValue = calculate(calcMemory, inputValue, calcOperation);
      setCalculatorDisplay(String(newValue));
      setCalcMemory(newValue);
    }
    
    setWaitingForOperand(true);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch(operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '*': return firstValue * secondValue;
      case '/': return secondValue !== 0 ? firstValue / secondValue : 0;
      default: return secondValue;
    }
  };

  // Função para processar entrada da calculadora
  const handleCalculatorInput = (value: string) => {
    if (value === 'AC' || value === 'Escape') {
      setCalculatorDisplay('0');
      setCalcMemory(0);
      setCalcOperation('');
      setWaitingForOperand(false);
      setLastOperation('');
      setOperand2(0);
    } else if (value === '⌫' || value === 'Backspace') {
      if (!waitingForOperand) {
        setCalculatorDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      }
    } else if (value === '.' || value === ',') {
      if (!calculatorDisplay.includes('.')) {
        setCalculatorDisplay(prev => prev + '.');
      }
    } else if (['+', '-', '*', '/'].includes(value)) {
      performOperation();
      setCalcOperation(value);
      setLastOperation('');
    } else if (value === '=' || value === 'Enter') {
      if (calcOperation) {
        const inputValue = parseFloat(calculatorDisplay);
        setOperand2(inputValue);
        performOperation();
        setLastOperation(`${calcMemory} ${calcOperation} ${inputValue}`);
        setCalcOperation('');
        setWaitingForOperand(false);
      }
    } else if (/^[0-9]$/.test(value)) {
      if (waitingForOperand) {
        setCalculatorDisplay(value);
        setWaitingForOperand(false);
      } else {
        setCalculatorDisplay(prev => prev === '0' ? value : prev + value);
      }
    }
  };

  // Adicionar suporte ao teclado numpad - apenas quando não há input focado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Verificar se o elemento ativo é um input, textarea ou contenteditable
      const activeElement = document.activeElement as HTMLElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );
      
      // Só processar teclas se não houver input focado
      if (!isInputFocused) {
        // Aceitar números do numpad e do teclado principal
        if ((e.key >= '0' && e.key <= '9') || 
            e.key === '.' || e.key === ',' || 
            e.key === 'Enter' || e.key === 'Escape' || 
            e.key === 'Backspace' ||
            ['+', '-', '*', '/'].includes(e.key)) {
          e.preventDefault();
          handleCalculatorInput(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [calculatorDisplay, waitingForOperand, calcOperation, calcMemory, lastOperation, operand2]);

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

  // Componente do ícone PIX
  const PixIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.9 231.1 518.9 200.8 488.6L103.3 391.1H112.6C132.6 391.1 151.5 383.3 165.7 369.1L242.4 292.5zM262.5 218.9C256.1 224.4 247.9 224.5 242.4 218.9L165.7 142.2C151.5 127.1 132.6 120.2 112.6 120.2H103.3L200.7 22.76C231.1 -7.586 280.3 -7.586 310.6 22.76L407.8 119.9H392.6C372.6 119.9 353.7 127.7 339.5 141.9L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C261.9 245.6 271.3 241.1 278.5 234.8L355.5 157.8C365.3 148.1 378.2 142.5 392 142.5H430.3L488.6 200.8C518.9 231.1 518.9 280.3 488.6 310.6L430.3 368.9H392C378.2 368.9 365.3 363.3 355.5 353.5L278.5 276.5C264.6 262.6 240.3 262.6 226.4 276.6L149.7 353.2C139.1 363 126.4 368.6 112.6 368.6H80.78L22.76 310.6C-7.586 280.3 -7.586 231.1 22.76 200.8L80.78 142.7H112.6z"/>
    </svg>
  );

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: Banknote, color: 'bg-green-700' },
    { id: 'credit', name: 'Crédito', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit', name: 'Débito', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'pix', name: 'PIX', icon: PixIcon, color: 'bg-cyan-500' }
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

      {/* Grid de 3 colunas - com padding-bottom para o rodapé */}
      <div className="flex-1 grid grid-cols-[1.2fr_1fr_0.8fr] gap-4 p-4 pb-20 overflow-hidden">
        
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
                      className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                        item.status === 'cancelled' 
                          ? 'bg-red-900/30 border border-red-800/50 opacity-75' 
                          : 'bg-gray-700/50 hover:bg-gray-700/70'
                      }`}
                    >
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
                      <div className="flex flex-col items-end px-2">
                        <div className={`font-bold text-sm ${
                          item.status === 'cancelled' ? 'text-red-400 line-through' : 'text-orange-400'
                        }`}>
                          {formatCurrency(item.total_price, true)}
                        </div>
                        {item.launched_at && (
                          <div className={`text-[10px] ${item.status === 'cancelled' ? 'text-red-400' : 'text-green-400'} opacity-60`}>
                            {(() => {
                              const date = new Date(item.launched_at);
                              const hours = date.getHours().toString().padStart(2, '0');
                              const minutes = date.getMinutes().toString().padStart(2, '0');
                              const seconds = date.getSeconds().toString().padStart(2, '0');
                              return `${hours}:${minutes}:${seconds}`;
                            })()}
                          </div>
                        )}
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
                  <div className="flex gap-1 mt-1 items-center">
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
                    <Input
                      type="number"
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      maxLength={6}
                      className="h-7 w-20 bg-gray-700 border-gray-600 text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder=""
                    />
                    {discountValue > 0 && (
                      <span className="text-xs text-green-400 ml-auto">
                        -{formatCurrency(
                          discountType === 'percentage'
                            ? (calculateTotal() * discountValue / 100)
                            : discountValue
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divisão */}
                <div>
                  <Label className="text-xs text-gray-400">Dividir em</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                      className="h-7 w-7 p-0 bg-gray-700 hover:bg-gray-600"
                      disabled={splitCount <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={splitCount}
                      onChange={(e) => setSplitCount(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                      className="h-7 w-12 text-center bg-gray-700 border-gray-600 text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      size="sm"
                      onClick={() => setSplitCount(Math.min(99, splitCount + 1))}
                      className="h-7 w-7 p-0 bg-gray-700 hover:bg-gray-600"
                    >
                      +
                    </Button>
                    <span className="text-xs text-gray-400">pessoas</span>
                    {splitCount > 1 && (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-orange-400">
                          {formatCurrency(perPersonAmount)} cada
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setCalculatorDisplay(perPersonAmount.toFixed(2));
                            setCalcMemory(0);
                            setCalcOperation('');
                            setWaitingForOperand(false);
                            setLastOperation('');
                          }}
                          className="h-5 w-5 p-0 bg-gray-700 hover:bg-gray-600"
                          title="Copiar valor para calculadora"
                        >
                          <Calculator className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculadora funcional estilo Apple */}
          <Card className="bg-black border-gray-800 flex-1 overflow-hidden">
            <CardContent className="p-2">
              {/* Display estilo iPhone */}
              <div className="bg-black p-3 mb-2">
                <div className="text-right">
                  <p className="text-gray-400 text-sm h-5 font-light">
                    {lastOperation ? lastOperation.replace(/\./g, ',').replace('*', '×').replace('/', '÷') : 
                     calcOperation ? `${calcMemory.toString().replace('.', ',')} ${calcOperation.replace('*', '×').replace('/', '÷')}` : ' '}
                  </p>
                  <p className="text-white text-3xl font-light">
                    {calculatorDisplay === '0' ? '0' : calculatorDisplay.replace('.', ',')}
                  </p>
                </div>
              </div>

              {/* Grid compacto 5x4 */}
              <div className="grid grid-cols-4 gap-1">
                {/* Linha 1 */}
                <Button
                  onClick={() => handleCalculatorInput('AC')}
                  className="h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white text-sm font-normal p-0"
                >
                  AC
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('Backspace')}
                  className="h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white text-sm p-0"
                >
                  ⌫
                </Button>
                <Button
                  onClick={() => setCalculatorDisplay(String(parseFloat(calculatorDisplay) / 100))}
                  className="h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white text-sm p-0"
                >
                  %
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('/')}
                  className={cn(
                    "h-10 rounded-full text-white text-lg p-0",
                    calcOperation === '/' ? "bg-white text-orange-500" : "bg-orange-500 hover:bg-orange-400"
                  )}
                >
                  ÷
                </Button>

                {/* Linha 2 */}
                <Button
                  onClick={() => handleCalculatorInput('7')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  7
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('8')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  8
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('9')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  9
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('*')}
                  className={cn(
                    "h-10 rounded-full text-white text-lg p-0",
                    calcOperation === '*' ? "bg-white text-orange-500" : "bg-orange-500 hover:bg-orange-400"
                  )}
                >
                  ×
                </Button>

                {/* Linha 3 */}
                <Button
                  onClick={() => handleCalculatorInput('4')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  4
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('5')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  5
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('6')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  6
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('-')}
                  className={cn(
                    "h-10 rounded-full text-white text-lg p-0",
                    calcOperation === '-' ? "bg-white text-orange-500" : "bg-orange-500 hover:bg-orange-400"
                  )}
                >
                  −
                </Button>

                {/* Linha 4 */}
                <Button
                  onClick={() => handleCalculatorInput('1')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  1
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('2')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  2
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('3')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  3
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('+')}
                  className={cn(
                    "h-10 rounded-full text-white text-lg p-0",
                    calcOperation === '+' ? "bg-white text-orange-500" : "bg-orange-500 hover:bg-orange-400"
                  )}
                >
                  +
                </Button>

                {/* Linha 5 */}
                <Button
                  onClick={() => setCalculatorDisplay(remaining.toFixed(2))}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-[10px] p-0"
                  disabled={remaining <= 0}
                  title="Preencher valor restante"
                >
                  Total
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('0')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  0
                </Button>
                <Button
                  onClick={() => handleCalculatorInput(',')}
                  className="h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-base p-0"
                >
                  ,
                </Button>
                <Button
                  onClick={() => handleCalculatorInput('=')}
                  className="h-10 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-lg p-0"
                >
                  =
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <div className="grid grid-cols-2 gap-1">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              
              // Classes específicas para cada método com hover mantendo a mesma cor
              const getButtonClass = () => {
                if (!isSelected) return "bg-gray-700 hover:bg-gray-600";
                
                switch(method.id) {
                  case 'cash':
                    return "bg-green-700 hover:bg-green-700 ring-2 ring-white/30";
                  case 'credit':
                    return "bg-blue-500 hover:bg-blue-500 ring-2 ring-white/30";
                  case 'debit':
                    return "bg-purple-500 hover:bg-purple-500 ring-2 ring-white/30";
                  case 'pix':
                    return "bg-cyan-500 hover:bg-cyan-500 ring-2 ring-white/30";
                  default:
                    return "bg-gray-700 hover:bg-gray-600";
                }
              };
              
              return (
                <Button
                  key={method.id}
                  size="sm"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={cn(
                    "h-12 w-full flex items-center justify-between px-3 transition-all",
                    getButtonClass()
                  )}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span className="text-sm font-medium text-right">{method.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Botão Adicionar Pagamento */}
          <Button
            onClick={handleAddPayment}
            disabled={parseFloat(calculatorDisplay) <= 0 || remaining <= 0}
            className="w-full h-12 mt-2 bg-green-600 hover:bg-green-700 font-bold"
          >
            <Check className="h-5 w-5 mr-2" />
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
                          className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
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
      
      {/* Rodapé com botões - Fora da estrutura 70/30 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = '/pos'}
            variant="outline"
            className="h-10 px-6 text-gray-300 border-gray-600 hover:bg-gray-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          {reopenTable && (
            <Button
              onClick={reopenTable}
              className="h-10 px-6 bg-orange-600 hover:bg-orange-500 text-white font-medium"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Reabrir Mesa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}