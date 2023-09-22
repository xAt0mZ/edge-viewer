import { PropsWithChildren } from 'react';
import ReactCollapsible from 'react-collapsible';

type Props = {
  trigger: string;
  open?: boolean;
};
export function Collapsible({
  trigger,
  open,
  children,
}: PropsWithChildren<Props>) {
  return (
    <ReactCollapsible
      trigger={trigger}
      open={open}
      triggerClassName='font-bold relative block w-full pb-1 after:content-[">"] after:absolute after:right-0 after:rotate-90'
      triggerOpenedClassName='font-bold relative block w-full pb-1 after:content-["<"] after:absolute after:right-0 after:rotate-90'
    >
      {children}
    </ReactCollapsible>
  );
}

// className | string
// .Collapsible element (root) when closed

// openedClassName | string
// .Collapsible element (root) when open

// triggerClassName | string
// .Collapsible__trigger element (root) when closed

// triggerOpenedClassName | string
// .Collapsible__trigger element (root) when open

// contentOuterClassName | string
// .Collapsible__contentOuter element

// contentInnerClassName | string
// .Collapsible__contentInner element
