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

    test('Prazo padrão de produção deve ser de 9 dias úteis em todo o site (sem referências a 12 dias úteis)', () => {
        const filesToCheck = [
            'src/app/api/checkout/route.ts',
            'src/app/checkout/page.tsx',
            'src/app/politicas/page.tsx',
            'src/app/produto/[id]/product-client-view.tsx',
            'src/app/sucesso/page.tsx',
            'src/components/homepage/footer.tsx',
            'src/components/homepage/top-bar.tsx',
            'src/lib/description-generator.ts',
            'src/data/product-control.ts',
        ];

        for (const relPath of filesToCheck) {
            const fullPath = path.resolve(process.cwd(), relPath);
            const content = fs.readFileSync(fullPath, 'utf-8');
            assert.ok(
                !/12\s*(?:dias|úteis|uteis)/i.test(content),
                `${relPath} não deve conter "12 dias" ou "12 úteis"`
            );
        }

        const checkoutApiContent = fs.readFileSync(checkoutApiPath, 'utf-8');
        assert.ok(
            checkoutApiContent.includes('addBusinessDays(now, 9)'),
            'Checkout API deve calcular deadline com addBusinessDays(now, 9)'
        );
        assert.ok(
            !checkoutApiContent.includes('addBusinessDays(now, 12)'),
            'Checkout API não deve usar addBusinessDays(now, 12)'
        );

        const topBarContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/homepage/top-bar.tsx'), 'utf-8');
        assert.ok(topBarContent.includes('9 dias úteis'), 'TopBar deve exibir 9 dias úteis');

        const footerContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/homepage/footer.tsx'), 'utf-8');
        assert.ok(footerContent.includes('9 dias úteis'), 'Footer deve exibir 9 dias úteis');
    });
});
