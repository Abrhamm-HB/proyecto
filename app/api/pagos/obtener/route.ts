import { getConnection } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pagoID = searchParams.get("id")

    console.log("[v0] API obtener - PagoID:", pagoID)

    if (!pagoID) {
      return NextResponse.json({ error: "PagoID requerido" }, { status: 400 })
    }

    const pool = await getConnection()
    console.log("[v0] Conexión establecida")

    const result = await pool
      .request()
      .input("pagoID", Number.parseInt(pagoID))
      .query(`
        SELECT 
          ComprobanteID,
          PagoID,
          SocioID,
          MembresíaID,
          NumeroComprobante,
          FechaEmision,
          MontoPago as Monto,
          MedioPago as MetodoPago,
          NombreSocio,
          EmailSocio,
          TelefonoSocio,
          NombrePlan,
          DuracionPlan,
          FechaInicio,
          FechaVencimiento,
          Concepto,
          Estado
        FROM Comprobantes
        WHERE PagoID = @pagoID
      `)

    console.log("[v0] Query ejecutada, recordset length:", result.recordset.length)

    if (result.recordset.length === 0) {
      console.log("[v0] No encontrado para PagoID:", pagoID)
      return NextResponse.json({ error: "Comprobante no encontrado" }, { status: 404 })
    }

    const data = result.recordset[0]
    console.log("[v0] Datos obtenidos:", data)

    const response = {
      PagoID: data.PagoID,
      FechaPago: data.FechaEmision,
      Monto: data.Monto,
      MetodoPago: data.MetodoPago,
      Nombre: data.NombreSocio ? data.NombreSocio.split(" ")[0] : "N/A",
      Apellido: data.NombreSocio ? data.NombreSocio.split(" ").slice(1).join(" ") : "N/A",
      RUT: "N/A",
      NombrePlan: data.NombrePlan,
      DuracionDias: data.DuracionPlan,
      FechaInicio: data.FechaInicio,
      FechaVencimiento: data.FechaVencimiento,
    }

    console.log("[v0] Respuesta final:", response)
    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error al obtener comprobante:", errorMessage)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "Error al obtener comprobante: " + errorMessage }, { status: 500 })
  }
}
