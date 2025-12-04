'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { StepItems } from '@/components/configurator/step-items';
import { StepFabrics } from '@/components/configurator/step-fabrics';
import { StepEmbroidery } from '@/components/configurator/step-embroidery';
import { StepPersonalization } from '@/components/configurator/step-personalization';
import { StepReview } from '@/components/configurator/step-review';
import { ConfiguratorLayout } from '@/components/configurator/layout';

export default function ConfiguradorPage() {
    const { currentStep } = useConfiguratorStore();

    const renderStep = () => {
        switch (currentStep) {
            case 'items':
                return <StepItems />;
            case 'fabrics':
                return <StepFabrics />;
            case 'embroidery':
                return <StepEmbroidery />;
            case 'personalization':
                return <StepPersonalization />;
            case 'review':
                return <StepReview />;
            default:
                return <StepItems />;
        }
    };

    return <ConfiguratorLayout>{renderStep()}</ConfiguratorLayout>;
}
