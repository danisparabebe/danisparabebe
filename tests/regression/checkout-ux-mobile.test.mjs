import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: UX Mobile & Checkout Instagram WebView (Fase 1)', () => {
    const checkoutPath = path.resolve('src/app/checkout/page.tsx');
    const content = fs.readFileSync(checkoutPath, 'utf8');

    test('Deve conter a Sticky Bottom Bar para dispositivos móveis', () => {
        assert.ok(
            content.includes('md:hidden fixed bottom-0 inset-x-0'),
            'Barra fixa mobile inferior (sticky bar) deve estar presente'
        );
        assert.ok(
            content.includes('PAGAR AGORA'),
            'Botão de ação rápida deve estar presente na sticky bar mobile'
        );
    });

    test('Deve conter o modal/fallback de transição segura para Instagram WebView', () => {
        assert.ok(
            content.includes('paymentRedirectUrl'),
            'Estado de fallback de URL do gateway deve existir'
        );
        assert.ok(
            content.includes('ABRIR PAGAMENTO AGORA'),
            'Botão explícito de contingência para WebView deve estar presente'
        );
    });

    test('Deve manter a persistência de dados de checkout no LocalStorage', () => {
        assert.ok(
            content.includes("localStorage.getItem('checkout_form')"),
            'Recuperação do formulário em cache deve estar ativa'
        );
        assert.ok(
            content.includes("localStorage.setItem('checkout_form'"),
            'Gravação de alterações do formulário em cache deve estar ativa'
        );
    });
});
