import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching restaurant settings:', error);
    }

    // Return data with fallback values
    const restaurantData = {
      name: data?.name || 'xxxxxx',
      address: data?.address || 'xxxxxx',
      phone: data?.phone || 'xxxxxx',
      whatsapp: data?.whatsapp || 'xxxxxx',
      email: data?.email || 'xxxxxx',
      cnpj: data?.cnpj || 'xxxxxx',
      city: data?.city || 'xxxxxx',
      state: data?.state || 'xxxxxx',
      zip_code: data?.zip_code || 'xxxxxx',
      number: data?.number || '',
      complement: data?.complement || '',
      service_tax_percentage: data?.service_tax_percentage || 0,
      wifi_network: data?.wifi_network || 'xxxxxx',
      wifi_password: data?.wifi_password || 'xxxxxx',
      instagram: data?.instagram || '',
      website: data?.website || '',
      ...data
    };

    // Format full address
    let fullAddress = restaurantData.address;
    if (restaurantData.number) {
      fullAddress += `, ${restaurantData.number}`;
    }
    if (restaurantData.complement) {
      fullAddress += ` - ${restaurantData.complement}`;
    }
    if (restaurantData.city && restaurantData.state) {
      fullAddress += ` - ${restaurantData.city}, ${restaurantData.state}`;
    }
    if (restaurantData.zip_code) {
      fullAddress += ` - CEP: ${restaurantData.zip_code}`;
    }

    return NextResponse.json({
      ...restaurantData,
      full_address: fullAddress
    });
  } catch (error) {
    console.error('Error in restaurant API:', error);
    return NextResponse.json({
      name: 'xxxxxx',
      address: 'xxxxxx',
      phone: 'xxxxxx',
      full_address: 'xxxxxx',
      service_tax_percentage: 0
    });
  }
}