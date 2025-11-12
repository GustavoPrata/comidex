"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, ShoppingCart, Plus, Loader2 } from "lucide-react";

const supabase = createClient();

interface RestaurantTable {
  id: number;
  number: string;
  capacity: number;
  type?: string;
  active: boolean;
}

interface TableSession {
  id: number;
  table_id: number;
  status: string;
  customer_count: number;
  opened_at: string;
  total: number;
}

export default function SimplePOSPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [sessions, setSessions] = useState<Map<number, TableSession>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('active', true)
        .order('number');

      if (tablesError) {
        console.error('Erro ao carregar mesas:', tablesError);
        toast.error('Erro ao carregar mesas');
      } else {
        setTables(tablesData || []);
      }

      // Load active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('status', 'active');

      if (sessionsError) {
        console.error('Erro ao carregar sessões:', sessionsError);
      } else {
        const sessionsMap = new Map();
        sessionsData?.forEach(session => {
          sessionsMap.set(session.table_id, session);
        });
        setSessions(sessionsMap);
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Open session
  const openSession = async (table: RestaurantTable) => {
    try {
      const { error } = await supabase
        .from('table_sessions')
        .insert({
          table_id: table.id,
          status: 'active',
          customer_count: 1,
          total: 0,
          opened_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success(`Mesa ${table.number} aberta!`);
      loadData(); // Reload data
    } catch (error) {
      console.error('Erro ao abrir mesa:', error);
      toast.error('Erro ao abrir mesa');
    }
  };

  // Close session
  const closeSession = async (tableId: number) => {
    const session = sessions.get(tableId);
    if (!session) return;

    try {
      const { error } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: session.total
        })
        .eq('id', session.id);

      if (error) throw error;
      toast.success('Mesa fechada!');
      loadData(); // Reload data
    } catch (error) {
      console.error('Erro ao fechar mesa:', error);
      toast.error('Erro ao fechar mesa');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sistema POS Simplificado</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {sessions.size} mesas ocupadas de {tables.length}
        </p>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {tables.map((table) => {
          const session = sessions.get(table.id);
          const isOccupied = !!session;
          
          return (
            <Card
              key={table.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isOccupied 
                  ? 'bg-orange-100 dark:bg-orange-950 border-orange-500' 
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-2">
                  {table.number}
                </div>
                <Badge variant={isOccupied ? "default" : "outline"}>
                  {table.capacity} lugares
                </Badge>
                {isOccupied && session && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.customer_count} pessoas
                    </p>
                    <p className="font-bold text-orange-600">
                      R$ {session.total.toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeSession(table.id);
                      }}
                    >
                      Fechar
                    </Button>
                  </div>
                )}
                {!isOccupied && (
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-green-500 hover:bg-green-600"
                    onClick={() => openSession(table)}
                  >
                    Abrir Mesa
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}