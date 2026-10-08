import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Check,ArrowRight,ArrowLeft} from 'lucide-react';
import {createDriverWhatsAppUrl,submitInquiry,type FormKind} from '../../lib/submissions';
const field=z.string().trim().max(500,'Please use fewer than 500 characters.');
const schema=z.object({name:field,company:field,contactName:field,email:z.union([z.literal(''),z.email('Enter a valid email.')]),phone:field,inquiryType:field,province:field,city:field,citiesServed:field,fleetSize:field,vehicleTypes:field,capacity:field,yearsOperating:field,vehicleType:field,availability:field,experience:field,message:field.max(2000),website:field});
type Values=z.infer<typeof schema>;
type Key=keyof Values;
const defaults:Values={name:'',company:'',contactName:'',email:'',phone:'',inquiryType:'',province:'',city:'',citiesServed:'',fleetSize:'',vehicleTypes:'',capacity:'',yearsOperating:'',vehicleType:'',availability:'',experience:'',message:'',website:''};
const fields:Record<Exclude<FormKind,'quote'>,Array<{key:Key;label:string;required?:boolean;type?:string;options?:string[]}>>={
 contact:[{key:'name',label:'Name',required:true},{key:'company',label:'Company'},{key:'email',label:'Email',required:true,type:'email'},{key:'phone',label:'Phone',required:true,type:'tel'},{key:'inquiryType',label:'Inquiry Type',options:['Sales','Operations','Carrier Support','Driver Support','General Inquiry']},{key:'message',label:'Message',required:true,type:'textarea'}],
 carrier:[{key:'company',label:'Company Name',required:true},{key:'contactName',label:'Contact Name',required:true},{key:'email',label:'Email',required:true,type:'email'},{key:'phone',label:'Phone',required:true,type:'tel'},{key:'province',label:'Province',required:true},{key:'citiesServed',label:'Cities Served'},{key:'fleetSize',label:'Fleet Size'},{key:'vehicleTypes',label:'Vehicle Types'},{key:'capacity',label:'Current Delivery Capacity'},{key:'yearsOperating',label:'Years Operating'},{key:'message',label:'Additional Details',type:'textarea'}]
};
export function InquiryForm({kind}:{kind:Exclude<FormKind,'quote'>|'driver'}){return kind==='driver'?<DriverForm/>:<EmailInquiryForm kind={kind}/>}
function EmailInquiryForm({kind}:{kind:Exclude<FormKind,'quote'>}){const [sent,setSent]=useState(false);const formSchema=schema.superRefine((data,ctx)=>{for(const f of fields[kind]){if(f.required&&!data[f.key].trim())ctx.addIssue({code:'custom',path:[f.key],message:'This field is required.'})}});const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(formSchema),defaultValues:defaults});const onSubmit=async(data:Values)=>{if(data.website)return;submitInquiry(kind,data);setSent(true)};if(sent)return <div className="form-success" role="status"><span><Check aria-hidden="true"/></span><h3>Email draft ready.</h3><p>Your email app should open with the details you provided. Review the message and send it when ready.</p><button type="button" onClick={()=>setSent(false)} className="button button--primary">Start another inquiry</button></div>;return <form className="inquiry-form" onSubmit={handleSubmit(onSubmit)} noValidate><div className="form-grid">{fields[kind].map(f=><label className={f.type==='textarea'?'full':''} key={f.key}><span>{f.label}{f.required&&' *'}</span>{f.type==='textarea'?<textarea {...register(f.key)} rows={5} required={f.required}/>:f.options?<select {...register(f.key)} required={f.required}><option value="">Select an option</option>{f.options.map(option=><option key={option}>{option}</option>)}</select>:<input {...register(f.key)} type={f.type||'text'} required={f.required}/>}<small>{errors[f.key]?.message}</small></label>)}</div><input className="honeypot" {...register('website')} tabIndex={-1} autoComplete="off" aria-hidden="true"/><p className="form-note">Submitting opens an email draft for you to review and send.</p><button className="button button--primary" disabled={isSubmitting} type="submit">{isSubmitting?'Preparing…':'Open email draft'} <ArrowRight size={17}/></button></form>}

const requiredDriverField=z.string().trim().min(1,'This field is required.').max(500,'Please use fewer than 500 characters.');
const driverSchema=z.object({
  name:requiredDriverField,email:z.email('Enter a valid email.'),phone:requiredDriverField.min(7,'Enter a valid phone number.'),
  age:requiredDriverField.regex(/^\d+$/,'Enter a whole number.').refine(value=>Number(value)>=1&&Number(value)<=120,'Enter an age from 1 to 120.'),
  city:requiredDriverField,province:requiredDriverField,
  workAuthorization:z.string().refine((value:string):boolean=>value==='Yes'||value==='No','Select Yes or No.'),
  validLicence:z.string().refine((value:string):boolean=>value==='Yes'||value==='No','Select Yes or No.'),
  vehicleType:requiredDriverField,vehicleName:requiredDriverField,
  weeklyAvailability:requiredDriverField,experience:z.string().trim().max(2000,'Please use fewer than 2000 characters.'),
  emergencyContact:requiredDriverField,message:z.string().trim().max(2000,'Please use fewer than 2000 characters.'),website:z.string(),
});
type DriverValues=z.infer<typeof driverSchema>;
const driverDefaults={name:'',email:'',phone:'',age:'',city:'',province:'',workAuthorization:'',validLicence:'',vehicleType:'',vehicleName:'',weeklyAvailability:'',experience:'',emergencyContact:'',message:'',website:''};
const vehicleOptions=['EV','Sedan','SUV / Crossover','Compact Cargo','Cargo Van','Large Cargo Van'];
const weeklyOptions=Array.from({length:7},(_,index)=>`${index+1} day${index===0?'':'s'} per week`);

function DriverForm(){
  const [ready,setReady]=useState(false);
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<DriverValues>({resolver:zodResolver(driverSchema),defaultValues:driverDefaults});
  const onSubmit=(data:DriverValues)=>{
    if(data.website)return;
    window.open(createDriverWhatsAppUrl(data),'_blank','noopener,noreferrer');
    setReady(true);
  };
  return <form className="inquiry-form" onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="form-grid">
      <label><span>Full Name *</span><input {...register('name')} required/><small>{errors.name?.message}</small></label>
      <label><span>Email *</span><input {...register('email')} type="email" required/><small>{errors.email?.message}</small></label>
      <label><span>Phone *</span><input {...register('phone')} type="tel" required/><small>{errors.phone?.message}</small></label>
      <label><span>Age *</span><input {...register('age')} type="number" min="1" max="120" step="1" required/><small>{errors.age?.message}</small></label>
      <label><span>City *</span><input {...register('city')} required/><small>{errors.city?.message}</small></label>
      <label><span>Province *</span><input {...register('province')} required/><small>{errors.province?.message}</small></label>
      <label><span>Are you legally authorized to work in Canada? *</span><select {...register('workAuthorization')} required><option value="">Select Yes or No</option><option>Yes</option><option>No</option></select><small>{errors.workAuthorization?.message}</small></label>
      <label><span>Do you have a valid driver’s licence? *</span><select {...register('validLicence')} required><option value="">Select Yes or No</option><option>Yes</option><option>No</option></select><small>{errors.validLicence?.message}</small></label>
      <label><span>Vehicle Type *</span><select {...register('vehicleType')} required><option value="">Select vehicle type</option>{vehicleOptions.map(option=><option key={option}>{option}</option>)}</select><small>{errors.vehicleType?.message}</small></label>
      <label><span>Vehicle Name *</span><input {...register('vehicleName')} placeholder="e.g. Toyota Corolla, Tesla Model 3, Ford Transit" required/><small>{errors.vehicleName?.message}</small></label>
      <label><span>Weekly Availability *</span><select {...register('weeklyAvailability')} required><option value="">Select availability</option>{weeklyOptions.map(option=><option key={option}>{option}</option>)}</select><small>{errors.weeklyAvailability?.message}</small></label>
      <label className="full"><span>Delivery Experience</span><textarea {...register('experience')} rows={5} placeholder="Tell us about your previous delivery, courier, driving, logistics, or related experience."/><small>{errors.experience?.message}</small></label>
      <label><span>Emergency Contact *</span><input {...register('emergencyContact')} placeholder="Name and phone number" required/><small>{errors.emergencyContact?.message}</small></label>
      <label className="full"><span>Additional Notes</span><textarea {...register('message')} rows={5}/><small>{errors.message?.message}</small></label>
    </div>
    <input className="honeypot" {...register('website')} tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <p className="form-note">Your details open in WhatsApp for you to review and send. This site does not store them.</p>
    <button className="button button--primary" disabled={isSubmitting} type="submit">{isSubmitting?'Preparing…':'Send via WhatsApp'} <ArrowRight size={17}/></button>
    {ready&&<p role="status">Your application details are ready in WhatsApp. Review the message and press Send to submit.</p>}
  </form>;
}
const quoteSchema=z.object({company:z.string().trim().min(2),name:z.string().trim().min(2),email:z.email(),phone:z.string().trim().min(7),pickupCity:z.string().trim().min(2),province:z.string().trim().min(2),warehouse:z.string().trim(),region:z.string().trim().min(2),volume:z.string().trim().min(1),frequency:z.string().trim().min(1),sameDay:z.string(),packageType:z.string().trim(),parcelSize:z.string().trim(),vehicle:z.string(),notes:z.string().trim().max(2000),preference:z.string()});
type QuoteValues=z.infer<typeof quoteSchema>;
const quoteDefaults:QuoteValues={company:'',name:'',email:'',phone:'',pickupCity:'',province:'',warehouse:'',region:'',volume:'',frequency:'',sameDay:'No',packageType:'',parcelSize:'',vehicle:'',notes:'',preference:'Email'};
const quoteSteps=[{title:'Your business',fields:[['company','Company Name'],['name','Contact Name'],['email','Business Email'],['phone','Phone']]},{title:'Pickup',fields:[['pickupCity','Pickup City'],['province','Province'],['warehouse','Warehouse / Distribution Center']]},{title:'Delivery requirements',fields:[['region','Primary Delivery Region'],['volume','Approx. Daily Volume'],['frequency','Delivery Frequency'],['sameDay','Same-Day Required'],['packageType','Package Type'],['parcelSize','Typical Parcel Size'],['vehicle','Preferred Vehicle Type']]},{title:'Additional information',fields:[['notes','Notes'],['preference','Contact Preference']]}] as const;
export function QuoteForm(){const [step,setStep]=useState(0),[sent,setSent]=useState(false);const {register,trigger,getValues,handleSubmit,formState:{errors,isSubmitting}}=useForm<QuoteValues>({resolver:zodResolver(quoteSchema),defaultValues:quoteDefaults,mode:'onTouched'});const next=async()=>{const names=quoteSteps[step].fields.map(f=>f[0]) as (keyof QuoteValues)[];if(await trigger(names))setStep(step+1)};const submit=async(data:QuoteValues)=>{submitInquiry('quote',data);setSent(true)};if(sent)return <div className="form-success" role="status"><span><Check aria-hidden="true"/></span><h3>Email draft ready.</h3><p>Your email app should open with the quote details you provided. Review the message and send it when ready.</p><button type="button" className="button button--primary" onClick={()=>{setSent(false);setStep(0)}}>Start another inquiry</button></div>;return <form className="quote-form" onSubmit={handleSubmit(submit)} noValidate><div className="quote-progress" aria-label={`Step ${step+1} of 5`}>{['Business','Pickup','Delivery','Details','Review'].map((label,i)=><div className={i<=step?'active':''} key={label}><span>{i<step?<Check size={14}/>:`0${i+1}`}</span><small>{label}</small></div>)}</div>{step<4?<><div className="form-step-heading"><span>STEP 0{step+1} / 05</span><h2>{quoteSteps[step].title}</h2></div><div className="form-grid">{quoteSteps[step].fields.map(([key,label])=><label key={key} className={key==='notes'?'full':''}><span>{label}{!['warehouse','packageType','parcelSize','vehicle','notes'].includes(key)&&' *'}</span>{key==='notes'?<textarea rows={5} {...register(key)}/>:['sameDay','preference','vehicle'].includes(key)?<select {...register(key)}>{(key==='sameDay'?['No','Yes','Discuss with team']:key==='preference'?['Email','Phone']:['No preference','EV','Sedan','SUV / Crossover','Compact Cargo','Cargo Van','Large Cargo Van']).map(o=><option key={o}>{o}</option>)}</select>:<input type={key==='email'?'email':key==='phone'?'tel':'text'} {...register(key)}/>}<small>{errors[key]?.message}</small></label>)}</div></>:<div className="review"><span>STEP 05 / 05</span><h2>Review your request.</h2><p>Confirm your details before opening the email draft.</p><div className="review-grid">{Object.entries(getValues()).filter(([,v])=>v).map(([key,value])=><div key={key}><small>{key.replace(/([A-Z])/g,' $1')}</small><strong>{value}</strong></div>)}</div></div>}<div className="form-actions">{step>0&&<button type="button" className="button button--outline" onClick={()=>setStep(step-1)}><ArrowLeft size={17}/> Back</button>}{step<4?<button type="button" className="button button--primary" onClick={event=>{event.preventDefault();void next()}}>Continue <ArrowRight size={17}/></button>:<button type="submit" className="button button--primary" disabled={isSubmitting}>{isSubmitting?'Preparing…':'Open email draft'} <ArrowRight size={17}/></button>}</div><p className="form-note">Your details open in your email app; this site does not store them.</p></form>}
