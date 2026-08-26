---
name: Feature request
about: Issue padrão do projeto
title: ''
labels: ''
assignees: ''
type: Task

---

## Descrição
[Descrever a tarefa, o que ela é e o que ela deve realizar]
]
### Especificação
[Especificar o que será feito na prática, abaixo há um code-block para exemplos ou especificações]

```
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_cadastro DATE
);

CREATE TABLE pedidos (
    pedido_id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT,
    valor_total DECIMAL(10, 2) NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

### Endpoints
[Definição dos endpoints a serem criados, importante que estejam padronizados entre front e back]
- GET /etc/etc - receber etc
- POST /etc/etc - adicionar etc
- DELETE /etc/etc - apagar etc

### Regras de negócio
[Regras importantes, a feature deve cumpri-las]

### Dependências
[Tasks ou atividades necessárias para a realização dessa task]

### Checklist (Opcional)
[Checklist do que deve ser feito, apenas para facilitar o andamento da task]
- [ ] Check 1
- [ ] Check 2
- [ ] Check 3
- [ ] Check 4

#### **Observações adicionais**
[Observações a mais para outras tasks e afins]
