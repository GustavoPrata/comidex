"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Key, Copy, RefreshCw, Shield, Check } from "lucide-react";
import { useState } from "react";

export default function ApiPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "sk_live_abcd1234efgh5678ijkl9012mnop3456";
  const apiUrl = "https://api.comidex.com/v1";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: "GET", path: "/items", description: "Listar todos os itens do cardápio" },
    { method: "POST", path: "/orders", description: "Criar novo pedido" },
    { method: "GET", path: "/tables", description: "Listar status das mesas" },
    { method: "PUT", path: "/tables/:id", description: "Atualizar status da mesa" },
    { method: "GET", path: "/orders/:id", description: "Detalhes do pedido" },
    { method: "POST", path: "/printer-queue", description: "Adicionar item à fila de impressão" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API</h1>
        <Button variant="outline">
          <Code className="h-4 w-4 mr-2" />
          Documentação Completa
        </Button>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Chave de API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono">
              {apiKey}
            </code>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(apiKey)}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Mantenha sua chave segura. Não compartilhe com terceiros.</span>
          </div>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL Base</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="block p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono">
            {apiUrl}
          </code>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    endpoint.method === "GET"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : endpoint.method === "POST"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                <span className="text-sm text-gray-500">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Request */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Requisição</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto">
            <code className="text-sm">{`curl -X GET \\
  ${apiUrl}/items \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}