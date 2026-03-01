import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { createLead, type LeadWritePayload, updateLead } from "@/api/leads";
import type { LeadDetail, LeadSource, LeadTag, LeadTemperature } from "@/types/leads";

interface LeadCreateCardProps {
  sources: LeadSource[];
  tags: LeadTag[];
  lead?: LeadDetail | null;
  onClose?: () => void;
}

interface LeadCreateState {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title: string;
  temperature: LeadTemperature;
  estimated_value: string;
  notes_summary: string;
  source_id: string;
  tag_ids: string[];
}

const initialState: LeadCreateState = {
  full_name: "",
  email: "",
  phone: "",
  company_name: "",
  job_title: "",
  temperature: "warm",
  estimated_value: "",
  notes_summary: "",
  source_id: "",
  tag_ids: [],
};

function getFormState(lead?: LeadDetail | null): LeadCreateState {
  if (!lead) {
    return initialState;
  }

  return {
    full_name: lead.full_name,
    email: lead.email || "",
    phone: lead.phone || "",
    company_name: lead.company_name || "",
    job_title: lead.job_title || "",
    temperature: lead.temperature,
    estimated_value: lead.estimated_value || "",
    notes_summary: lead.notes_summary || "",
    source_id: lead.source?.id || "",
    tag_ids: lead.tags.map((tag) => tag.id),
  };
}

export function LeadCreateCard({ sources, tags, lead, onClose }: LeadCreateCardProps) {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<LeadCreateState>(() => getFormState(lead));
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = Boolean(lead);

  useEffect(() => {
    setFormState(getFormState(lead));
    setErrorMessage("");
  }, [lead]);

  const leadMutation = useMutation({
    mutationFn: (payload: LeadWritePayload) =>
      isEditing && lead ? updateLead(lead.id, payload) : createLead(payload),
    onSuccess: async (savedLead) => {
      setFormState(initialState);
      setErrorMessage("");
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["pipeline-board"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["lead", savedLead.id] });
      onClose?.();
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Nao foi possivel atualizar o lead."
            : "Nao foi possivel criar o lead.",
      );
    },
  });

  function handleTagToggle(tagId: string) {
    setFormState((current) => ({
      ...current,
      tag_ids: current.tag_ids.includes(tagId)
        ? current.tag_ids.filter((value) => value !== tagId)
        : [...current.tag_ids, tagId],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const payload: LeadWritePayload = {
      full_name: formState.full_name,
      email: formState.email || undefined,
      phone: formState.phone || undefined,
      company_name: formState.company_name || undefined,
      job_title: formState.job_title || undefined,
      temperature: formState.temperature,
      estimated_value: formState.estimated_value || undefined,
      notes_summary: formState.notes_summary || undefined,
      source_id: formState.source_id || undefined,
      tag_ids: formState.tag_ids.length ? formState.tag_ids : undefined,
    };

    leadMutation.mutate(payload);
  }

  return (
    <article className="card modal-card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Captacao</p>
          <h2>{isEditing ? "Editar lead" : "Adicionar lead"}</h2>
        </div>
        <div className="toolbar-actions">
          <span className="badge badge--accent">Entrada rapida</span>
          {onClose ? (
            <button className="ghost-button" type="button" onClick={onClose}>
              Fechar
            </button>
          ) : null}
        </div>
      </div>
      <p className="section-copy">
        {isEditing
          ? "Atualize os dados comerciais sem sair da carteira. As mudancas refletem imediatamente na operacao."
          : "Cadastre um contato sem sair da carteira. O lead entra com status inicial automatico e ja fica disponivel no funil."}
      </p>
      <form className="stack" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--three">
          <label className="form-field">
            <span>Nome completo</span>
            <input
              required
              value={formState.full_name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, full_name: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Telefone</span>
            <input
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Empresa</span>
            <input
              value={formState.company_name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, company_name: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Cargo</span>
            <input
              value={formState.job_title}
              onChange={(event) =>
                setFormState((current) => ({ ...current, job_title: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Origem</span>
            <select
              value={formState.source_id}
              onChange={(event) =>
                setFormState((current) => ({ ...current, source_id: event.target.value }))
              }
            >
              <option value="">Sem origem</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Temperatura</span>
            <select
              value={formState.temperature}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  temperature: event.target.value as LeadTemperature,
                }))
              }
            >
              <option value="cold">Frio</option>
              <option value="warm">Morno</option>
              <option value="hot">Quente</option>
            </select>
          </label>
          <label className="form-field">
            <span>Valor estimado</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={formState.estimated_value}
              onChange={(event) =>
                setFormState((current) => ({ ...current, estimated_value: event.target.value }))
              }
            />
          </label>
        </div>
        <label className="form-field">
          <span>Resumo</span>
          <textarea
            rows={3}
            placeholder="Contexto, necessidade, canal de entrada ou proximo passo."
            value={formState.notes_summary}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes_summary: event.target.value }))
            }
          />
        </label>
        <div className="stack stack--sm">
          <div className="field-label-row">
            <span className="form-label">Tags</span>
          </div>
          <div className="chip-list">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={`chip ${formState.tag_ids.includes(tag.id) ? "is-active" : ""}`}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
              >
                <span className="chip__swatch" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <div className="form-actions">
          <button className="primary-link" disabled={leadMutation.isPending} type="submit">
            {leadMutation.isPending ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Adicionar lead"}
          </button>
        </div>
      </form>
    </article>
  );
}
