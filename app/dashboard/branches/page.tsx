"use client"

import { useState } from "react"
import { SearchBar } from "@/components/branches/search-bar"
import { BranchCard } from "@/components/branches/branch-card"
import { BranchDialog } from "@/components/branches/branch-dialog"
import { EmptyBranches } from "@/components/branches/empty-branches"
import { BranchesLoadingSkeleton } from "@/components/branches/branches-loading-skeleton"
import { useBranches } from "@/hooks/branches-hook"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Branch } from "@/types"

export default function BranchesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null)
  const [branchToSetMain, setBranchToSetMain] = useState<Branch | null>(null)

  const { branches, isLoading, restaurantId, handleDeleteBranch, handleSetMainBranch, handleBranchesUpdated } =
    useBranches()

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleCreateBranch = () => {
    setSelectedBranch(null)
    setIsDialogOpen(true)
  }

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (branchToDelete) {
      await handleDeleteBranch(branchToDelete)
      setBranchToDelete(null)
    }
  }

  const handleConfirmSetMain = async () => {
    if (branchToSetMain) {
      await handleSetMainBranch(branchToSetMain)
      setBranchToSetMain(null)
    }
  }

  if (isLoading) {
    return <BranchesLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-heading">Sucursales</h1>
          <p className="text-muted-foreground">Gestiona las sucursales de tu restaurante</p>
        </div>
      </div>

      <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} onCreate={handleCreateBranch} />

      {filteredBranches.length === 0 ? (
        <EmptyBranches searchQuery={searchQuery} onCreate={handleCreateBranch} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={handleEditBranch}
              onDelete={(branch) => setBranchToDelete(branch)}
              onSetMain={(branch) => setBranchToSetMain(branch)}
            />
          ))}
        </div>
      )}

      {/* Diálogo de creación/edición de sucursal */}
      {restaurantId && (
        <BranchDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          branch={selectedBranch}
          restaurantId={String(restaurantId)}
          onBranchUpdated={handleBranchesUpdated}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!branchToDelete} onOpenChange={() => setBranchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la sucursal {branchToDelete?.name} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para establecer como principal */}
      <AlertDialog open={!!branchToSetMain} onOpenChange={() => setBranchToSetMain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Establecer como sucursal principal</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas establecer {branchToSetMain?.name} como la sucursal principal? La sucursal
              principal actual dejará de serlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSetMain}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
