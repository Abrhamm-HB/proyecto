import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { socioID, planID, metodoPago } = body

    if (!socioID || !planID || !metodoPago) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const pool = await getConnection()

    // Obtener datos del plan y socio
    const [planResult, socioResult] = await Promise.all([
      pool
        .request()
        .input("planID", planID)
        .query(`
          SELECT Precio, NombrePlan, DuracionDias FROM PlanesMembresía WHERE PlanID = @planID
        `),
      pool
        .request()
        .input("socioID", socioID)
        .query(`
          SELECT Nombre, Apellido, Email, Telefono FROM Socios WHERE SocioID = @socioID
        `),
    ])

    if (planResult.recordset.length === 0) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    if (socioResult.recordset.length === 0) {
      return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 })
    }

    const plan = planResult.recordset[0]
    const socio = socioResult.recordset[0]
    const monto = plan.Precio
    const duracionDias = plan.DuracionDias

    const fechaInicio = new Date()
    const fechaVencimiento = new Date(fechaInicio.getTime() + duracionDias * 24 * 60 * 60 * 1000)

    const membresiaResult = await pool
      .request()
      .input("socioID", socioID)
      .input("planID", planID)
      .input("fechaInicio", fechaInicio.toISOString().split("T")[0])
      .input("fechaVencimiento", fechaVencimiento.toISOString().split("T")[0])
      .input("monto", monto)
      .query(`
        INSERT INTO Membresías (SocioID, PlanID, FechaInicio, FechaVencimiento, MontoPagado, Estado)
        VALUES (@socioID, @planID, @fechaInicio, @fechaVencimiento, @monto, 'Vigente')
        SELECT SCOPE_IDENTITY() as MembresíaID
      `)

    const membresiaID = membresiaResult.recordset[0].MembresíaID

    const numeroComprobante = `COMP-${Date.now()}`
    const pagoResult = await pool
      .request()
      .input("socioID", socioID)
      .input("membresiaID", membresiaID)
      .input("monto", monto)
      .input("medioPago", metodoPago)
      .input("concepto", `Pago ${plan.NombrePlan}`)
      .input("numeroComprobante", numeroComprobante)
      .query(`
        INSERT INTO Pagos (SocioID, MembresíaID, MontoPago, MedioPago, FechaPago, Concepto, NumeroComprobante)
        VALUES (@socioID, @membresiaID, @monto, @medioPago, GETDATE(), @concepto, @numeroComprobante)
        SELECT SCOPE_IDENTITY() as PagoID
      `)

    const pagoID = pagoResult.recordset[0].PagoID

    const comprobanteResult = await pool
      .request()
      .input("pagoID", pagoID)
      .input("socioID", socioID)
      .input("membresiaID", membresiaID)
      .input("numeroComprobante", numeroComprobante)
      .input("monto", monto)
      .input("medioPago", metodoPago)
      .input("nombreSocio", `${socio.Nombre} ${socio.Apellido}`)
      .input("emailSocio", socio.Email)
      .input("telefonoSocio", socio.Telefono)
      .input("nombrePlan", plan.NombrePlan)
      .input("duracionPlan", duracionDias)
      .input("fechaInicio", fechaInicio.toISOString().split("T")[0])
      .input("fechaVencimiento", fechaVencimiento.toISOString().split("T")[0])
      .query(`
        INSERT INTO Comprobantes (
          PagoID, SocioID, MembresíaID, NumeroComprobante, MontoPago, MedioPago,
          NombreSocio, EmailSocio, TelefonoSocio, NombrePlan, DuracionPlan,
          FechaInicio, FechaVencimiento, Concepto, Estado
        )
        VALUES (
          @pagoID, @socioID, @membresiaID, @numeroComprobante, @monto, @medioPago,
          @nombreSocio, @emailSocio, @telefonoSocio, @nombrePlan, @duracionPlan,
          @fechaInicio, @fechaVencimiento, 'Pago de membresía', 'Emitido'
        )
        SELECT SCOPE_IDENTITY() as ComprobanteID
      `)

    const comprobanteID = comprobanteResult.recordset[0].ComprobanteID

    return NextResponse.json({
      success: true,
      comprobanteID,
      pagoID,
      membresiaID,
      monto,
    })
  } catch (error) {
    console.error("Error al procesar pago:", error)
    return NextResponse.json({ error: "Error al procesar pago" }, { status: 500 })
  }
}
