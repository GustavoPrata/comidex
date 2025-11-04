'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  X
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

const FONT_TYPES = ['FONT_A', 'FONT_B', 'FONT_C', 'FONT_D', 'FONT_E'];

const CUT_COMMANDS = ['FULL', 'PARTIAL', 'NONE'];

const BARCODE_TYPES = [
  'CODE128', 'CODE39', 'EAN13', 'EAN8', 
  'ITF', 'CODABAR', 'PDF417', 'QRCODE'
];

const fetcher = async (url: string) => {
  const supabase = createClient();
  if (url === 'profiles') {
    const { data, error } = await supabase
      .from('printer_profiles')
      .select('*')
      .order('manufacturer', { ascending: true })
      .order('model', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  if (url === 'templates') {
    const { data, error } = await supabase
      .from('print_templates')
      .select('*')
      .order('template_type', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  return [];
};

export default function PrintConfigPage() {
  const { data: profiles = [], error: profilesError, isLoading: profilesLoading } = useSWR('profiles', fetcher);
  const { data: templates = [], error: templatesError, isLoading: templatesLoading } = useSWR('templates', fetcher);
  
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PrinterProfile | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    manufacturer: '',
    model: '',
    connection_type: 'ESC/POS',
    paper_width: 80,
    dpi: 203,
    charset: 'CP850',
    code_table: 'PC850',
    supports_cut: true,
    cut_command: 'FULL',
    supports_drawer: true,
    drawer_pin: 'PIN_2',
    default_font_size: 1,
    default_font_type: 'FONT_A',
    line_spacing: 30,
    margin_left: 0,
    margin_right: 0,
    margin_top: 0,
    margin_bottom: 0,
    custom_commands: {},
    active: true
  });

  const [templateForm, setTemplateForm] = useState({
    profile_id: 0,
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
    footer_text: '',
    items_columns: ['quantity', 'description', 'price', 'total'],
    items_column_widths: { quantity: 5, description: 25, price: 10, total: 10 },
    show_logo: false,
    logo_path: '',
    show_qrcode: false,
    show_barcode: false,
    barcode_type: 'CODE128',
    barcode_height: 50,
    barcode_width: 2,
    cut_paper: true,
    cut_type: 'FULL',
    feed_lines_before: 0,
    feed_lines_after: 3,
    open_drawer: false,
    custom_header: '',
    custom_footer: '',
    active: true
  });

  const supabase = createClient();

  const openProfileModal = (profile?: PrinterProfile) => {
    if (profile) {
      setEditingProfile(profile);
      setProfileForm({
        name: profile.name,
        manufacturer: profile.manufacturer,
        model: profile.model,
        connection_type: profile.connection_type,
        paper_width: profile.paper_width,
        dpi: profile.dpi,
        charset: profile.charset,
        code_table: profile.code_table,
        supports_cut: profile.supports_cut,
        cut_command: profile.cut_command,
        supports_drawer: profile.supports_drawer,
        drawer_pin: profile.drawer_pin,
        default_font_size: profile.default_font_size,
        default_font_type: profile.default_font_type,
        line_spacing: profile.line_spacing,
        margin_left: profile.margin_left,
        margin_right: profile.margin_right,
        margin_top: profile.margin_top,
        margin_bottom: profile.margin_bottom,
        custom_commands: profile.custom_commands || {},
        active: profile.active
      });
    } else {
      setEditingProfile(null);
      setProfileForm({
        name: '',
        manufacturer: '',
        model: '',
        connection_type: 'ESC/POS',
        paper_width: 80,
        dpi: 203,
        charset: 'CP850',
        code_table: 'PC850',
        supports_cut: true,
        cut_command: 'FULL',
        supports_drawer: true,
        drawer_pin: 'PIN_2',
        default_font_size: 1,
        default_font_type: 'FONT_A',
        line_spacing: 30,
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0,
        custom_commands: {},
        active: true
      });
    }
    setIsProfileModalOpen(true);
  };

  const openTemplateModal = (template?: PrintTemplate, profileId?: number) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        profile_id: template.profile_id,
        template_type: template.template_type,
        name: template.name,
        description: template.description || '',
        header_enabled: template.header_enabled,
        header_align: template.header_align,
        header_bold: template.header_bold,
        header_size: template.header_size,
        body_font_size: template.body_font_size,
        body_line_spacing: template.body_line_spacing,
        body_align: template.body_align,
        footer_enabled: template.footer_enabled,
        footer_align: template.footer_align,
        footer_text: template.footer_text || '',
        items_columns: template.items_columns,
        items_column_widths: template.items_column_widths,
        show_logo: template.show_logo,
        logo_path: template.logo_path || '',
        show_qrcode: template.show_qrcode,
        show_barcode: template.show_barcode,
        barcode_type: template.barcode_type,
        barcode_height: template.barcode_height,
        barcode_width: template.barcode_width,
        cut_paper: template.cut_paper,
        cut_type: template.cut_type,
        feed_lines_before: template.feed_lines_before,
        feed_lines_after: template.feed_lines_after,
        open_drawer: template.open_drawer,
        custom_header: template.custom_header || '',
        custom_footer: template.custom_footer || '',
        active: template.active
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        profile_id: profileId || (selectedProfile?.id || 0),
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
        footer_text: '',
        items_columns: ['quantity', 'description', 'price', 'total'],
        items_column_widths: { quantity: 5, description: 25, price: 10, total: 10 },
        show_logo: false,
        logo_path: '',
        show_qrcode: false,
        show_barcode: false,
        barcode_type: 'CODE128',
        barcode_height: 50,
        barcode_width: 2,
        cut_paper: true,
        cut_type: 'FULL',
        feed_lines_before: 0,
        feed_lines_after: 3,
        open_drawer: false,
        custom_header: '',
        custom_footer: '',
        active: true
      });
    }
    setIsTemplateModalOpen(true);
  };

  const saveProfile = async () => {
    if (!profileForm.name || !profileForm.model) {
      toast.error("Nome e modelo são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      if (editingProfile) {
        const { error } = await supabase
          .from('printer_profiles')
          .update(profileForm)
          .eq('id', editingProfile.id);
        
        if (error) throw error;
        toast.success("Perfil atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('printer_profiles')
          .insert([profileForm]);
        
        if (error) throw error;
        toast.success("Perfil criado com sucesso!");
      }
      
      setIsProfileModalOpen(false);
      mutate('profiles');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateForm.name || !templateForm.profile_id) {
      toast.error("Nome e perfil são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('print_templates')
          .update(templateForm)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast.success("Template atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('print_templates')
          .insert([templateForm]);
        
        if (error) throw error;
        toast.success("Template criado com sucesso!");
      }
      
      setIsTemplateModalOpen(false);
      mutate('templates');
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || "Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async (profile: PrinterProfile) => {
    if (!confirm(`Tem certeza que deseja excluir o perfil "${profile.name}"?\nTodos os templates associados também serão excluídos.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('printer_profiles')
        .delete()
        .eq('id', profile.id);
      
      if (error) throw error;
      toast.success("Perfil excluído com sucesso!");
      mutate('profiles');
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error(error.message || "Erro ao excluir perfil");
    }
  };

  const deleteTemplate = async (template: PrintTemplate) => {
    if (!confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('print_templates')
        .delete()
        .eq('id', template.id);
      
      if (error) throw error;
      toast.success("Template excluído com sucesso!");
      mutate('templates');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || "Erro ao excluir template");
    }
  };

  const duplicateProfile = async (profile: PrinterProfile) => {
    const newProfile = {
      ...profile,
      name: `${profile.name} (Cópia)`,
      id: undefined
    };
    
    try {
      const { error } = await supabase
        .from('printer_profiles')
        .insert([newProfile]);
      
      if (error) throw error;
      toast.success("Perfil duplicado com sucesso!");
      mutate('profiles');
    } catch (error: any) {
      console.error('Error duplicating profile:', error);
      toast.error(error.message || "Erro ao duplicar perfil");
    }
  };

  const filteredProfiles = profiles.filter((profile: PrinterProfile) =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const profileTemplates = selectedProfile 
    ? templates.filter((t: PrintTemplate) => t.profile_id === selectedProfile.id)
    : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Configuração de Impressoras
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Pesquisar perfis..."
                className="w-64 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            Configure perfis de impressoras e templates de impressão
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {profilesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Lista de Perfis */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Perfis de Impressora</CardTitle>
                  <CardDescription>
                    {filteredProfiles.length} perfis cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredProfiles.map((profile: PrinterProfile) => (
                    <div
                      key={profile.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedProfile?.id === profile.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                      }`}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {profile.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {profile.manufacturer} - {profile.model}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {profile.paper_width}mm
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {profile.dpi} DPI
                            </Badge>
                            {profile.supports_cut && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                <Scissors className="h-3 w-3 mr-1" />
                                Corte
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openProfileModal(profile);
                            }}
                            className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateProfile(profile);
                            }}
                            className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProfile(profile);
                            }}
                            className="h-7 w-7 rounded-full hover:text-red-500 transition-colors inline-flex items-center justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Perfil Selecionado */}
            <div className="xl:col-span-2">
              {selectedProfile ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedProfile.name}</CardTitle>
                        <CardDescription>
                          {selectedProfile.manufacturer} - {selectedProfile.model}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => openTemplateModal(undefined, selectedProfile.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Template
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="specs">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="specs">Especificações</TabsTrigger>
                        <TabsTrigger value="templates">Templates ({profileTemplates.length})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="specs" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-gray-500">Largura do Papel</Label>
                              <div className="font-medium">{selectedProfile.paper_width}mm</div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Resolução (DPI)</Label>
                              <div className="font-medium">{selectedProfile.dpi}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Charset</Label>
                              <div className="font-medium">{selectedProfile.charset}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Tabela de Código</Label>
                              <div className="font-medium">{selectedProfile.code_table}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-gray-500">Suporte a Corte</Label>
                              <div className="flex items-center gap-2">
                                {selectedProfile.supports_cut ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium">
                                  {selectedProfile.supports_cut ? selectedProfile.cut_command : 'Não suportado'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Gaveta de Dinheiro</Label>
                              <div className="flex items-center gap-2">
                                {selectedProfile.supports_drawer ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium">
                                  {selectedProfile.supports_drawer ? selectedProfile.drawer_pin : 'Não suportado'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Fonte Padrão</Label>
                              <div className="font-medium">
                                {selectedProfile.default_font_type} - Tamanho {selectedProfile.default_font_size}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Espaçamento de Linha</Label>
                              <div className="font-medium">{selectedProfile.line_spacing} pontos</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <Label className="text-xs text-gray-500">Margens</Label>
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Superior</div>
                              <div className="font-medium">{selectedProfile.margin_top}mm</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Direita</div>
                              <div className="font-medium">{selectedProfile.margin_right}mm</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Inferior</div>
                              <div className="font-medium">{selectedProfile.margin_bottom}mm</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Esquerda</div>
                              <div className="font-medium">{selectedProfile.margin_left}mm</div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="templates" className="space-y-2">
                        {profileTemplates.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            Nenhum template configurado para este perfil
                          </div>
                        ) : (
                          profileTemplates.map((template: PrintTemplate) => {
                            const templateType = TEMPLATE_TYPES.find(t => t.value === template.template_type);
                            const Icon = templateType?.icon || FileText;
                            
                            return (
                              <div
                                key={template.id}
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                      <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{template.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {templateType?.label}
                                      </div>
                                      {template.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {template.description}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 mt-2">
                                        {template.cut_paper && (
                                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                            <Scissors className="h-3 w-3 mr-1" />
                                            Corte
                                          </Badge>
                                        )}
                                        {template.open_drawer && (
                                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            Gaveta
                                          </Badge>
                                        )}
                                        {template.show_qrcode && (
                                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                            <QrCode className="h-3 w-3 mr-1" />
                                            QR
                                          </Badge>
                                        )}
                                        {template.show_barcode && (
                                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                                            <Barcode className="h-3 w-3 mr-1" />
                                            Código
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openTemplateModal(template)}
                                      className="h-7 w-7 rounded-full hover:text-orange-500 transition-colors inline-flex items-center justify-center"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteTemplate(template)}
                                      className="h-7 w-7 rounded-full hover:text-red-500 transition-colors inline-flex items-center justify-center"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <PrinterIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione um perfil para ver os detalhes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Perfil */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
            </DialogTitle>
            <DialogDescription>
              Configure as especificações técnicas do modelo de impressora
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-name">Nome do Perfil *</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  placeholder="Ex: Epson TM-T88VI"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Fabricante</Label>
                <Input
                  id="manufacturer"
                  value={profileForm.manufacturer}
                  onChange={(e) => setProfileForm({...profileForm, manufacturer: e.target.value})}
                  placeholder="Ex: Epson"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={profileForm.model}
                  onChange={(e) => setProfileForm({...profileForm, model: e.target.value})}
                  placeholder="Ex: TM-T88VI"
                />
              </div>
              <div>
                <Label htmlFor="paper-width">Largura do Papel (mm)</Label>
                <Select
                  value={profileForm.paper_width.toString()}
                  onValueChange={(value) => setProfileForm({...profileForm, paper_width: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58">58mm</SelectItem>
                    <SelectItem value="80">80mm</SelectItem>
                    <SelectItem value="112">112mm</SelectItem>
                    <SelectItem value="210">210mm (A4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dpi">Resolução (DPI)</Label>
                <Select
                  value={profileForm.dpi.toString()}
                  onValueChange={(value) => setProfileForm({...profileForm, dpi: parseInt(value)})}
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
              <div>
                <Label htmlFor="charset">Charset</Label>
                <Select
                  value={profileForm.charset}
                  onValueChange={(value) => setProfileForm({...profileForm, charset: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHARSETS.map((charset) => (
                      <SelectItem key={charset} value={charset}>
                        {charset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Suporte a Corte de Papel</Label>
                  <p className="text-xs text-gray-500">Impressora suporta corte automático</p>
                </div>
                <Switch
                  checked={profileForm.supports_cut}
                  onCheckedChange={(checked) => setProfileForm({...profileForm, supports_cut: checked})}
                />
              </div>
              
              {profileForm.supports_cut && (
                <div>
                  <Label htmlFor="cut-command">Comando de Corte</Label>
                  <Select
                    value={profileForm.cut_command}
                    onValueChange={(value) => setProfileForm({...profileForm, cut_command: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUT_COMMANDS.map((cmd) => (
                        <SelectItem key={cmd} value={cmd}>
                          {cmd}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Gaveta de Dinheiro</Label>
                  <p className="text-xs text-gray-500">Suporte para abrir gaveta registradora</p>
                </div>
                <Switch
                  checked={profileForm.supports_drawer}
                  onCheckedChange={(checked) => setProfileForm({...profileForm, supports_drawer: checked})}
                />
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font-type">Tipo de Fonte Padrão</Label>
                  <Select
                    value={profileForm.default_font_type}
                    onValueChange={(value) => setProfileForm({...profileForm, default_font_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_TYPES.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="font-size">Tamanho de Fonte Padrão</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[profileForm.default_font_size]}
                      onValueChange={(value) => setProfileForm({...profileForm, default_font_size: value[0]})}
                      max={4}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{profileForm.default_font_size}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="line-spacing">Espaçamento de Linha (pontos)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[profileForm.line_spacing]}
                    onValueChange={(value) => setProfileForm({...profileForm, line_spacing: value[0]})}
                    max={100}
                    min={0}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{profileForm.line_spacing}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <Label>Margens (mm)</Label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs">Superior</Label>
                  <Input
                    type="number"
                    value={profileForm.margin_top}
                    onChange={(e) => setProfileForm({...profileForm, margin_top: parseInt(e.target.value) || 0})}
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-xs">Direita</Label>
                  <Input
                    type="number"
                    value={profileForm.margin_right}
                    onChange={(e) => setProfileForm({...profileForm, margin_right: parseInt(e.target.value) || 0})}
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-xs">Inferior</Label>
                  <Input
                    type="number"
                    value={profileForm.margin_bottom}
                    onChange={(e) => setProfileForm({...profileForm, margin_bottom: parseInt(e.target.value) || 0})}
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-xs">Esquerda</Label>
                  <Input
                    type="number"
                    value={profileForm.margin_left}
                    onChange={(e) => setProfileForm({...profileForm, margin_left: parseInt(e.target.value) || 0})}
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-20 px-3 py-0.5 rounded-full text-xs font-medium transition-all text-center bg-red-500 hover:bg-red-600 text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="w-20 px-3 py-0.5 rounded-full text-xs font-medium transition-all text-center bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Template */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o template de impressão para diferentes tipos de documentos
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-profile">Perfil de Impressora *</Label>
                <Select
                  value={templateForm.profile_id.toString()}
                  onValueChange={(value) => setTemplateForm({...templateForm, profile_id: parseInt(value)})}
                  disabled={!!editingTemplate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile: PrinterProfile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template-type">Tipo de Template *</Label>
                <Select
                  value={templateForm.template_type}
                  onValueChange={(value) => setTemplateForm({...templateForm, template_type: value})}
                  disabled={!!editingTemplate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Nome do Template *</Label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  placeholder="Ex: Cupom Fiscal Padrão"
                />
              </div>
              <div>
                <Label htmlFor="template-desc">Descrição</Label>
                <Input
                  id="template-desc"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  placeholder="Breve descrição do template"
                />
              </div>
            </div>
            
            <Tabs defaultValue="header">
              <TabsList>
                <TabsTrigger value="header">Cabeçalho</TabsTrigger>
                <TabsTrigger value="body">Corpo</TabsTrigger>
                <TabsTrigger value="footer">Rodapé</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>
              
              <TabsContent value="header" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar Cabeçalho</Label>
                  <Switch
                    checked={templateForm.header_enabled}
                    onCheckedChange={(checked) => setTemplateForm({...templateForm, header_enabled: checked})}
                  />
                </div>
                
                {templateForm.header_enabled && (
                  <>
                    <div>
                      <Label>Alinhamento do Cabeçalho</Label>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setTemplateForm({...templateForm, header_align: 'left'})}
                          className={`p-2 rounded ${templateForm.header_align === 'left' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateForm({...templateForm, header_align: 'center'})}
                          className={`p-2 rounded ${templateForm.header_align === 'center' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateForm({...templateForm, header_align: 'right'})}
                          className={`p-2 rounded ${templateForm.header_align === 'right' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          <AlignRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Cabeçalho em Negrito</Label>
                      <Switch
                        checked={templateForm.header_bold}
                        onCheckedChange={(checked) => setTemplateForm({...templateForm, header_bold: checked})}
                      />
                    </div>
                    
                    <div>
                      <Label>Tamanho da Fonte do Cabeçalho</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[templateForm.header_size]}
                          onValueChange={(value) => setTemplateForm({...templateForm, header_size: value[0]})}
                          max={4}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-8 text-center">{templateForm.header_size}x</span>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="body" className="space-y-4">
                <div>
                  <Label>Tamanho da Fonte do Corpo</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[templateForm.body_font_size]}
                      onValueChange={(value) => setTemplateForm({...templateForm, body_font_size: value[0]})}
                      max={4}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{templateForm.body_font_size}x</span>
                  </div>
                </div>
                
                <div>
                  <Label>Espaçamento de Linha</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[templateForm.body_line_spacing]}
                      onValueChange={(value) => setTemplateForm({...templateForm, body_line_spacing: value[0]})}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{templateForm.body_line_spacing}</span>
                  </div>
                </div>
                
                <div>
                  <Label>Alinhamento do Corpo</Label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setTemplateForm({...templateForm, body_align: 'left'})}
                      className={`p-2 rounded ${templateForm.body_align === 'left' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateForm({...templateForm, body_align: 'center'})}
                      className={`p-2 rounded ${templateForm.body_align === 'center' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateForm({...templateForm, body_align: 'right'})}
                      className={`p-2 rounded ${templateForm.body_align === 'right' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                    >
                      <AlignRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="footer" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Habilitar Rodapé</Label>
                  <Switch
                    checked={templateForm.footer_enabled}
                    onCheckedChange={(checked) => setTemplateForm({...templateForm, footer_enabled: checked})}
                  />
                </div>
                
                {templateForm.footer_enabled && (
                  <>
                    <div>
                      <Label>Alinhamento do Rodapé</Label>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setTemplateForm({...templateForm, footer_align: 'left'})}
                          className={`p-2 rounded ${templateForm.footer_align === 'left' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateForm({...templateForm, footer_align: 'center'})}
                          className={`p-2 rounded ${templateForm.footer_align === 'center' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateForm({...templateForm, footer_align: 'right'})}
                          className={`p-2 rounded ${templateForm.footer_align === 'right' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          <AlignRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Texto do Rodapé</Label>
                      <Input
                        value={templateForm.footer_text}
                        onChange={(e) => setTemplateForm({...templateForm, footer_text: e.target.value})}
                        placeholder="Ex: Obrigado pela preferência!"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="extras" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Cortar Papel</Label>
                    <Switch
                      checked={templateForm.cut_paper}
                      onCheckedChange={(checked) => setTemplateForm({...templateForm, cut_paper: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Abrir Gaveta</Label>
                    <Switch
                      checked={templateForm.open_drawer}
                      onCheckedChange={(checked) => setTemplateForm({...templateForm, open_drawer: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Mostrar QR Code</Label>
                    <Switch
                      checked={templateForm.show_qrcode}
                      onCheckedChange={(checked) => setTemplateForm({...templateForm, show_qrcode: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Mostrar Código de Barras</Label>
                    <Switch
                      checked={templateForm.show_barcode}
                      onCheckedChange={(checked) => setTemplateForm({...templateForm, show_barcode: checked})}
                    />
                  </div>
                </div>
                
                {templateForm.show_barcode && (
                  <div>
                    <Label>Tipo de Código de Barras</Label>
                    <Select
                      value={templateForm.barcode_type}
                      onValueChange={(value) => setTemplateForm({...templateForm, barcode_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BARCODE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Linhas de Avanço Antes</Label>
                    <Input
                      type="number"
                      value={templateForm.feed_lines_before}
                      onChange={(e) => setTemplateForm({...templateForm, feed_lines_before: parseInt(e.target.value) || 0})}
                      min={0}
                      max={10}
                    />
                  </div>
                  <div>
                    <Label>Linhas de Avanço Depois</Label>
                    <Input
                      type="number"
                      value={templateForm.feed_lines_after}
                      onChange={(e) => setTemplateForm({...templateForm, feed_lines_after: parseInt(e.target.value) || 0})}
                      min={0}
                      max={10}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(false)}
              className="w-20 px-3 py-0.5 rounded-full text-xs font-medium transition-all text-center bg-red-500 hover:bg-red-600 text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveTemplate}
              disabled={saving}
              className="w-20 px-3 py-0.5 rounded-full text-xs font-medium transition-all text-center bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}