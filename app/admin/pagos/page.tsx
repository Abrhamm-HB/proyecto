"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import Link from "next/link"

interface Pago {
  PagoID: number
  Monto: number
  FechaPago: string
  MetodoPago: string
  NombreSocio: string
  NombrePlan: string
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPagos()
  }, [])

  const fetchPagos = async () => {
    try {
      const response = await fetch("/api/pagos")
      if (response.ok) {
        const data = await response.json()
        setPagos(data)
      }
    } catch (error) {
      console.error("Error al cargar pagos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPagos = pagos.filter(
    (pago) =>
      pago.NombreSocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.NombrePlan?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  const getMetodoIcon = (metodo: string) => {
    switch (metodo?.toLowerCase()) {
      case "efectivo":
        return "💵"
      case "tarjeta":
        return "💳"
      case "transferencia":
        return "🏦"
      default:
        return "💰"
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="Administrador">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando pagos...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="Administrador">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
          <p className="text-muted-foreground">Visualiza y gestiona todos los pagos procesados</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Total: {pagos.length} pagos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por socio o plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">ID Pago</th>
                      <th className="text-left p-3 font-medium">Socio</th>
                      <th className="text-left p-3 font-medium">Plan</th>
                      <th className="text-left p-3 font-medium">Monto</th>
                      <th className="text-left p-3 font-medium">Método</th>
                      <th className="text-left p-3 font-medium">Fecha</th>
                      <th className="text-left p-3 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPagos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No se encontraron pagos
                        </td>
                      </tr>
                    ) : (
                      filteredPagos.map((pago) => (
                        <tr key={pago.PagoID} className="border-t hover:bg-muted/50">
                          <td className="p-3 font-medium text-sm">#{pago.PagoID}</td>
                          <td className="p-3 text-sm">{pago.NombreSocio}</td>
                          <td className="p-3 text-sm">{pago.NombrePlan}</td>
                          <td className="p-3 font-bold text-sm">{formatCurrency(pago.Monto)}</td>
                          <td className="p-3 text-sm">
                            <span className="flex items-center gap-1">
                              {getMetodoIcon(pago.MetodoPago)} {pago.MetodoPago}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{new Date(pago.FechaPago).toLocaleDateString("es-CL")}</td>
                          <td className="p-3">
                            <Link href={`/admin/pagos/${pago.PagoID}`}>
                              <Button size="sm" variant="ghost" className="gap-2">
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
