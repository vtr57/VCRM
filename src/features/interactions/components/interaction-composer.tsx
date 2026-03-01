import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";

import { createInteraction } from "@/api/interactions";
import type { InteractionDirection, InteractionType } from "@/types/interactions";

interface InteractionComposerProps {
  leadId: string;
  dealId?: string | null;
  timelineQueryKey: readonly unknown[];
  extraInvalidateKeys?: readonly (readonly unknown[])[];
}

const interactionTypeOptions: Array<{ label: string; value: InteractionType }> = [
  { label: "Ligacao", value: "call" },
  { label: "Mensagem", value: "message" },
  { label: "Observacao", value: "note" },
];

interface ComposerState {
  type: InteractionType;
  direction: InteractionDirection;
  subject: string;
  content: string;
  outcome: string;
}

const initialState: ComposerState = {
  type: "call",
  direction: "outbound",
  subject: "",
  content: "",
  outcome: "",
};

export function InteractionComposer({
  leadId,
  dealId = null,
  timelineQueryKey,
  extraInvalidateKeys = [],
}: InteractionComposerProps) {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<ComposerState>(initialState);
  const [errorMessage, setErrorMessage] = useState("");

  const createInteractionMutation = useMutation({
    mutationFn: createInteraction,
    onSuccess: async () => {
      setFormState(initialState);
      setErrorMessage("");
      await queryClient.invalidateQueries({ queryKey: [...timelineQueryKey] });
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      for (const queryKey of extraInvalidateKeys) {
        await queryClient.invalidateQueries({ queryKey: [...queryKey] });
      }
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel registrar a interacao.");
    },
  });

  const needsExternalDirection = formState.type === "call" || formState.type === "message";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    createInteractionMutation.mutate({
      lead_id: leadId,
      deal_id: dealId,
      type: formState.type,
      direction: needsExternalDirection ? formState.direction : "internal",
      subject: formState.subject,
      content: formState.content,
      outcome: formState.outcome,
    });
  }

  return (
    <article className="card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Registrar</p>
          <h2>Nova interacao</h2>
        </div>
      </div>
      <form className="stack" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--three">
          <label className="form-field">
            <span>Tipo</span>
            <select
              value={formState.type}
              onChange={(event) => {
                const nextType = event.target.value as InteractionType;
                setFormState((current) => ({
                  ...current,
                  type: nextType,
                  direction: nextType === "note" ? "internal" : current.direction,
                }));
              }}
            >
              {interactionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Assunto</span>
            <input
              placeholder="Ex.: Ligacao de qualificacao"
              value={formState.subject}
              onChange={(event) =>
                setFormState((current) => ({ ...current, subject: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Resultado</span>
            <input
              placeholder="Ex.: Agendou demo"
              value={formState.outcome}
              onChange={(event) =>
                setFormState((current) => ({ ...current, outcome: event.target.value }))
              }
            />
          </label>
        </div>
        {needsExternalDirection ? (
          <div className="segmented-control" role="group" aria-label="Direcao da interacao">
            {[
              { label: "Saida", value: "outbound" },
              { label: "Entrada", value: "inbound" },
            ].map((option) => (
              <button
                key={option.value}
                className={formState.direction === option.value ? "is-active" : ""}
                type="button"
                onClick={() =>
                  setFormState((current) => ({
                    ...current,
                    direction: option.value as InteractionDirection,
                  }))
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        <label className="form-field">
          <span>Descricao</span>
          <textarea
            placeholder="Registre o contexto da conversa, objeções e proximo passo."
            rows={4}
            value={formState.content}
            onChange={(event) =>
              setFormState((current) => ({ ...current, content: event.target.value }))
            }
            required
          />
        </label>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <div className="form-actions">
          <button className="primary-link" disabled={createInteractionMutation.isPending} type="submit">
            {createInteractionMutation.isPending ? "Salvando..." : "Registrar interacao"}
          </button>
        </div>
      </form>
    </article>
  );
}
