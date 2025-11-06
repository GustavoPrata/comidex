'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { 
  Settings, 
  Printer as PrinterIcon, 
  Save,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Power,
  PowerOff,
  Scissors,
  Check,
  X,
  Info,
  Cpu
} from "lucide-react";
import useSWR, { mutate } from 'swr';

interface PrinterProfile {
  id: number;
  name: string;
  manufacturer: string;
  model: string;
  connection_type: string;
  paper_width: number;
  dpi: number;
  charset: string;
  code_table: string;
  supports_cut: boolean;
  cut_command: string;
  default_font_size: number;
  default_font_type: string;
  line_spacing: number;
  margin_left: number;
  margin_right: number;
  margin_top: number;
  margin_bottom: number;
  custom_commands: any;
  active: boolean;
}

const CONNECTION_TYPES = [
  { value: 'usb', label: 'USB' },
  { value: 'serial', label: 'Serial (COM)' },
  { value: 'network', label: 'Rede (IP)' },
  { value: 'bluetooth', label: 'Bluetooth' },
];

const CHARSETS = [
  { value: 'CP437', label: 'CP437 (US)' },
  { value: 'CP850', label: 'CP850 (Latin-1)' },
  { value: 'CP860', label: 'CP860 (Portuguese)' },
  { value: 'CP1252', label: 'CP1252 (Windows)' },
  { value: 'UTF-8', label: 'UTF-8' },
];

const CODE_TABLES = [
  { value: '0', label: 'PC437 (USA)' },
  { value: '1', label: 'Katakana' },
  { value: '2', label: 'PC850 (Multilingual)' },
  { value: '3', label: 'PC860 (Portuguese)' },
  { value: '4', label: 'PC863 (Canadian-French)' },
  { value: '5', label: 'PC865 (Nordic)' },
];

const FONT_TYPES = [
  { value: 'A', label: 'Fonte A (12x24)' },
  { value: 'B', label: 'Fonte B (9x17)' },
];

export default function PrintConfigPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProfile, setEditingProfile] = useState<PrinterProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<PrinterProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: profiles, error, isLoading } = useSWR('/api/printer-profiles', async () => {
    const response = await fetch('/api/printer-profiles');
    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }
    return response.json();
  });

  const filteredProfiles = profiles?.filter((profile: PrinterProfile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.name.toLowerCase().includes(searchLower) ||
      profile.manufacturer.toLowerCase().includes(searchLower) ||
      profile.model.toLowerCase().includes(searchLower) ||
      profile.connection_type.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateProfile = () => {
    setEditingProfile({
      id: 0,
      name: '',
      manufacturer: '',
      model: '',
      connection_type: 'usb',
      paper_width: 80,
      dpi: 203,
      charset: 'CP850',
      code_table: '2',
      supports_cut: true,
      cut_command: '\\x1D\\x56\\x00',
      default_font_size: 1,
      default_font_type: 'A',
      line_spacing: 30,
      margin_left: 0,
      margin_right: 0,
      margin_top: 0,
      margin_bottom: 0,
      custom_commands: {},
      active: true
    });
    setShowEditDialog(true);
  };

  const handleEditProfile = (profile: PrinterProfile) => {
    setEditingProfile(profile);
    setShowEditDialog(true);
  };

  const duplicateProfile = async (profile: PrinterProfile) => {
    try {
      setLoading(true);
      const newProfile = {
        ...profile,
        id: undefined,
        name: `${profile.name} (Cópia)`,
        active: false
      };

      const response = await fetch('/api/printer-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });

      if (!response.ok) {
        throw new Error('Erro ao duplicar perfil');
      }

      await mutate('/api/printer-profiles');
      toast.success('Perfil duplicado com sucesso!');
    } catch (error) {
      console.error('Erro ao duplicar perfil:', error);
      toast.error('Erro ao duplicar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/printer-profiles/${profileToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar perfil');
      }

      await mutate('/api/printer-profiles');
      toast.success('Perfil deletado com sucesso!');
      setShowDeleteDialog(false);
      setProfileToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      toast.error('Erro ao deletar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    
    try {
      setLoading(true);
      
      const method = editingProfile.id ? 'PUT' : 'POST';
      const url = editingProfile.id 
        ? `/api/printer-profiles/${editingProfile.id}`
        : '/api/printer-profiles';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProfile)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar perfil');
      }

      await mutate('/api/printer-profiles');
      toast.success('Perfil salvo com sucesso!');
      setShowEditDialog(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <PrinterIcon className="h-10 w-10" />
            <div>
              <h1 className="text-4xl font-bold">Configuração de Impressoras</h1>
              <p className="text-orange-100 mt-2">
                Gerencie perfis de impressoras térmicas ESC/POS
              </p>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar perfis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            onClick={handleCreateProfile}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Perfil
          </Button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProfiles?.map((profile: PrinterProfile) => (
            <div
              key={profile.id}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-xl hover:border-orange-500 group"
            >
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="h-5 w-5 text-orange-500" />
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {profile.name}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {profile.manufacturer}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile.model}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Largura:</span>
                    <Badge variant="outline" className="text-xs">{profile.paper_width}mm</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Resolução:</span>
                    <Badge variant="outline" className="text-xs">{profile.dpi} DPI</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Charset:</span>
                    <Badge variant="outline" className="text-xs">{profile.charset}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Conexão:</span>
                    <Badge variant="outline" className="text-xs">{profile.connection_type.toUpperCase()}</Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => duplicateProfile(profile)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Duplicar perfil"
                  >
                    <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-orange-500" />
                  </button>
                  <button
                    onClick={() => handleEditProfile(profile)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Editar perfil"
                  >
                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-orange-500" />
                  </button>
                  <button
                    onClick={() => {
                      setProfileToDelete(profile);
                      setShowDeleteDialog(true);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Excluir perfil"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile?.id ? 'Editar Perfil' : 'Novo Perfil'}
              </DialogTitle>
              <DialogDescription>
                Configure as propriedades do perfil de impressora
              </DialogDescription>
            </DialogHeader>
            
            {editingProfile && (
              <div className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Perfil</Label>
                      <Input
                        value={editingProfile.name}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>Fabricante</Label>
                      <Input
                        value={editingProfile.manufacturer}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          manufacturer: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>Modelo</Label>
                      <Input
                        value={editingProfile.model}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          model: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>Tipo de Conexão</Label>
                      <Select
                        value={editingProfile.connection_type}
                        onValueChange={(value) => setEditingProfile({
                          ...editingProfile,
                          connection_type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONNECTION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Paper Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Configurações de Papel
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Largura do Papel (mm)</Label>
                      <Input
                        type="number"
                        value={editingProfile.paper_width}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          paper_width: parseInt(e.target.value) || 80
                        })}
                      />
                    </div>
                    <div>
                      <Label>Resolução (DPI)</Label>
                      <Input
                        type="number"
                        value={editingProfile.dpi}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          dpi: parseInt(e.target.value) || 203
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Font Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Configurações de Fonte
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Charset</Label>
                      <Select
                        value={editingProfile.charset}
                        onValueChange={(value) => setEditingProfile({
                          ...editingProfile,
                          charset: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARSETS.map(charset => (
                            <SelectItem key={charset.value} value={charset.value}>
                              {charset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tabela de Códigos</Label>
                      <Select
                        value={editingProfile.code_table}
                        onValueChange={(value) => setEditingProfile({
                          ...editingProfile,
                          code_table: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CODE_TABLES.map(table => (
                            <SelectItem key={table.value} value={table.value}>
                              {table.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Fonte</Label>
                      <Select
                        value={editingProfile.default_font_type}
                        onValueChange={(value) => setEditingProfile({
                          ...editingProfile,
                          default_font_type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_TYPES.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Margens
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Superior</Label>
                      <Input
                        type="number"
                        value={editingProfile.margin_top}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          margin_top: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Inferior</Label>
                      <Input
                        type="number"
                        value={editingProfile.margin_bottom}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          margin_bottom: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Esquerda</Label>
                      <Input
                        type="number"
                        value={editingProfile.margin_left}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          margin_left: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Direita</Label>
                      <Input
                        type="number"
                        value={editingProfile.margin_right}
                        onChange={(e) => setEditingProfile({
                          ...editingProfile,
                          margin_right: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Recursos
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingProfile.supports_cut}
                        onCheckedChange={(checked) => setEditingProfile({
                          ...editingProfile,
                          supports_cut: checked
                        })}
                      />
                      <Label>Suporta Guilhotina</Label>
                    </div>
                    {editingProfile.supports_cut && (
                      <div className="flex-1">
                        <Input
                          placeholder="Comando de corte (ex: \x1D\x56\x00)"
                          value={editingProfile.cut_command}
                          onChange={(e) => setEditingProfile({
                            ...editingProfile,
                            cut_command: e.target.value
                          })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingProfile.active}
                    onCheckedChange={(checked) => setEditingProfile({
                      ...editingProfile,
                      active: checked
                    })}
                  />
                  <Label>Perfil Ativo</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingProfile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o perfil "{profileToDelete?.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProfile}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}