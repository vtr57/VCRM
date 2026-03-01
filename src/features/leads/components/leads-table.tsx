import { Link } from "react-router-dom";

import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { LeadListItem } from "@/types/leads";

interface LeadsTableProps {
  leads: LeadListItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onEditLead: (lead: LeadListItem) => void;
  onPageChange: (page: number) => void;
}

const statusLabels: Record<LeadListItem["status"], string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  proposal: "Proposta",
  won: "Ganho",
  lost: "Perdido",
};

const temperatureLabels: Record<LeadListItem["temperature"], string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente",
};

export function LeadsTable({
  leads,
  currentPage,
  totalPages,
  totalItems,
  onEditLead,
  onPageChange,
}: LeadsTableProps) {
  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Carteira</p>
          <h2>Leads ativos</h2>
        </div>
        <span className="badge badge--muted">{totalItems} registros</span>
      </div>
      {leads.length === 0 ? (
        <div className="empty-state empty-state--inline">
          <strong>Nenhum lead encontrado</strong>
          <p>Ajuste os filtros para ampliar a carteira ou cadastre novos contatos.</p>
        </div>
      ) : (
        <>
          <div className="data-table__wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Origem</th>
                  <th>Valor</th>
                  <th>Ultima interacao</th>
                  <th>Owner</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr className="lead-row" key={lead.id}>
                    <td>
                      <div className="table-primary">
                        <strong>{lead.full_name}</strong>
                        <span>{lead.company_name || lead.email || "Contato sem empresa"}</span>
                      </div>
                      <div className="table-tags">
                        <span className={`badge badge--status badge--${lead.status}`}>
                          {statusLabels[lead.status]}
                        </span>
                        <span className="badge badge--muted">{temperatureLabels[lead.temperature]}</span>
                        {lead.tags.slice(0, 2).map((tag) => (
                          <span className="badge badge--tag" key={tag.id}>
                            <span
                              className="badge__swatch"
                              style={{ backgroundColor: tag.color }}
                              aria-hidden="true"
                            />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{statusLabels[lead.status]}</td>
                    <td>{lead.source?.name ?? "Nao informado"}</td>
                    <td>{formatCurrency(lead.estimated_value)}</td>
                    <td>{formatDateTime(lead.last_interaction_at)}</td>
                    <td>{lead.assigned_to?.full_name || lead.created_by.full_name || "Sem owner"}</td>
                    <td className="table-actions">
                      <button
                        aria-label={`Editar ${lead.full_name}`}
                        className="table-actions__edit"
                        type="button"
                        onClick={() => onEditLead(lead)}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path
                            d="M4 20h4l10-10-4-4L4 16v4zm13.7-11.3 1.6-1.6a1 1 0 0 0 0-1.4l-1-1a1 1 0 0 0-1.4 0l-1.6 1.6 2.4 2.4z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      <Link className="text-link" to={`/leads/${lead.id}`}>
                        Abrir lead
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-bar">
            <span>
              Pagina {currentPage} de {totalPages}
            </span>
            <div className="pagination-bar__actions">
              <button
                className="ghost-button"
                disabled={currentPage <= 1}
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
              >
                Anterior
              </button>
              <button
                className="ghost-button"
                disabled={currentPage >= totalPages}
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
              >
                Proxima
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
