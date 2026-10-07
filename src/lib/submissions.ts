import {siteConfig} from '../config/siteConfig';
export type FormKind = 'contact'|'quote'|'driver'|'carrier';

// The visitor reviews and sends the message in their email app. No form data is stored here.
export function createInquiryMailto(kind:FormKind,data:Record<string,string>):string {
  const label={contact:'Contact inquiry',quote:'Quote request',driver:'Driver application',carrier:'Business inquiry'}[kind];
  const body=Object.entries(data)
    .filter(([key,value])=>key!=='website'&&value.trim())
    .map(([key,value])=>{
      const field=key.replace(/([A-Z])/g,' $1');
      return `${field.charAt(0).toUpperCase()}${field.slice(1)}: ${value.trim()}`;
    })
    .join('\n');
  return `mailto:${siteConfig.businessEmail}?subject=${encodeURIComponent(`Velcotiy ${label}`)}&body=${encodeURIComponent(body)}`;
}
export function submitInquiry(kind:FormKind,data:Record<string,string>):void {
  window.location.href=createInquiryMailto(kind,data);
}
