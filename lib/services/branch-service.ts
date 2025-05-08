import type { Branch } from "@/types"

/**
 * Obtiene todas las sucursales de un restaurante
 * @param restaurantId - ID del restaurante
 * @returns Promise con el array de sucursales
 */
export async function getBranches(restaurantId: string): Promise<Branch[]> {
  try {
    // Asegurarse de incluir las credenciales para enviar cookies
    const response = await fetch(`/api/restaurants/${restaurantId}/branches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante: incluir cookies de autenticación
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
      
      // Crear un error más específico para problemas de autenticación
      if (response.status === 401) {
        throw new Error(`401: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching branches:", error)
    throw error
  }
}

/**
 * Elimina una sucursal
 * @param branchId - ID de la sucursal a eliminar
 */
export async function deleteBranch(branchId: string): Promise<void> {
  try {
    const response = await fetch(`/api/branches/${branchId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante: incluir cookies de autenticación
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
      
      // Crear un error más específico para problemas de autenticación
      if (response.status === 401) {
        throw new Error(`401: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting branch:", error)
    throw error
  }
}

/**
 * Establece una sucursal como principal
 * @param branchId - ID de la sucursal a establecer como principal
 * @param restaurantId - ID del restaurante
 */
export async function setMainBranch(branchId: string, restaurantId: string): Promise<void> {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/branches/main`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante: incluir cookies de autenticación
      body: JSON.stringify({ branch_id: branchId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
      
      // Crear un error más específico para problemas de autenticación
      if (response.status === 401) {
        throw new Error(`401: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("Error setting main branch:", error)
    throw error
  }
}

/**
 * Crea una nueva sucursal
 * @param branchData - Datos de la sucursal a crear
 * @param restaurantId - ID del restaurante
 * @returns Promise con la sucursal creada
 */
export async function createBranch(branchData: Partial<Branch>, restaurantId: string): Promise<Branch> {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante: incluir cookies de autenticación
      body: JSON.stringify(branchData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
      
      // Crear un error más específico para problemas de autenticación
      if (response.status === 401) {
        throw new Error(`401: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating branch:", error)
    throw error
  }
}

/**
 * Actualiza una sucursal existente
 * @param branchId - ID de la sucursal a actualizar
 * @param branchData - Datos actualizados de la sucursal
 * @returns Promise con la sucursal actualizada
 */
export async function updateBranch(branchId: string, branchData: Partial<Branch>): Promise<Branch> {
  try {
    const response = await fetch(`/api/branches/${branchId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Importante: incluir cookies de autenticación
      body: JSON.stringify(branchData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
      
      // Crear un error más específico para problemas de autenticación
      if (response.status === 401) {
        throw new Error(`401: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating branch:", error)
    throw error
  }
}
