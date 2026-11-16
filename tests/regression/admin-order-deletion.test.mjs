import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Regressão: Exclusão Segura de Pedidos no Painel Admin', () => {
    const adminPedidosPagePath = path.resolve(process.cwd(), 'src/app/admin/pedidos/page.tsx');
    const adminPedidosApiPath = path.resolve(process.cwd(), 'src/app/api/admin/pedidos/route.ts');

    test('API /api/admin/pedidos (DELETE) deve suportar exclusão individual segura com arquivamento', () => {
        assert.ok(fs.existsSync(adminPedidosApiPath), 'src/app/api/admin/pedidos/route.ts deve existir');
        const content = fs.readFileSync(adminPedidosApiPath, 'utf-8');

        assert.ok(content.includes('orderId = searchParams.get(\'orderId\')'), 'Deve obter orderId via searchParams');
        assert.ok(content.includes('orders_archive'), 'Deve arquivar o pedido com segurança em orders_archive');
        assert.ok(content.includes('manual_individual_admin'), 'Deve registrar motivo da exclusão como manual_individual_admin');
        assert.ok(content.includes('await docRef.delete()'), 'Deve remover o documento da coleção de pedidos ativos');
        assert.ok(content.includes('Pedido não encontrado'), 'Deve validar a existência do pedido com status 404');
    });

    test('Painel Admin de Pedidos deve conter botão e fluxo de confirmação para exclusão', () => {
        assert.ok(fs.existsSync(adminPedidosPagePath), 'src/app/admin/pedidos/page.tsx deve existir');
        const content = fs.readFileSync(adminPedidosPagePath, 'utf-8');

        assert.ok(content.includes('handleDeleteOrder'), 'Deve implementar função handleDeleteOrder');
        assert.ok(content.includes('window.confirm'), 'Deve solicitar confirmação antes de excluir o pedido');
        assert.ok(content.includes('Excluir Pedido'), 'Deve exibir botão visual "Excluir Pedido" no card');
        assert.ok(content.includes('Trash2'), 'Deve utilizar ícone de lixeira Trash2');
        assert.ok(content.includes('orderId=${encodeURIComponent(orderId)}'), 'Deve enviar orderId parametrizado na requisição DELETE');
    });
});
