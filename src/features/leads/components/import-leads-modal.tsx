import type { FormEvent } from "react";
import { useId, useMemo, useState } from "react";

import { importLeadsCsv } from "@/api/leads";

const leadImportFields = [
  "organization",
  "full_name",
  "email",
  "phone",
  "job_title",
  "source",
  "estimated_value",
] as const;

type LeadImportField = (typeof leadImportFields)[number];
type MappingState = Record<LeadImportField, string>;

interface ImportLeadsModalProps {
  onClose: () => void;
  onImported: () => Promise<void> | void;
}

interface CsvParseResult {
  headers: string[];
  rows: string[][];
}

interface ImportResultState {
  imported_count: number;
  error_count: number;
  errors: Array<{ row: number; error: string }>;
}

function detectDelimiter(line: string) {
  const semicolonCount = (line.match(/;/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  if (semicolonCount > commaCount) {
    return ";";
  }
  return ",";
}

function parseCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }
    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (current || line.endsWith(",")) {
    values.push(current.trim());
  }

  return values;
}

function parseCsvContent(content: string): CsvParseResult {
  const normalizedContent = content.replace(/^\uFEFF/, "");
  const lines = normalizedContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { headers: [], rows: [] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).filter(Boolean);
  const rows = lines.slice(1).map((line) => parseCsvLine(line, delimiter));
  return { headers, rows };
}

function buildDefaultMapping(headers: string[]) {
  return leadImportFields.reduce<MappingState>((accumulator, field) => {
    const matchingHeader = headers.find((header) => header === field) ?? "";
    accumulator[field] = matchingHeader;
    return accumulator;
  }, {} as MappingState);
}

export function ImportLeadsModal({ onClose, onImported }: ImportLeadsModalProps) {
  const fileInputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<MappingState>(() => buildDefaultMapping([]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [importResult, setImportResult] = useState<ImportResultState | null>(null);

  const mappedCount = useMemo(
    () => Object.values(mapping).filter(Boolean).length,
    [mapping],
  );

  const previewHeaders = useMemo(
    () => csvHeaders.slice(0, Math.min(csvHeaders.length, 6)),
    [csvHeaders],
  );

  function handleDownloadTemplate() {
    const templateContent = `${leadImportFields.join(",")}\n`;
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lead-import-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    setErrorMessage("");
    setResultMessage("");
    setImportResult(null);

    if (!nextFile) {
      setCsvHeaders([]);
      setPreviewRows([]);
      setMapping(buildDefaultMapping([]));
      return;
    }

    const content = await nextFile.text();
    const { headers, rows } = parseCsvContent(content);
    setCsvHeaders(headers);
    setPreviewRows(rows.slice(0, 5));
    setMapping(buildDefaultMapping(headers));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Selecione um arquivo CSV para importar.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setResultMessage("");
      setImportResult(null);
      const result = await importLeadsCsv(file, mapping);
      await onImported();
      setImportResult(result);
      setResultMessage(
        `Importacao concluida: ${result.imported_count} leads importados e ${result.error_count} erros.`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel importar o CSV.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="card modal-card import-modal-card">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Importacao</p>
          <h2>Importar leads</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onClose}>
          Fechar
        </button>
      </div>
      <p className="section-copy">
        Envie um CSV e mapeie apenas os campos essenciais de cadastro antes de iniciar a importacao.
      </p>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="import-actions">
          <div className="form-field">
            <span>Arquivo CSV</span>
            <div className="import-file-picker">
              <input
                accept=".csv,text/csv"
                className="import-file-input"
                id={fileInputId}
                type="file"
                onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
              />
              <label className="ghost-button" htmlFor={fileInputId}>
                Selecionar arquivo
              </label>
              <span className="import-file-name">{file?.name || "Nenhum arquivo selecionado"}</span>
            </div>
          </div>
          <button className="ghost-button" type="button" onClick={handleDownloadTemplate}>
            Baixar template .csv
          </button>
        </div>

        <div className="import-layout">
          <div className="import-fields">
              <div className="field-label-row">
                <span className="form-label">Campos importados do lead</span>
                <span className="field-hint">{mappedCount}/{leadImportFields.length} mapeados</span>
              </div>
            <div className="import-grid">
              {leadImportFields.map((field) => (
                <div className="import-grid__row" key={field}>
                  <span className="import-grid__field">{field}</span>
                  <select
                    value={mapping[field]}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Nao mapear</option>
                    {csvHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="import-form">
            <div className="stack stack--sm">
              <div className="field-label-row">
                <span className="form-label">Resumo do arquivo</span>
              </div>
              <div className="note-block">
                <strong>{file?.name || "Nenhum arquivo selecionado"}</strong>
                <span>{csvHeaders.length ? `${csvHeaders.length} colunas detectadas` : "Selecione um CSV para ler os cabecalhos."}</span>
              </div>
              <div className="chip-list">
                {csvHeaders.map((header) => (
                  <span key={header} className="chip">
                    {header}
                  </span>
                ))}
              </div>
            </div>

            <div className="stack stack--sm">
              <div className="field-label-row">
                <span className="form-label">Preview das primeiras linhas</span>
                <span className="field-hint">{previewRows.length} linhas carregadas</span>
              </div>
              {previewHeaders.length && previewRows.length ? (
                <div className="data-table__wrapper import-preview">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {previewHeaders.map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, rowIndex) => (
                        <tr key={`${rowIndex}-${row.join("|")}`}>
                          {previewHeaders.map((header, columnIndex) => (
                            <td key={`${header}-${rowIndex}`}>{row[columnIndex] || ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state empty-state--inline">
                  <strong>Sem preview disponivel</strong>
                  <p>Selecione um CSV para visualizar as primeiras linhas antes da importacao.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {resultMessage ? <p className="form-success">{resultMessage}</p> : null}
        {importResult?.errors.length ? (
          <div className="stack stack--sm">
            <div className="field-label-row">
              <span className="form-label">Erros por linha</span>
              <span className="field-hint">{importResult.error_count} ocorrencias</span>
            </div>
            <div className="import-error-list">
              {importResult.errors.map((entry) => (
                <article className="import-error-card" key={`${entry.row}-${entry.error}`}>
                  <strong>Linha {entry.row}</strong>
                  <p>{entry.error}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="form-actions">
          <button className="primary-link" disabled={isSubmitting || !file} type="submit">
            {isSubmitting ? "Importando..." : "Importar leads"}
          </button>
        </div>
      </form>
    </article>
  );
}
