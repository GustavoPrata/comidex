"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Clock, DollarSign, Search, Plus } from "lucide-react"
import { toast } from "sonner"
import { useTables, openTableSession } from "@/lib/api/hooks"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function POSPage() {
  const { tables, isLoading, mutate } = useTables()
  const [selectedTable, setSelectedTable] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const handleTableClick = (table: any) => {
    setSelectedTable(table)
    if (!table.current_session) {
      toast.info(`Mesa ${table.number} está disponível. Clique em "Abrir Mesa" para iniciar atendimento.`)
    }
  }

  const handleOpenTable = async () => {
    if (selectedTable && !selectedTable.current_session) {
      try {
        await openTableSession({
          table_id: selectedTable.id,
          attendance_type: 'rodizio_premium',
          number_of_people: 2,
          customer_name: '',
          unit_price: 189.00,
          time_limit: 120
        })
        toast.success(`Mesa ${selectedTable.number} aberta com sucesso!`)
        mutate() // Refresh tables data
      } catch (error) {
        toast.error('Erro ao abrir mesa')
      }
    }
  }

  const getStatusColor = (table: any) => {
    if (table.current_session) return "bg-orange-100 border-orange-300"
    return "bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 border-gray-300"
  }

  const getStatusBadge = (table: any) => {
    if (table.current_session) return <Badge variant="secondary" className="bg-orange-600">Ocupada</Badge>
    return <Badge variant="secondary" className="bg-orange-500">Disponível</Badge>
  }
  
  const activeTables = tables?.filter((t: any) => t.current_session) || []
  const totalPeople = activeTables.reduce((acc: number, t: any) => 
    acc + (t.current_session?.number_of_people || 0), 0
  )
  const totalRevenue = activeTables.reduce((acc: number, t: any) => 
    acc + (t.current_session?.total_price || 0), 0
  )


  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sistema POS</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Gestão de mesas e atendimento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">
              Mesas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">
              {tables?.filter((t: any) => !t.current_session).length || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">
              Mesas Ocupadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {activeTables.length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">
              Total de Pessoas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPeople}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">
              Faturamento Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables Grid */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Mesas</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar mesa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {tables?.map((table: any) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      getStatusColor(table)
                    } ${selectedTable?.id === table.id ? "ring-2 ring-orange-500" : ""}`}
                  >
                    <p className="font-bold text-lg">{table.number}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 dark:text-gray-300">{table.name}</p>
                    {table.current_session && (
                      <p className="text-xs mt-1 flex items-center justify-center">
                        <Users className="h-3 w-3 mr-1" />
                        {table.current_session.number_of_people}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Details */}
        <div>
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Detalhes da Mesa</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTable ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{selectedTable.name}</p>
                    {getStatusBadge(selectedTable)}
                  </div>
                  
                  {selectedTable.current_session && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Tipo:</span>
                          <span className="font-medium">
                            {selectedTable.current_session.attendance_type === 'rodizio_premium' 
                              ? 'Rodízio Premium'
                              : selectedTable.current_session.attendance_type === 'rodizio_tradicional'
                              ? 'Rodízio Tradicional' 
                              : 'À la Carte'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Pessoas:</span>
                          <span className="font-medium">{selectedTable.current_session.number_of_people}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Total:</span>
                          <span className="font-bold text-lg text-orange-500">
                            R$ {selectedTable.current_session.total_price?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button className="w-full">
                          Ver Pedidos
                        </Button>
                        <Button variant="outline" className="w-full">
                          Adicionar Item
                        </Button>
                        <Button variant="destructive" className="w-full">
                          Fechar Mesa
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {!selectedTable.current_session && (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleOpenTable}>
                        <Plus className="h-4 w-4 mr-2" />
                        Abrir Mesa
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Selecione uma mesa para ver os detalhes
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="border-gray-200 dark:border-gray-800 mt-4">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Chamar Garçom
              </Button>
              <Button variant="outline" className="w-full">
                Ver Pedidos Pendentes
              </Button>
              <Button variant="outline" className="w-full">
                Relatório do Dia
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}