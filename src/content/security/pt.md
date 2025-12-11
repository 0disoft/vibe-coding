# Política de Segurança

> Última Atualização: {{LAST_UPDATED}}

## Tecnologias e Princípios de Proteção de Dados

Os dados do usuário são processados com segurança com medidas de proteção aplicadas em várias camadas, incluindo criptografia em repouso e TLS em trânsito.

### Proteção de Senha
**As senhas dos usuários nunca são armazenadas em texto simples e são protegidas usando as tecnologias de hash mais recentes.**
- **Algoritmo**: {{ENC_ALGO_PASSWORD}}
- **Motivo**: {{ENC_REASON_PASSWORD}}
- Um Salt exclusivo é aplicado a cada senha para evitar ataques de rainbow table.

### Criptografia de Dados
**As informações confidenciais são criptografadas imediatamente antes do armazenamento, com gerenciamento de chaves estritamente separado.**
- **Algoritmo**: {{ENC_ALGO_DATA}}
- **Motivo**: {{ENC_REASON_DATA}}
- **Derivação de Chave**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Usamos Criptografia de Envelope (Envelope Encryption) para proteger Chaves de Criptografia de Dados (DEK) com Chaves de Criptografia de Chave (KEK) separadas.

### Integridade de Dados
**Funções de hash de alto desempenho são usadas para verificar se os dados críticos do sistema não foram violados.**
- **Algoritmo**: {{ENC_ALGO_INTEGRITY}}
- **Motivo**: {{ENC_REASON_INTEGRITY}}

### Segurança de Transporte
**Toda a comunicação entre usuários e servidores é protegida por um túnel criptografado usando os protocolos de segurança mais recentes.**
- **Protocolo**: {{ENC_ALGO_TRANSPORT}}
- **Motivo**: {{ENC_REASON_TRANSPORT}}
- HTTPS é imposto para todas as comunicações, e HSTS é aplicado para impedir estritamente ataques de downgrade.

## Segurança Administrativa e Física

Além das medidas técnicas, gerenciamos minuciosamente a segurança em relação a pessoas e processos.

- **Controle de Acesso de Funcionários**: O acesso aos dados é concedido apenas a pessoal essencial com base no 'Princípio do Menor Privilégio'. Todo o histórico de acesso é registrado e auditado. O acesso sem motivo legítimo é estritamente proibido.
- **Segurança Física**: Toda a infraestrutura de nuvem de terceiros opera em data centers que obtiveram certificações de segurança física, como ISO 27001.

## Segurança de Conta e Sessão

- **Proteção de Login**: Aplicamos limites de tentativa de login e mecanismos de atraso para bloquear ataques automatizados de força bruta.
- **Gerenciamento de Sessão**: As sessões expiram automaticamente após um período de inatividade, e notificações são enviadas para alterações importantes na conta.
- **Autenticação de Dois Fatores**: Planejamos introduzir a funcionalidade 2FA no futuro.

## Segurança de Aplicativo

Projetamos tendo em mente as melhores práticas de segurança, como OWASP Top 10, desde a fase de desenvolvimento.

- **Validação de Entrada**: Prepared Statements e ORMs são usados para consultas de banco de dados, e a entrada do usuário é validada tanto no lado do servidor quanto no lado do cliente.
- **Defesa contra Ataques**: Tokens CSRF, atributos de cookie SameSite e CSP (Content Security Policy) são aplicados para mitigar sequestro de sessão e ataques de injeção de script.

## Segurança da Cadeia de Suprimentos de Software

- **Gerenciamento de Dependências**: Bibliotecas e pacotes externos são instalados apenas de registros oficiais, e versões verificadas são garantidas por meio de arquivos de bloqueio.
- **Verificações de Vulnerabilidade**: Relatórios de vulnerabilidade são revisados regularmente, e dependências de alto risco são priorizadas para atualizações.

## Retenção e Exclusão de Dados

- **Exclusão de Conta**: Mediante solicitação de exclusão de conta, os dados relacionados são destruídos permanentemente após um período de carência de 30 dias (para recuperação de exclusão acidental).
- **Dados de Backup**: Backups para estabilidade do sistema são retidos por no máximo 90 dias e, em seguida, excluídos com segurança. Devido a limitações técnicas, a exclusão completa dos sistemas de backup pode exigir tempo adicional.
- **Dados de Log**: Logs de acesso são retidos por 1 ano para análise de ameaças de segurança de longo prazo e identificação de tendências.
- **Exceção de Retenção Legal**: Dados exigidos por lei para serem retidos por um período específico podem ser armazenados separadamente pelo tempo aplicável.

## Resposta a Incidentes

No caso de um incidente de segurança, seguimos estes procedimentos para resposta rápida e minimização de danos:

1. **Detecção e Contenção (Imediata)**: Isolar ameaças e prevenir danos adicionais.
2. **Análise de Impacto**: Avaliar o escopo e a gravidade o mais rápido possível, normalmente em questão de horas.
3. **Notificação do Usuário**: Para incidentes que afetam os usuários (por exemplo, vazamentos de dados), notificar os usuários o mais rápido possível e cumprir os prazos legais (por exemplo, 72 horas).
4. **Divulgação Transparente**: Publicar um relatório detalhado (causa, ações, medidas preventivas) após a resolução do incidente.

## Auditorias de Segurança e Serviços de Terceiros

- **Auditorias de Segurança**: Atualmente estamos na fase de estabilização do serviço e realizamos revisões regulares de código interno e verificações de segurança. Planejamos introduzir auditorias de segurança regulares de terceiros à medida que o serviço for escalado.
- **Infraestrutura de Terceiros**: Aderimos ao princípio de não armazenar informações confidenciais não criptografadas diretamente. Para funções principais como pagamentos e autenticação, utilizamos serviços confiáveis ({{THIRD_PARTY_PROVIDERS}}, etc.) que obtiveram certificações de segurança reconhecidas internacionalmente (SOC 2, ISO 27001) ou passam por avaliações de segurança equivalentes regularmente.

## Recomendações de Segurança para Usuários

A segurança da conta é uma responsabilidade compartilhada.

- **Senhas Fortes**: Use senhas exclusivas e complexas não usadas em outros sites.
- **Cuidado com Phishing**: Tenha cuidado com mensagens que alegam ser e-mails oficiais e verifique o endereço antes de clicar nos links.

## Contato

Se você tiver alguma dúvida sobre nossa Política de Segurança, entre em contato conosco em [{{EMAIL}}](mailto:{{EMAIL}}).

Para relatórios de vulnerabilidade e políticas de proteção ao pesquisador, consulte nossa página do [Programa de Bug Bounty](/pt/bug-bounty).
