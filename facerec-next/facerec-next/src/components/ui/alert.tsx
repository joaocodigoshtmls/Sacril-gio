import { ReactNode } from 'react'
export function Alert({ children, variant='default' }:{ children: ReactNode, variant?: 'default'|'destructive'}) {
  return <div className={ounded-lg p-3 border }>{children}</div>
}
export function AlertDescription({ children }:{children: ReactNode}) {
  return <div className='text-sm opacity-90'>{children}</div>
}
