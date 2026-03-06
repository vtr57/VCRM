export function PrivacyPolicyPage() {
  return (
    <section className="policy-page">
      <article className="card policy-card">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Legal</p>
            <h1>Politica de Privacidade</h1>
          </div>
        </div>

        <p className="section-copy">Ultima atualizacao: 6 de marco de 2026.</p>

        <div className="stack stack--sm">
          <h2>Resumo</h2>
          <p>
            Esta politica descreve como a extensao VCRM para WhatsApp Web e o sistema VCRM tratam dados
            pessoais durante autenticacao e cadastro de leads.
          </p>
        </div>

        <div className="stack stack--sm">
          <h2>1. Acesso ao WhatsApp</h2>
          <p>
            A extensao e o CRM <strong>nao acessam o conteudo de mensagens do WhatsApp</strong>. O painel
            apenas exibe um formulario lateral para operacao comercial.
          </p>
        </div>

        <div className="stack stack--sm">
          <h2>2. Envio de dados para API</h2>
          <p>
            Dados informados no formulario sao enviados para a API do VCRM para autenticar o usuario e
            registrar leads. O envio ocorre por requisicoes HTTPS para o backend configurado do projeto.
          </p>
        </div>

        <div className="stack stack--sm">
          <h2>3. Dados coletados</h2>
          <p>Para criacao de lead, o sistema pode coletar e armazenar:</p>
          <ul className="policy-list">
            <li>Nome completo</li>
            <li>Email</li>
            <li>Telefone</li>
            <li>Empresa</li>
            <li>Cargo</li>
            <li>Origem</li>
            <li>Temperatura</li>
            <li>Valor estimado</li>
          </ul>
          <p>
            O campo <strong>telefone</strong> faz parte dos dados de lead e tratado como dado pessoal.
          </p>
        </div>

        <div className="stack stack--sm">
          <h2>4. Armazenamento local na extensao</h2>
          <p>
            A extensao utiliza armazenamento local do navegador para manter sessao autenticada e configuracao
            operacional basica.
          </p>
        </div>

        <div className="stack stack--sm">
          <h2>5. Contato</h2>
          <p>
            Para duvidas sobre privacidade ou solicitacoes relacionadas a dados pessoais, entre em contato com
            o responsavel pelo VCRM da sua organizacao.
          </p>
        </div>
      </article>
    </section>
  );
}
