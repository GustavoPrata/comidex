'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PrinterIcon, CheckCircle2, XCircle, Loader2, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export default function PrinterTestPanel() {
  const [testing, setTesting] = useState(false);
  const [ip, setIp] = useState('192.168.86.191');
  const [port, setPort] = useState('9100');
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    
    try {
      // Primeiro testar a conexão
      const testResponse = await fetch('/api/printers/test-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, port: parseInt(port) })
      });
      
      const testResult = await testResponse.json();
      setConnectionStatus(testResult);
      
      if (testResult.success) {
        toast.success(`✅ Impressora conectada em ${ip}:${port}!`);
        
        // Tentar enviar um comando de teste
        toast('📄 Enviando teste de impressão...');
        
        // Adicionar impressora se não existir
        const discoverResponse = await fetch('/api/printers/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, ports: [parseInt(port)] })
        });
        
        const discoverResult = await discoverResponse.json();
        if (discoverResult.found) {
          toast.success('✅ Impressora pronta para uso!');
        }
      } else {
        toast.error(`❌ Falha na conexão: ${testResult.error}`);
        
        if (testResult.solution) {
          toast(`💡 ${testResult.solution}`);
        }
        
        // Se houver porta alternativa sugerida
        if (testResult.alternativePort) {
          setPort(testResult.alternativePort.toString());
          toast(`💡 Tente a porta ${testResult.alternativePort}`);
        }
      }
    } catch (error: any) {
      toast.error('❌ Erro ao testar impressora');
      setConnectionStatus({
        success: false,
        error: error.message || 'Erro desconhecido'
      });
    } finally {
      setTesting(false);
    }
  };

  const quickTest = async (testIp: string, testPort: number) => {
    setIp(testIp);
    setPort(testPort.toString());
    await testConnection();
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wifi className="h-5 w-5 text-orange-500" />
          Teste Direto de Impressora
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            type="text"
            placeholder="IP da impressora"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="col-span-2"
          />
          <Input
            type="number"
            placeholder="Porta"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            min="1"
            max="65535"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={testConnection}
            disabled={testing || !ip}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <PrinterIcon className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
          
          <Button
            onClick={() => quickTest('192.168.86.191', 9100)}
            variant="outline"
            disabled={testing}
            title="Testar IP específico do usuário"
            className="border-green-500 text-green-700 hover:bg-green-50"
          >
            192.168.86.191:9100
          </Button>
          
          <Button
            onClick={() => quickTest('192.168.1.100', 9100)}
            variant="outline"
            disabled={testing}
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            192.168.1.100
          </Button>
        </div>
        
        {/* Status da Conexão */}
        {connectionStatus && (
          <div className={`p-4 rounded-lg border ${
            connectionStatus.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {connectionStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className="font-medium">
                  {connectionStatus.success ? 'Conexão Estabelecida' : 'Falha na Conexão'}
                </p>
                <p className="text-sm text-gray-600">
                  {connectionStatus.message || connectionStatus.error}
                </p>
                {connectionStatus.details && (
                  <div className="text-xs text-gray-500 mt-2">
                    <p>IP: {connectionStatus.details.ip}</p>
                    <p>Porta: {connectionStatus.details.port}</p>
                    <p>Protocolo: {connectionStatus.details.protocol}</p>
                    <p>Status: {connectionStatus.details.status}</p>
                  </div>
                )}
                {connectionStatus.solution && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      💡 {connectionStatus.solution}
                    </p>
                  </div>
                )}
                {connectionStatus.checkedPorts && (
                  <p className="text-xs text-gray-500 mt-1">
                    Portas verificadas: {connectionStatus.checkedPorts.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>⚙️ Portas comuns: 9100 (padrão), 515 (LPR), 631 (IPP)</p>
          <p>📡 Certifique-se que a impressora está ligada e na mesma rede</p>
          <p>🔒 Verifique se não há firewall bloqueando a conexão</p>
        </div>
      </div>
    </Card>
  );
}