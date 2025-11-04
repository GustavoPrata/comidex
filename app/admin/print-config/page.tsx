'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { 
  Settings, 
  Printer as PrinterIcon, 
  Save,
  Loader2,
  Plus,
  Edit,
  Trash2,
  FileText,
  Copy,
  ChevronRight,
  Maximize2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Scissors,
  QrCode,
  Barcode,
  CreditCard,
  Check,
  X,
  MoreVertical,
  Search,
  Power,
  PowerOff,
  Info
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
  supports_drawer: boolean;
  drawer_pin: string;
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

interface PrintTemplate {
  id: number;
  profile_id: number;
  template_type: string;
  name: string;
  description: string;
  header_enabled: boolean;
  header_align: string;
  header_bold: boolean;
  header_size: number;
  body_font_size: number;
  body_line_spacing: number;
  body_align: string;
  footer_enabled: boolean;
  footer_align: string;
  footer_text: string;
  items_columns: string[];
  items_column_widths: any;
  show_logo: boolean;
  logo_path: string;
  show_qrcode: boolean;
  show_barcode: boolean;
  barcode_type: string;
  barcode_height: number;
  barcode_width: number;
  cut_paper: boolean;
  cut_type: string;
  feed_lines_before: number;
  feed_lines_after: number;
  open_drawer: boolean;
  custom_header: string;
  custom_footer: string;
  active: boolean;
}

const TEMPLATE_TYPES = [
  { value: 'receipt', label: 'Cupom Fiscal', icon: FileText },
  { value: 'kitchen', label: 'Comanda Cozinha', icon: FileText },
  { value: 'bar', label: 'Comanda Bar', icon: FileText },
  { value: 'test', label: 'Teste de Impressão', icon: FileText },
  { value: 'report', label: 'Relatório', icon: FileText },
  { value: 'invoice', label: 'Nota Fiscal', icon: FileText },
];

const CHARSETS = [
  'CP850', 'CP860', 'CP437', 'CP858', 
  'CP866', 'CP1252', 'UTF-8', 'ISO-8859-1'
];

const CUT_TYPES = [
  { value: 'full', label: 'Corte Total' },
  { value: 'partial', label: 'Corte Parcial' },
  { value: 'both', label: 'Ambos' },
];

export default function PrintConfigPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'profile' | 'template', item: any } | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');

  // Fetch profiles and templates
  const { data: profiles, error: profilesError } = useSWR('/api/printer-profiles', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch profiles');
    return res.json();
  });

  const { data: templates, error: templatesError } = useSWR(
    selectedProfile ? `/api/print-templates?profile_id=${selectedProfile.id}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    }
  );

  // Filter profiles based on search
  const filteredProfiles = profiles?.filter((profile: PrinterProfile) =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open profile modal for create/edit
  const openProfileModal = (profile?: PrinterProfile) => {
    setSelectedProfile(profile || {
      id: 0,
      name: '',
      manufacturer: '',
      model: '',
      connection_type: 'network',
      paper_width: 80,
      dpi: 203,
      charset: 'CP850',
      code_table: 'PC437',
      supports_cut: true,
      cut_command: 'GS V 0',
      supports_drawer: false,
      drawer_pin: '2',
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
    setIsProfileModalOpen(true);
  };

  // Open template modal for create/edit
  const openTemplateModal = (template?: PrintTemplate) => {
    if (!selectedProfile) {
      toast.error('Selecione um perfil primeiro');
      return;
    }
    
    setSelectedTemplate(template || {
      id: 0,
      profile_id: selectedProfile.id,
      template_type: 'receipt',
      name: '',
      description: '',
      header_enabled: true,
      header_align: 'center',
      header_bold: true,
      header_size: 2,
      body_font_size: 1,
      body_line_spacing: 30,
      body_align: 'left',
      footer_enabled: true,
      footer_align: 'center',
      footer_text: 'Obrigado pela preferência!',
      items_columns: ['nome', 'qtd', 'valor'],
      items_column_widths: { nome: 50, qtd: 20, valor: 30 },
      show_logo: false,
      logo_path: '',
      show_qrcode: false,
      show_barcode: false,
      barcode_type: 'CODE128',
      barcode_height: 50,
      barcode_width: 2,
      cut_paper: true,
      cut_type: 'partial',
      feed_lines_before: 0,
      feed_lines_after: 3,
      open_drawer: false,
      custom_header: '',
      custom_footer: '',
      active: true
    });
    setIsTemplateModalOpen(true);
  };

  // Save profile
  const saveProfile = async () => {
    if (!selectedProfile) return;
    
    setSaving(true);
    try {
      const method = selectedProfile.id ? 'PUT' : 'POST';
      const url = selectedProfile.id 
        ? `/api/printer-profiles/${selectedProfile.id}`
        : '/api/printer-profiles';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProfile)
      });

      if (!res.ok) throw new Error('Failed to save profile');
      
      toast.success(`Perfil ${selectedProfile.id ? 'atualizado' : 'criado'} com sucesso`);
      setIsProfileModalOpen(false);
      mutate('/api/printer-profiles');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  // Save template
  const saveTemplate = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    try {
      const method = selectedTemplate.id ? 'PUT' : 'POST';
      const url = selectedTemplate.id 
        ? `/api/print-templates/${selectedTemplate.id}`
        : '/api/print-templates';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate)
      });

      if (!res.ok) throw new Error('Failed to save template');
      
      toast.success(`Template ${selectedTemplate.id ? 'atualizado' : 'criado'} com sucesso`);
      setIsTemplateModalOpen(false);
      mutate(`/api/print-templates?profile_id=${selectedProfile?.id}`);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  // Delete profile or template
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setSaving(true);
    try {
      const url = deleteTarget.type === 'profile'
        ? `/api/printer-profiles/${deleteTarget.item.id}`
        : `/api/print-templates/${deleteTarget.item.id}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete ${deleteTarget.type}`);
      
      toast.success(`${deleteTarget.type === 'profile' ? 'Perfil' : 'Template'} excluído com sucesso`);
      
      if (deleteTarget.type === 'profile') {
        mutate('/api/printer-profiles');
        setSelectedProfile(null);
      } else {
        mutate(`/api/print-templates?profile_id=${selectedProfile?.id}`);
      }
      
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(`Erro ao excluir ${deleteTarget.type === 'profile' ? 'perfil' : 'template'}`);
    } finally {
      setSaving(false);
    }
  };

  // Duplicate profile
  const duplicateProfile = async (profile: PrinterProfile) => {
    setSaving(true);
    try {
      const newProfile = {
        ...profile,
        id: 0,
        name: `${profile.name} (Cópia)`,
        active: true
      };

      const res = await fetch('/api/printer-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });

      if (!res.ok) throw new Error('Failed to duplicate profile');
      
      toast.success('Perfil duplicado com sucesso');
      mutate('/api/printer-profiles');
    } catch (error) {
      console.error('Error duplicating profile:', error);
      toast.error('Erro ao duplicar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings className="h-8 w-8 text-orange-500" />
            Configuração de Impressoras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie perfis de impressoras e templates de impressão
          </p>
        </div>
        <Button 
          onClick={() => openProfileModal()} 
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar perfis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profiles List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <PrinterIcon className="h-5 w-5 text-orange-500" />
                  Perfis de Impressora
                </h2>
                <Badge variant="secondary">
                  {filteredProfiles?.length || 0} perfis
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredProfiles?.map((profile: PrinterProfile) => (
                  <div
                    key={profile.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedProfile?.id === profile.id
                        ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20'
                        : 'bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{profile.name}</h3>
                          {profile.active ? (
                            <Badge className="text-xs bg-green-100 text-green-700">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-gray-100 text-gray-600">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.manufacturer} - {profile.model}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {profile.paper_width}mm
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {profile.dpi} DPI
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            openProfileModal(profile);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            duplicateProfile(profile);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ type: 'profile', item: profile });
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details & Templates */}
        <div className="lg:col-span-2">
          {selectedProfile ? (
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="profiles" className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Detalhes do Perfil
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Templates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profiles" className="mt-4">
                    <div className="space-y-6">
                      {/* Profile Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{selectedProfile.name}</h3>
                          <p className="text-gray-500">{selectedProfile.manufacturer} - {selectedProfile.model}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProfileModal(selectedProfile)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Perfil
                        </Button>
                      </div>

                      {/* Profile Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                              Configurações do Papel
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Largura:</span>
                                <Badge variant="outline">{selectedProfile.paper_width}mm</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">DPI:</span>
                                <Badge variant="outline">{selectedProfile.dpi}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Margens:</span>
                                <span className="text-sm">
                                  {selectedProfile.margin_top}/{selectedProfile.margin_right}/{selectedProfile.margin_bottom}/{selectedProfile.margin_left}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                              Configurações de Fonte
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Charset:</span>
                                <Badge variant="outline">{selectedProfile.charset}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Tabela de Código:</span>
                                <Badge variant="outline">{selectedProfile.code_table}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Espaçamento:</span>
                                <span className="text-sm">{selectedProfile.line_spacing}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                              Recursos de Hardware
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Corte Automático:</span>
                                {selectedProfile.supports_cut ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <Check className="h-3 w-3 mr-1" />
                                    Suportado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600">
                                    <X className="h-3 w-3 mr-1" />
                                    Não Suportado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Gaveta de Dinheiro:</span>
                                {selectedProfile.supports_drawer ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <Check className="h-3 w-3 mr-1" />
                                    Suportado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600">
                                    <X className="h-3 w-3 mr-1" />
                                    Não Suportado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                              Informações Gerais
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Conexão:</span>
                                <Badge variant="outline">
                                  {selectedProfile.connection_type === 'network' ? 'Rede' :
                                   selectedProfile.connection_type === 'usb' ? 'USB' :
                                   selectedProfile.connection_type === 'serial' ? 'Serial' :
                                   'Bluetooth'}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Status:</span>
                                {selectedProfile.active ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <Power className="h-3 w-3 mr-1" />
                                    Ativo
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600">
                                    <PowerOff className="h-3 w-3 mr-1" />
                                    Inativo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="templates" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Templates de Impressão</h3>
                        <Button
                          size="sm"
                          onClick={() => openTemplateModal()}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Template
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates?.map((template: PrintTemplate) => (
                          <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-orange-500" />
                                    <h4 className="font-medium">{template.name}</h4>
                                    {template.active ? (
                                      <Badge className="text-xs bg-green-100 text-green-700">
                                        Ativo
                                      </Badge>
                                    ) : (
                                      <Badge className="text-xs bg-gray-100 text-gray-600">
                                        Inativo
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {TEMPLATE_TYPES.find(t => t.value === template.template_type)?.label}
                                    </Badge>
                                    {template.show_qrcode && (
                                      <Badge variant="outline" className="text-xs">
                                        <QrCode className="h-3 w-3 mr-1" />
                                        QR Code
                                      </Badge>
                                    )}
                                    {template.show_barcode && (
                                      <Badge variant="outline" className="text-xs">
                                        <Barcode className="h-3 w-3 mr-1" />
                                        Código de Barras
                                      </Badge>
                                    )}
                                    {template.cut_paper && (
                                      <Badge variant="outline" className="text-xs">
                                        <Scissors className="h-3 w-3 mr-1" />
                                        Corte
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openTemplateModal(template)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => {
                                        setDeleteTarget({ type: 'template', item: template });
                                        setIsDeleteModalOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <PrinterIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Selecione um Perfil
                </h3>
                <p className="text-gray-500">
                  Escolha um perfil de impressora na lista ao lado para ver os detalhes e configurar templates
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProfile?.id ? 'Editar Perfil' : 'Novo Perfil'}
            </DialogTitle>
            <DialogDescription>
              Configure as especificações técnicas do modelo de impressora
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Nome do Perfil</Label>
                  <Input
                    value={selectedProfile.name}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, name: e.target.value })}
                    placeholder="Ex: Epson TM-T88V"
                  />
                </div>
                <div>
                  <Label>Fabricante</Label>
                  <Input
                    value={selectedProfile.manufacturer}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, manufacturer: e.target.value })}
                    placeholder="Ex: Epson"
                  />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={selectedProfile.model}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, model: e.target.value })}
                    placeholder="Ex: TM-T88V"
                  />
                </div>
              </div>

              {/* Connection & Paper */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de Conexão</Label>
                  <Select
                    value={selectedProfile.connection_type}
                    onValueChange={(value) => setSelectedProfile({ ...selectedProfile, connection_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="network">Rede (Ethernet/WiFi)</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                      <SelectItem value="serial">Serial (COM)</SelectItem>
                      <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Largura do Papel (mm)</Label>
                  <Select
                    value={selectedProfile.paper_width.toString()}
                    onValueChange={(value) => setSelectedProfile({ ...selectedProfile, paper_width: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58">58mm</SelectItem>
                      <SelectItem value="80">80mm</SelectItem>
                      <SelectItem value="112">112mm</SelectItem>
                      <SelectItem value="210">A4 (210mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>DPI</Label>
                  <Select
                    value={selectedProfile.dpi.toString()}
                    onValueChange={(value) => setSelectedProfile({ ...selectedProfile, dpi: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="180">180 DPI</SelectItem>
                      <SelectItem value="203">203 DPI</SelectItem>
                      <SelectItem value="300">300 DPI</SelectItem>
                      <SelectItem value="600">600 DPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Charset & Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Charset</Label>
                  <Select
                    value={selectedProfile.charset}
                    onValueChange={(value) => setSelectedProfile({ ...selectedProfile, charset: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARSETS.map(charset => (
                        <SelectItem key={charset} value={charset}>{charset}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tabela de Código</Label>
                  <Input
                    value={selectedProfile.code_table}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, code_table: e.target.value })}
                    placeholder="Ex: PC437"
                  />
                </div>
              </div>

              {/* Hardware Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Suporte a Corte Automático</Label>
                    <p className="text-xs text-gray-500">Impressora possui guilhotina</p>
                  </div>
                  <Switch
                    checked={selectedProfile.supports_cut}
                    onCheckedChange={(checked) => setSelectedProfile({ ...selectedProfile, supports_cut: checked })}
                  />
                </div>

                {selectedProfile.supports_cut && (
                  <div>
                    <Label>Comando de Corte</Label>
                    <Input
                      value={selectedProfile.cut_command}
                      onChange={(e) => setSelectedProfile({ ...selectedProfile, cut_command: e.target.value })}
                      placeholder="Ex: GS V 0"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Suporte a Gaveta de Dinheiro</Label>
                    <p className="text-xs text-gray-500">Pode abrir gaveta registradora</p>
                  </div>
                  <Switch
                    checked={selectedProfile.supports_drawer}
                    onCheckedChange={(checked) => setSelectedProfile({ ...selectedProfile, supports_drawer: checked })}
                  />
                </div>

                {selectedProfile.supports_drawer && (
                  <div>
                    <Label>Pino da Gaveta</Label>
                    <Select
                      value={selectedProfile.drawer_pin}
                      onValueChange={(value) => setSelectedProfile({ ...selectedProfile, drawer_pin: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Pino 2</SelectItem>
                        <SelectItem value="5">Pino 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Perfil Ativo</Label>
                  <p className="text-xs text-gray-500">Disponível para uso nas impressoras</p>
                </div>
                <Switch
                  checked={selectedProfile.active}
                  onCheckedChange={(checked) => setSelectedProfile({ ...selectedProfile, active: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={saveProfile} 
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? (
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

      {/* Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.id ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o layout e formatação do documento
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Template</Label>
                  <Input
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                    placeholder="Ex: Cupom Fiscal Padrão"
                  />
                </div>
                <div>
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={selectedTemplate.template_type}
                    onValueChange={(value) => setSelectedTemplate({ ...selectedTemplate, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={selectedTemplate.description}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                  placeholder="Ex: Template padrão para cupom fiscal com logo e QR Code"
                />
              </div>

              {/* Header Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cabeçalho</Label>
                    <p className="text-xs text-gray-500">Nome do estabelecimento e informações</p>
                  </div>
                  <Switch
                    checked={selectedTemplate.header_enabled}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, header_enabled: checked })}
                  />
                </div>

                {selectedTemplate.header_enabled && (
                  <div className="grid grid-cols-3 gap-4 pl-6">
                    <div>
                      <Label>Alinhamento</Label>
                      <Select
                        value={selectedTemplate.header_align}
                        onValueChange={(value) => setSelectedTemplate({ ...selectedTemplate, header_align: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tamanho da Fonte</Label>
                      <Select
                        value={selectedTemplate.header_size.toString()}
                        onValueChange={(value) => setSelectedTemplate({ ...selectedTemplate, header_size: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Normal</SelectItem>
                          <SelectItem value="2">Grande</SelectItem>
                          <SelectItem value="3">Extra Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedTemplate.header_bold}
                        onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, header_bold: checked })}
                      />
                      <Label>Negrito</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rodapé</Label>
                    <p className="text-xs text-gray-500">Mensagem de agradecimento</p>
                  </div>
                  <Switch
                    checked={selectedTemplate.footer_enabled}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, footer_enabled: checked })}
                  />
                </div>

                {selectedTemplate.footer_enabled && (
                  <>
                    <Input
                      value={selectedTemplate.footer_text}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, footer_text: e.target.value })}
                      placeholder="Ex: Obrigado pela preferência!"
                      className="ml-6"
                    />
                    <div className="ml-6">
                      <Label>Alinhamento do Rodapé</Label>
                      <Select
                        value={selectedTemplate.footer_align}
                        onValueChange={(value) => setSelectedTemplate({ ...selectedTemplate, footer_align: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Special Features */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedTemplate.show_qrcode}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, show_qrcode: checked })}
                  />
                  <Label>QR Code</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedTemplate.show_barcode}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, show_barcode: checked })}
                  />
                  <Label>Código de Barras</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedTemplate.show_logo}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, show_logo: checked })}
                  />
                  <Label>Logo</Label>
                </div>
              </div>

              {/* Cut Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Corte de Papel</Label>
                    <p className="text-xs text-gray-500">Cortar papel após impressão</p>
                  </div>
                  <Switch
                    checked={selectedTemplate.cut_paper}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, cut_paper: checked })}
                  />
                </div>

                {selectedTemplate.cut_paper && (
                  <div className="ml-6">
                    <Label>Tipo de Corte</Label>
                    <Select
                      value={selectedTemplate.cut_type}
                      onValueChange={(value) => setSelectedTemplate({ ...selectedTemplate, cut_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CUT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Template Ativo</Label>
                  <p className="text-xs text-gray-500">Disponível para uso</p>
                </div>
                <Switch
                  checked={selectedTemplate.active}
                  onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, active: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={saveTemplate} 
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? (
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

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este {deleteTarget?.type === 'profile' ? 'perfil' : 'template'}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}