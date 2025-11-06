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
  FileText,
  Copy,
  Search,
  Power,
  PowerOff,
  Scissors,
  QrCode,
  Barcode,
  Check,
  X,
  ChevronRight,
  Info,
  Cpu,
  Maximize2
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
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');

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
      connection_type: 'auto',
      paper_width: 80,
      dpi: 203,
      charset: 'CP850',
      code_table: 'PC437',
      supports_cut: true,
      cut_command: 'GS V 0',
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
        setActiveView('list');
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

  const handleProfileClick = (profile: PrinterProfile) => {
    setSelectedProfile(profile);
    setActiveView('detail');
  };

  return (
    <div className="min-h-screen">
      {/* Header no padrão do app */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuração de Impressoras</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Pesquisar perfis..."
                  className="w-64 pr-10 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full p-1">
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
              <Button 
                onClick={() => openProfileModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Perfil
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie perfis de impressoras e templates de impressão
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeView === 'list' ? (
          // Lista de Perfis
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProfiles?.map((profile: PrinterProfile) => (
              <div
                key={profile.id}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                onClick={() => handleProfileClick(profile)}
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
                  </div>


                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateProfile(profile);
                      }}
                      className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProfileModal(profile);
                      }}
                      className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: 'profile', item: profile });
                        setIsDeleteModalOpen(true);
                      }}
                      className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Detalhe do Perfil
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setActiveView('list');
                  setSelectedProfile(null);
                }}
              >
                ← Voltar para lista
              </Button>
            </div>

            {selectedProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-1">
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-3xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
                          <Cpu className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {selectedProfile.name}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {selectedProfile.manufacturer} - {selectedProfile.model}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                            Especificações
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Largura:</span>
                              <span className="font-medium">{selectedProfile.paper_width}mm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">DPI:</span>
                              <span className="font-medium">{selectedProfile.dpi}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Charset:</span>
                              <span className="font-medium">{selectedProfile.charset}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                            Recursos
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Corte Automático</span>
                              {selectedProfile.supports_cut ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <Check className="h-3 w-3 mr-1" />
                                  Sim
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600">
                                  <X className="h-3 w-3 mr-1" />
                                  Não
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => openProfileModal(selectedProfile)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Perfil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Templates */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-3xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Templates de Impressão
                        </h2>
                        <Button
                          size="sm"
                          className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => openTemplateModal()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Template
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates?.map((template: PrintTemplate) => (
                          <div
                            key={template.id}
                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-orange-500" />
                                <h3 className="font-medium">{template.name}</h3>
                              </div>
                              {template.active ? (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600 text-xs">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {TEMPLATE_TYPES.find(t => t.value === template.template_type)?.label}
                              </Badge>
                              {template.show_qrcode && (
                                <Badge variant="outline" className="text-xs">
                                  <QrCode className="h-3 w-3 mr-1" />
                                  QR
                                </Badge>
                              )}
                              {template.show_barcode && (
                                <Badge variant="outline" className="text-xs">
                                  <Barcode className="h-3 w-3 mr-1" />
                                  Código
                                </Badge>
                              )}
                              {template.cut_paper && (
                                <Badge variant="outline" className="text-xs">
                                  <Scissors className="h-3 w-3 mr-1" />
                                  Corte
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => openTemplateModal(template)}
                                className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({ type: 'template', item: template });
                                  setIsDeleteModalOpen(true);
                                }}
                                className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {(!templates || templates.length === 0) && (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Nenhum template configurado</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Crie templates para diferentes tipos de impressão
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!profiles || (filteredProfiles?.length === 0 && activeView === 'list') && (
          <div className="text-center py-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-3xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <Settings className="h-10 w-10 text-orange-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {searchTerm 
                ? 'Nenhum perfil encontrado'
                : 'Nenhum perfil cadastrado'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => openProfileModal()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Perfil
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProfile?.id ? 'Editar Perfil' : 'Novo Perfil'}
            </DialogTitle>
            <DialogDescription>
              Configure as especificações técnicas do modelo de impressora
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4 mt-4">
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

              {/* Paper Settings */}
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Resolução (DPI)</Label>
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

              {/* Charset */}
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

              {/* Hardware Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-sm">Corte Automático</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Impressora possui guilhotina</p>
                  </div>
                  <Switch
                    checked={selectedProfile.supports_cut}
                    onCheckedChange={(checked) => setSelectedProfile({ ...selectedProfile, supports_cut: checked })}
                  />
                </div>

              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsProfileModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveProfile} 
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              type="button"
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.id ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o layout e formatação do documento
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 mt-4">
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
                  placeholder="Ex: Template padrão para cupom fiscal"
                />
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-sm">Cabeçalho</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Nome do estabelecimento</p>
                  </div>
                  <Switch
                    checked={selectedTemplate.header_enabled}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, header_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-sm">Rodapé</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Mensagem de agradecimento</p>
                  </div>
                  <Switch
                    checked={selectedTemplate.footer_enabled}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, footer_enabled: checked })}
                  />
                </div>

                {selectedTemplate.footer_enabled && (
                  <Input
                    value={selectedTemplate.footer_text}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, footer_text: e.target.value })}
                    placeholder="Ex: Obrigado pela preferência!"
                  />
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Label className="text-sm">QR Code</Label>
                    <Switch
                      checked={selectedTemplate.show_qrcode}
                      onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, show_qrcode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Label className="text-sm">Código Barras</Label>
                    <Switch
                      checked={selectedTemplate.show_barcode}
                      onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, show_barcode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Label className="text-sm">Corte</Label>
                    <Switch
                      checked={selectedTemplate.cut_paper}
                      onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, cut_paper: checked })}
                    />
                  </div>
                </div>

                {selectedTemplate.cut_paper && (
                  <div>
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

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-sm">Template Ativo</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Disponível para uso</p>
                  </div>
                  <Switch
                    checked={selectedTemplate.active}
                    onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, active: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTemplateModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveTemplate} 
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              type="button"
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