import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== (process.env.IOT_API_KEY || 'test1234')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { device_id, voltage, current, power, efficiency, shunt_voltage } = body

    if (!device_id) {
      return NextResponse.json({ error: 'device_id is required' }, { status: 400 })
    }

    // Insert reading
    const { error: insertError } = await supabase.from('esp32_solar_readings').insert({
      device_id,
      voltage: voltage || 0,
      current_estimated: current || 0,
      power_watts: power || 0,
      efficiency: efficiency || 0,
      shunt_voltage: shunt_voltage || 0
    })

    if (insertError) throw insertError

    // Update last_seen on device
    await supabase.from('devices')
      .update({ last_seen: new Date().toISOString(), status: 'online' })
      .eq('device_id', device_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
