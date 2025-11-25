'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { 
  Building2,
  Phone,
  MapPin,
  Mail,
  Clock,
  CreditCard,
  Wifi,
  Save,
  Loader2,
  Upload,
  Image,
  Globe,
  DollarSign,
  Settings,
  Tablet
} from "lucide-react";
import useSWR, { mutate } from 'swr';

interface RestaurantSettings {
  id?: number;
  name: string;
  legal_name?: string;
  cnpj?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  
  // Horários por dia da semana
  monday_enabled?: boolean;
  monday_open?: string;
  monday_close?: string;
  tuesday_enabled?: boolean;
  tuesday_open?: string;
  tuesday_close?: string;
  wednesday_enabled?: boolean;
  wednesday_open?: string;
  wednesday_close?: string;
  thursday_enabled?: boolean;
  thursday_open?: string;
  thursday_close?: string;
  friday_enabled?: boolean;
  friday_open?: string;
  friday_close?: string;
  saturday_enabled?: boolean;
  saturday_open?: string;
  saturday_close?: string;
  sunday_enabled?: boolean;
  sunday_open?: string;
  sunday_close?: string;
  
  accepts_cash?: boolean;
  accepts_credit?: boolean;
  accepts_debit?: boolean;
  accepts_pix?: boolean;
  pix_key?: string;
  
  instagram?: string;
  website?: string;
  
  service_tax_percentage?: number;
  wifi_network?: string;
  wifi_password?: string;
  
  primary_color?: string;
  secondary_color?: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    phone: '',
    address: '',
    // Horários padrão 18:00 às 23:00
    monday_enabled: true,
    monday_open: '18:00',
    monday_close: '23:00',
    tuesday_enabled: true,
    tuesday_open: '18:00',
    tuesday_close: '23:00',
    wednesday_enabled: true,
    wednesday_open: '18:00',
    wednesday_close: '23:00',
    thursday_enabled: true,
    thursday_open: '18:00',
    thursday_close: '23:00',
    friday_enabled: true,
    friday_open: '18:00',
    friday_close: '23:00',
    saturday_enabled: true,
    saturday_open: '18:00',
    saturday_close: '23:00',
    sunday_enabled: true,
    sunday_open: '18:00',
    sunday_close: '23:00',
  });

  // Load settings from database
  const { data: dbSettings, isLoading } = useSWR('restaurant_settings', async () => {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
    }
    
    return data;
  });

  // Initialize settings when data is loaded
  useEffect(() => {
    if (dbSettings) {
      setSettings({
        ...dbSettings,
        // Manter horários padrão se não existirem no banco
        monday_enabled: dbSettings.monday_enabled ?? true,
        monday_open: dbSettings.monday_open || '18:00',
        monday_close: dbSettings.monday_close || '23:00',
        tuesday_enabled: dbSettings.tuesday_enabled ?? true,
        tuesday_open: dbSettings.tuesday_open || '18:00',
        tuesday_close: dbSettings.tuesday_close || '23:00',
        wednesday_enabled: dbSettings.wednesday_enabled ?? true,
        wednesday_open: dbSettings.wednesday_open || '18:00',
        wednesday_close: dbSettings.wednesday_close || '23:00',
        thursday_enabled: dbSettings.thursday_enabled ?? true,
        thursday_open: dbSettings.thursday_open || '18:00',
        thursday_close: dbSettings.thursday_close || '23:00',
        friday_enabled: dbSettings.friday_enabled ?? true,
        friday_open: dbSettings.friday_open || '18:00',
        friday_close: dbSettings.friday_close || '23:00',
        saturday_enabled: dbSettings.saturday_enabled ?? true,
        saturday_open: dbSettings.saturday_open || '18:00',
        saturday_close: dbSettings.saturday_close || '23:00',
        sunday_enabled: dbSettings.sunday_enabled ?? true,
        sunday_open: dbSettings.sunday_open || '18:00',
        sunday_close: dbSettings.sunday_close || '23:00',
      });
    }
  }, [dbSettings]);

  // Handle input changes
  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // Automatically search CEP when it's complete
    if (field === 'zip_code') {
      const cleanCep = value.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        searchCepAutomatic(cleanCep);
      }
    }
  };

  // Format CEP input
  const formatCep = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply format mask (00000-000)
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Search address by CEP automatically
  const searchCepAutomatic = async (cep: string) => {
    if (!cep || cep.length !== 8) return;

    setSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        // Silently fail for automatic searches
        return;
      }

      // Update address fields with the fetched data
      setSettings(prev => ({
        ...prev,
        address: `${data.logradouro}, ${data.bairro}`,
        city: data.localidade,
        state: data.uf
      }));
    } catch (error) {
      // Silently fail for automatic searches
      console.error('Error searching CEP:', error);
    } finally {
      setSearchingCep(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('restaurant')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('restaurant')
        .getPublicUrl(fileName);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao enviar logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      // Prepare the settings object, removing any undefined or null logo_url
      const settingsToSave = {
        ...settings,
        logo_url: settings.logo_url || null
      };

      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('restaurant_settings')
          .update(settingsToSave)
          .eq('id', settings.id);

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
      } else {
        // Create new
        const { data, error } = await supabase
          .from('restaurant_settings')
          .insert([settingsToSave])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        
        if (data) {
          setSettings(data);
        }
      }

      toast.success('Configurações salvas com sucesso!');
      mutate('restaurant_settings');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const errorMessage = error?.message || error?.details || 'Erro ao salvar configurações';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Configurações do Restaurante
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie as informações e configurações do seu estabelecimento
                </p>
              </div>
            </div>
            <Button
              onClick={saveSettings}
              disabled={saving || isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="hours">Horários</TabsTrigger>
              <TabsTrigger value="payment">Pagamento</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="tablets">Tablets</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  Informações Básicas
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div className="col-span-2">
                    <Label>Logo do Restaurante</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {settings.logo_url ? (
                        <img 
                          src={settings.logo_url} 
                          alt="Logo" 
                          className="h-24 w-24 object-contain rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Enviar Logo
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG ou GIF. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Nome do Restaurante</Label>
                    <Input
                      id="name"
                      value={settings.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Restaurante Sakura"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="legal_name">Razão Social</Label>
                    <Input
                      id="legal_name"
                      value={settings.legal_name || ''}
                      onChange={(e) => handleChange('legal_name', e.target.value)}
                      placeholder="Restaurante Sakura LTDA"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={settings.cnpj || ''}
                      onChange={(e) => handleChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={settings.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(11) 1234-5678"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={settings.whatsapp || ''}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="(11) 91234-5678"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="contato@restaurante.com"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Endereço
                </h2>
                
                <div className="space-y-4">
                  {/* CEP com busca automática */}
                  <div>
                    <Label htmlFor="zip_code">
                      CEP 
                      {searchingCep && (
                        <span className="ml-2 text-xs text-orange-500">
                          <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                          Buscando...
                        </span>
                      )}
                    </Label>
                    <Input
                      id="zip_code"
                      value={settings.zip_code || ''}
                      onChange={(e) => handleChange('zip_code', formatCep(e.target.value))}
                      placeholder="00000-000"
                      className="mt-2"
                      maxLength={9}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite o CEP para buscar o endereço automaticamente
                    </p>
                  </div>

                  {/* Número e Complemento */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={settings.number || ''}
                        onChange={(e) => handleChange('number', e.target.value)}
                        placeholder="123"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={settings.complement || ''}
                        onChange={(e) => handleChange('complement', e.target.value)}
                        placeholder="Apto 101"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Endereço (editável como fallback) */}
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={settings.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Rua, Bairro"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Preenchido automaticamente ou digite manualmente
                    </p>
                  </div>

                  {/* Endereço Completo formatado */}
                  {settings.address && settings.number && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                        Endereço Completo:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {settings.address}, {settings.number}
                        {settings.complement && ` - ${settings.complement}`}
                        {settings.city && settings.state && (
                          <span className="block mt-1">
                            {settings.city}, {settings.state}
                            {settings.zip_code && ` - CEP: ${settings.zip_code}`}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Hours Tab */}
            <TabsContent value="hours" className="space-y-6">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Horário de Funcionamento
                </h2>
                
                <div className="space-y-4">
                  {/* Segunda-feira */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.monday_enabled || false}
                      onCheckedChange={(checked) => handleChange('monday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Segunda-feira</Label>
                      <Input
                        type="time"
                        value={settings.monday_open || ''}
                        onChange={(e) => handleChange('monday_open', e.target.value)}
                        disabled={!settings.monday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.monday_close || ''}
                        onChange={(e) => handleChange('monday_close', e.target.value)}
                        disabled={!settings.monday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>

                  {/* Terça-feira */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.tuesday_enabled || false}
                      onCheckedChange={(checked) => handleChange('tuesday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Terça-feira</Label>
                      <Input
                        type="time"
                        value={settings.tuesday_open || ''}
                        onChange={(e) => handleChange('tuesday_open', e.target.value)}
                        disabled={!settings.tuesday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.tuesday_close || ''}
                        onChange={(e) => handleChange('tuesday_close', e.target.value)}
                        disabled={!settings.tuesday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>

                  {/* Quarta-feira */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.wednesday_enabled || false}
                      onCheckedChange={(checked) => handleChange('wednesday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Quarta-feira</Label>
                      <Input
                        type="time"
                        value={settings.wednesday_open || ''}
                        onChange={(e) => handleChange('wednesday_open', e.target.value)}
                        disabled={!settings.wednesday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.wednesday_close || ''}
                        onChange={(e) => handleChange('wednesday_close', e.target.value)}
                        disabled={!settings.wednesday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>

                  {/* Quinta-feira */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.thursday_enabled || false}
                      onCheckedChange={(checked) => handleChange('thursday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Quinta-feira</Label>
                      <Input
                        type="time"
                        value={settings.thursday_open || ''}
                        onChange={(e) => handleChange('thursday_open', e.target.value)}
                        disabled={!settings.thursday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.thursday_close || ''}
                        onChange={(e) => handleChange('thursday_close', e.target.value)}
                        disabled={!settings.thursday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>

                  {/* Sexta-feira */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.friday_enabled || false}
                      onCheckedChange={(checked) => handleChange('friday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Sexta-feira</Label>
                      <Input
                        type="time"
                        value={settings.friday_open || ''}
                        onChange={(e) => handleChange('friday_open', e.target.value)}
                        disabled={!settings.friday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.friday_close || ''}
                        onChange={(e) => handleChange('friday_close', e.target.value)}
                        disabled={!settings.friday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>

                  {/* Sábado */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.saturday_enabled || false}
                      onCheckedChange={(checked) => handleChange('saturday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Sábado</Label>
                      <Input
                        type="time"
                        value={settings.saturday_open || ''}
                        onChange={(e) => handleChange('saturday_open', e.target.value)}
                        disabled={!settings.saturday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.saturday_close || ''}
                        onChange={(e) => handleChange('saturday_close', e.target.value)}
                        disabled={!settings.saturday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>

                  {/* Domingo */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Switch
                      checked={settings.sunday_enabled || false}
                      onCheckedChange={(checked) => handleChange('sunday_enabled', checked)}
                    />
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Domingo</Label>
                      <Input
                        type="time"
                        value={settings.sunday_open || ''}
                        onChange={(e) => handleChange('sunday_open', e.target.value)}
                        disabled={!settings.sunday_enabled}
                        placeholder="Abertura"
                      />
                      <Input
                        type="time"
                        value={settings.sunday_close || ''}
                        onChange={(e) => handleChange('sunday_close', e.target.value)}
                        disabled={!settings.sunday_enabled}
                        placeholder="Fechamento"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>


            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  Formas de Pagamento
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="accepts_cash">Dinheiro</Label>
                      <p className="text-sm text-gray-500">Aceitar pagamento em dinheiro</p>
                    </div>
                    <Switch
                      id="accepts_cash"
                      checked={settings.accepts_cash || false}
                      onCheckedChange={(checked) => handleChange('accepts_cash', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="accepts_credit">Cartão de Crédito</Label>
                      <p className="text-sm text-gray-500">Aceitar cartões de crédito</p>
                    </div>
                    <Switch
                      id="accepts_credit"
                      checked={settings.accepts_credit || false}
                      onCheckedChange={(checked) => handleChange('accepts_credit', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="accepts_debit">Cartão de Débito</Label>
                      <p className="text-sm text-gray-500">Aceitar cartões de débito</p>
                    </div>
                    <Switch
                      id="accepts_debit"
                      checked={settings.accepts_debit || false}
                      onCheckedChange={(checked) => handleChange('accepts_debit', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="accepts_pix">PIX</Label>
                      <p className="text-sm text-gray-500">Aceitar pagamento via PIX</p>
                    </div>
                    <Switch
                      id="accepts_pix"
                      checked={settings.accepts_pix || false}
                      onCheckedChange={(checked) => handleChange('accepts_pix', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                  Taxas e Serviços
                </h2>
                
                <div>
                  <Label htmlFor="service_tax_percentage">Taxa de Serviço (%)</Label>
                  <Input
                    id="service_tax_percentage"
                    type="number"
                    step="0.01"
                    value={settings.service_tax_percentage || ''}
                    onChange={(e) => handleChange('service_tax_percentage', parseFloat(e.target.value))}
                    placeholder="10"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentual cobrado como taxa de serviço (opcional)
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-orange-500" />
                  Wi-Fi para Clientes
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="wifi_network">Nome da Rede Wi-Fi</Label>
                    <Input
                      id="wifi_network"
                      value={settings.wifi_network || ''}
                      onChange={(e) => handleChange('wifi_network', e.target.value)}
                      placeholder="Nome da rede"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wifi_password">Senha do Wi-Fi</Label>
                    <Input
                      id="wifi_password"
                      value={settings.wifi_password || ''}
                      onChange={(e) => handleChange('wifi_password', e.target.value)}
                      placeholder="Senha da rede"
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  Informações do Wi-Fi serão exibidas no cupom ou cardápio para clientes
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-orange-500" />
                  Presença Online
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={settings.instagram || ''}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      placeholder="@restaurante"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="www.restaurante.com.br"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tablets Tab */}
            <TabsContent value="tablets" className="space-y-6">
              <TabletSettingsSection />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function TabletSettingsSection() {
  const supabase = createClient();
  const [maxTablets, setMaxTablets] = useState(20);
  const [tabletsCount, setTabletsCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTabletSettings();
  }, []);

  const loadTabletSettings = async () => {
    try {
      const [settingsRes, countRes] = await Promise.all([
        supabase.from('tablet_settings').select('*').eq('setting_key', 'max_tablets').single(),
        supabase.from('registered_tablets').select('*', { count: 'exact', head: true })
      ]);

      if (settingsRes.data) {
        setMaxTablets(parseInt(settingsRes.data.setting_value) || 20);
      }
      setTabletsCount(countRes.count || 0);
    } catch (error) {
      console.error('Erro ao carregar configurações de tablets:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMaxTablets = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('tablet_settings')
        .update({ 
          setting_value: maxTablets.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'max_tablets');

      if (error) throw error;
      toast.success('Limite de tablets atualizado!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Tablet className="h-5 w-5 text-orange-500" />
        Limite de Tablets
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="max_tablets">Número máximo de tablets registrados</Label>
          <div className="flex items-center gap-4 mt-2">
            <Input
              id="max_tablets"
              type="number"
              min={1}
              max={100}
              value={maxTablets}
              onChange={(e) => setMaxTablets(parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <Button
              onClick={saveMaxTablets}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? '' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Tablets registrados:</span>
          <span className={`font-medium ${tabletsCount >= maxTablets ? 'text-red-500' : 'text-green-500'}`}>
            {tabletsCount} / {maxTablets}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Novos tablets serão registrados automaticamente quando se conectarem, 
          desde que haja vagas disponíveis dentro do limite configurado.
        </p>
      </div>
    </div>
  );
}