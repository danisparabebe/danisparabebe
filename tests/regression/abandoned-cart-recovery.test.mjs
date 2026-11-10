import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Recuperação de Carrinho Abandonado via WhatsApp', () => {
    const adminPedidosPath = path.resolve(process.cwd(), 'src/app/admin/pedidos/page.tsx');
    const abandonedApiPath = path.resolve(process.cwd(), 'src/app/api/checkout/abandoned/route.ts');
    const checkoutPagePath = path.resolve(process.cwd(), 'src/app/checkout/page.tsx');
    const stepReviewPath = path.resolve(process.cwd(), 'src/components/configurator/step-review.tsx');

    test('Endpoint /api/checkout/abandoned deve existir e validar dados mínimos', () => {
        assert.ok(fs.existsSync(abandonedApiPath), 'Rota /api/checkout/abandoned deve existir');
        const content = fs.readFileSync(abandonedApiPath, 'utf-8');
        assert.ok(content.includes('cleanName.length < 2'), 'Deve validar tamanho do nome');
        assert.ok(content.includes('cleanPhone.length < 10'), 'Deve validar telefone brasileiro com DDD');
        assert.ok(content.includes('LEAD_'), 'Deve padronizar ID do lead com LEAD_');
    });

    test('Admin de Pedidos deve conter botão de recuperação no WhatsApp e mensagem personalizada', () => {
        const content = fs.readFileSync(adminPedidosPath, 'utf-8');
        assert.ok(content.includes('generateRecoveryWhatsAppUrl'), 'Deve conter gerador de URL do WhatsApp');
        assert.ok(content.includes('Recuperar WhatsApp') || content.includes('Recuperar no WhatsApp'), 'Deve conter botão de recuperar WhatsApp');
        assert.ok(content.includes('Aguardando Pagamento'), 'Deve destacar pedidos aguardando pagamento');
        assert.ok(content.includes('Bebê:'), 'Deve exibir prévia do nome do bebê se houver');
    });

    test('Checkout e Monte Seu Kit devem conter auto-captura para recuperação de leads', () => {
        const checkoutContent = fs.readFileSync(checkoutPagePath, 'utf-8');
        assert.ok(checkoutContent.includes('/api/checkout/abandoned'), 'Checkout oficial deve capturar leads abandonados');

        const reviewContent = fs.readFileSync(stepReviewPath, 'utf-8');
        assert.ok(reviewContent.includes('/api/checkout/abandoned'), 'Monte Seu Kit deve capturar leads abandonados');
    });
});
