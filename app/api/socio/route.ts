import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const socioID = searchParams.get("id")

    if (!socioID) {
      return NextResponse.json({ error: "ID de socio requerido" }, { status: 400 })
    }

    const pool = await getConnection()

    const result = await pool
      .request()
      .input("SocioID", Number.parseInt(socioID))
      .query(`
        SELECT 
          SocioID,
          RUT,
          Nombre,
          Apellido,
          FechaNacimiento,
          Email,
          Telefono,
          Direccion,
          EstadoSocio,
          FechaRegistro
        FROM Socios
        WHERE SocioID = @SocioID
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error("Error al obtener socio:", error)
    return NextResponse.json({ error: "Error al obtener socio" }, { status: 500 })
  }
}
