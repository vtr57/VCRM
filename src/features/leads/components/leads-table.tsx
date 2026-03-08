import { formatCurrency } from "@/lib/formatters";
import type { LeadListItem } from "@/types/leads";

interface LeadsTableProps {
  leads: LeadListItem[];
  currentPage: number;
  isDeleting: boolean;
  selectedLeadIds: string[];
  totalPages: number;
  totalItems: number;
  onBulkDelete: () => void;
  onEditLead: (lead: LeadListItem) => void;
  onPageChange: (page: number) => void;
  onSelectAllLeads: (checked: boolean) => void;
  onSelectLead: (leadId: string, checked: boolean) => void;
}

export function LeadsTable({
  leads,
  currentPage,
  isDeleting,
  selectedLeadIds,
  totalPages,
  totalItems,
  onBulkDelete,
  onEditLead,
  onPageChange,
  onSelectAllLeads,
  onSelectLead,
}: LeadsTableProps) {
  const selectedCount = selectedLeadIds.length;
  const allVisibleSelected = leads.length > 0 && leads.every((lead) => selectedLeadIds.includes(lead.id));

  return (
    <article className="card leads-table-card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Carteira</p>
          <h2>Leads ativos</h2>
        </div>
        <div className="toolbar-actions">
          <span className="badge badge--muted">{totalItems} registros</span>
          <button
            className="ghost-button ghost-button--danger"
            disabled={selectedCount === 0 || isDeleting}
            type="button"
            onClick={onBulkDelete}
          >
            {isDeleting ? "Excluindo..." : `Excluir selecionados${selectedCount ? ` (${selectedCount})` : ""}`}
          </button>
        </div>
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
                  <th>
                    <span className="lead-column-header">
                      <input
                        aria-label="Selecionar todos os leads da pagina"
                        checked={allVisibleSelected}
                        type="checkbox"
                        onChange={(event) => onSelectAllLeads(event.target.checked)}
                      />
                      <span>Lead</span>
                    </span>
                  </th>
                  <th>Origem</th>
                  <th>Valor</th>
                  <th>Owner</th>
                  <th>Telefone</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr className="lead-row" key={lead.id}>
                    <td>
                      <div className="lead-cell">
                        <input
                          aria-label={`Selecionar ${lead.full_name}`}
                          checked={selectedLeadIds.includes(lead.id)}
                          type="checkbox"
                          onChange={(event) => onSelectLead(lead.id, event.target.checked)}
                        />
                        <div className="table-primary">
                          <strong>
                            <button className="text-link" type="button" onClick={() => onEditLead(lead)}>
                              {lead.full_name}
                            </button>
                          </strong>
                          <span>{lead.company_name || lead.email || "Contato sem empresa"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{lead.source?.name ?? "Nao informado"}</td>
                    <td>{formatCurrency(lead.estimated_value)}</td>
                    <td>{lead.assigned_to?.full_name || lead.created_by.full_name || "Sem owner"}</td>
                    <td>{lead.phone || "Nao informado"}</td>
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
