import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const pool = await getConnection()

    const result = await pool.query(`
      SELECT 
        p.PagoID,
        p.MontoPago as Monto,
        p.FechaPago,
        p.MedioPago as MetodoPago,
        p.EstadoPago as Estado,
        p.Concepto,
        pm.NombrePlan
      FROM Pagos p
      LEFT JOIN Membresías m ON p.SocioID = m.SocioID
      LEFT JOIN PlanesMembresía pm ON m.PlanID = pm.PlanID
      ORDER BY p.FechaPago DESC
    `)

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 })
  }
}
