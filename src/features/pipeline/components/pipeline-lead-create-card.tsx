import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getLeads } from "@/api/leads";
import { formatCurrency } from "@/lib/formatters";
import type { LeadListItem } from "@/types/leads";

interface PipelineLeadCreateCardProps {
  onLeadDragStart: (lead: LeadListItem) => void;
  onLeadDragEnd: () => void;
  pendingLeadId: string | null;
  draggingLeadId: string | null;
}

export function PipelineLeadCreateCard({
  onLeadDragStart,
  onLeadDragEnd,
  pendingLeadId,
  draggingLeadId,
}: PipelineLeadCreateCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const leadsQuery = useQuery({
    queryKey: ["pipeline-lead-picker", deferredSearchTerm],
    queryFn: () =>
      getLeads({
        search: deferredSearchTerm || undefined,
        ordering: "-created_at",
        page: 1,
      }),
  });

  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <h2>Adicionar lead ao pipeline</h2>
        </div>
        <span className="badge badge--accent">Leads cadastrados</span>
      </div>

      <div className="stack stack--sm">
        <label className="form-field">
          <input
            placeholder="Digite nome ou empresa"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        {leadsQuery.isLoading && !leadsQuery.data ? (
          <div className="empty-state empty-state--inline">
            <strong>Carregando leads</strong>
            <p>Buscando contatos disponiveis para abrir novos cards no pipeline.</p>
          </div>
        ) : null}

        {leadsQuery.data?.results.length ? (
          <div className="lead-picker">
            {leadsQuery.data.results.map((lead) => {
              const isPending = pendingLeadId === lead.id;
              const isDragging = draggingLeadId === lead.id;

              return (
                <article
                  key={lead.id}
                  className={`lead-picker__card ${isDragging ? "is-dragging" : ""}`}
                  draggable={!isPending}
                  onDragEnd={onLeadDragEnd}
                  onDragStart={() => onLeadDragStart(lead)}
                >
                  <div className="lead-picker__meta">
                    <div className="card-meta-row">
                      <span aria-label="Nome" className="card-meta-icon" role="img" title="Nome">
                        <i aria-hidden="true" className="fa-solid fa-user" />
                      </span>
                      <strong>{lead.full_name}</strong>
                    </div>
                    <div className="card-meta-row">
                      <span aria-label="Empresa" className="card-meta-icon" role="img" title="Empresa">
                        <i aria-hidden="true" className="fa-solid fa-building" />
                      </span>
                      <strong>{lead.company_name || "Sem empresa"}</strong>
                    </div>
                    <div className="card-meta-row">
                      <span aria-label="Contato" className="card-meta-icon" role="img" title="Contato">
                        <i aria-hidden="true" className="fa-solid fa-address-card" />
                      </span>
                      <strong>{lead.phone || lead.email || "Sem contato"}</strong>
                    </div>
                    <div className="card-meta-row">
                      <span aria-label="Valor" className="card-meta-icon" role="img" title="Valor">
                        <i aria-hidden="true" className="fa-solid fa-sack-dollar" />
                      </span>
                      <strong>{formatCurrency(lead.estimated_value)}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {!leadsQuery.isLoading && !leadsQuery.data?.results.length ? (
          <div className="empty-state empty-state--inline">
            <strong>Nenhum lead encontrado</strong>
            <p>
              Ajuste a busca para nome ou empresa, ou cadastre novos leads na carteira antes de abrir cards aqui.
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
