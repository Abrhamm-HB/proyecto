import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET() {
  try {
    const pool = await getConnection()

    const result = await pool.request().query(`
      SELECT 
        PlanID,
        NombrePlan,
        Descripcion,
        Precio,
        DuracionDias,
        TipoPlan,
        Beneficios,
        Activo
      FROM PlanesMembresía
      ORDER BY Precio ASC
    `)

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("Error al obtener membresías:", error)
    return NextResponse.json({ error: "Error al obtener membresías" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombrePlan, descripcion, precio, duracionDias, tipoPlan, beneficios } = body

    const pool = await getConnection()

    await pool
      .request()
      .input("nombrePlan", nombrePlan)
      .input("descripcion", descripcion)
      .input("precio", precio)
      .input("duracionDias", duracionDias)
      .input("tipoPlan", tipoPlan)
      .input("beneficios", beneficios)
      .input("activo", true)
      .query(`
        INSERT INTO PlanesMembresía (NombrePlan, Descripcion, Precio, DuracionDias, TipoPlan, Beneficios, Activo)
        VALUES (@nombrePlan, @descripcion, @precio, @duracionDias, @tipoPlan, @beneficios, @activo)
      `)

    return NextResponse.json({ success: true, message: "Plan creado exitosamente" })
  } catch (error) {
    console.error("Error al crear plan:", error)
    return NextResponse.json({ error: "Error al crear plan" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { planID, nombrePlan, descripcion, precio, duracionDias, tipoPlan, beneficios, activo } = body

    const pool = await getConnection()

    await pool
      .request()
      .input("planID", planID)
      .input("nombrePlan", nombrePlan)
      .input("descripcion", descripcion)
      .input("precio", precio)
      .input("duracionDias", duracionDias)
      .input("tipoPlan", tipoPlan)
      .input("beneficios", beneficios)
      .input("activo", activo)
      .query(`
        UPDATE PlanesMembresía
        SET NombrePlan = @nombrePlan, Descripcion = @descripcion, Precio = @precio,
            DuracionDias = @duracionDias, TipoPlan = @tipoPlan, Beneficios = @beneficios, Activo = @activo
        WHERE PlanID = @planID
      `)

    return NextResponse.json({ success: true, message: "Plan actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar plan:", error)
    return NextResponse.json({ error: "Error al actualizar plan" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planID = searchParams.get("planID")

    if (!planID) {
      return NextResponse.json({ error: "PlanID es requerido" }, { status: 400 })
    }

    const pool = await getConnection()

    // Soft delete - just deactivate
    await pool
      .request()
      .input("planID", planID)
      .query(`
        UPDATE PlanesMembresía
        SET Activo = 0
        WHERE PlanID = @planID
      `)

    return NextResponse.json({ success: true, message: "Plan eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar plan:", error)
    return NextResponse.json({ error: "Error al eliminar plan" }, { status: 500 })
  }
}
