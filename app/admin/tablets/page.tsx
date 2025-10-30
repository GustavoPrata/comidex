"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tablet, Wifi, WifiOff, Battery, Settings, Plus } from "lucide-react";

export default function TabletsPage() {
  const tablets = [
    { 
      id: 1, 
      name: "Tablet Mesa 1-5", 
      status: "online", 
      battery: 85, 
      lastSeen: "Agora" 
    },
    { 
      id: 2, 
      name: "Tablet Mesa 6-10", 
      status: "online", 
      battery: 62, 
      lastSeen: "2 min atrás" 
    },
    { 
      id: 3, 
      name: "Tablet Mesa 11-15", 
      status: "offline", 
      battery: 45, 
      lastSeen: "15 min atrás" 
    },
    { 
      id: 4, 
      name: "Tablet Balcão", 
      status: "online", 
      battery: 92, 
      lastSeen: "Agora" 
    },
  ];

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-500";
    if (level > 30) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tablets</h1>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tablet
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Wifi className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Online</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <WifiOff className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Offline</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Tablet className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Tablets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tablets.map((tablet) => (
          <Card key={tablet.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tablet className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-base">{tablet.name}</CardTitle>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {tablet.status === "online" ? (
                    <Badge className="bg-green-500 text-white">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Bateria</span>
                  <div className="flex items-center gap-2">
                    <Battery className={`h-4 w-4 ${getBatteryColor(tablet.battery)}`} />
                    <span className={`text-sm font-medium ${getBatteryColor(tablet.battery)}`}>
                      {tablet.battery}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Última Atividade</span>
                  <span className="text-sm">{tablet.lastSeen}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}