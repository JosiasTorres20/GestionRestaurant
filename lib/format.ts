// Formatear precio
export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price)
}

// Formatear fecha
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

// Formatear estado de orden
export function formatOrderStatus(status: string) {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    processing: { label: "En proceso", color: "bg-blue-100 text-blue-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  }

  return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" }
}

// Truncar texto
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}
