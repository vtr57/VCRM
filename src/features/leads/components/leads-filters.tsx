import { useEffect, useState } from "react";

import type { LeadFilters } from "@/api/leads";
import type { LeadSource, LeadTag, LeadStatus } from "@/types/leads";

interface LeadsFiltersProps {
  filters: LeadFilters;
  sources: LeadSource[];
  tags: LeadTag[];
  onChange: (next: LeadFilters) => void;
  onReset: () => void;
}

const statusOptions: Array<{ label: string; value: LeadStatus }> = [
  { label: "Novo", value: "new" },
  { label: "Contatado", value: "contacted" },
  { label: "Qualificado", value: "qualified" },
  { label: "Proposta", value: "proposal" },
  { label: "Ganho", value: "won" },
  { label: "Perdido", value: "lost" },
];

function getSelectedTags(filters: LeadFilters) {
  return filters.tags?.split(",").filter(Boolean) ?? [];
}

export function LeadsFilters({ filters, sources, tags, onChange, onReset }: LeadsFiltersProps) {
  const selectedTags = getSelectedTags(filters);
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  function applySearch() {
    onChange({
      ...filters,
      search: searchValue || undefined,
      page: 1,
    });
  }

  function handleTagToggle(tagName: string) {
    const nextTags = selectedTags.includes(tagName)
      ? selectedTags.filter((tag) => tag !== tagName)
      : [...selectedTags, tagName];

    onChange({
      ...filters,
      tags: nextTags.join(","),
      page: 1,
    });
  }

  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Filtro operacional</p>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          Limpar filtros
        </button>
      </div>
      <div className="form-grid form-grid--filters">
        <label className="form-field">
          <span>Busca</span>
          <input
            placeholder="Nome, email, telefone ou empresa"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applySearch();
              }
            }}
          />
        </label>
        <label className="form-field">
          <span>Status</span>
          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value || undefined,
                page: 1,
              })
            }
          >
            <option value="">Todos os status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Origem</span>
          <select
            value={filters.source ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                source: event.target.value || undefined,
                page: 1,
              })
            }
          >
            <option value="">Todas as origens</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-field form-field--action">
          <span>&nbsp;</span>
          <button className="primary-link" type="button" onClick={applySearch}>
            Pesquisar
          </button>
        </div>
      </div>
      <div className="stack stack--sm">
        <div className="field-label-row">
       </div>
        <div className="chip-list">
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`chip ${selectedTags.includes(tag.name) ? "is-active" : ""}`}
              type="button"
              onClick={() => handleTagToggle(tag.name)}
            >
              <span className="chip__swatch" style={{ backgroundColor: tag.color }} aria-hidden="true" />
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
