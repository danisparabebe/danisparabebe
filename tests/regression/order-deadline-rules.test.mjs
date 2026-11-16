import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Regras de Prazo de Entrega e Produção (Pós-Pagamento)', () => {
    const checkoutApiPath = path.resolve(process.cwd(), 'src/app/api/checkout/route.ts');
    const webhookApiPath = path.resolve(process.cwd(), 'src/app/api/webhooks/infinitepay/route.ts');
    const adminPedidosApiPath = path.resolve(process.cwd(), 'src/app/api/admin/pedidos/route.ts');
    const adminPedidosPagePath = path.resolve(process.cwd(), 'src/app/admin/pedidos/page.tsx');
    const clientOrderSheetPath = path.resolve(process.cwd(), 'src/components/product/client-order-sheet.tsx');

    test('Checkout não deve iniciar contagem de prazo enquanto o pedido estiver pendente', () => {
        assert.ok(fs.existsSync(checkoutApiPath), 'src/app/api/checkout/route.ts deve existir');
        const content = fs.readFileSync(checkoutApiPath, 'utf-8');

        assert.ok(content.includes('deadlineDate: null'), 'Pedido pendente criado no checkout deve ter deadlineDate nulo');
        assert.ok(content.includes('status: \'pendente\''), 'Status inicial deve ser pendente');
    });

    test('Webhook da InfinitePay deve iniciar prazo de 15 dias a partir da confirmação do pagamento', () => {
        assert.ok(fs.existsSync(webhookApiPath), 'src/app/api/webhooks/infinitepay/route.ts deve existir');
        const content = fs.readFileSync(webhookApiPath, 'utf-8');

        assert.ok(content.includes('status: \'pago_aprovado\''), 'Webhook deve marcar status como pago_aprovado');
        assert.ok(content.includes('paymentDate: paidAt.toISOString()'), 'Webhook deve salvar paymentDate');
        assert.ok(content.includes('deadline.setDate(deadline.getDate() + 15)'), 'Webhook deve calcular 15 dias a partir do pagamento');
        assert.ok(content.includes('deadlineDate: deadline.toISOString()'), 'Webhook deve salvar deadlineDate calculado');
    });

    test('API do Admin de Pedidos deve suspender prazo para pendentes e calcular pós-pagamento', () => {
        assert.ok(fs.existsSync(adminPedidosApiPath), 'src/app/api/admin/pedidos/route.ts deve existir');
        const content = fs.readFileSync(adminPedidosApiPath, 'utf-8');

        assert.ok(content.includes('rawStatus !== \'pendente\''), 'Prazo só deve ser calculado se não estiver pendente');
        assert.ok(content.includes('updatePayload.deadlineDate = null'), 'Ao reverter para pendente, prazo deve ser suspenso');
        assert.ok(content.includes('paymentDate'), 'Deve retornar e sincronizar paymentDate');
    });

    test('Painel Admin e Ficha Técnica devem exibir claramente que o prazo inicia após o pagamento', () => {
        const adminPageContent = fs.readFileSync(adminPedidosPagePath, 'utf-8');
        assert.ok(adminPageContent.includes('order.status !== \'pendente\' && isUrgent'), 'Pedido pendente nunca deve ser classificado como urgente');
        assert.ok(adminPageContent.includes('Inicia após pagamento'), 'Deve exibir badge "Inicia após pagamento" para pedidos pendentes');

        const sheetContent = fs.readFileSync(clientOrderSheetPath, 'utf-8');
        assert.ok(sheetContent.includes('Inicia após confirmação do pagamento'), 'Ficha técnica deve indicar que prazo inicia pós-pagamento');
    });
});
