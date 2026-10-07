'use client';

import { useEffect } from 'react';
import { ConfiguratorLayout } from '@/components/configurator/layout';
import { useConfiguratorStore } from '@/store/configurator-store';

export default function MonteSeuKitPage() {
    const setSelectedProduct = useConfiguratorStore((s) => s.setSelectedProduct);

    useEffect(() => {
        // No Monte Seu Kit livre, o cliente monta como quiser sem restrições de um produto pré-selecionado
        setSelectedProduct(null);
    }, [setSelectedProduct]);

    return <ConfiguratorLayout />;
}
