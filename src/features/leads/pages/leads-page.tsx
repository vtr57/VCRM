import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  deleteSelectedLeads,
  exportLeadsCsv,
  getLeadSources,
  getLeadTags,
  getLeads,
  type LeadFilters,
} from "@/api/leads";
import { FullscreenState } from "@/components/feedback/fullscreen-state";
import { LeadCreateCard } from "@/features/leads/components/lead-create-card";
import { ImportLeadsModal } from "@/features/leads/components/import-leads-modal";
import { LeadsFilters } from "@/features/leads/components/leads-filters";
import { LeadsTable } from "@/features/leads/components/leads-table";
import type { LeadDetail } from "@/types/leads";

const PAGE_SIZE = 10;

function getFiltersFromSearchParams(searchParams: URLSearchParams): LeadFilters {
  return {
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    tags: searchParams.get("tags") ?? undefined,
    page: Number(searchParams.get("page") ?? "1"),
  };
}

function setFiltersOnSearchParams(next: LeadFilters, setSearchParams: (value: URLSearchParams) => void) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  }
  setSearchParams(params);
}

export function LeadsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadDetail | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const filters = getFiltersFromSearchParams(searchParams);

  const leadsQuery = useQuery({
    queryKey: ["leads", filters],
    queryFn: () => getLeads(filters),
  });

  const sourcesQuery = useQuery({
    queryKey: ["lead-sources"],
    queryFn: getLeadSources,
  });

  const tagsQuery = useQuery({
    queryKey: ["lead-tags"],
    queryFn: getLeadTags,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteSelectedLeads,
    onSuccess: async () => {
      setDeleteError("");
      setSelectedLeadIds([]);
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["pipeline-board"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] });
    },
    onError: (error) => {
      setDeleteError(error instanceof Error ? error.message : "Nao foi possivel excluir os leads selecionados.");
    },
  });

  function handleFiltersChange(next: LeadFilters) {
    setFiltersOnSearchParams(next, setSearchParams);
  }

  function handleReset() {
    setSearchParams(new URLSearchParams());
  }

  function handleSelectLead(leadId: string, checked: boolean) {
    setSelectedLeadIds((current) =>
      checked ? (current.includes(leadId) ? current : [...current, leadId]) : current.filter((id) => id !== leadId),
    );
  }

  function handleSelectAllLeads(checked: boolean, visibleLeadIds: string[]) {
    setSelectedLeadIds(checked ? visibleLeadIds : []);
  }

  function handleBulkDelete() {
    if (!selectedLeadIds.length || bulkDeleteMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      `Excluir ${selectedLeadIds.length} lead${selectedLeadIds.length > 1 ? "s" : ""} selecionado${selectedLeadIds.length > 1 ? "s" : ""}?`,
    );
    if (!confirmed) {
      return;
    }

    bulkDeleteMutation.mutate(selectedLeadIds);
  }

  async function handleExport() {
    try {
      setIsExporting(true);
      setExportError("");
      const { blob, filename } = await exportLeadsCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "leads-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Nao foi possivel exportar o CSV.");
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => {
    if (!isCreateModalOpen && !editingLead) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
        setIsImportModalOpen(false);
        setEditingLead(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingLead, isCreateModalOpen, isImportModalOpen]);

  useEffect(() => {
    const visibleLeadIds = new Set(leadsQuery.data?.results.map((lead) => lead.id) ?? []);
    setSelectedLeadIds((current) => current.filter((leadId) => visibleLeadIds.has(leadId)));
  }, [leadsQuery.data?.results]);

  if (leadsQuery.isLoading && !leadsQuery.data) {
    return (
      <FullscreenState
        eyebrow="Leads"
        title="Carregando carteira"
        description="Buscando leads, origens e tags para montar a operacao."
      />
    );
  }

  if (leadsQuery.isError) {
    return (
      <FullscreenState
        eyebrow="Leads"
        title="Nao foi possivel carregar a carteira"
        description="A API de leads falhou. Recarregue a pagina ou verifique a autenticacao."
      />
    );
  }

  const leadsResponse = leadsQuery.data;
  if (!leadsResponse) {
    return null;
  }

  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(leadsResponse.count / PAGE_SIZE));

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Leads</p>
          <h1>Carteira comercial</h1>
        </div>
        <div className="stack stack--sm leads-actions">
          <button className="primary-link" type="button" onClick={() => setIsCreateModalOpen(true)}>
            Adicionar lead
          </button>
          <div className="toolbar-actions">
            <button className="ghost-button" type="button" onClick={() => setIsImportModalOpen(true)}>
              Importar leads
            </button>
            <button className="ghost-button" disabled={isExporting} type="button" onClick={handleExport}>
              {isExporting ? "Exportando CSV..." : "Exportar leads (.csv)"}
            </button>
          </div>
          {exportError ? <p className="form-error">{exportError}</p> : null}
          {deleteError ? <p className="form-error">{deleteError}</p> : null}
        </div>
      </div>
      <LeadsFilters
        filters={filters}
        sources={sourcesQuery.data?.results ?? []}
        tags={tagsQuery.data?.results ?? []}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />
      <LeadsTable
        leads={leadsResponse.results}
        currentPage={currentPage}
        isDeleting={bulkDeleteMutation.isPending}
        selectedLeadIds={selectedLeadIds}
        totalItems={leadsResponse.count}
        totalPages={totalPages}
        onBulkDelete={handleBulkDelete}
        onEditLead={(lead) => setEditingLead(lead)}
        onPageChange={(page) => handleFiltersChange({ ...filters, page })}
        onSelectAllLeads={(checked) =>
          handleSelectAllLeads(
            checked,
            leadsResponse.results.map((lead) => lead.id),
          )
        }
        onSelectLead={handleSelectLead}
      />
      {isCreateModalOpen || editingLead || isImportModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsCreateModalOpen(false);
            setIsImportModalOpen(false);
            setEditingLead(null);
          }}
          role="presentation"
        >
          <div className="modal-shell" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            {isImportModalOpen ? (
              <ImportLeadsModal
                onClose={() => setIsImportModalOpen(false)}
                onImported={async () => {
                  await leadsQuery.refetch();
                }}
              />
            ) : (
              <LeadCreateCard
                lead={editingLead}
                sources={sourcesQuery.data?.results ?? []}
                onClose={() => {
                  setIsCreateModalOpen(false);
                  setEditingLead(null);
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
