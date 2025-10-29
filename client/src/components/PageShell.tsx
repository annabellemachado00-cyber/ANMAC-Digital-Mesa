import { ReactNode } from 'react';
import InfoTooltip from './InfoTooltip';

interface PageShellProps {
  title: string;
  description?: string;
  legend?: string;
  actions?: ReactNode;
  extraHeader?: ReactNode;
}

const PageShell = ({ title, description, legend, actions, extraHeader, children }: React.PropsWithChildren<PageShellProps>) => (
  <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {legend && <InfoTooltip text={legend} />}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {extraHeader}
    </div>
    {actions}
    <div className="space-y-6">{children}</div>
  </section>
);

export default PageShell;
