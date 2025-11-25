import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('tablet_settings')
      .select('setting_key, setting_value, setting_type')
      .order('id');

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settings: Record<string, any> = {};
    data?.forEach((setting: any) => {
      let value: any = setting.setting_value;
      
      if (setting.setting_type === 'boolean') {
        value = setting.setting_value === 'true';
      } else if (setting.setting_type === 'number') {
        value = parseFloat(setting.setting_value);
      }
      
      settings[setting.setting_key] = value;
    });

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    console.error('Erro ao buscar configurações do tablet:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
