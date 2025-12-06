"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Banknote, CreditCard, Building2, Wallet, Calendar, User, FileText } from "lucide-react"
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

  const getMetodoDisplay = (metodo: string) => {
    const metodoLower = metodo?.toLowerCase()

    if (metodoLower === "efectivo") {
      return {
        icon: Banknote,
        label: "Efectivo",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      }
    }
    if (metodoLower === "tarjeta") {
      return {
        icon: CreditCard,
        label: "Tarjeta",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      }
    }
    if (metodoLower === "transferencia") {
      return {
        icon: Building2,
        label: "Transferencia",
        className: "bg-purple-100 text-purple-700 border-purple-200",
      }
    }
    return {
      icon: Wallet,
      label: metodo,
      className: "bg-slate-100 text-slate-700 border-slate-200",
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="Administrador">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Cargando pagos...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="Administrador">
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h1>
            <p className="text-muted-foreground">Visualiza y gestiona todos los pagos procesados en el sistema</p>
          </div>
          <Card className="min-w-[200px]">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{pagos.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Pagos Registrados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Historial de Pagos</CardTitle>
                <CardDescription className="mt-1.5">Historial completo de transacciones realizadas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre de socio o plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <div className="border rounded-lg overflow-hidden bg-background">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            ID Pago
                          </div>
                        </th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Socio
                          </div>
                        </th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Plan</th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Monto
                          </div>
                        </th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Método</th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha
                          </div>
                        </th>
                        <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPagos.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Search className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-muted-foreground">No se encontraron pagos</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {searchTerm
                                    ? "Intenta con otros términos de búsqueda"
                                    : "Aún no hay pagos registrados"}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPagos.map((pago) => {
                          const metodoInfo = getMetodoDisplay(pago.MetodoPago)
                          const MetodoIcon = metodoInfo.icon

                          return (
                            <tr
                              key={pago.PagoID}
                              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-4">
                                <span className="font-mono text-sm font-semibold text-primary">
                                  #{String(pago.PagoID).padStart(4, "0")}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="font-medium text-sm">{pago.NombreSocio}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-muted-foreground">{pago.NombrePlan}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-sm">{formatCurrency(pago.Monto)}</span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${metodoInfo.className}`}
                                >
                                  <MetodoIcon className="h-3.5 w-3.5" />
                                  {metodoInfo.label}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(pago.FechaPago).toLocaleDateString("es-CL", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <Link href={`/admin/pagos/${pago.PagoID}`}>
                                  <Button size="sm" variant="ghost" className="gap-2 hover:bg-primary/10">
                                    <Eye className="h-4 w-4" />
                                    Ver Detalles
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
