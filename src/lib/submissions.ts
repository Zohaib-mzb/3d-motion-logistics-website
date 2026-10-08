import {siteConfig} from '../config/siteConfig';
export type FormKind = 'contact'|'quote'|'carrier';

// The visitor reviews and sends the message in their email app. No form data is stored here.
export function createInquiryMailto(kind:FormKind,data:Record<string,string>):string {
  const label={contact:'Contact inquiry',quote:'Quote request',carrier:'Business inquiry'}[kind];
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

export type DriverApplication = {
  name:string; email:string; phone:string; age:string; city:string; province:string;
  workAuthorization:string; validLicence:string; vehicleType:string; vehicleName:string;
  weeklyAvailability:string; experience:string; emergencyContact:string; message:string;
};

export function createDriverWhatsAppUrl(data:DriverApplication):string {
  const lines=[
    'Hello Velcotiy,',
    '',
    'I would like to apply as a driver.',
    '',
    'DRIVER APPLICATION',
    '',
    `Name: ${data.name.trim()}`,
    `Email: ${data.email.trim()}`,
    `Phone: ${data.phone.trim()}`,
    `Age: ${data.age.trim()}`,
    `Location: ${data.city.trim()}, ${data.province.trim()}`,
    `Legally authorized to work in Canada: ${data.workAuthorization}`,
    `Valid driver’s licence: ${data.validLicence}`,
    `Vehicle type: ${data.vehicleType}`,
    `Vehicle name: ${data.vehicleName.trim()}`,
    `Weekly availability: ${data.weeklyAvailability}`,
    `Delivery experience: ${data.experience.trim() || 'Not provided'}`,
    `Emergency contact: ${data.emergencyContact.trim()}`,
    ...(data.message.trim() ? [`Additional notes: ${data.message.trim()}`] : []),
    '',
    'Thank you.',
  ];
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}
