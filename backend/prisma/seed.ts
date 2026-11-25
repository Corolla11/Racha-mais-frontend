import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/lib/prisma.js";

const SENHA_PADRAO = "Senha123!";

async function main() {
  const senhaHash = await hashPassword(SENHA_PADRAO);
  const agora = Date.now();
  const em12Horas = new Date(agora + 12 * 60 * 60 * 1000);
  const em5Dias = new Date(agora + 5 * 24 * 60 * 60 * 1000);
  const ontem = new Date(agora - 24 * 60 * 60 * 1000);

  const usuarios = [
    { id: "seed-user-ana", name: "Ana Souza", email: "ana@racha.test", chavePix: "ana@racha.test", tipoChave: "email" as const },
    { id: "seed-user-bruno", name: "Bruno Lima", email: "bruno@racha.test", chavePix: "+5511999990001", tipoChave: "telefone" as const },
    { id: "seed-user-carla", name: "Carla Dias", email: "carla@racha.test", chavePix: "12345678909", tipoChave: "cpf" as const },
  ];

  for (const u of usuarios) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, emailVerified: true },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
      },
    });

    const contaExistente = await prisma.account.findFirst({
      where: { userId: u.id, providerId: "credential" },
      select: { id: true },
    });
    if (contaExistente) {
      await prisma.account.update({
        where: { id: contaExistente.id },
        data: { password: senhaHash },
      });
    } else {
      await prisma.account.create({
        data: {
          id: `seed-acc-${u.id}`,
          accountId: u.id,
          providerId: "credential",
          userId: u.id,
          password: senhaHash,
        },
      });
    }

    await prisma.chavePix.upsert({
      where: { chave: u.chavePix },
      update: { tipoChave: u.tipoChave, idUser: u.id },
      create: {
        id: `seed-pix-${u.id}`,
        idUser: u.id,
        tipoChave: u.tipoChave,
        chave: u.chavePix,
      },
    });
  }

  await prisma.grupo.upsert({
    where: { id: "seed-grupo-viagem" },
    update: { nome: "Viagem Litoral", descricao: "Casa de praia, transporte e passeios do feriado." },
    create: {
      id: "seed-grupo-viagem",
      nome: "Viagem Litoral",
      descricao: "Casa de praia, transporte e passeios do feriado.",
    },
  });

  await prisma.grupo.upsert({
    where: { id: "seed-grupo-churrasco" },
    update: { nome: "Churrasco da Equipe", descricao: "Carnes, bebidas e carvão do fim de semana." },
    create: {
      id: "seed-grupo-churrasco",
      nome: "Churrasco da Equipe",
      descricao: "Carnes, bebidas e carvão do fim de semana.",
    },
  });

  const membros = [
    { idUser: "seed-user-ana", idGrupo: "seed-grupo-viagem", funcao: "dono" as const },
    { idUser: "seed-user-bruno", idGrupo: "seed-grupo-viagem", funcao: "membro" as const },
    { idUser: "seed-user-carla", idGrupo: "seed-grupo-viagem", funcao: "membro" as const },
    { idUser: "seed-user-bruno", idGrupo: "seed-grupo-churrasco", funcao: "dono" as const },
    { idUser: "seed-user-ana", idGrupo: "seed-grupo-churrasco", funcao: "membro" as const },
  ];

  for (const m of membros) {
    await prisma.membro.upsert({
      where: { idUser_idGrupo: { idUser: m.idUser, idGrupo: m.idGrupo } },
      update: { funcao: m.funcao },
      create: m,
    });
  }

  const tarefas = [
    {
      id: "seed-tarefa-casa",
      idGrupo: "seed-grupo-viagem",
      idUser: "seed-user-ana",
      nome: "Aluguel da casa de praia",
      descricao: "Reserva para 3 diárias no litoral.",
      valorTotal: "900.00",
      dataInicio: ontem,
      dataFinal: em5Dias,
      tipoTarefa: "contribuinte" as const,
      statusAndamento: "EM_ANDAMENTO" as const,
    },
    {
      id: "seed-tarefa-mercado",
      idGrupo: "seed-grupo-viagem",
      idUser: "seed-user-bruno",
      nome: "Compras de mercado e bebidas",
      descricao: "Café da manhã, água e lanches.",
      valorTotal: "300.00",
      dataInicio: ontem,
      dataFinal: em12Horas,
      tipoTarefa: "contribuinte" as const,
      statusAndamento: "AGENDADA" as const,
    },
    {
      id: "seed-tarefa-carvao",
      idGrupo: "seed-grupo-churrasco",
      idUser: "seed-user-bruno",
      nome: "Levar grelha e carvão",
      descricao: "Confirmar disponibilidade antes do evento.",
      valorTotal: "0.00",
      dataInicio: ontem,
      dataFinal: em5Dias,
      tipoTarefa: "comum" as const,
      statusAndamento: "AGENDADA" as const,
    },
  ];

  for (const t of tarefas) {
    await prisma.tarefa.upsert({
      where: { id: t.id },
      update: {
        nome: t.nome,
        descricao: t.descricao,
        valorTotal: t.valorTotal,
        dataInicio: t.dataInicio,
        dataFinal: t.dataFinal,
        tipoTarefa: t.tipoTarefa,
        statusAndamento: t.statusAndamento,
      },
      create: t,
    });
  }

  const partes = [
    {
      id: "seed-parte-casa-ana",
      idUser: "seed-user-ana",
      idGrupo: "seed-grupo-viagem",
      idTarefa: "seed-tarefa-casa",
      descricao: "Cota: Aluguel da casa de praia",
      valor: "300.00",
      status: "FINALIZADA" as const,
    },
    {
      id: "seed-parte-casa-bruno",
      idUser: "seed-user-bruno",
      idGrupo: "seed-grupo-viagem",
      idTarefa: "seed-tarefa-casa",
      descricao: "Cota: Aluguel da casa de praia",
      valor: "300.00",
      status: "EM_ANDAMENTO" as const,
    },
    {
      id: "seed-parte-casa-carla",
      idUser: "seed-user-carla",
      idGrupo: "seed-grupo-viagem",
      idTarefa: "seed-tarefa-casa",
      descricao: "Cota: Aluguel da casa de praia",
      valor: "300.00",
      status: "AGENDADA" as const,
    },
    {
      id: "seed-parte-mercado-ana",
      idUser: "seed-user-ana",
      idGrupo: "seed-grupo-viagem",
      idTarefa: "seed-tarefa-mercado",
      descricao: "Cota: Compras de mercado e bebidas",
      valor: "150.00",
      status: "AGENDADA" as const,
    },
    {
      id: "seed-parte-mercado-bruno",
      idUser: "seed-user-bruno",
      idGrupo: "seed-grupo-viagem",
      idTarefa: "seed-tarefa-mercado",
      descricao: "Cota: Compras de mercado e bebidas",
      valor: "150.00",
      status: "FINALIZADA" as const,
    },
  ];

  for (const p of partes) {
    await prisma.parte.upsert({
      where: { id: p.id },
      update: {
        idGrupo: p.idGrupo,
        descricao: p.descricao,
        valor: p.valor,
        status: p.status,
      },
      create: p,
    });
  }

  await prisma.notificacao.createMany({
    data: [
      {
        idUser: "seed-user-bruno",
        tipo: "MEMBRO_ADICIONADO",
        titulo: "Você foi adicionado a um grupo",
        mensagem: 'Você agora faz parte do grupo "Viagem Litoral".',
        idGrupo: "seed-grupo-viagem",
        chaveEvento: "seed-membro-bruno-viagem",
      },
      {
        idUser: "seed-user-bruno",
        tipo: "COBRANCA_CRIADA",
        titulo: "Nova cobrança",
        mensagem: 'Você recebeu uma cobrança de R$ 300,00 na tarefa "Aluguel da casa de praia".',
        idGrupo: "seed-grupo-viagem",
        idTarefa: "seed-tarefa-casa",
        idParte: "seed-parte-casa-bruno",
        chaveEvento: "seed-cobranca-bruno-casa",
      },
      {
        idUser: "seed-user-ana",
        tipo: "TAREFA_CRIADA",
        titulo: "Nova tarefa no grupo",
        mensagem: 'A tarefa "Compras de mercado e bebidas" foi criada no grupo "Viagem Litoral".',
        idGrupo: "seed-grupo-viagem",
        idTarefa: "seed-tarefa-mercado",
        chaveEvento: "seed-tarefa-ana-mercado",
      },
      {
        idUser: "seed-user-ana",
        tipo: "PRAZO_PROXIMO",
        titulo: "Prazo se aproximando",
        mensagem: 'A tarefa "Compras de mercado e bebidas" vence nas próximas 24 horas.',
        idGrupo: "seed-grupo-viagem",
        idTarefa: "seed-tarefa-mercado",
        idParte: "seed-parte-mercado-ana",
        chaveEvento: "seed-prazo-ana-mercado",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluído com sucesso.");
  console.log("Usuários de teste (senha padrão: Senha123!):");
  for (const u of usuarios) {
    console.log(`- ${u.name}: ${u.email} (Pix: ${u.chavePix})`);
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
