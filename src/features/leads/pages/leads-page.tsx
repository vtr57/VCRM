import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { exportLeadsCsv, getLeadSources, getLeadTags, getLeads, type LeadFilters } from "@/api/leads";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadDetail | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
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

  function handleFiltersChange(next: LeadFilters) {
    setFiltersOnSearchParams(next, setSearchParams);
  }

  function handleReset() {
    setSearchParams(new URLSearchParams());
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
        totalItems={leadsResponse.count}
        totalPages={totalPages}
        onEditLead={(lead) => setEditingLead(lead)}
        onPageChange={(page) => handleFiltersChange({ ...filters, page })}
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
                tags={tagsQuery.data?.results ?? []}
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
