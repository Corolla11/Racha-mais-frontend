import test from 'node:test';
import assert from 'node:assert/strict';
import { share, canCloseGroup } from '../src/lib/finance.ts';

test('rateios preservam o total em centavos, inclusive em divisões não exatas', () => {
  for (const cents of [1, 2, 99, 100, 101, 10000, 45001, 999999]) {
    for (let participants = 1; participants <= 50; participants++) {
      const shares = Array.from({ length: participants }, (_, index) => Math.round(share(cents / 100, participants, index) * 100));
      assert.equal(shares.reduce((sum, value) => sum + value, 0), cents);
      assert.ok(Math.max(...shares) - Math.min(...shares) <= 1);
    }
  }
});
test('sem participantes não há divisão por zero', () => assert.equal(share(100, 0, 0), 0));
test('tarefa concluída com pagamento informado não permite encerramento', () => {
  assert.equal(canCloseGroup([true], [{ payment: { status: 'informado' } }]), false);
});
test('pendências e contestações bloqueiam o encerramento', () => {
  for (const status of ['pendente', 'contestado']) assert.equal(canCloseGroup([true], [{ payment: { status } }]), false);
});
test('pagamentos confirmados não substituem a conclusão da atividade', () => {
  assert.equal(canCloseGroup([true, false], [{ payment: { status: 'confirmado' } }]), false);
});
test('encerramento exige todas as atividades concluídas e todos os pagamentos confirmados', () => {
  assert.equal(canCloseGroup([true, true], [{ payment: { status: 'confirmado' } }, { payment: { status: 'confirmado' } }]), true);
});
