"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Banknote, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"

interface Socio {
  SocioID: number
  Nombre: string
  Apellido: string
  RUT: string
  Email: string
}

interface Plan {
  PlanID: number
  NombrePlan: string
  Precio: number
  DuracionDias: number
}

const METODOS_PAGO = [
  { id: "Efectivo", nombre: "Efectivo", icon: Banknote, color: "from-green-400 to-green-600" },
  { id: "Tarjeta", nombre: "Tarjeta Crédito/Débito", icon: CreditCard, color: "from-blue-400 to-blue-600" },
  { id: "Transferencia", nombre: "Transferencia", icon: Smartphone, color: "from-purple-400 to-purple-600" },
]

export default function ProcesarPagoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const socioID = searchParams.get("socioID")
  const planID = searchParams.get("planID")

  const [socio, setSocio] = useState<Socio | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [metodoPago, setMetodoPago] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (planID) {
      fetchPlan()
    }
    if (socioID) {
      fetchSocio()
    }
  }, [planID, socioID])

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/admin/membresias?id=${planID}`)
      if (response.ok) {
        const data = await response.json()
        const selectedPlan = Array.isArray(data) ? data.find((p: Plan) => p.PlanID === Number(planID)) : data

        if (selectedPlan) {
          setPlan(selectedPlan)
        } else {
          setError("Plan no encontrado")
        }
      } else {
        setError("No se pudo cargar el plan")
      }
    } catch (err) {
      console.error("[v0] Error al cargar plan:", err)
      setError("Error al cargar el plan")
    }
  }

  const fetchSocio = async () => {
    try {
      const response = await fetch(`/api/socio?id=${socioID}`)
      if (response.ok) {
        const data = await response.json()
        setSocio(Array.isArray(data) ? data[0] : data)
      }
    } catch (err) {
      console.error("[v0] Error al cargar socio:", err)
    }
  }

  const handleProcesarPago = async () => {
    if (!metodoPago) {
      setError("Por favor selecciona un método de pago")
      return
    }

    if (!socio || !plan) {
      setError("Datos incompletos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/pagos/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socioID: socio.SocioID,
          planID: plan.PlanID,
          metodoPago: metodoPago,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Error al procesar el pago")
        setLoading(false)
        return
      }

      router.push(`/admin/pagos/${result.pagoID}`)
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Error de conexión al servidor")
      setLoading(false)
    }
  }

  if (!socio || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-lg mx-auto">
        <Link href="/admin/socios">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Procesar Pago</h1>
            <p className="text-slate-600 mt-2">Completa el pago de la membresía</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <CardTitle className="text-lg">Información del Socio</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Nombre</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {socio.Nombre} {socio.Apellido}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">RUT</p>
                    <p className="font-medium text-slate-900">{socio.RUT}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                    <p className="text-sm text-slate-900">{socio.Email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg">Plan Seleccionado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Plan</p>
                <p className="text-xl font-bold text-slate-900">{plan.NombrePlan}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Duración</p>
                  <p className="text-lg font-semibold text-slate-900">{plan.DuracionDias} días</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Monto a Pagar</p>
                  <p className="text-3xl font-bold text-blue-600">${plan.Precio.toLocaleString("es-CL")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-4">Selecciona Método de Pago</label>
            <div className="grid grid-cols-1 gap-3">
              {METODOS_PAGO.map(({ id, nombre, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setMetodoPago(id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    metodoPago === id
                      ? `border-blue-600 bg-blue-50 shadow-lg`
                      : `border-slate-200 bg-white hover:border-slate-300`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-900">{nombre}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/admin/socios" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancelar
              </Button>
            </Link>
            <Button
              onClick={handleProcesarPago}
              disabled={loading || !metodoPago}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Procesando..." : "Procesar Pago"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
