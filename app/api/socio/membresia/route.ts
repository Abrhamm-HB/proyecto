import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const socioID = searchParams.get("socioID")

    if (!socioID) {
      return NextResponse.json({ error: "SocioID es requerido" }, { status: 400 })
    }

    const pool = await getConnection()

    const result = await pool
      .request()
      .input("socioID", socioID)
      .query(`
        SELECT 
          m.MembresiaID,
          m.FechaInicio,
          m.FechaFin,
          m.EstadoMembresia as Estado,
          p.NombrePlan,
          p.Descripcion,
          p.Precio,
          p.DuracionDias,
          p.Beneficios
        FROM Membresias m
        INNER JOIN PlanesMembresía p ON m.PlanID = p.PlanID
        WHERE m.SocioID = @socioID
        AND m.EstadoMembresia = 'Activa'
      `)

    return NextResponse.json(result.recordset[0] || null)
  } catch (error) {
    console.error("Error al obtener membresía del socio:", error)
    return NextResponse.json({ error: "Error al obtener membresía" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { socioID, planID } = body

    if (!socioID || !planID) {
      return NextResponse.json({ error: "SocioID y PlanID son requeridos" }, { status: 400 })
    }

    const pool = await getConnection()

    // Get plan details
    const planResult = await pool
      .request()
      .input("planID", planID)
      .query(`
        SELECT PlanID, NombrePlan, Precio, DuracionDias
        FROM PlanesMembresía
        WHERE PlanID = @planID AND Activo = 1
      `)

    if (planResult.recordset.length === 0) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    const plan = planResult.recordset[0]

    // Deactivate current membership if exists
    await pool
      .request()
      .input("socioID", socioID)
      .query(`
        UPDATE Membresias
        SET EstadoMembresia = 'Inactiva'
        WHERE SocioID = @socioID AND EstadoMembresia = 'Activa'
      `)

    // Calculate dates
    const fechaInicio = new Date()
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + plan.DuracionDias)

    // Create new membership
    await pool
      .request()
      .input("socioID", socioID)
      .input("planID", planID)
      .input("fechaInicio", fechaInicio)
      .input("fechaFin", fechaFin)
      .query(`
        INSERT INTO Membresias (SocioID, PlanID, FechaInicio, FechaFin, EstadoMembresia)
        VALUES (@socioID, @planID, @fechaInicio, @fechaFin, 'Activa')
      `)

    // Create payment record
    await pool
      .request()
      .input("socioID", socioID)
      .input("monto", plan.Precio)
      .input("metodoPago", "Efectivo")
      .input("concepto", `Membresía ${plan.NombrePlan}`)
      .query(`
        INSERT INTO Pagos (SocioID, FechaPago, MontoPago, MetodoPago, Concepto)
        VALUES (@socioID, GETDATE(), @monto, @metodoPago, @concepto)
      `)

    return NextResponse.json({
      message: "Membresía adquirida exitosamente",
      plan: plan.NombrePlan,
      fechaInicio,
      fechaFin,
    })
  } catch (error) {
    console.error("Error al adquirir membresía:", error)
    return NextResponse.json({ error: "Error al adquirir membresía" }, { status: 500 })
  }
}
