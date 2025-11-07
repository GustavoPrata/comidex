'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  Settings
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
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  
  opening_time?: string;
  closing_time?: string;
  delivery_enabled?: boolean;
  delivery_fee?: number;
  minimum_order?: number;
  
  accepts_cash?: boolean;
  accepts_credit?: boolean;
  accepts_debit?: boolean;
  accepts_pix?: boolean;
  pix_key?: string;
  
  instagram?: string;
  facebook?: string;
  website?: string;
  
  service_tax_percentage?: number;
  wifi_password?: string;
  table_service?: boolean;
  self_service?: boolean;
  takeaway?: boolean;
  
  primary_color?: string;
  secondary_color?: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    phone: '',
    address: '',
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
      setSettings(dbSettings);
    }
  }, [dbSettings]);

  // Handle input changes
  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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
      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('restaurant_settings')
          .update(settings)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('restaurant_settings')
          .insert([settings])
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings(data);
        }
      }

      toast.success('Configurações salvas com sucesso!');
      mutate('restaurant_settings');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
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
              <TabsTrigger value="delivery">Entrega</TabsTrigger>
              <TabsTrigger value="payment">Pagamento</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card className="p-6">
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
                    <Label htmlFor="name">Nome do Restaurante *</Label>
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
                    <Label htmlFor="phone">Telefone *</Label>
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
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Endereço
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      value={settings.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Rua das Flores, 123"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={settings.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="São Paulo"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={settings.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="SP"
                      className="mt-2"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={settings.zip_code || ''}
                      onChange={(e) => handleChange('zip_code', e.target.value)}
                      placeholder="00000-000"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Hours Tab */}
            <TabsContent value="hours" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Horário de Funcionamento
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="opening_time">Horário de Abertura</Label>
                    <Input
                      id="opening_time"
                      type="time"
                      value={settings.opening_time || ''}
                      onChange={(e) => handleChange('opening_time', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="closing_time">Horário de Fechamento</Label>
                    <Input
                      id="closing_time"
                      type="time"
                      value={settings.closing_time || ''}
                      onChange={(e) => handleChange('closing_time', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">Modalidades de Atendimento</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="table_service">Atendimento em Mesa</Label>
                      <p className="text-sm text-gray-500">Garçons atendem os clientes nas mesas</p>
                    </div>
                    <Switch
                      id="table_service"
                      checked={settings.table_service || false}
                      onCheckedChange={(checked) => handleChange('table_service', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="self_service">Self-Service</Label>
                      <p className="text-sm text-gray-500">Cliente se serve no buffet</p>
                    </div>
                    <Switch
                      id="self_service"
                      checked={settings.self_service || false}
                      onCheckedChange={(checked) => handleChange('self_service', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="takeaway">Retirada no Local</Label>
                      <p className="text-sm text-gray-500">Cliente retira pedido no balcão</p>
                    </div>
                    <Switch
                      id="takeaway"
                      checked={settings.takeaway || false}
                      onCheckedChange={(checked) => handleChange('takeaway', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6">Configurações de Entrega</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="delivery_enabled">Delivery Ativo</Label>
                      <p className="text-sm text-gray-500">Aceitar pedidos para entrega</p>
                    </div>
                    <Switch
                      id="delivery_enabled"
                      checked={settings.delivery_enabled || false}
                      onCheckedChange={(checked) => handleChange('delivery_enabled', checked)}
                    />
                  </div>

                  {settings.delivery_enabled && (
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                      <div>
                        <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
                        <Input
                          id="delivery_fee"
                          type="number"
                          step="0.01"
                          value={settings.delivery_fee || ''}
                          onChange={(e) => handleChange('delivery_fee', parseFloat(e.target.value))}
                          placeholder="5.00"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="minimum_order">Pedido Mínimo (R$)</Label>
                        <Input
                          id="minimum_order"
                          type="number"
                          step="0.01"
                          value={settings.minimum_order || ''}
                          onChange={(e) => handleChange('minimum_order', parseFloat(e.target.value))}
                          placeholder="30.00"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card className="p-6">
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

                  {settings.accepts_pix && (
                    <div className="pl-12 pt-2">
                      <Label htmlFor="pix_key">Chave PIX</Label>
                      <Input
                        id="pix_key"
                        value={settings.pix_key || ''}
                        onChange={(e) => handleChange('pix_key', e.target.value)}
                        placeholder="email@exemplo.com ou CPF/CNPJ"
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
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
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-orange-500" />
                  Redes Sociais e Internet
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
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
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={settings.facebook || ''}
                      onChange={(e) => handleChange('facebook', e.target.value)}
                      placeholder="facebook.com/restaurante"
                      className="mt-2"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="www.restaurante.com.br"
                      className="mt-2"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="wifi_password">Senha do Wi-Fi</Label>
                    <Input
                      id="wifi_password"
                      value={settings.wifi_password || ''}
                      onChange={(e) => handleChange('wifi_password', e.target.value)}
                      placeholder="Senha para clientes"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Será exibida no cupom ou cardápio para clientes
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}