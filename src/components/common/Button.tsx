import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import {prefetchRoute} from '../../lib/prefetch';
export function Button({to,children,variant='primary',className=''}:{to:string;children:React.ReactNode;variant?:'primary'|'outline'|'text';className?:string}){
  return <Link className={`button button--${variant} ${className}`} to={to} onMouseEnter={()=>void prefetchRoute(to.split('#')[0])} onFocus={()=>void prefetchRoute(to.split('#')[0])}><span>{children}</span><ArrowUpRight size={17} aria-hidden="true"/></Link>
}
