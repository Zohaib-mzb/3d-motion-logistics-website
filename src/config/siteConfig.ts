const whatsappNumber = '14376659457';
const whatsappMessage = 'Hi Velcotiy, I’d like to discuss your final mile delivery services.';
export const siteConfig = {
  companyName: 'Velcotiy Techniques Inc', shortName: 'Velcotiy',
  businessEmail: 'info@velcotiytechniques.ca', businessPhone: '+1 437 665 9457', whatsappNumber,
  whatsappMessage,
  whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
  indeedJobsUrl: 'https://ca.indeed.com/cmp/Velcotiy-Techniques-Inc?campaignid=mobvjcmp&from=mobviewjob&tk=1k4bo7pfui9v2800&fromjk=8286fea33c3216bc',
  linkedinCompanyUrl: 'https://www.linkedin.com/company/velcotiy-techniques-inc/',
  siteUrl: 'https://velcotiytechniques.ca',
  developerGithubUrl: 'https://github.com/Zohaib-mzb',
} as const;
export const companyContent = {
  mission: 'To make final-mile delivery faster, more efficient and easier to scale through flexible fleet capacity and operational excellence.',
  vision: 'To build a smarter delivery network that supports the future of commerce across Canada.',
};
