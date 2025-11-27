"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, AlertCircle } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Comprobante {
  PagoID: number
  FechaPago: string
  Monto: number
  MetodoPago: string
  Nombre: string
  Apellido: string
  RUT: string
  NombrePlan: string
  DuracionDias: number
  FechaInicio: string
  FechaVencimiento: string
}

export default function ComprobantePage() {
  const params = useParams()
  const pagoID = params.pagoID

  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchComprobante = async () => {
      try {
        console.log("[v0] Fetching pago detail for ID:", pagoID)
        const response = await fetch(`/api/pagos/obtener?id=${pagoID}`)
        console.log("[v0] Response status:", response.status)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Data loaded successfully:", data)
        setComprobante(data)
        setError("")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error("[v0] Error al obtener comprobante:", errorMessage)
        setError("Error al cargar el comprobante: " + errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (pagoID) {
      fetchComprobante()
    }
  }, [pagoID])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <DashboardLayout role="Administrador">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando comprobante...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !comprobante) {
    return (
      <DashboardLayout role="Administrador">
        <div className="space-y-4">
          <Link href="/admin/pagos">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al historial
            </Button>
          </Link>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Error al cargar comprobante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error || "No se encontró el comprobante"}</p>
              <p className="text-sm text-red-600 mt-2">ID de pago: {pagoID}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="Administrador">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Comprobante de Pago</h1>
            <p className="text-muted-foreground mt-1">Detalles del pago #{comprobante.PagoID}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/pagos">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle>Información del Socio</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Nombre</p>
                <p className="text-lg font-semibold mt-1">
                  {comprobante.Nombre} {comprobante.Apellido}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">RUT</p>
                <p className="text-lg font-semibold mt-1">{comprobante.RUT}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle>Detalles del Pago</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Fecha de Pago</p>
                <p className="text-lg font-semibold mt-1">{formatDate(comprobante.FechaPago)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Método de Pago</p>
                <p className="text-lg font-semibold mt-1 capitalize">{comprobante.MetodoPago}</p>
              </div>
            </div>
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground font-medium">Monto Pagado</p>
              <p className="text-3xl font-bold text-primary mt-2">{formatCurrency(comprobante.Monto)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle>Plan Asignado</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Plan</p>
                <p className="text-2xl font-bold mt-1">{comprobante.NombrePlan}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Duración</p>
                  <p className="text-xl font-bold mt-2">{comprobante.DuracionDias} días</p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Inicio</p>
                  <p className="text-sm font-semibold mt-2">{formatDate(comprobante.FechaInicio)}</p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Vencimiento</p>
                  <p className="text-sm font-semibold mt-2">{formatDate(comprobante.FechaVencimiento)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <style>{`
          @media print {
            button { display: none; }
            .sidebar { display: none; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}
