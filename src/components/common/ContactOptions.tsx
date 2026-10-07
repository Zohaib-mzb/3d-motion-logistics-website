import {ArrowUpRight, Mail, Phone, MessageCircle} from 'lucide-react';
import {siteConfig} from '../../config/siteConfig';

const options = [
  {title:'Drop us an email',detail:siteConfig.businessEmail,href:`mailto:${siteConfig.businessEmail}`,Icon:Mail},
  {title:'Call our team',detail:siteConfig.businessPhone,href:`tel:${siteConfig.businessPhone.replace(/[^\d+]/g,'')}`,Icon:Phone},
  {title:'Message us on WhatsApp',detail:siteConfig.businessPhone,href:siteConfig.whatsappUrl,Icon:MessageCircle,external:true},
];

export function ContactOptions({compact=false}:{compact?:boolean}){
  return <div className={`contact-options ${compact?'contact-options--compact':''}`}>
    {options.map(({title,detail,href,Icon,external})=><a key={title} href={href} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined} className="contact-option"><Icon aria-hidden="true"/><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight aria-hidden="true" className="contact-option-arrow"/></a>)}
  </div>;
}
