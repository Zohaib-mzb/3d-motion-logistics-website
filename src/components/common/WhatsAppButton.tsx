import {ArrowUpRight} from 'lucide-react';
import {siteConfig} from '../../config/siteConfig';

export function WhatsAppButton({children,className=''}:{children:React.ReactNode;className?:string}){
  return <a className={`button button--primary ${className}`} href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer"><span>{children}</span><ArrowUpRight size={17} aria-hidden="true"/></a>;
}
