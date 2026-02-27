import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: devices, error: devError } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false })

    if (devError) throw devError

    // For each device, get latest reading
    const devicesWithReadings = await Promise.all(devices.map(async (device) => {
      const { data: readings } = await supabase
        .from('esp32_solar_readings')
        .select('*')
        .eq('device_id', device.device_id)
        .order('recorded_at', { ascending: false })
        .limit(1)

      return {
        ...device,
        latest_reading: readings && readings.length > 0 ? readings[0] : null
      }
    }))

    return NextResponse.json(devicesWithReadings)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
