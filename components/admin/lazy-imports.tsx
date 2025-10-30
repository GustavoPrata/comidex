// Lazy loading para componentes pesados
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Lazy load componentes pesados do Radix UI
export const Dialog = lazy(() => import('@radix-ui/react-dialog'));
export const DropdownMenu = lazy(() => import('@radix-ui/react-dropdown-menu'));
export const Select = lazy(() => import('@radix-ui/react-select'));
export const Tabs = lazy(() => import('@radix-ui/react-tabs'));

// Lazy load componentes de gráficos
export const LazyChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));

// Wrapper para componentes lazy
export function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner className="h-8 w-8" />}>
      {children}
    </Suspense>
  );
}