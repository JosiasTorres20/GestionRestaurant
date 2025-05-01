import type { Branch } from "@/types"


export async function getBranches(restaurantId: string): Promise<Branch[]> {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/branches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching branches:", error)
    throw error
  }
}


export async function deleteBranch(branchId: string): Promise<void> {
  try {
    const response = await fetch(`/api/branches/${branchId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting branch:", error)
    throw error
  }
}


export async function setMainBranch(branchId: string, restaurantId: string): Promise<void> {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/branches/main`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ branch_id: branchId }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error setting main branch:", error)
    throw error
  }
}

export async function createBranch(branchData: Partial<Branch>, restaurantId: string): Promise<Branch> {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating branch:", error)
    throw error
  }
}


export async function updateBranch(branchId: string, branchData: Partial<Branch>): Promise<Branch> {
  try {
    const response = await fetch(`/api/branches/${branchId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating branch:", error)
    throw error
  }
}