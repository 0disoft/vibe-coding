# Programa de Bug Bounty

> Última atualização: {{LAST_UPDATED}}

## Introdução

Na {{SITE_NAME}}, colaboramos com pesquisadores de segurança para criar um ambiente de Internet mais seguro. Se você encontrou uma vulnerabilidade de segurança em nosso serviço, entre em contato conosco imediatamente.

Este programa opera atualmente como um **Canal de Divulgação de Vulnerabilidades** focado em relatórios responsáveis e colaboração, em vez de recompensas monetárias. Valorizamos e cooperamos de forma transparente com pesquisadores que divulgam vulnerabilidades de maneira ética.

## Escopo (In-Scope)

Os pesquisadores podem testar apenas os seguintes domínios e serviços:

- Site oficial da {{SITE_NAME}} e seus subdomínios
- Aplicativos móveis oficiais da {{SITE_NAME}} (quando disponíveis)
- Endpoints de API operados diretamente pela {{SITE_NAME}}

Domínios e serviços de terceiros (gateways de pagamento, ferramentas de análise, provedores de hospedagem, etc.) não listados acima não são cobertos por este programa. Se não tiver certeza se um alvo está dentro do escopo, entre em contato conosco antes de testar.

## Política de Recompensas

Atualmente, o Programa de Bug Bounty da {{SITE_NAME}} não oferece recompensas monetárias regulares. No entanto, para mostrar nosso apreço por contribuições significativas, operamos o seguinte:

- **Hall of Fame (Hall da Fama)**: Listagem dos nomes dos pesquisadores que relataram vulnerabilidades válidas (quando operacional).
- **Reconhecimento Público**: Fornecimento de reconhecimento público ou carta de recomendação com o consentimento do pesquisador.
- **Prioridade Futura**: Fornecimento de oportunidades de participação prioritária se fizermos a transição para um programa pago no futuro.

Podemos introduzir um sistema de recompensas monetárias (Bounty) no futuro, dependendo do orçamento e da escala do serviço, e anunciaremos nesta página se for implementado.

## Critérios de Severidade

| Severidade | CVSS | Exemplos |
|---|---|---|
| Critical | 9.0-10.0 | Execução remota de código (RCE), vazamento completo de BD, tomada massiva de contas |
| High | 7.0-8.9 | Injeção de SQL, XSS armazenado, bypass de autenticação |
| Medium | 4.0-6.9 | XSS refletido, CSRF em ações sensíveis, divulgação de informações |
| Low | 0.1-3.9 | Falta de cabeçalhos de segurança, divulgação de versão |

A severidade pode ser ajustada com base no impacto real.

## Relatando Vulnerabilidades

### Canais de Relatório

- **E-mail**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Assunto**: `[Security Report] Vulnerability Summary` (Resumo da vulnerabilidade)
- **Idioma**: Por favor, escreva em coreano, inglês ou português.

### Formato do Relatório

Para nos ajudar a analisar e reproduzir o problema, inclua o seguinte:

1. Tipo de vulnerabilidade e descrição detalhada.
2. Passos específicos para reproduzir o problema (incluindo scripts ou linhas de comando).
3. URLs, endpoints de API ou componentes afetados.
4. Código de prova de conceito (PoC) ou capturas de tela.

### Padrões de Qualidade do Relatório

- Relatórios que não podem ser reproduzidos ou carecem de detalhes suficientes podem não ser aceitos.
- Relatórios de saída de scanners automatizados não são aceitos.
- **Duplicatas**: Vulnerabilidades duplicadas são creditadas apenas ao primeiro relator. (Com base no carimbo de data/hora de recebimento do servidor de e-mail)

### Processo

1. **Confirmação de Recebimento**: Enviaremos um e-mail de confirmação dentro de 72 horas após o seu relatório.
2. **Análise e Planejamento**: Uma vez verificada a vulnerabilidade, avaliaremos sua severidade e informaremos o prazo estimado para correção. Se não pudermos cumprir o prazo, explicaremos o motivo e forneceremos um cronograma atualizado.
3. **Resolução e Notificação**: Notificaremos você assim que o patch for concluído. A resolução pode levar tempo se forem necessárias alterações estruturais para a estabilidade do serviço.
4. **Divulgação e Reconhecimento**: Uma vez resolvido, decidiremos sobre a divulgação em consulta com o pesquisador. Relatórios válidos serão reconhecidos de acordo com a 'Política de Recompensas' acima.
5. **Emissão de CVE**: Para vulnerabilidades significativas, podemos solicitar a emissão de um número CVE com o consentimento do relator.

### Política de Divulgação Pública (Public Disclosure)

- Recomendamos a divulgação após a conclusão do patch e solicitamos que compartilhe os detalhes da divulgação conosco com antecedência.
- Se nenhuma ação apropriada for tomada dentro de **60 dias** após o relatório, o relator tem o direito de divulgar detalhes da vulnerabilidade de maneira mutuamente acordada. (No entanto, podemos solicitar um ajuste de cronograma para problemas complexos.)
- Em casos urgentes onde a exploração ativa é observada "in the wild", podemos coordenar com você para uma divulgação antecipada.

## Política e Diretrizes de Teste

Por favor, siga as diretrizes abaixo para testes de vulnerabilidade seguros.

### Atividades Permitidas

- Testar vulnerabilidades usando contas que você possui ou contas de teste que você criou.
- **Verificação Mínima**: Acesse apenas os dados mínimos necessários para provar a vulnerabilidade. Se você acidentalmente acessar informações confidenciais de terceiros, pare imediatamente e inclua apenas informações mascaradas em seu relatório.

### Ambiente de Teste

- **Solicitação de Conta de Teste**: Se precisar de uma conta de teste, você pode solicitá-la em [{{EMAIL}}](mailto:{{EMAIL}}).
- **Scans Automatizados**: Scans leves são permitidos, mas scans de alta carga que geram solicitações excessivas por segundo ou afetam a qualidade do serviço requerem coordenação prévia.

### Atividades Proibidas (Fora do Escopo)

As seguintes atividades são estritamente proibidas e podem não ser legalmente protegidas se violadas:

- Executar **scans automatizados excessivos** (a um nível que cause carga no serviço) sem coordenação prévia.
- Qualquer atividade que esgote intencionalmente os recursos do servidor (CPU, memória, disco, largura de banda da rede).
- Acessar ou modificar contas, dados ou informações pessoais de outros usuários.
- Engenharia social (phishing, etc.) ou ataques de segurança física.

### Fora do Escopo Explícito (Out-of-Scope)

- Vulnerabilidades encontradas em serviços ou infraestrutura de terceiros.
- Segurança física, sistemas de RH, redes internas.
- Vulnerabilidades já públicas ou relatórios duplicados.
- Problemas causados apenas pelo envio de spam ou e-mails de phishing.

### Vulnerabilidades de Baixo Risco (Não Aceitas)

Os seguintes itens são excluídos do programa, pois apresentam baixo risco de segurança ou são comportamento intencional:

- CSRF de baixo impacto, como CSRF de logout
- Clickjacking em páginas sem informações confidenciais
- Divulgação simples de versão (banner grabbing)
- Configurações de segurança ausentes sem caminho de exploração comprovado (por exemplo, falta de cabeçalhos de segurança sem impacto direto, políticas de envio de e-mail não configuradas, etc.)
- Preenchimento automático do navegador ativado

No entanto, mesmo os itens acima podem ser avaliados se forem encadeados com outras vulnerabilidades para provar um cenário de ataque real.

### Proteção do Pesquisador (Safe Harbor)

Se você pesquisar e relatar vulnerabilidades de boa fé e em conformidade com esta política, prometemos o seguinte **na medida permitida pela lei aplicável**:

1. Consideramos suas atividades de pesquisa como pesquisa de segurança autorizada e não tomaremos nenhuma ação legal civil ou criminal contra você.
2. Não o denunciaremos voluntariamente às autoridades policiais nem apresentaremos queixa.
3. Se um terceiro iniciar uma ação legal em relação às suas atividades de pesquisa, forneceremos suporte dentro de um limite razoável, como fornecer documentação comprovando que você é um pesquisador em conformidade.

No entanto, o Safe Harbor não se aplica nos seguintes casos:

- Violação clara das atividades proibidas neste documento.
- Testes não autorizados de sistemas ou infraestrutura de terceiros fora do nosso controle.

## Contato

Se você tiver alguma dúvida sobre nosso Programa de Bug Bounty, sinta-se à vontade para nos contatar em [{{EMAIL}}](mailto:{{EMAIL}}).
