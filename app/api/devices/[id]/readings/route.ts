import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const { data: readings, error } = await supabase
      .from('esp32_solar_readings')
      .select('*')
      .eq('device_id', id)
      .order('recorded_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(readings)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
