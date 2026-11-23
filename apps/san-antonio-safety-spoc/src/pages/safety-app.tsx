import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, BarChart3, BookOpen, Building2, CalendarDays, Camera, CheckCircle2, ChevronRight, ClipboardCheck, ExternalLink, FileClock, FileText, Gauge, HardHat, Home, Info, MapPin, Menu, MessageSquare, Plus, Save, Search, Settings, ShieldCheck, Trash2, TrendingUp, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { InMemoryDataBanner } from '@/generated/components/in-memory-data-banner';
import { HAS_IN_MEMORY_TABLES } from '@/generated/hooks';
import { useUser } from '@/hooks/use-user';
import { SafetyAuditsService } from '@/generated/services/SafetyAuditsService';
import { SafetyResponsesService } from '@/generated/services/SafetyResponsesService';
const referenceDocumentsUrl = 'https://txdot.sharepoint.com/sites/district-SAT/Shared%20Documents/Forms/Tiles.aspx?id=%2Fsites%2Fdistrict%2DSAT%2FShared%20Documents%2FTP%26D%2FDigital%20Solutions%20Team%2FSAT%20Digital%20Solutions%2FApp&viewid=d7c0c5ae%2D8f7a%2D441c%2Dbf24%2Db3924b64debe';
const referenceDocumentCategories = [
  { name: 'Inspection Forms', url: 'https://txdot.sharepoint.com/sites/district-SAT/Shared%20Documents/Forms/Tiles.aspx?id=%2Fsites%2Fdistrict%2DSAT%2FShared%20Documents%2FTP%26D%2FDigital%20Solutions%20Team%2FSAT%20Digital%20Solutions%2FApp%2FSPOC%20Binder%20Forms&viewid=d7c0c5ae%2D8f7a%2D441c%2Dbf24%2Db3924b64debe' },
  { name: 'HAZCOM', url: 'https://txdot.sharepoint.com/sites/district-SAT/Shared%20Documents/Forms/Tiles.aspx?id=%2Fsites%2Fdistrict%2DSAT%2FShared%20Documents%2FTP%26D%2FDigital%20Solutions%20Team%2FSAT%20Digital%20Solutions%2FApp%2FSDS&viewid=d7c0c5ae%2D8f7a%2D441c%2Dbf24%2Db3924b64debe' },
  { name: 'SDS', url: 'https://txdot.sharepoint.com/sites/district-SAT/Shared%20Documents/Forms/Tiles.aspx?id=%2Fsites%2Fdistrict%2DSAT%2FShared%20Documents%2FTP%26D%2FDigital%20Solutions%20Team%2FSAT%20Digital%20Solutions%2FApp%2FSDS&viewid=d7c0c5ae%2D8f7a%2D441c%2Dbf24%2Db3924b64debe' },
  { name: 'SPCC', url: 'https://txdot.sharepoint.com/sites/district-SAT/Shared%20Documents/Forms/Tiles.aspx?id=%2Fsites%2Fdistrict%2DSAT%2FShared%20Documents%2FTP%26D%2FDigital%20Solutions%20Team%2FSAT%20Digital%20Solutions%2FApp%2FSPCC&viewid=d7c0c5ae%2D8f7a%2D441c%2Dbf24%2Db3924b64debe' },
];
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Page = 'home' | 'dashboard' | 'audit' | 'drafts' | 'history' | 'directory' | 'documents' | 'admin';
type Step = 1 | 2 | 3 | 4;
type SectionState = 'Applicable' | 'Not Applicable';
type Asset = { id: string; identifier: string; serial: string; location: string; answers: Record<string, string>; comments: Record<string, string>; evidence: Record<string, string> };
type Question = { code: string; text: string; type: 'yesnona' | 'yesno' | 'text' | 'multiline' | 'date' | 'single' | 'multi'; required: boolean; options?: string[]; group?: 'EXCAVATION' | 'UTILITIES' | 'WET CONDITIONS' | 'HAZARDOUS ATMOSPHERE' | 'INSPECTION INFORMATION' | 'COMPETENT PERSON SIGN-OFF' | 'PERMIT INFORMATION' | 'TEAM MEMBERS' | 'AIR MONITORING' | 'ADDITIONAL INFORMATION' | 'SAMPLING EQUIPMENT' | 'EMERGENCY INFORMATION' | 'ENTRY INFORMATION' | 'CONFINED SPACE CHECKLIST' | 'DEBRIEFING' | 'SCOPE OF WORK' };
type HistoryAudit = { id: string; date: string; status: string; inspector: string; workGroup: string; location: string; supervisor: string; sections: Array<{ name: SectionName; status: string; deficiencies: number }>; comments: number; evidence: number; responses?: Array<{section:SectionName;asset:string;code:string;text:string;value:string;comment?:string;photo?:string;nonCompliant:boolean}> };
type SpocRecord = { name: string; role: 'Primary' | 'Alternate'; email: string; supervisor: string; supervisorEmail: string; group: string; reviewFlag: boolean; reviewNotes: string };

const sectionNames = ['Fire Extinguisher (Form 2013)', 'Portable Ladder (Form 2279)', 'HAZMAT (Form 2012)', 'Office / Administration (Form 2016)', 'Laboratory (Form 2015)', 'Trenches and Excavations (Form 2194)', 'TxDOT Confined Space Entry Permit & Checklist (Form 1993)'] as const;
type SectionName = (typeof sectionNames)[number];

const navItems: Array<{ page: Page; label: string; icon: typeof Home }> = [
  { page: 'home', label: 'Home', icon: Home }, { page: 'dashboard', label: 'Safety Dashboard', icon: BarChart3 },
  { page: 'audit', label: 'New Safety Audit', icon: ClipboardCheck }, { page: 'drafts', label: 'My Draft Audits', icon: FileClock },
  { page: 'history', label: 'Audit History', icon: FileText }, { page: 'directory', label: 'SPOC Directory', icon: Users },
  { page: 'documents', label: 'Reference Documents', icon: BookOpen }, { page: 'admin', label: 'App Configutation', icon: Settings },
];

const repeatable: SectionName[] = ['Fire Extinguisher (Form 2013)', 'Portable Ladder (Form 2279)'];
const questions: Record<SectionName, Question[]> = {
  'Fire Extinguisher (Form 2013)': [
    { code: 'FIRE-001', text: 'Fire Extinguisher Number', type: 'text', required: true },
    { code: 'FIRE-002', text: 'Fire Extinguisher Location', type: 'text', required: true },
    ...['Is the fire extinguisher in place?','Is access unobstructed?','Is the label in place and legible?','Are seal or tamper indicators intact?','Is the tag in place and up to date?','Is it in good condition overall?','Pressure indicating operable or correct range?','Gauge indicating good operation pressure?'].map((text: string, index: number) => ({ code: `FIRE-${String(index + 3).padStart(3,'0')}`, text, type: 'yesnona' as const, required: true })),
    { code: 'FIRE-011', text: 'CO2 Weight (if applicable)', type: 'yesnona', required: false },
  ],
  'Portable Ladder (Form 2279)': [
    { code:'LAD-001',text:'Ladder/Unit Number',type:'text',required:true },
    { code:'LAD-002',text:'Location',type:'text',required:true },
    { code:'LAD-003',text:'Ladder Description',type:'single',required:true,options:['Metal','Wooden','Fiberglass'] },
    { code:'LAD-004',text:'Ladder Tightness',type:'single',required:true,options:['Loose','Wobbly','Good Condition'] },
    { code:'LAD-005',text:'Ladder Uprights',type:'multi',required:true,options:['Cracked','Split','Kinked','Twisted','Bent','Torn Fiberglass','Good Condition','Other'] },
    { code:'LAD-006',text:'Ladder Steps',type:'multi',required:true,options:['Cracked','Broken','Missing','Oily/Greasy','Good Condition','Other'] },
    { code:'LAD-007',text:'Ladder Feet',type:'multi',required:true,options:['Good Condition','Worn/Rotted','Other'] },
    ...['Is the footing solid?','Is the footing level?','Are adjusting supports tightened?','Are anti-skid covers on the feet?','Are anti-skid covers in good condition?','Do extension locks work properly?','Do metal spreaders lock firmly in place?','Are the metal spreaders in good condition?','Is the ladder painted?','Is the tool platform in place?','Is the tool platform in good condition?'].map((text: string,index: number)=>({code:`LAD-${String(index+8).padStart(3,'0')}`,text,type:'yesno' as const,required:true})),
  ],
  'HAZMAT (Form 2012)': [
    ...[
      'Monthly safety meetings documented? Pre-printed roster?',
      'Daily safety meetings documented? TA/TCP’s included?',
      'Fire extinguisher annual/monthly inspections current?',
      'Fire extinguisher stations identified? Unobstructed?',
      'Is extra PPE available in stock room?',
      'Exit signs in place? Are exits unobstructed?',
      'Emergency procedures posted near building diagram?',
      'HazCom Posters Notice To Employees posted? Current?',
      'Are containers labeled? (pump-sprayers, tanks, barrels, etc.)',
      'Parts washer lid down when not in use?',
      'Office area housekeeping good?',
      'Shops, sheds, maintenance yard housekeeping good?',
      'First-aid kits identified? Stocked? Unobstructed?',
      'Eye-wash stations available? Unobstructed?',
      'Eye-wash nozzle covers on? Adequate water pressure?',
      'Do welder cutting torches have flashback arrestors?',
      'Welding gas cylinders/area signed? Secured? Separated?',
      'Are flammable storage cabinets in use?',
      'Approved, metal, flammable liquid containers in use?',
      'Are incompatible materials separated for safety?',
      'Are emergency fuel shut-offs in place? Labeled?',
      'Emergency break-aways installed on fuel pump hoses?',
      'Propane refueling tanks barricaded? PPE? Warning signs?',
      'Propane cylinders stored outdoors? Signed? Secured?',
      'Are storage tanks protected and/or bermed?',
      'Are compressors in work areas sound baffled?',
      'Are compressed air outlets pressure regulated?',
      'Are air nozzles 30 psi outlet limited?',
      'Are shop machines anchored?',
      'Are applicable shop machines adjusted and guarded?',
      'Automotive hoist have safety locks? Max. capacity posted?',
      'Chain saws/pole saws stored with bar guards?',
      'Fork Lifts/skid-steer and/or pallet jacks in use?',
      'Ergonomic rack storage in maint. yard for forklift access?',
      'Overhead hoist beams load rated?',
      'Overhead storage areas load rated? Max. capacity posted?',
      'Chains and tie downs in good condition?',
      'Are chains secured with coupling device vs. spot welded?',
      'Are portable ladders in good condition?',
      'Do stairways have proper stair railings?',
      'Do platforms have standard railings and toe-boards?',
      'Loading dock edges identified? Chains available as needed?',
      'Applicable wet areas protected with GFCI receptacles?',
      'GFCI protection available for generator electrical outlets?',
      'Electrical panel breakers labeled? Panels unobstructed?',
      'Are Electrical Cords In Good Condition?',
      'Are materials stored away from the fence line?',
      'Are lab ovens vented?',
      'Are stationary power washers vented?',
      '4 leg-base, swivel chairs removed from work area?',
    ].map((text: string, index: number): Question => ({
      code: `HAZ-${String(index + 1).padStart(3, '0')}`,
      text,
      type: 'yesnona',
      required: true,
    })),
    { code: 'HAZ-051', text: 'Other Notes / Comments', type: 'multiline', required: false },
  ],
  'Office / Administration (Form 2016)': [
    ...[
      'Regular Safety Meetings Recorded and Documented?',
      'Pre-printed Roster in Use?',
      'Office Housekeeping Good?',
      'Computer Workstations Provided With Adjustable Keyboard and/or Mouse Trays?',
      'Are Office Chairs Fully Adjustable and Supported with a Five-Leg Base?',
      'File Cabinets Properly Loaded To Prevent Tipping?',
      'File Cabinet Drawers Kept Closed When Not In Use?',
      'Shelving Properly Anchored?',
      'Exits, Aisles, Halls, Maintained Free of Obstruction?',
      'Do Stairways Have Serviceable Handrails?',
      'Stairways In Good Condition?',
      'Fire Extinguisher Annual/Monthly Inspections Current?',
      'Fire Extinguisher Stations Indentified? Unobstructed?',
      'Exit Signs In Place? Exits Unobstructed?',
      'Illuminated Exit Signs Lighted?',
      'Is Emergency Lighting In Place and In Service?',
      'Emergency Procedures Posted Near Building Diagram?',
      'Are Heavy Items Stored at Lower Shelving Levels?',
      'Are Ladders and/or Step-Ladders in Good Condition?',
      'SDS Manual Current?',
      'SDS Manual: Written Plan & Detail Sheet Included?',
      'Current HazCom Poster Notice To Employees Posted?',
      'First Aid Kits in Place, Stocked, Identified, Unobstructed?',
      'Electrical Cords and Floor Mats Positioned Safely?',
      'Dollies, and/or Carts Available for Heavy Objects?',
      'Electric Space Heaters UL or FM Approved?',
      'Wet Areas Protected with GFCI Receptacles?',
      'Electrical Breakers Labeled? Panels Unobstructed?',
      'Electrical Cords in Good Condition?',
      'Electric Switches/Outlets/Junction Boxes Covered?',
    ].map((text: string, index: number): Question => ({ code:`OFF-${String(index+1).padStart(3,'0')}`, text, type:'yesnona', required:true })),
    { code:'OFF-031',text:'Other Notes / Comments',type:'multiline',required:false },
  ],
  'Laboratory (Form 2015)': [
    'Monthly Safety Meetings Documented? Pre-printed Roster?',
    'Fire Extinguisher Annual/Monthly Inspections Current?',
    'Fire Extinguishers Identified? Unobstructed?',
    'Is Appropriate Personal Protective Equipment Available?',
    'Exit Signs In Place?',
    'Are Exits, Aisles, Halls Maintained Free Of Obstruction?',
    'Emergency Procedures Posted Near Building Diagram?',
    'Chemical Hygiene Plan Developed for Lab?',
    'SDS Manual: Product Sheets Current?',
    'SDS Manual: Index In Place? & Up to Date?',
    'SDS Manual: Tier II Report Current, In Place?',
    'SDS Manual: Site Plan, Written Plan & Detail Sheet?',
    'HazCom Poster Notice To Employees Posted?',
    'Are Chemical Containers Labeled? (Sample Bottles, etc.)',
    'Office Housekeeping Good?',
    'Lab Work Area Housekeeping Good?',
    'Storage & Back Dock Housekeeping Good?',
    'Are First Aid Kits In Place, Stocked, Identified?',
    'Eye Wash Stations Available? Unobstructed?',
    'Nozzle Covers in Place for Plumbed Eye Wash Stations?',
    'PPE, Warning Sign, Eye Wash Near Lime Water, Beam Tank?',
    'Is Local Exhaust Ventilation In Place?',
    'Is Each Local Exhaust Ventilation System Working?',
    'Are Flammable Storage Cabinets Used?',
    'Are Flammable Material Storerooms Labeled?',
    'Are Incompatible Materials Separated for Safety?',
    'Is Radioactive Material Storage Labeled, and Secure?',
    'Is The Air Compressor Located Out Of The Work Area?',
    'Are Compressed Air Outlets Pressure Regulated?',
    'Are Air Cleaning Nozzles 30 PSI Outlet Limited?',
    'Are Fork Lifts and/or Pallet Jacks Used?',
    'Are Dollies, and/or Carts Used For Heavy Objects?',
    'Mechanical Hoist At Concrete Beam Soak Tank?',
    'Are Portable Ladders In Good Condition?',
    'Do stairs and/or platforms have proper railings?',
    'Loading Dock Edges Painted? Chains Available as Needed?',
    'Is Hazardous Location Electrical Equipment In Good Condition?',
    'Are Wet Areas Protected With GFCI Receptacles?',
    'Are Electrical Panel Breakers Labeled? Unobstructed?',
    'Are Electrical Cords In Good Condition?',
    'Are Electric Outlets/Junction Boxes Covered?',
  ].map((text: string, index: number): Question => ({ code:`LAB-${String(index+1).padStart(3,'0')}`, text, type:'yesnona', required:true })),

  'Trenches and Excavations (Form 2194)': [
    ...['Project','Date','Weather','Soil Type','Trench Depth','Length','Width','Type of Protective System'].map((text: string, index: number): Question => ({ code: `TRN-I${String(index + 1).padStart(2,'0')}`, text, type: text === 'Date' ? 'date' : 'text', required: true, group: 'INSPECTION INFORMATION' })),
    ...[
      ['EXCAVATION','Excavations and Protective Systems inspected by a TxDOT Competent Person* daily before the start of work.'],
      ['EXCAVATION','Competent Person has authority to remove workers from excavation immediately.'],
      ['EXCAVATION','Surface encumbrances supported or removed.'],
      ['EXCAVATION','Employees are protected from loose rock or soil.'],
      ['EXCAVATION','Hard Hats are worn by all employees.'],
      ['EXCAVATION','Spoils, materials and equipment are set back a minimum of two (2) feet from edge of excavation.'],
      ['EXCAVATION','Barriers are provided at all remote excavations, wells, pits, shafts, etc.'],
      ['EXCAVATION','Walkways and bridges over excavations of six (6) feet or more in depth are equipped with guardrails.'],
      ['EXCAVATION','Warning vests or other highly visible PPE are provided and worn by all employees exposed to vehicular traffic.'],
      ['EXCAVATION','Employees are prohibited from working on faces of sloped or benched excavations above other employees.'],
      ['EXCAVATION','Warning system is established and used when mobile equipment is operating near the edge of the excavation.'],
      ['UTILITIES','Utility companies are contacted and/or utilities located.'],
      ['UTILITIES','Exact location of utilities are marked when near excavation.'],
      ['UTILITIES','Underground installations are protected, supported or removed when excavation is open.'],
      ['WET CONDITIONS','Precautions are taken to protect employees from accumulation of water.'],
      ['WET CONDITIONS','Water removal equipment is monitored by a Competent Person.'],
      ['WET CONDITIONS','Surface water is controlled or diverted.'],
      ['WET CONDITIONS','Inspection is made after each rainstorm.'],
      ['HAZARDOUS ATMOSPHERE','Atmosphere is tested when there is a possibility of oxygen deficiency or build-up of hazardous gases.'],
      ['HAZARDOUS ATMOSPHERE','Oxygen content is between 19.5 percent and 21 percent.'],
      ['HAZARDOUS ATMOSPHERE','Ventilation provided to prevent flammable gas build-up to 20 percent of lower explosive limit of the gas.'],
      ['HAZARDOUS ATMOSPHERE','Testing is conducted to ensure that the atmosphere remains safe.'],
      ['HAZARDOUS ATMOSPHERE','Emergency Response Equipment is readily available where a hazardous atmosphere could or does exist.'],
      ['HAZARDOUS ATMOSPHERE','Employees trained in the use of Personal Protective and Emergency Response Equipment.'],
      ['HAZARDOUS ATMOSPHERE','Safety harness and life line individually attended when employees enter deep confined spaces.'],
    ].map(([group,text]: string[], index: number): Question => ({ code: `TRN-${String(index + 1).padStart(3,'0')}`, text, type: 'yesnona', required: true, group: group as Question['group'] })),
    { code:'TRN-S01', text:'Name of Competent Person (Printed)', type:'text', required:true, group:'COMPETENT PERSON SIGN-OFF' },
    { code:'TRN-S02', text:'Signature', type:'text', required:true, group:'COMPETENT PERSON SIGN-OFF' },
    { code:'TRN-S03', text:'Date', type:'date', required:true, group:'COMPETENT PERSON SIGN-OFF' },
  ],
  'TxDOT Confined Space Entry Permit & Checklist (Form 1993)': [
    ...['Location and Description of Confined Space','Date','Scheduled Work to be Done','Time Started','District/Division','Time Completed'].map((text: string, index: number): Question => ({ code:`CSP-I${String(index+1).padStart(2,'0')}`, text, type:text==='Date'?'date':'text', required:true, group:'PERMIT INFORMATION' })),
    ...Array.from({length:8}, (_unused: unknown, rowIndex: number) => ['Name','Role (Entrant or Attendant)','Entry Time','Exit Time'].map((text: string, columnIndex: number): Question => ({ code:`CSP-T${rowIndex+1}-${columnIndex+1}`, text:`Team member ${rowIndex+1}: ${text}`, type:columnIndex===1?'single':'text', options:columnIndex===1?['Entrant','Attendant']:undefined, required:rowIndex===0, group:'TEAM MEMBERS' }))).flat(),
    ...['Oxygen – 19.5% to 23.5%','Lower Explosive Limit – Under 10%','Carbon Monoxide – Under 25 ppm','Hydrogen Sulfide – Under 10 ppm','Tester Initials'].flatMap((row: string, rowIndex: number) => ['Initial Checks','Checks After Isolation and Ventilation','Hr 1','Hr 2','Hr 3','Hr 4','Hr 5','Hr 6','Hr 7','Hr 8'].map((column: string, columnIndex: number): Question => ({ code:`CSP-M${rowIndex+1}-${columnIndex+1}`, text:`${row}: ${column}`, type:'text', required:columnIndex===0, group:'AIR MONITORING' }))),
    { code:'CSP-Q01', text:'Qualified Person (Gas Tester) Name', type:'text', required:true, group:'ADDITIONAL INFORMATION' },
    ...Array.from({length:6}, (_unused: unknown, rowIndex: number) => ['Sampling Equipment','Name','Type','Date Calibrated','Identification Number'].map((text: string, columnIndex: number): Question => ({ code:`CSP-S${rowIndex+1}-${columnIndex+1}`, text:`Sampling equipment ${rowIndex+1}: ${text}`, type:columnIndex===3?'date':'text', required:rowIndex===0, group:'SAMPLING EQUIPMENT' }))).flat(),
    ...['Emergency Notification – Ambulance','Emergency Notification – Fire','Emergency Notification – District',"Entry Supervisor's Approval Signature","Printed Entry Supervisor's Name and Phone Number"].map((text: string, index: number): Question => ({ code:`CSP-E${String(index+1).padStart(2,'0')}`, text, type:'text', required:true, group:'EMERGENCY INFORMATION' })),
    ...['Time','Date','District/Division','Location'].map((text: string, index: number): Question => ({ code:`CSP-CI${index+1}`, text, type:text==='Date'?'date':'text', required:true, group:'ENTRY INFORMATION' })),
    ...['Vessel cleaned, washed, and purged?','Gas monitor current calibration and bump test?','Lockout/Tagout completed?','Electrical hazards removed?','Line(s) drained, double-blanked and capped?','Continuous ventilation provided?','Area secured (Post/Flag)?','Engulfment monitor assigned?','Safety harness and lifeline provided?','Employees in immediate area notified?','Emergency escape retrieval equipment provided?','Explosion-proof lighting provided?','Fire extinguisher provided?','Communication equipment provided?','Communication procedures verified?','Proper PPE and respirator provided?','Evaluation air testing completed?','Rescue services verified?','Emergency phone numbers recorded on permit?'].map((text: string, index: number): Question => ({ code:`CSP-C${String(index+1).padStart(2,'0')}`, text, type:'yesnona', required:true, group:'CONFINED SPACE CHECKLIST' })),
    { code:'CSP-D01', text:'Debriefing Meeting Date', type:'date', required:true, group:'DEBRIEFING' },
    { code:'CSP-W01', text:'Scope of Work', type:'multiline', required:true, group:'SCOPE OF WORK' },
  ],
};

const fireExtinguisherGuidance: Record<string, { topic: string; note: string }> = {
  'FIRE-001': { topic: 'F.E. No.', note: 'Identify each facility, vehicle, or equipment location where an extinguisher is installed with a number or other designator. For vehicle units, VEH may be entered here and the vehicle number recorded in the location field. Identify the extinguisher location—not the extinguisher itself—so a replacement can use the same designation. Ensure the monthly inspector initials and dates the back of the green monthly tag.' },
  'FIRE-002': { topic: 'F.E. Location / Vehicle Number', note: 'Provide a brief description that helps the inspector find the extinguisher quickly, such as “By north door of welding shop,” or enter the number of the vehicle where it is installed.' },
  'FIRE-003': { topic: 'In Place', note: 'Extinguishers weighing 40 lb or less must be installed with the top no more than 5 ft above the floor. Extinguishers over 40 lb, except wheeled types, must have the top no more than 3½ ft above the floor. The bottom must always be at least 4 inches above the floor, per NFPA 10-2002 1.5.10.' },
  'FIRE-004': { topic: 'Clear', note: 'Confirm access and visibility are not obstructed by equipment or materials. Look for pallets, trash cans, mop buckets, tools, or other items that could make the extinguisher difficult to reach.' },
  'FIRE-005': { topic: 'Label', note: 'The nameplate label and operating instructions must be legible and face outward. The label identifies the fire class rating and provides important safety reminders and operating instructions.' },
  'FIRE-006': { topic: 'Seal', note: 'Seals or other tamper indicators must be intact and in place. This helps confirm the extinguisher has not been used and improperly returned to its location.' },
  'FIRE-007': { topic: 'Tag', note: 'The tag records annual and monthly inspections for the individual extinguisher. It must be present, current, and contain all required inspector actions. The tag and this master inspection list are both required for a complete extinguisher inspection system.' },
  'FIRE-008': { topic: 'General Condition', note: 'Check for physical damage, corrosion, leakage, a clogged hose nozzle, chipped or flaking paint, extreme weathering, and a weathered or cracked discharge hose.' },
  'FIRE-009': { topic: 'Pressure', note: 'For dry chemical extinguishers, confirm the pressure gauge or indicator shows the operable or correct range or position.' },
  'FIRE-010': { topic: 'Gauge', note: 'Most stored-pressure dry chemical extinguishers have a green gauge area. The indicator should be positioned within that green area to show good operating pressure.' },
  'FIRE-011': { topic: 'CO2 Weight', note: 'A carbon dioxide extinguisher must be weighed to verify a full charge; its fully charged weight is shown on the discharge handle. A quick “heft test” may compare its apparent weight with a known full unit, but this is subjective.' },
};

const officeGuidance: Record<string, { topic: string; note: string }> = {
  'OFF-001': { topic: 'Safety Meetings', note: 'Monthly and/or quarterly meetings should be recorded on Form 1301 and filed. Employees absent from the meeting must review the meeting materials when they return from sick leave, vacation, or other absence, then sign and date the roster.' },
  'OFF-002': { topic: 'Safety Meetings', note: 'Monthly and/or quarterly meetings should be recorded on Form 1301 and filed. Employees absent from the meeting must review the meeting materials when they return from sick leave, vacation, or other absence, then sign and date the roster.' },
  'OFF-003': { topic: 'Housekeeping', note: 'Confirm the office work area is clean and materials are stored orderly. Look for trip hazards, including electrical cords across aisle ways.' },
  'OFF-004': { topic: 'Computer Workstations', note: 'Confirm workstations are ergonomically arranged for the greatest comfort of the user. Ask whether employees experience joint pain after working at the workstation.' },
  'OFF-005': { topic: 'Office Chairs', note: 'Office chairs should provide adjustments for the arms, back, seat height, and lumbar support. The chair base should have five legs with good, functional rollers.' },
  'OFF-006': { topic: 'File Cabinets', note: 'Check that upper drawers are not overloaded with heavy material that could cause tipping when fully opened. Verify safety locks prevent more than one drawer from opening at a time and work properly. Keep drawers closed when not in use.' },
  'OFF-007': { topic: 'File Cabinets', note: 'Check that upper drawers are not overloaded with heavy material that could cause tipping when fully opened. Verify safety locks prevent more than one drawer from opening at a time and work properly. Keep drawers closed when not in use.' },
  'OFF-008': { topic: 'Shelving', note: 'Shelf units should be securely fastened to the wall. If freestanding units are grouped together, secure them to one another.' },
  'OFF-009': { topic: 'Aisle Obstruction', note: 'Aisles and hallways should not be used for storage that impedes the flow of people. Maintain at least 44 inches of unobstructed access.' },
  'OFF-010': { topic: 'Stairways', note: 'Maintain stairways in good condition with uniform tread rise and no worn or uneven tread noses. Handrails should be 34 to 38 inches high, measured vertically from the tread nose, and provide a good grasp point.' },
  'OFF-011': { topic: 'Stairways', note: 'Maintain stairways in good condition with uniform tread rise and no worn or uneven tread noses. Handrails should be 34 to 38 inches high, measured vertically from the tread nose, and provide a good grasp point.' },
  'OFF-012': { topic: 'Fire Extinguishers', note: 'Two inspections are required: annual and monthly. Annual maintenance is normally documented by a vendor or qualified inspector on a tag. A shop or section employee performs the monthly visual inspection using the OCC Form 2013 master checklist, which should be retained in a separate file. Record the date and initials on the annual tag when space is provided; otherwise use a separate monthly inspection tag.' },
  'OFF-013': { topic: 'Fire Extinguishers', note: 'Fire extinguishers must be identified and unobstructed. Confirm the annual and monthly inspection documentation is current and retained as required.' },
  'OFF-014': { topic: 'Exit Signs', note: 'Doors leading outside should have exit signs, and exits must remain unobstructed. If the office is occupied at night, exit signs should be illuminated and backed up by an emergency power source.' },
  'OFF-015': { topic: 'Exit Signs', note: 'Doors leading outside should have exit signs, and exits must remain unobstructed. If the office is occupied at night, exit signs should be illuminated and backed up by an emergency power source.' },
  'OFF-016': { topic: 'Emergency Illumination', note: 'Where offices may be occupied after dark, emergency lighting should illuminate exits leading to stairwells and interior stairwells in multi-story buildings. Look for the indicator light, usually red, showing the unit is functional.' },
  'OFF-017': { topic: 'Emergency Procedures', note: 'Confirm the District, Division, or Office has written emergency procedures for fire, inclement weather, bomb threats, and similar events. A shelter area should be identified for inclement weather, and a diagram showing emergency exit routes should be posted on a bulletin board.' },
  'OFF-018': { topic: 'Shelving', note: 'Store heavy items at lower shelving levels. Shelf units should be securely fastened to the wall or, for grouped freestanding units, secured to one another.' },
  'OFF-019': { topic: 'Portable Ladders', note: 'Inspect wooden ladders for looseness, wobbling, and broken or split rails or steps; metal ladders for bends and loose rivets; and fiberglass ladders for looseness, tears, or breaks. Discard and replace damaged ladders.' },
  'OFF-020': { topic: 'SDS Manual', note: 'Individual SDS records must be current. At five years or older, contact the manufacturer for an update. Replace the SDS or note the new revision date. The index and manual contents must match.' },
  'OFF-021': { topic: 'SDS Manual', note: 'The Site Plan should show the work-location layout and every hazardous-material storage location. Include the two HazCom documents: the written plan and the detail sheet identifying individual responsibilities and contact methods.' },
  'OFF-022': { topic: 'SDS Manual', note: 'Confirm the current HazCom notice to employees is posted and that the SDS manual, index, site plan, written plan, and responsibility detail sheet are current and consistent.' },
  'OFF-023': { topic: 'First Aid Kits', note: 'Confirm first aid kits are present, identified, unobstructed, and contain the entire inventory shown on the current inventory list.' },
  'OFF-024': { topic: 'Housekeeping', note: 'Keep electrical cords and floor mats positioned so they do not create trip hazards or obstruct aisle ways.' },
  'OFF-025': { topic: 'Material Handling', note: 'Provide dollies or carts for heavy objects and materials. Confirm they are in good condition and that dollies with pneumatic tires do not have low or flat tires.' },
  'OFF-026': { topic: 'Electrical', note: 'Space heaters must carry UL or FM approval. Verify the approval label is present and legible.' },
  'OFF-027': { topic: 'Electrical', note: 'Install GFCI receptacles in break-room sink areas and other locations subject to water splash.' },
  'OFF-028': { topic: 'Electrical', note: 'Circuit breakers should be clearly labeled with the circuit they control, and electrical panels must remain unobstructed.' },
  'OFF-029': { topic: 'Electrical', note: 'Look for frayed insulation and broken ground prongs on extension cords. Cords should be UL or FM listed.' },
  'OFF-030': { topic: 'Electrical', note: 'Look for junction boxes without covers and receptacles or wall switches without face plates.' },
};

const hazmatGuidance: Record<string, { topic: string; note: string }> = {
  'HAZ-001': { topic: 'Safety Meetings', note: 'Monthly meetings must be recorded on Form 1301 and filed. Employees absent from a monthly meeting must review the material when they return, then sign and date the roster.' },
  'HAZ-002': { topic: 'Safety Meetings', note: 'Daily meetings must be recorded in a diary, local form, or daily work or job sheet and filed. Include applicable task analyses and traffic control plans.' },
  'HAZ-003': { topic: 'Fire Extinguishers', note: 'Two inspections are required: annual and monthly. Annual inspections are normally documented by a vendor or qualified inspector on a green tag. A shop or section employee completes the monthly visual inspection using a master checklist for workplace, vehicle, and equipment extinguishers, then records the date and initials on the green monthly tag.' },
  'HAZ-004': { topic: 'Fire Extinguishers', note: 'Confirm each extinguisher station is identified, visible, and unobstructed. Verify the annual and monthly inspection records are current.' },
  'HAZ-005': { topic: 'Extra PPE', note: 'Keep a limited supply of spare safety glasses, goggles, gloves, hard hats, respirators, and hearing protection available in the local stock room.' },
  'HAZ-006': { topic: 'Exit Signs', note: 'Emergency egress routes must have exit signs and remain unobstructed.' },
  'HAZ-007': { topic: 'Emergency Evacuation', note: 'Post basic fire and inclement-weather procedures near a simple building diagram. Including the location of an identified shelter area is a best practice.' },
  'HAZ-008': { topic: 'MSDS Manual', note: 'Individual MSDS records must be current. At five years or older, contact the manufacturer and replace the sheet or note its updated revision date. The index and manual contents must match. The site plan should show the work location and hazardous-material storage areas. Include the written HazCom plan and the document identifying individual responsibilities and contact information.' },
  'HAZ-009': { topic: 'Containers Labeled', note: 'Label every chemical container and tank. An indelible marker may be used to identify contents. This includes parts-washer containment barrels, magnesium chloride tanks, herbicide tanks, and non-potable water tanks on trucks, trailers, and sweepers.' },
  'HAZ-011': { topic: 'Housekeeping', note: 'Keep offices, shops, sheds, and the yard swept and orderly. Store material on racks, pick up trash and banding, control weeds, remove trip hazards, and keep water hoses properly stored.' },
  'HAZ-012': { topic: 'Housekeeping', note: 'Keep offices, shops, sheds, and the yard swept and orderly. Store material on racks, pick up trash and banding, control weeds, remove trip hazards, and keep water hoses properly stored.' },
  'HAZ-013': { topic: 'First Aid Kits', note: 'Confirm kits are present and contain the full inventory shown on the current inventory list.' },
  'HAZ-014': { topic: 'Eye Washes', note: 'Provide an eye wash in the shop, welding shop, near the battery charger, and near lime-water or beam-tank work. Identify whether it is a bottle, replaceable-fluid wall fountain, or permanently plumbed unit. Units requiring monthly checks must be current.' },
  'HAZ-015': { topic: 'Eye Washes', note: 'Confirm eye-wash units are accessible and serviceable, nozzle covers are in place, and the water or fluid supply provides adequate pressure.' },
  'HAZ-016': { topic: 'Torch Flashback Arrestors', note: 'Install actual flashback arrestors—not check valves—at the torch handle rather than at the regulator.' },
  'HAZ-018': { topic: 'Flammables', note: 'Use approved dedicated flammable-storage cabinets. Storage sheds for gasoline cans and similar fuels should display FLAMMABLE and NO SMOKING signs.' },
  'HAZ-019': { topic: 'Flammables', note: 'Store flammable liquids in approved metal containers and approved dedicated cabinets. Clearly identify the storage area with required warning signs.' },
  'HAZ-020': { topic: 'Flammables', note: 'Do not store flammables with incompatible materials such as pesticides, bleach, or acids. Separate incompatible materials.' },
  'HAZ-021': { topic: 'Fuel Emergency Shutdown', note: 'Gasoline, diesel, and propane fuel pumps must have clearly labeled emergency shutdown switches. A panic push-button switch with a white sign and red lettering is preferred.' },
  'HAZ-022': { topic: 'Fuel Emergency Shutdown', note: 'Fuel hoses should have breakaway couplers. Hose reels are recommended to protect hoses.' },
  'HAZ-023': { topic: 'Propane PPE', note: 'Store goggles, a face shield, and insulated rubber gloves at the propane fuel pump. Confirm the LPG tank is barricaded and warning signs are present.' },
  'HAZ-024': { topic: 'Propane Storage', note: 'Small propane tanks require separate, identified, secure, well-ventilated storage away from occupied buildings. Post PROPANE and NO SMOKING signs.' },
  'HAZ-026': { topic: 'Compressed Air', note: 'Compressors located in work areas should be sound baffled as a best practice.' },
  'HAZ-027': { topic: 'Compressed Air', note: 'Shop compressed-air outlets should have variable-set pressure regulators.' },
  'HAZ-028': { topic: 'Compressed Air', note: 'Check air-nozzle bodies for pressure limitations or wording such as “Meets OSHA Requirements.” Outlet pressure must be limited to 30 psi.' },
  'HAZ-029': { topic: 'Shop Machines', note: 'Drill presses, grinders, table saws, and similar machines must be bolted securely to the floor or bench.' },
  'HAZ-030': { topic: 'Shop Machines', note: 'Confirm machine guards are present and adjusted. Grinder clearance must not exceed 1/4 inch at the upper guard and 1/8 inch at the lower guard.' },
  'HAZ-035': { topic: 'Overhead Hoists', note: 'Hoist beams must be rated for the weight they can handle, with the capacity stenciled on the beam.' },
  'HAZ-036': { topic: 'Overhead Hoists', note: 'Clearly post the maximum capacity for overhead storage and lifting areas.' },
  'HAZ-037': { topic: 'Chains and Tie Downs', note: 'Do not use cold-shut links or break-over tie downs, also called boomers. Inspect chains and tie downs for safe condition.' },
  'HAZ-038': { topic: 'Chains and Tie Downs', note: 'Use approved chain couplers rather than spot welding chains.' },
  'HAZ-039': { topic: 'Portable Ladders', note: 'Inspect ladders for looseness, wobbling, tears, and breaks. Discard damaged ladders and seek approval to replace them.' },
  'HAZ-040': { topic: 'Stair Railings', note: 'Stair railings must include mid-rails and measure 30 to 34 inches from the tread to the top of the rail.' },
  'HAZ-041': { topic: 'Platform Standard Railings', note: 'Platform top rails must be 42 inches above the walking surface and include a mid-rail and a 4-inch toe board.' },
  'HAZ-042': { topic: 'Loading Docks', note: 'Identify loading-dock edges to warn of fall hazards. A yellow-and-black color scheme is commonly used. Provide chains where needed.' },
  'HAZ-043': { topic: 'Electrical', note: 'Install GFCI receptacles in break-room sink areas and other locations subject to water splash.' },
  'HAZ-044': { topic: 'Electrical', note: 'Use GFCI pigtails for electrical outlets on generators greater than 5 kW.' },
  'HAZ-045': { topic: 'Electrical', note: 'Circuit breakers should be clearly labeled with the circuit they control, and panels must remain unobstructed.' },
  'HAZ-046': { topic: 'Electrical', note: 'Look for frayed extension-cord insulation and broken connector ground prongs. Cords should be UL or FM listed. Also check for uncovered junction boxes and receptacles or wall switches without face plates.' },
  'HAZ-047': { topic: 'Fence-Line Storage', note: 'Store material away from the fence line and check for security breaches. Keep wooden items away from the fence to create a fire break, and contain scrap metal and tires in a designated area.' },
};

const laboratoryGuidance: Record<string, { topic: string; note: string }> = {
  'LAB-001': { topic: 'Safety Meetings', note: 'Record monthly or quarterly meetings on Form 1301 and file them. Employees absent from the initial meeting must review the safety material when they return, then sign and date the roster.' },
  'LAB-002': { topic: 'Fire Extinguishers', note: 'Two inspections are required: annual and monthly. A vendor or qualified inspector normally documents the annual inspection on a tag. A shop or section employee completes the monthly visual inspection using OCC Form 2013, retains the master list in a separate file, and records the date and initials on the extinguisher tag.' },
  'LAB-003': { topic: 'Fire Extinguishers', note: 'Ensure extinguishers are identified, visible, and unobstructed at all times. Confirm annual and monthly inspection documentation is current.' },
  'LAB-004': { topic: 'PPE', note: 'Appropriate PPE—such as safety glasses, goggles, aprons, gloves, hearing protection, and respirators—must be immediately available at specific work locations or personally issued. Shared PPE must be clean, serviceable, and in good condition. Post hazard warning signs at workstations requiring specific PPE.' },
  'LAB-005': { topic: 'Exit Signs', note: 'Doors leading outside must have exit signs. Keep all exits and emergency egress routes unobstructed.' },
  'LAB-006': { topic: 'Exit Signs', note: 'Doors leading outside must have exit signs. Keep all exits, aisles, halls, and emergency egress routes unobstructed.' },
  'LAB-007': { topic: 'Emergency Evacuation', note: 'Post basic fire and inclement-weather procedures near a simple building diagram. Identifying the location of a shelter area is a best practice.' },
  'LAB-008': { topic: 'Chemical Hygiene Plan', note: 'Develop and maintain a Chemical Hygiene Plan for the laboratory in accordance with OCC Manual, Chapter 4.' },
  'LAB-009': { topic: 'SDS Manual', note: 'Individual SDS records must be current. At five years or older, contact the manufacturer and replace the sheet or note the updated revision date.' },
  'LAB-010': { topic: 'SDS Manual', note: 'Maintain a current index that matches the manual: every indexed product must have an SDS, and every SDS in the manual must be listed in the index.' },
  'LAB-011': { topic: 'SDS Manual', note: 'Confirm the current Tier II report is present in the SDS manual.' },
  'LAB-012': { topic: 'SDS Manual', note: 'The site plan must show the work-location layout and all hazardous-material storage locations. Include the written HazCom plan and the detail sheet identifying individual responsibilities and contact information.' },
  'LAB-013': { topic: 'SDS Manual', note: 'Confirm the current HazCom notice to employees is posted and the laboratory hazard-communication documents are complete and current.' },
  'LAB-014': { topic: 'Containers Labeled', note: 'Label all chemical containers, including sample bottles and cans. An indelible marker may be used to write the contents on a container.' },
  'LAB-015': { topic: 'Housekeeping', note: 'Keep office areas clean and organized, store materials properly, and remove trip hazards.' },
  'LAB-016': { topic: 'Housekeeping', note: 'Keep laboratory work areas clean and organized, store materials properly, and remove trip hazards.' },
  'LAB-017': { topic: 'Housekeeping', note: 'Keep the back dock and storage areas clean, organized, and free of trip hazards, with materials properly stored.' },
  'LAB-018': { topic: 'First Aid Kits', note: 'Confirm first aid kits are present, identified, and contain the full inventory shown on the current inventory list.' },
  'LAB-019': { topic: 'Eye Washes', note: 'Provide an accessible eye wash in the laboratory. Identify whether it is a bottle, replaceable-fluid wall fountain, or permanently plumbed unit, and keep required monthly checks current.' },
  'LAB-020': { topic: 'Eye Washes', note: 'Confirm nozzle covers are in place on plumbed eye-wash stations and the station is accessible and serviceable.' },
  'LAB-021': { topic: 'Eye Washes', note: 'Provide the required PPE, warning signs, and accessible eye-wash protection near lime-water and concrete-beam-tank work.' },
  'LAB-022': { topic: 'Local Exhaust Ventilation', note: 'Provide local exhaust hoods for chemical extractions and point-source ventilation for dust in the rock-grinding room and for indoor flammable-material storerooms. Window fans are not local exhaust ventilation.' },
  'LAB-023': { topic: 'Local Exhaust Ventilation', note: 'Turn on each local exhaust system to verify proper operation and check the condition of any filters used with the equipment. Window fans do not qualify as local exhaust ventilation.' },
  'LAB-024': { topic: 'Flammables', note: 'Use dedicated flammable-storage cabinets. Do not store flammables with incompatible materials such as pesticides, bleach, or acids.' },
  'LAB-025': { topic: 'Flammables', note: 'Clearly label laboratory storeroom doors when the room contains hazardous or flammable materials.' },
  'LAB-026': { topic: 'Flammables', note: 'Separate flammables from incompatible materials such as pesticides, bleach, and acids.' },
  'LAB-027': { topic: 'Radiation Safety', note: 'Identify nuclear-source instrument storage with standard radiation warning signs. Keep the storage room locked and secure.' },
  'LAB-028': { topic: 'Compressed Air', note: 'If the laboratory has an air compressor, locate it outside the work area.' },
  'LAB-029': { topic: 'Compressed Air', note: 'Equip laboratory compressed-air outlets with variable-set pressure regulators.' },
  'LAB-030': { topic: 'Compressed Air', note: 'Check air-cleaning nozzle bodies for pressure limitations or wording such as “Meets OSHA Requirements.” Outlet pressure must be limited to 30 PSI.' },
  'LAB-031': { topic: 'Material Handling', note: 'Use forklifts or pallet jacks where appropriate for heavy objects and materials, and confirm the equipment is in good condition.' },
  'LAB-032': { topic: 'Material Handling', note: 'Provide dollies or carts for heavy objects. Confirm they are in good condition and that pneumatic tires are not low or flat.' },
  'LAB-033': { topic: 'Overhead Hoists', note: 'If the concrete-beam soaking tank has an overhead hoist, rate the hoist frame for the load it can handle and stencil that capacity on the frame.' },
  'LAB-034': { topic: 'Portable Ladders', note: 'Inspect wooden ladders for looseness, wobbling, and broken or split rails or steps; metal ladders for bends and loose rivets; and fiberglass ladders for looseness, tears, or breaks.' },
  'LAB-035': { topic: 'Hand Railings', note: 'Stair railings must include mid-rails and measure 30 to 34 inches from the tread to the top rail. Platform railings must have a top rail 42 inches above the walking surface, a mid-rail, and a 4-inch toe board.' },
  'LAB-036': { topic: 'Loading Docks', note: 'Paint loading-dock edges to warn of fall hazards; a yellow-and-black scheme is commonly used. Provide safety chains where needed.' },
  'LAB-037': { topic: 'Electrical', note: 'Inspect explosion-proof electrical equipment in hazardous locations such as extraction rooms. Gaskets and seals must be intact, faceplate fasteners present and tight, and conduit firmly connected to boxes.' },
  'LAB-038': { topic: 'Electrical', note: 'Install GFCI receptacles in sink areas, break rooms, and other locations subject to water splash.' },
  'LAB-039': { topic: 'Electrical', note: 'Clearly label circuit breakers with the circuits they control and keep electrical panels unobstructed.' },
  'LAB-040': { topic: 'Electrical', note: 'Look for frayed insulation and broken ground prongs. Electrical cords must be in good condition and UL or FM listed.' },
  'LAB-041': { topic: 'Electrical', note: 'Ensure junction boxes have covers and receptacles or wall switches have face plates. Keep all fasteners in place and electrical connections secure.' },
};

const workGroups = ['San Antonio District Headquarters','Bexar Metro Area Office','East Bexar Maintenance','Boerne Maintenance','District Bridge Crew','District Electric Shop','Hondo Area Office','Kerrville Maintenance','Kerrville Area Office','New Braunfels Area Office','North Bexar Area Office','Pearsall Maintenance','Seguin Maintenance','District Signal Shop','Special Jobs','Tilden Maintenance','West Bexar Maintenance','Uvalde Maintenance','Bandera Maintenance','Hondo Maintenance','Floresville Maintenance','District Lab','District Maintenance Operations'];
const historyAudits: HistoryAudit[] = [
  { id:'SA-2026-0120', date:'Jan 20, 2026', status:'Submitted', inspector:'Priya Patel', workGroup:'San Antonio District Headquarters', location:'4615 NW Loop 410, San Antonio, TX 78229', supervisor:'Elena Martinez', sections:[{name:'Fire Extinguisher (Form 2013)',status:'Complete',deficiencies:0},{name:'Portable Ladder (Form 2279)',status:'Not Applicable',deficiencies:0},{name:'HAZMAT (Form 2012)',status:'Complete',deficiencies:0},{name:'Office / Administration (Form 2016)',status:'Complete',deficiencies:0},{name:'Laboratory (Form 2015)',status:'Not Applicable',deficiencies:0}], comments:2, evidence:1 },
  { id:'SA-2025-1118', date:'Nov 18, 2025', status:'Non-Compliant', inspector:'Daniel Ramirez', workGroup:'New Braunfels Area Office', location:'4102 IH 35 South, New Braunfels, TX 78132', supervisor:'Daniel Ramirez', sections:[{name:'Fire Extinguisher (Form 2013)',status:'Complete',deficiencies:0},{name:'Portable Ladder (Form 2279)',status:'Complete',deficiencies:0},{name:'HAZMAT (Form 2012)',status:'Non-Compliant',deficiencies:1},{name:'Office / Administration (Form 2016)',status:'Complete',deficiencies:0},{name:'Laboratory (Form 2015)',status:'Complete',deficiencies:0}], comments:3, evidence:2, responses:[{section:'HAZMAT (Form 2012)',asset:'HAZMAT',code:'HAZ-003',text:'Eye-wash stations unobstructed?',value:'No',comment:'A storage cart was blocking direct access to the eye-wash station.',nonCompliant:true}] },
  { id:'SA-2025-0912', date:'Sep 12, 2025', status:'Submitted', inspector:'Jordan Ellis', workGroup:'District Maintenance Operations', location:'4551 NW Loop 410, San Antonio, TX 78229', supervisor:'Not displayed', sections:[{name:'Fire Extinguisher (Form 2013)',status:'Complete',deficiencies:0},{name:'Portable Ladder (Form 2279)',status:'Complete',deficiencies:0},{name:'HAZMAT (Form 2012)',status:'Complete',deficiencies:0},{name:'Office / Administration (Form 2016)',status:'Complete',deficiencies:0},{name:'Laboratory (Form 2015)',status:'Not Applicable',deficiencies:0}], comments:1, evidence:1 },
];
const draftAudits: HistoryAudit[] = [
  { id:'DRAFT-0203', date:'Feb 3, 2026', status:'In Progress', inspector:'Current user', workGroup:'Bexar Metro Area Office', location:'San Antonio, TX', supervisor:'Not entered', sections:[{name:'Fire Extinguisher (Form 2013)',status:'In Progress',deficiencies:1},{name:'Portable Ladder (Form 2279)',status:'Not Started',deficiencies:0},{name:'HAZMAT (Form 2012)',status:'Not Applicable',deficiencies:0},{name:'Office / Administration (Form 2016)',status:'Not Started',deficiencies:0},{name:'Laboratory (Form 2015)',status:'Not Applicable',deficiencies:0}], comments:1, evidence:0 },
  { id:'DRAFT-0210', date:'Feb 10, 2026', status:'In Progress', inspector:'Current user', workGroup:'Kerrville Area Office', location:'Kerrville, TX', supervisor:'Not entered', sections:[{name:'Fire Extinguisher (Form 2013)',status:'Not Applicable',deficiencies:0},{name:'Portable Ladder (Form 2279)',status:'Not Applicable',deficiencies:0},{name:'HAZMAT (Form 2012)',status:'Not Applicable',deficiencies:0},{name:'Office / Administration (Form 2016)',status:'In Progress',deficiencies:0},{name:'Laboratory (Form 2015)',status:'Not Applicable',deficiencies:0}], comments:0, evidence:0 },
];
const spocRoster: string[][] = [
  ['Bexar Metro Area Office','Kiwini Turner','Primary','Kiwini.Turner@txdot.gov','Citlali Tapia','Citlali.Tapia@txdot.gov'], ['East Bexar Maintenance','Austin Reposndek','Primary','Austin.Respondek@txdot.gov','Gil Romo Jr','Gilbert.Perez@txdot.gov'], ['East Bexar Maintenance','Jaime Gomez','Alternate','Jaime.Gomez1@txdot.gov','',''], ['Boerne Maintenance','Dakota Putrite','Primary','Dakota.Putrite@txdot.gov','Wes Gwaltney','Wes.Gwaltney@txdot.gov'], ['District Bridge Crew','William Reed','Primary','William.Reed@txdot.gov','James Meuth','James.Meuth@txdot.gov'], ['District Bridge Crew','Mario Ramirez','Alternate','Mariano.Ramirez@txdot.gov','',''], ['District Electric Shop','John Payne','Primary','Jon.Payne@txdot.gov','Roy McCue','Roy.Mccue@txdot.gov'], ['Hondo Area Office','Garry Stephens','Primary','Garry.Stephens@txdot.gov','Enrique Manuel Gonzalez','Enrique.Manuel.Gonzalez@txdot.gov'], ['Hondo Area Office','Joseph Elwood','Alternate','Joseph.Elwood@txdot.gov','',''], ['Kerrville Maintenance','Jose Medina','Primary','Jose.Medina@txdot.gov','Gilbert Davila III','Gilbert.D.Davila@txdot.gov'], ['Kerrville Maintenance','Rosendo Carraso','Alternate','Rosendo.Carrasco@txdot.gov','',''], ['Kerrville Area Office','Ethan Barry','Primary','Ethan.Barry@txdot.gov','Roberto Madrigal','Roberto.Madrigal@txdot.gov'], ['New Braunfels Area Office','Michael Fuller','Primary','Michael.Fuller@txdot.gov','Luke Story','Luke.Story@txdot.gov'], ['North Bexar Area Office','Jose Alaniz','Primary','Jose.Alaniz@txdot.gov','Danny Gallegos','Danny.Gallegos@txdot.gov'], ['Pearsall Maintenance','Travis Torres','Primary','Travis.Torres@txdot.gov','Steven Trevino','Steven.Trevino@txdot.gov'], ['Pearsall Maintenance','Gustavo Jimenez','Alternate','Gustavo.Jimenez@txdot.gov','',''], ['Seguin Maintenance','Arthur Shaw','Primary','Arthur.Shaw@txdot.gov','Ricardo Martinez','Ricardo.Martinez@txdot.gov'], ['District Signal Shop','Pablo Guerra','Primary','Pablo.B.Guerra@txdot.gov','Jorge Ramos','Jorge.Ramos@txdot.gov'], ['District Signal Shop','Barry Peyton','Alternate','Barry.Peyton@txdot.gov','',''], ['Special Jobs','Fabian Canales','Primary','Fabian.Canales@txdot.gov','Cody Kosub','Cody.Kosub@txdot.gov'], ['Tilden Maintenance','Paul Parsons','Primary','Paul.Parsons@txdot.gov','Nathan Kessler','Nathan.Kessler@txdot.gov'], ['West Bexar Maintenance','Justin Roberson','Primary','Justin.Roberson@txdot.gov','Jerry Stevenson','Jerry.Stevens@txdot.gov'], ['West Bexar Maintenance','Michael Connolly','Alternate','Michael.Connolly@txdot.gov','',''], ['Uvalde Maintenance','Jose Razo','Primary','Jose.Razo@txdot.gov','Robert Pursley','Robert.Pursley@txdot.gov'], ['Bandera Maintenance','Nick Yanez','Primary','Hugo.Yanez@txdot.gov','Mitch Little','Mitchell.Little@txdot.gov'], ['Bandera Maintenance','George Karnes','Alternate','George.Karnes@txdot.gov','',''], ['Hondo Maintenance','Kai Garziella','Primary','Kai.Garziella@txdot.gov','David Saucedo','David.Saucedo@txdot.gov'], ['Hondo Maintenance','Eric Aase','Alternate','Eric.Aase@txdot.gov','',''], ['Floresville Maintenance','Travis Svoboda','Primary','Travis.Svoboda@txdot.gov','Jason Pfeil','Jason.Pfeil@txdot.gov'], ['Floresville Maintenance','Robert Osban','Alternate','Robert.Osban@txdot.gov','',''], ['District Lab','Alexis Leyva','Primary','Alexis.Leyva@txdot.gov','Manuel Rodriguez','Manuel.Rodriguez2@txdot.gov'],
];
const spocs: SpocRecord[] = spocRoster.map(([group,name,role,email,supervisor,supervisorEmail]: string[]): SpocRecord => {
  const locationSupervisor = spocRoster.find(([candidateGroup, , , , candidateSupervisor]: string[]) => candidateGroup === group && Boolean(candidateSupervisor));
  const resolvedSupervisor = supervisor || locationSupervisor?.[4] || '';
  const resolvedSupervisorEmail = supervisorEmail || locationSupervisor?.[5] || '';
  const reviewNotes = ['Austin Reposndek','Mario Ramirez','John Payne','Rosendo Carraso'].includes(name) ? 'Review apparent SPOC name and email spelling difference.' : '';
  return { group, name, role: role as SpocRecord['role'], email, supervisor: resolvedSupervisor, supervisorEmail: resolvedSupervisorEmail, reviewFlag: Boolean(reviewNotes), reviewNotes };
});

function FormSectionTitle({title}:{title:string}){return <div className="border-y border-foreground bg-secondary p-2 text-center text-sm font-bold text-secondary-foreground">{title}</div>}

function SafetyApp() {
  const { data: user } = useUser();
  const [page,setPage] = useState<Page>('home'); const [step,setStep] = useState<Step>(1); const [date,setDate] = useState<Date>();
  const [site,setSite] = useState({completedBy:'',workGroup:'',supervisorName:'',supervisorEmail:'',additionalRecipient:'',address:'',city:'San Antonio',state:'TX',postalCode:''});
  const [sections,setSections] = useState<Record<SectionName,SectionState>>({ 'Fire Extinguisher (Form 2013)':'Applicable','Portable Ladder (Form 2279)':'Not Applicable','HAZMAT (Form 2012)':'Applicable','Office / Administration (Form 2016)':'Applicable','Laboratory (Form 2015)':'Not Applicable','Trenches and Excavations (Form 2194)':'Not Applicable','TxDOT Confined Space Entry Permit & Checklist (Form 1993)':'Not Applicable' });
  const [assets,setAssets] = useState<Record<SectionName,Asset[]>>({ 'Fire Extinguisher (Form 2013)':[], 'Portable Ladder (Form 2279)':[], 'HAZMAT (Form 2012)':[ {id:'hazmat',identifier:'HAZMAT',serial:'',location:'',answers:{},comments:{},evidence:{}} ], 'Office / Administration (Form 2016)':[ {id:'office',identifier:'Office',serial:'',location:'',answers:{},comments:{},evidence:{}} ], 'Laboratory (Form 2015)':[ {id:'lab',identifier:'Laboratory',serial:'',location:'',answers:{},comments:{},evidence:{}} ], 'Trenches and Excavations (Form 2194)':[ {id:'trenches',identifier:'Form 2194',serial:'',location:'',answers:{},comments:{},evidence:{}} ], 'TxDOT Confined Space Entry Permit & Checklist (Form 1993)':[ {id:'confined-space',identifier:'Form 1993',serial:'',location:'',answers:{},comments:{},evidence:{}} ] });
  const [activeSection,setActiveSection] = useState<SectionName>('Fire Extinguisher (Form 2013)'); const [activeAsset,setActiveAsset] = useState<string>(''); const [query,setQuery] = useState(''); const [submitted,setSubmitted] = useState(false); const [selectedHistoryAudit,setSelectedHistoryAudit] = useState<HistoryAudit>(); const [selectedDraftAudit,setSelectedDraftAudit] = useState<HistoryAudit>();
  const [openComment,setOpenComment] = useState<string>('');
  const [commentDraft,setCommentDraft] = useState('');
  const [photoQuestion,setPhotoQuestion] = useState<string>('');
  const [auditHistory, setAuditHistory] = useState<HistoryAudit[]>([]);
  const [directorySpocs,setDirectorySpocs] = useState<SpocRecord[]>(spocs);
  const [spocDialogOpen,setSpocDialogOpen] = useState(false); const [editingSpocIndex,setEditingSpocIndex] = useState<number | null>(null); const [pendingRemovalIndex,setPendingRemovalIndex] = useState<number | null>(null);
  const blankSpoc: SpocRecord = { name:'', role:'Primary', email:'', supervisor:'', supervisorEmail:'', group:'', reviewFlag:false, reviewNotes:'' };
  const [spocForm,setSpocForm] = useState<SpocRecord>(blankSpoc);
  const [configuredQuestions,setConfiguredQuestions] = useState<Record<SectionName,Question[]>>(questions);
  const [configuredWorkGroups,setConfiguredWorkGroups] = useState<string[]>(workGroups);
  const [configuredLocations,setConfiguredLocations] = useState<string[]>(['San Antonio','New Braunfels','Kerrville','Pearsall','Seguin']);
  const [configuredDocuments,setConfiguredDocuments] = useState<Array<{name:string;url:string}>>(referenceDocumentCategories);
  useEffect(() => {
  const loadAuditHistory = async () => {
    try {
      const result = await SafetyAuditsService.getAll();

      if (!result.data) {
        return;
      }

      const sharePointAudits: HistoryAudit[] = result.data.map((audit) => ({
        id: audit.AuditKey,
        date: audit.VisitDate
          ? format(new Date(`${audit.VisitDate}T00:00:00`), 'MMM d, yyyy')
          : '',
        status: audit.Status?.Value ?? 'Submitted',
        inspector: audit.CompletedByName,
        workGroup: audit.WorkGroup,
        location: [
          audit.Address,
          audit.City,
          audit.State,
          audit.PostalCode,
        ]
          .filter(Boolean)
          .join(', '),
        supervisor: audit.SupervisorName || 'Not displayed',
        sections: [],
        comments: audit.CommentCount,
        evidence: audit.EvidenceCount,
        responses: [],
      }));

      setAuditHistory(sharePointAudits);
    } catch (error) {
      console.error('Failed to load SharePoint audit history:', error);
      toast.error('Audit History could not be loaded from SharePoint.');
    }
  };

  void loadAuditHistory();
}, []);
  const displayName = user?.fullName ?? 'User';
  const spocSectionOptions = useMemo(() => Array.from(new Set(directorySpocs.map((spoc: SpocRecord) => spoc.group.trim()).filter((section: string) => section.length > 0 && section !== 'Needs TxDOT Confirmation'))).sort((first: string, second: string) => first.localeCompare(second)), [directorySpocs]);
  const updateSite = (key: keyof typeof site,value: string | boolean) => setSite((current: typeof site)=>({...current,[key]:value}));
  const siteValid = Boolean(date && (site.completedBy || displayName) && site.workGroup && site.supervisorEmail);
  const allApplicable = sectionNames.filter((name: SectionName)=>sections[name]==='Applicable');
  const currentAsset = assets[activeSection].find((asset: Asset)=>asset.id===activeAsset) ?? assets[activeSection][0];
  const isFormComplete = (name: SectionName) => {
    const list = assets[name];
    return list.length > 0 && list.every((asset: Asset) => configuredQuestions[name].every((question: Question) => !question.required || Boolean(asset.answers[question.code])));
  };
  const activeFormIndex = allApplicable.indexOf(activeSection);
  const nextIncompleteForm = [...allApplicable.slice(activeFormIndex + 1),...allApplicable.slice(0,activeFormIndex + 1)].find((name: SectionName) => name !== activeSection && !isFormComplete(name));
  const openForm = (name: SectionName) => { setActiveSection(name); setActiveAsset(assets[name][0]?.id ?? ''); setStep(3); };
  const validationErrors = useMemo(()=>{ const errors:string[]=[]; if(!siteValid) errors.push('Complete required Site Information fields.'); allApplicable.forEach((name: SectionName)=>{ const list=assets[name]; if(repeatable.includes(name)&&list.length===0) errors.push(`${name}: add at least one asset.`); list.forEach((asset: Asset)=>configuredQuestions[name].filter((question: Question)=>question.required&&!asset.answers[question.code]).forEach((question: Question)=>errors.push(`${name} · ${asset.identifier}: ${question.code} is required.`))); }); return errors; },[assets,allApplicable,configuredQuestions,siteValid]);
  const deficiencyCount = Object.values(assets).flat().reduce((total: number,asset: Asset)=>total+Object.values(asset.answers).filter((value: string)=>value==='No').length,0);
  const evidenceCount = Object.values(assets).flat().reduce((total:number,asset:Asset)=>total+Object.values(asset.evidence).filter(Boolean).length,0);
  const commentCount = Object.values(assets).flat().reduce((total:number,asset:Asset)=>total+Object.values(asset.comments).filter(Boolean).length,0);
  const addAsset = (section: SectionName)=>{ const id=`${section}-${Date.now()}`; const number=assets[section].length+1; setAssets((current: Record<SectionName,Asset[]>)=>({...current,[section]:[...current[section],{id,identifier:`${section.split(' ')[0]} ${number}`,serial:'',location:'',answers:{},comments:{},evidence:{}}]})); setActiveSection(section); setActiveAsset(id); };
  const removeAsset = () => {
    if (!currentAsset || !repeatable.includes(activeSection)) return;
    const remainingAssets = assets[activeSection].filter((asset: Asset) => asset.id !== currentAsset.id);
    setAssets((current: Record<SectionName,Asset[]>) => ({...current,[activeSection]:remainingAssets}));
    setActiveAsset(remainingAssets[0]?.id ?? '');
    toast.success(`${currentAsset.identifier} removed.`);
  };
  const updateComment = (code:string,value:string)=>setAssets((current:Record<SectionName,Asset[]>)=>({...current,[activeSection]:current[activeSection].map((asset:Asset)=>asset.id===currentAsset?.id?{...asset,comments:{...asset.comments,[code]:value}}:asset)}));
  const deleteComment = (code:string) => { updateComment(code,''); toast.success('Comment removed.'); };
  const beginComment = (code:string) => { setOpenComment(code); setCommentDraft(currentAsset?.comments[code] ?? ''); };
  const saveComment = () => { if (!openComment) return; updateComment(openComment,commentDraft.trim()); setOpenComment(''); toast.success(commentDraft.trim() ? 'Comment saved.' : 'Comment removed.'); };
  const captureEvidence = (code:string,event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0]; if(!file||!currentAsset)return;
    const reader=new FileReader();
    reader.onload=()=>{const photo=typeof reader.result==='string'?reader.result:'';setAssets((current:Record<SectionName,Asset[]>)=>({...current,[activeSection]:current[activeSection].map((asset:Asset)=>asset.id===currentAsset.id?{...asset,evidence:{...asset.evidence,[code]:photo}}:asset)}));toast.success('Photo evidence added.');};
    reader.onerror=()=>toast.error('Photo could not be read.');
    reader.readAsDataURL(file);
  };
  const submitAudit = async () => {
  try {
    const auditKey = `SA-${Date.now()}`;
    const visitDate = date
      ? format(date, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');

    // 1. SAVE THE MAIN AUDIT TO SHAREPOINT
    const auditResult = await SafetyAuditsService.create({
      Title: auditKey,
      AuditKey: auditKey,
      Status: deficiencyCount > 0 ? 'Non-Compliant' : 'Submitted',
      VisitDate: visitDate,
      SubmittedDate: new Date().toISOString(),
      CompletedByName: site.completedBy || displayName,
      CompletedByEmail: '',
      WorkGroup: site.workGroup,
      SupervisorName: site.supervisorName || '',
      SupervisorEmail: site.supervisorEmail,
      AdditionalRecipient: site.additionalRecipient || '',
      Address: site.address || '',
      City: site.city || '',
      State: site.state || '',
      PostalCode: site.postalCode || '',
      IsCompliant: deficiencyCount === 0,
      NameNotFound: false,
      DeficiencyCount: deficiencyCount,
      CommentCount: commentCount,
      EvidenceCount: evidenceCount,
    });

    if (!auditResult.data) {
      throw new Error('The SafetyAudits SharePoint record was not created.');
    }

    // 2. BUILD ALL QUESTION RESPONSES
    const responses = sectionNames.flatMap((section: SectionName) =>
      assets[section].flatMap((asset: Asset) =>
        configuredQuestions[section]
          .filter((question: Question) =>
            Boolean(asset.answers[question.code])
          )
          .map((question: Question) => ({
            section,
            asset,
            question,
            value: asset.answers[question.code],
            comment: asset.comments[question.code] || '',
            isDeficiency: asset.answers[question.code] === 'No',
          }))
      )
    );

    // 3. SAVE EACH RESPONSE TO SHAREPOINT
    await Promise.all(
      responses.map((response, index) => {
        const responseKey =
          `${auditKey}-R-${String(index + 1).padStart(4, '0')}`;

        return SafetyResponsesService.create({
          Title: response.question.code,
          ResponseKey: responseKey,
          AuditKey: auditKey,
          SectionName: response.section,

          SectionStatus:
            sections[response.section] === 'Not Applicable'
              ? 'Not Applicable'
              : response.isDeficiency
                ? 'Non-Compliant'
                : 'Complete',

          AssetKey: response.asset.id,
          AssetIdentifier: response.asset.identifier,
          AssetSerialNumber: response.asset.serial || '',
          AssetLocation: response.asset.location || '',

          QuestionCode: response.question.code,
          QuestionTextSnapshot: response.question.text,
          ResponseValue: response.value,
          Comment: response.comment,
          IsDeficiency: response.isDeficiency,
        });
      })
    );

    // 4. ONLY SHOW SUCCESS AFTER SHAREPOINT WRITES FINISH
    setSubmitted(true);

    toast.success(
      `Audit ${auditKey} saved to SharePoint with ${responses.length} responses.`
    );

  } catch (error) {
    console.error('Audit SharePoint submission error:', error);

    toast.error(
      error instanceof Error
        ? error.message
        : 'The audit could not be saved to SharePoint.'
    );
  }
};


  const updateAnswer = (code:string,value:string)=>setAssets((current: Record<SectionName,Asset[]>)=>({...current,[activeSection]:current[activeSection].map((asset: Asset)=>asset.id===(currentAsset?.id ?? activeAsset)?{...asset,answers:{...asset.answers,[code]:value}}:asset)}));


  const openAddSpoc = () => { setEditingSpocIndex(null); setSpocForm(blankSpoc); setSpocDialogOpen(true); };
  const openEditSpoc = (spoc: SpocRecord, index: number) => { setEditingSpocIndex(index); setSpocForm({...spoc}); setSpocDialogOpen(true); };
  const updateSpocForm = (key: keyof SpocRecord, value: string | boolean) => setSpocForm((current: SpocRecord) => ({...current,[key]:value}));
  const saveSpoc = () => {
    if (!spocForm.name.trim() || !spocForm.group.trim()) { toast.error('SPOC name and section are required.'); return; }
    setDirectorySpocs((current: SpocRecord[]) => editingSpocIndex === null ? [...current,spocForm] : current.map((spoc: SpocRecord,index: number) => index === editingSpocIndex ? spocForm : spoc));
    toast.success(editingSpocIndex === null ? 'SPOC added.' : 'SPOC updated.');
    setSpocDialogOpen(false);
  };
  const requestRemoveSpoc = (index: number) => setPendingRemovalIndex(index);
  const confirmRemoveSpoc = () => {
    if (pendingRemovalIndex === null) return;
    setDirectorySpocs((current: SpocRecord[]) => current.filter((_spoc: SpocRecord,currentIndex: number) => currentIndex !== pendingRemovalIndex));
    setPendingRemovalIndex(null);
    toast.success('SPOC removed.');
  };
  const saveDraft=()=>toast.success('Draft saved for this session.');
  const go=(next:Page)=>{setPage(next); if(next==='audit'){setStep(1);setSubmitted(false);} };

  const renderQuestion=(question:Question)=>{ const value=currentAsset?.answers[question.code]??''; if(question.type==='multiline') return <Textarea value={value} onChange={(event: ChangeEvent<HTMLTextAreaElement>)=>updateAnswer(question.code,event.target.value)} />; if(question.type==='text') return <Input value={value} onChange={(event: ChangeEvent<HTMLInputElement>)=>updateAnswer(question.code,event.target.value)} />; if(question.type==='date') return <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start">{value?format(new Date(`${value}T00:00:00`),'PPP'):'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={value?new Date(`${value}T00:00:00`):undefined} onSelect={(selected?:Date)=>selected&&updateAnswer(question.code,format(selected,'yyyy-MM-dd'))} /></PopoverContent></Popover>; if(question.type==='multi') return <div className="grid gap-2 sm:grid-cols-2">{question.options?.map((option:string)=><label key={option} className="flex min-h-11 items-center gap-2 rounded-md border p-3"><Checkbox checked={value.split('|').includes(option)} onCheckedChange={(checked:boolean|'indeterminate')=>{const next=value?value.split('|').filter(Boolean):[];updateAnswer(question.code,checked===true?[...next,option].filter((item:string,index:number,array:string[])=>array.indexOf(item)===index).join('|'):next.filter((item:string)=>item!==option).join('|'));}} />{option}</label>)}</div>; const options=question.type==='single'?(question.options??[]):question.type==='yesno'?['Yes','No']:['Yes','No','Not Applicable']; return <Select value={value||'unanswered'} onValueChange={(next:string)=>updateAnswer(question.code,next==='unanswered'?'':next)}><SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unanswered">Select response</SelectItem>{options.filter(Boolean).map((option:string)=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>; };
  const renderStandardQuestions=()=>{
    if(!currentAsset) return null;
    return <div className="space-y-3">
      {configuredQuestions[activeSection].map((question:Question)=>{
        const guidance=activeSection==='Office / Administration (Form 2016)'?officeGuidance[question.code]:activeSection==='Fire Extinguisher (Form 2013)'?fireExtinguisherGuidance[question.code]:activeSection==='HAZMAT (Form 2012)'?hazmatGuidance[question.code]:activeSection==='Laboratory (Form 2015)'?laboratoryGuidance[question.code]:undefined;
        const isBinary=question.type==='yesno'||question.type==='yesnona';
        const answer=currentAsset.answers[question.code];
        const questionDetails=<><div className="flex items-start gap-2"><Badge variant="outline">{question.code}</Badge><Label className="flex-1 leading-snug">{question.text}{question.required&&<span aria-label="required"> *</span>}</Label>{guidance&&<Popover><PopoverTrigger asChild><Button type="button" variant="outline" size="icon-sm" aria-label={`View explanatory note for ${question.text}`}><Info className="h-4 w-4" /></Button></PopoverTrigger><PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-80"><p className="font-semibold">{guidance.topic}</p><p className="mt-2 text-sm text-muted-foreground">{guidance.note}</p></PopoverContent></Popover>}</div>{!isBinary&&<div className="mt-2 [&_input]:bg-accent [&_textarea]:bg-accent [&_button]:bg-accent [&_button]:text-accent-foreground">{renderQuestion(question)}</div>}{currentAsset.comments[question.code]&&<div className="mt-2 rounded-md bg-muted p-3 text-muted-foreground"><div className="mb-1 flex items-center justify-between gap-2"><div className="flex items-center gap-2 font-medium text-foreground"><MessageSquare className="h-4 w-4"/>Comment</div><Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete comment for ${question.text}`} onClick={()=>deleteComment(question.code)}><X className="h-4 w-4" /></Button></div><p className="whitespace-pre-wrap text-sm">{currentAsset.comments[question.code]}</p></div>}<div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={()=>beginComment(question.code)}><MessageSquare/>{currentAsset.comments[question.code]?'Edit Comment':'Add Comment'}</Button><Button size="sm" variant="outline" onClick={()=>setPhotoQuestion(question.code)}><Camera/>{currentAsset.evidence[question.code]?'Replace Photo':'Add Photo'}</Button></div></>;
        if(!isBinary) return <div key={question.code} className="rounded-lg border bg-card p-4 text-card-foreground">{questionDetails}</div>;
        const responseOptions=question.type==='yesno'?(['Yes','No'] as const):(['Yes','No','Not Applicable'] as const);
        const gridClass=question.type==='yesno'?'grid-cols-[56px_56px_1fr]':'grid-cols-[56px_56px_56px_1fr]';
        return <div key={question.code} className={`overflow-x-auto border border-foreground ${answer==='No'?'bg-destructive text-destructive-foreground':'bg-card text-card-foreground'}`}><div className={`grid min-w-[420px] ${gridClass} border-b border-foreground text-center text-xs font-bold`}>{responseOptions.map((option:'Yes'|'No'|'Not Applicable')=><div key={option} className="border-r border-foreground p-2">{option==='Not Applicable'?'N/A':option}</div>)}<div className="p-2">INSPECTION DESCRIPTION</div></div><div className={`grid min-w-[420px] ${gridClass} text-sm`}>{responseOptions.map((option:'Yes'|'No'|'Not Applicable')=><div key={option} className="flex min-h-11 cursor-pointer items-center justify-center border-r border-foreground p-2"><input aria-label={`${option}: ${question.text}`} type="radio" name={question.code} checked={answer===option} onChange={()=>updateAnswer(question.code,option)} /></div>)}<div className="min-w-0 p-2">{questionDetails}</div></div></div>;
      })}
    </div>;
  };
  const renderConfinedSpaceForm=()=>{
    if(!currentAsset) return null;
    const formQuestions=configuredQuestions['TxDOT Confined Space Entry Permit & Checklist (Form 1993)'];
    const byGroup=(group:Question['group'])=>formQuestions.filter((question:Question)=>question.group===group);
    const fieldGrid=(group:Question['group'], columns:string)=><div className={`grid grid-cols-1 gap-px bg-foreground sm:${columns}`}>{byGroup(group).map((question:Question)=><div key={question.code} className="bg-card p-2"><Label className="text-xs font-bold">{question.text}{question.required&&' *'}</Label><div className="mt-1 [&_input]:bg-accent [&_textarea]:bg-accent [&_button]:bg-accent [&_button]:text-accent-foreground">{renderQuestion(question)}</div></div>)}</div>;
    const tableInput=(question:Question)=><div className="bg-card p-1 [&_input]:min-h-11 [&_input]:bg-accent [&_button]:min-h-11 [&_button]:bg-accent [&_button]:text-accent-foreground">{renderQuestion(question)}</div>;
    const teamRows=Array.from({length:8},(_unused:unknown,index:number)=>index+1);
    const equipmentRows=Array.from({length:6},(_unused:unknown,index:number)=>index+1);
    const monitoringRows=['Oxygen – 19.5% to 23.5%','Lower Explosive Limit – Under 10%','Carbon Monoxide – Under 25 ppm','Hydrogen Sulfide – Under 10 ppm','Tester Initials'];
    const monitoringColumns=['Initial Checks','Checks After Isolation and Ventilation','Hr 1','Hr 2','Hr 3','Hr 4','Hr 5','Hr 6','Hr 7','Hr 8'];

    const checklist=byGroup('CONFINED SPACE CHECKLIST');
    return <div className="border border-foreground bg-card text-card-foreground">

      <div>
      <div className="border-b border-foreground p-3 text-center"><h2 className="text-lg font-bold">TxDOT Confined Space Entry Permit &amp; Checklist (Form 1993)</h2></div>
      <FormSectionTitle title="PERMIT INFORMATION" />{fieldGrid('PERMIT INFORMATION','grid-cols-2')}
      <FormSectionTitle title="TEAM MEMBERS" /><div className="overflow-x-auto"><div className="min-w-[640px]"><div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-foreground text-center text-xs font-bold">{['Name','Role (Entrant or Attendant)','Entry Time','Exit Time'].map((heading:string)=><div key={heading} className="border-r border-foreground p-2 last:border-r-0">{heading}</div>)}</div>{teamRows.map((row:number)=><div key={row} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-foreground">{[1,2,3,4].map((column:number)=>{const question=formQuestions.find((item:Question)=>item.code===`CSP-T${row}-${column}`);return <div key={column} className="border-r border-foreground last:border-r-0">{question&&tableInput(question)}</div>;})}</div>)}</div></div>
      <FormSectionTitle title="CONTINUOUS AIR MONITORING RESULTS" /><p className="border-b border-foreground bg-muted p-2 text-xs text-muted-foreground sm:hidden">Swipe horizontally to enter all monitoring intervals.</p><div className="overflow-x-auto"><div className="min-w-[1380px]"><div className="grid grid-cols-[190px_140px_repeat(10,105px)] border-b border-foreground text-center text-[11px] font-bold"><div className="border-r border-foreground p-2">Atmospheric Check</div><div className="border-r border-foreground p-2">Permissible Entry Levels</div>{monitoringColumns.map((column:string)=><div key={column} className="border-r border-foreground p-2 last:border-r-0">{column}</div>)}</div>{monitoringRows.map((row:string,rowIndex:number)=><div key={row} className="grid grid-cols-[190px_140px_repeat(10,105px)] border-b border-foreground"><div className="border-r border-foreground p-2 text-xs font-medium">{row.split(' – ')[0]}</div><div className="border-r border-foreground p-2 text-xs">{row.split(' – ')[1]??'—'}</div>{monitoringColumns.map((_column:string,columnIndex:number)=>{const question=formQuestions.find((item:Question)=>item.code===`CSP-M${rowIndex+1}-${columnIndex+1}`);return <div key={columnIndex} className="border-r border-foreground last:border-r-0">{question&&tableInput(question)}</div>;})}</div>)}</div></div>
      <FormSectionTitle title="ADDITIONAL INFORMATION" />{fieldGrid('ADDITIONAL INFORMATION','grid-cols-1')}
      <FormSectionTitle title="SAMPLING EQUIPMENT" /><div className="overflow-x-auto"><div className="min-w-[700px]"><div className="grid grid-cols-5 border-b border-foreground text-center text-xs font-bold">{['Sampling Equipment','Name','Type','Date Calibrated','Identification Number'].map((heading:string)=><div key={heading} className="border-r border-foreground p-2 last:border-r-0">{heading}</div>)}</div>{equipmentRows.map((row:number)=><div key={row} className="grid grid-cols-5 border-b border-foreground">{[1,2,3,4,5].map((column:number)=>{const question=formQuestions.find((item:Question)=>item.code===`CSP-S${row}-${column}`);return <div key={column} className="border-r border-foreground last:border-r-0">{question&&tableInput(question)}</div>;})}</div>)}</div></div>
      <FormSectionTitle title="EMERGENCY INFORMATION AND APPROVAL" />{fieldGrid('EMERGENCY INFORMATION','grid-cols-2')}<div className="border-b border-foreground bg-destructive p-3 text-center font-bold text-destructive-foreground">If an emergency should occur-first summon help. If a person is down for no apparent cause you must assume that toxic gases or oxygen deficiency could exist-DO NOT ENTER.</div>

      <FormSectionTitle title="CONFINED SPACE ENTRY CHECKLIST" />{fieldGrid('ENTRY INFORMATION','grid-cols-4')}<div className="overflow-x-auto"><div className="grid min-w-[420px] grid-cols-[56px_56px_56px_1fr] border-y border-foreground text-center text-xs font-bold"><div className="border-r border-foreground p-2">Yes</div><div className="border-r border-foreground p-2">No</div><div className="border-r border-foreground p-2">N/A</div><div className="p-2">CHECKLIST ITEM</div></div>{checklist.map((question:Question)=><div key={question.code} className="grid min-w-[420px] grid-cols-[56px_56px_56px_1fr] border-b border-foreground text-sm">{(['Yes','No','Not Applicable'] as const).map((option:'Yes'|'No'|'Not Applicable')=><div key={option} className="flex items-center justify-center border-r border-foreground"><input type="radio" name={question.code} aria-label={`${option}: ${question.text}`} checked={currentAsset.answers[question.code]===option} onChange={()=>updateAnswer(question.code,option)} /></div>)}<div className="p-2">{question.text}</div></div>)}</div></div>
      <FormSectionTitle title="DEBRIEFING" />{fieldGrid('DEBRIEFING','grid-cols-1')}<FormSectionTitle title="SCOPE OF WORK" />{fieldGrid('SCOPE OF WORK','grid-cols-1')}
    </div>;
  };
  const renderTrenchForm=()=>{
    if(!currentAsset) return null;
    const formQuestions=configuredQuestions['Trenches and Excavations (Form 2194)'];
    const information=formQuestions.filter((question:Question)=>question.group==='INSPECTION INFORMATION');
    const signOff=formQuestions.filter((question:Question)=>question.group==='COMPETENT PERSON SIGN-OFF');
    const groups: Question['group'][]=['EXCAVATION','UTILITIES','WET CONDITIONS','HAZARDOUS ATMOSPHERE'];
    return <div className="overflow-hidden border border-foreground bg-card text-card-foreground">
      <div className="border-b border-foreground p-3 text-center"><h2 className="text-lg font-bold">Trenches and Excavations (Form 2194)</h2></div>
      <div className="grid gap-px bg-foreground sm:grid-cols-2">{information.map((question:Question)=><div key={question.code} className="bg-card p-2"><Label className="text-xs font-bold">{question.text}</Label><div className="mt-1 [&_input]:bg-accent [&_button]:bg-accent [&_button]:text-accent-foreground">{renderQuestion(question)}</div></div>)}</div>
      {groups.map((group:Question['group'])=><div key={group}><div className="border-y border-foreground bg-secondary p-2 text-center text-sm font-bold text-secondary-foreground">{group}</div><div className="grid min-w-[420px] grid-cols-[56px_56px_56px_1fr] border-b border-foreground text-center text-xs font-bold"><div className="border-r border-foreground p-2">Yes</div><div className="border-r border-foreground p-2">No</div><div className="border-r border-foreground p-2">N/A</div><div className="p-2">INSPECTION DESCRIPTION</div></div>{formQuestions.filter((question:Question)=>question.group===group).map((question:Question)=><div key={question.code} className="grid min-w-[420px] grid-cols-[56px_56px_56px_1fr] border-b border-foreground text-sm"><div className="flex items-center justify-center border-r border-foreground"><input aria-label={`Yes: ${question.text}`} type="radio" name={question.code} checked={currentAsset.answers[question.code]==='Yes'} onChange={()=>updateAnswer(question.code,'Yes')} /></div><div className="flex items-center justify-center border-r border-foreground"><input aria-label={`No: ${question.text}`} type="radio" name={question.code} checked={currentAsset.answers[question.code]==='No'} onChange={()=>updateAnswer(question.code,'No')} /></div><div className="flex items-center justify-center border-r border-foreground"><input aria-label={`N/A: ${question.text}`} type="radio" name={question.code} checked={currentAsset.answers[question.code]==='Not Applicable'} onChange={()=>updateAnswer(question.code,'Not Applicable')} /></div><div className="p-2 leading-snug">{question.text}</div></div>)}</div>)}
      <div className="border-b border-foreground bg-secondary p-2 text-center text-sm font-bold text-secondary-foreground">COMPETENT PERSON SIGN-OFF</div><div className="grid gap-px bg-foreground sm:grid-cols-3">{signOff.map((question:Question)=><div key={question.code} className="bg-card p-2"><Label className="text-xs font-bold">{question.text}</Label><div className="mt-1 [&_input]:bg-accent [&_button]:bg-accent [&_button]:text-accent-foreground">{renderQuestion(question)}</div></div>)}</div>
    </div>;
  };
  const pageTitle=navItems.find((item)=>item.page===page)?.label??'Home';
  return <div className="min-h-screen bg-background text-foreground"><header className="sticky top-0 z-30 border-b bg-background/95"><div className="mx-auto flex min-h-16 max-w-[1500px] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4"><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-[min(20rem,calc(100vw-2rem))] overflow-y-auto"><SheetHeader><SheetTitle>San Antonio District SPOC Portal</SheetTitle></SheetHeader><div className="mt-6 grid gap-2">{navItems.map(({page:navPage,label,icon:Icon})=><Button key={navPage} variant={page===navPage?'default':'ghost'} className="justify-start" onClick={()=>go(navPage)}><Icon />{label}</Button>)}</div></SheetContent></Sheet><div className="hidden h-11 w-11 shrink-0 sm:flex items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-label="Safety portal"><HardHat className="h-7 w-7" aria-hidden="true" /></div><p className="min-w-0 truncate font-semibold leading-tight"><span className="sm:hidden">Safety Portal</span><span className="hidden sm:inline">San Antonio District SPOC Portal</span></p><div className="ml-auto min-w-0 text-right"><p className="truncate text-sm font-medium"><span className="hidden sm:inline">Logged in as: </span>{displayName}</p></div></div></header><div className="mx-auto flex max-w-[1500px]"><aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-sidebar p-3 lg:block"><nav className="grid gap-1">{navItems.map(({page:navPage,label,icon:Icon})=><Button key={navPage} variant={page===navPage?'default':'ghost'} className="justify-start" onClick={()=>go(navPage)}><Icon />{label}</Button>)}</nav><Card className="mt-6"><CardContent className="p-4 text-sm"><p className="font-medium">Policy boundary</p><p className="mt-1 text-muted-foreground">Unconfirmed workflow settings are marked “Needs TxDOT Confirmation.”</p></CardContent></Card></aside><main className="min-w-0 flex-1 p-3 sm:p-4 md:p-6"><InMemoryDataBanner show={HAS_IN_MEMORY_TABLES} message="This app uses draft tables for testing. Data entered won't be saved. Contact the app owner to enable storage." className="mb-4" /><div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold">{pageTitle}</h1><p className="text-muted-foreground">Facility safety operations and oversight</p></div>{page==='audit'&&<Button variant="outline" className="w-full sm:w-auto" onClick={saveDraft}><Save />Save Draft</Button>}</div>
  {page==='home'&&<HomeView go={go} displayName={displayName} />}
  {page==='dashboard'&&<SafetyDashboard audits={auditHistory} />}
  {page==='audit'&&<div className="space-y-5"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{['Site','Choose Forms','Complete','Review & Submit'].map((label:string,index:number)=><button key={label} className={`min-h-12 rounded-md p-2 text-xs font-medium ${step===index+1?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'}`} onClick={()=>setStep((index+1) as Step)}>{index+1}. {label}</button>)}</div><Progress value={(step/4)*100} />
  {step===1&&<Card><CardHeader><CardTitle>Site Information</CardTitle><CardDescription>Required fields are marked with an asterisk.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div><Label>Date of Visit *</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="mt-1 w-full justify-start">{date?format(date,'PPP'):'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent></Popover></div><Field label="Completed By *" value={site.completedBy||displayName} change={(value:string)=>updateSite('completedBy',value)} /><div><Label htmlFor="section-office">Section / Office *</Label><select id="section-office" value={site.workGroup} onChange={(event:ChangeEvent<HTMLSelectElement>)=>updateSite('workGroup',event.target.value)} className="mt-1 flex min-h-11 w-full text-base sm:text-sm rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring"><option value="">Select section or office</option>{configuredWorkGroups.filter((group:string)=>group.trim().length>0).map((group:string)=><option key={group} value={group}>{group}</option>)}</select></div><Field label="Supervisor Name" value={site.supervisorName} change={(value:string)=>updateSite('supervisorName',value)} /><Field label="Supervisor Email *" value={site.supervisorEmail} change={(value:string)=>updateSite('supervisorEmail',value)} /><Field label="Additional Recipient" value={site.additionalRecipient} change={(value:string)=>updateSite('additionalRecipient',value)} /><Field label="Address" value={site.address} change={(value:string)=>updateSite('address',value)} icon={<MapPin className="h-4 w-4"/>} /><Field label="City" value={site.city} change={(value:string)=>updateSite('city',value)} /><Field label="State" value={site.state} change={(value:string)=>updateSite('state',value)} /><Field label="Postal Code" value={site.postalCode} change={(value:string)=>updateSite('postalCode',value)} /><div className="flex flex-col md:col-span-2 sm:items-end"><Button disabled={!siteValid} onClick={()=>setStep(2)}>Continue<ChevronRight /></Button></div></CardContent></Card>}
  {step===2&&<Card><CardHeader><CardTitle>Choose Forms</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{sectionNames.map((name:SectionName)=>{const selected=sections[name]==='Applicable';return <button type="button" key={name} aria-pressed={selected} onClick={()=>setSections((current:Record<SectionName,SectionState>)=>({...current,[name]:selected?'Not Applicable':'Applicable'}))} className={`group flex min-h-24 items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${selected?'border-primary bg-primary text-primary-foreground':'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'}`}><span className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 shrink-0"/><strong>{name}</strong></span>{selected&&<CheckCircle2 className="h-5 w-5 shrink-0" aria-label="Selected"/>}</button>})}<div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-between [&_button]:w-full sm:[&_button]:w-auto"><Button variant="outline" onClick={()=>setStep(1)}>Back</Button><Button onClick={()=>setStep(3)}>Continue<ChevronRight /></Button></div></CardContent></Card>}
  {step===3&&<div className="grid gap-4 xl:grid-cols-[340px_1fr]"><Card><CardHeader><CardTitle>Audit Sections</CardTitle></CardHeader><CardContent className="space-y-2">{sectionNames.map((name:SectionName)=>{const disabled=sections[name]==='Not Applicable';const list=assets[name];const missing=list.reduce((sum:number,asset:Asset)=>sum+configuredQuestions[name].filter((q:Question)=>q.required&&!asset.answers[q.code]).length,0);const deficient=list.reduce((sum:number,asset:Asset)=>sum+Object.values(asset.answers).filter((value:string)=>value==='No').length,0);return <button key={name} disabled={disabled} onClick={()=>openForm(name)} className={`w-full rounded-md border p-3 text-left ${activeSection===name?'border-primary bg-accent text-accent-foreground':''}`}><div className="flex items-center justify-between gap-2"><strong>{name}</strong><Badge variant={disabled?'secondary':deficient?'destructive':'outline'}>{disabled?'Not Applicable':deficient?'Deficiency Present':list.length&&missing===0?'Complete':list.length?'In Progress':'Not Started'}</Badge></div>{!disabled&&<p className="mt-1 text-xs">{missing} required unanswered · {deficient} potential deficiencies</p>}</button>})}</CardContent></Card><Card><CardHeader><div className="flex flex-col items-start justify-between gap-3 sm:flex-row"><div><CardTitle>{activeSection}</CardTitle><CardDescription>{repeatable.includes(activeSection)?'Repeatable asset inspection':'Section questionnaire'}</CardDescription></div>{repeatable.includes(activeSection)&&<Button onClick={()=>addAsset(activeSection)}><Plus />Add Asset</Button>}</div></CardHeader><CardContent>{sections[activeSection]==='Not Applicable'?<p>This section is excluded from required validation.</p>:repeatable.includes(activeSection)&&assets[activeSection].length===0?<div className="rounded-lg border border-dashed p-8 text-center"><Building2 className="mx-auto mb-3"/><p className="font-medium">No assets added</p><Button className="mt-3" onClick={()=>addAsset(activeSection)}><Plus/>Add {activeSection}</Button></div>:<div className="space-y-5">{repeatable.includes(activeSection)&&<div className="flex flex-wrap gap-2">{assets[activeSection].map((asset:Asset,index:number)=><Button key={asset.id} variant={currentAsset?.id===asset.id?'default':'outline'} onClick={()=>setActiveAsset(asset.id)}>{activeSection==='Fire Extinguisher (Form 2013)'?`Extinguisher ${index+1}`:asset.identifier}</Button>)}</div>}{currentAsset&&<>{activeSection==='Trenches and Excavations (Form 2194)'?renderTrenchForm():activeSection==='TxDOT Confined Space Entry Permit & Checklist (Form 1993)'?renderConfinedSpaceForm():<>{}{renderStandardQuestions()}</>}{repeatable.includes(activeSection)&&<div className="flex justify-end border-t pt-5"><Button variant="destructive" onClick={removeAsset}><Trash2/>Remove Asset</Button></div>}</>}</div>}</CardContent></Card><div className="flex flex-col-reverse gap-2 xl:col-span-2 sm:flex-row sm:justify-between [&_button]:w-full sm:[&_button]:w-auto"><Button variant="outline" onClick={()=>setStep(2)}>Back</Button><div className="flex flex-col gap-2 sm:flex-row [&_button]:w-full sm:[&_button]:w-auto">{nextIncompleteForm&&<Button onClick={()=>openForm(nextIncompleteForm)}>Continue to next form: {nextIncompleteForm}<ChevronRight /></Button>}<Button variant={nextIncompleteForm?'outline':'default'} onClick={()=>setStep(4)}>Review & Submit<ChevronRight /></Button></div></div></div>}
  {step===4&&<Card><CardHeader><CardTitle>{submitted?'Submission Successful':'Review & Submit'}</CardTitle></CardHeader><CardContent>{submitted?<div className="text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-primary"/><p className="mt-4 text-xl font-bold">Submission Successful</p><p className="mt-2">The audit, comments, compliance flags, and photos were saved.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row [&_button]:w-full sm:[&_button]:w-auto"><Button variant="outline" onClick={()=>go('home')}>Return Home</Button><Button onClick={()=>go('history')}>View Submitted Audit</Button></div></div>:<><div className="grid gap-4 md:grid-cols-4"><Metric label="Applicable sections" value={allApplicable.length} icon={<ClipboardCheck/>}/><Metric label="Non-compliant" value={deficiencyCount} icon={<AlertTriangle/>}/><Metric label="Comments" value={commentCount} icon={<MessageSquare/>}/><Metric label="Photos" value={evidenceCount} icon={<Camera/>}/></div>{deficiencyCount>0&&<div className="mt-5 rounded-lg bg-destructive p-4 text-destructive-foreground"><strong>Non-compliant audit:</strong> {deficiencyCount} response(s) marked No.</div>}<div className="mt-5 space-y-2">{validationErrors.length===0?<div className="rounded-lg bg-primary p-4 text-primary-foreground">All required information is complete.</div>:validationErrors.map((error:string)=><button key={error} className="flex w-full items-center gap-2 rounded-md border border-destructive p-3 text-left" onClick={()=>setStep(error.includes('Site')?1:3)}><AlertTriangle className="h-4 w-4"/>{error}</button>)}</div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between [&_button]:w-full sm:[&_button]:w-auto"><Button variant="outline" onClick={()=>setStep(3)}>Back</Button><Button disabled={validationErrors.length>0} onClick={submitAudit}>Submit Audit</Button></div></>}</CardContent></Card>}</div>}
  {page==='drafts'&&(selectedDraftAudit?<AuditHistoryDetail audit={selectedDraftAudit} back={()=>setSelectedDraftAudit(undefined)} backLabel="Back to My Draft Audits" />:<TableView title="Draft audits" rows={draftAudits.map((audit:HistoryAudit)=>[audit.id,audit.date,audit.status])} note="Open a draft to review its site and section progress. Draft ownership, expiration, cleanup, and administrative access: Needs TxDOT Confirmation" onView={(id:string)=>setSelectedDraftAudit(draftAudits.find((audit:HistoryAudit)=>audit.id===id))} />)}
  <Dialog open={Boolean(openComment)} onOpenChange={(open:boolean)=>{if(!open)setOpenComment('')}}><DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>Add response comment</DialogTitle><DialogDescription>Record details or context for this inspection response.</DialogDescription></DialogHeader><Textarea value={commentDraft} onChange={(event:ChangeEvent<HTMLTextAreaElement>)=>setCommentDraft(event.target.value)} placeholder="Enter comment" rows={5} autoFocus /><DialogFooter><Button variant="outline" onClick={()=>setOpenComment('')}>Cancel</Button><Button onClick={saveComment}>Save Comment</Button></DialogFooter></DialogContent></Dialog>
  <Dialog open={Boolean(photoQuestion)} onOpenChange={(open:boolean)=>{if(!open)setPhotoQuestion('')}}><DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>Add photo evidence</DialogTitle><DialogDescription>Take a new picture or select an existing image from this device.</DialogDescription></DialogHeader><div className="grid gap-3 sm:grid-cols-2"><Button variant="outline" asChild><label className="cursor-pointer"><Camera/>Take Picture<input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event:ChangeEvent<HTMLInputElement>)=>{captureEvidence(photoQuestion,event);setPhotoQuestion('');event.target.value='';}} /></label></Button><Button variant="outline" asChild><label className="cursor-pointer"><FileText/>Choose From Device<input className="sr-only" type="file" accept="image/*" onChange={(event:ChangeEvent<HTMLInputElement>)=>{captureEvidence(photoQuestion,event);setPhotoQuestion('');event.target.value='';}} /></label></Button></div><DialogFooter><Button variant="outline" onClick={()=>setPhotoQuestion('')}>Cancel</Button></DialogFooter></DialogContent></Dialog>
  {page==='history'&&(selectedHistoryAudit?<AuditHistoryDetail audit={selectedHistoryAudit} back={()=>setSelectedHistoryAudit(undefined)} />:<><div className="mb-4 grid gap-3 md:grid-cols-4"><Input placeholder="Search inspector, group, location" value={query} onChange={(event:ChangeEvent<HTMLInputElement>)=>setQuery(event.target.value)} /><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All sections</SelectItem>{sectionNames.map((name:SectionName)=><SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="Submitted">Submitted</SelectItem><SelectItem value="Non-Compliant">Non-Compliant</SelectItem></SelectContent></Select><Button variant="outline" onClick={()=>toast.info('History filters applied.')}><Search/>Filter</Button></div><TableView title="Authorized audit history" rows={auditHistory.filter((audit:HistoryAudit)=>`${audit.id} ${audit.inspector} ${audit.workGroup} ${audit.location}`.toLowerCase().includes(query.toLowerCase())).map((audit:HistoryAudit)=>[audit.id,audit.date,audit.status])} note="Submitted responses, comments, compliance flags, and evidence are read-only." onView={(id:string)=>setSelectedHistoryAudit(auditHistory.find((audit:HistoryAudit)=>audit.id===id))} /></>)}
  {page==='directory'&&<><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Input className="max-w-lg" placeholder="Search name, role, section, email, or supervisor" value={query} onChange={(event:ChangeEvent<HTMLInputElement>)=>setQuery(event.target.value)} /><Button onClick={openAddSpoc}><Plus />Add SPOC</Button></div><div className="grid gap-4 md:grid-cols-2">{directorySpocs.map((spoc:SpocRecord,index:number)=>({spoc,index})).filter(({spoc}:{spoc:SpocRecord;index:number})=>Object.values(spoc).join(' ').toLowerCase().includes(query.toLowerCase())).map(({spoc,index}:{spoc:SpocRecord;index:number})=><Card key={`${spoc.email}-${spoc.name}-${index}`}><CardHeader><div className="flex flex-wrap justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><CardTitle>{spoc.name}</CardTitle><Badge variant="secondary">{spoc.role} SPOC</Badge></div></div><CardDescription>{spoc.group}</CardDescription></CardHeader><CardContent className="space-y-1"><p><strong>SPOC email:</strong> {spoc.email?<a className="underline" href={`mailto:${spoc.email}`}>{spoc.email}</a>:'Not provided'}</p><p><strong>Supervisor:</strong> {spoc.supervisor||'Not provided'}</p><p><strong>Supervisor email:</strong> {spoc.supervisorEmail?<a className="underline" href={`mailto:${spoc.supervisorEmail}`}>{spoc.supervisorEmail}</a>:'Not provided'}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={()=>openEditSpoc(spoc,index)}>Edit</Button><Button variant="destructive" onClick={()=>requestRemoveSpoc(index)}>Remove</Button></div></CardContent></Card>)}</div><Dialog open={spocDialogOpen} onOpenChange={setSpocDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editingSpocIndex===null?'Add SPOC':'Edit SPOC'}</DialogTitle><DialogDescription>Enter the SPOC and supervisor contact information.</DialogDescription></DialogHeader><div className="grid gap-4 py-2 md:grid-cols-2"><Field label="SPOC name *" value={spocForm.name} change={(value:string)=>updateSpocForm('name',value)} /><div><Label>SPOC role</Label><Select value={spocForm.role} onValueChange={(value:SpocRecord['role'])=>updateSpocForm('role',value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Primary">Primary</SelectItem><SelectItem value="Alternate">Alternate</SelectItem></SelectContent></Select></div><div><Label>Section *</Label><Select value={spocForm.group || 'unselected'} onValueChange={(value:string)=>updateSpocForm('group',value==='unselected'?'':value)}><SelectTrigger className="mt-1 min-h-11"><SelectValue placeholder="Select section" /></SelectTrigger><SelectContent><SelectItem value="unselected">Select section</SelectItem>{spocSectionOptions.filter((section:string)=>section.length>0).map((section:string)=><SelectItem key={section} value={section}>{section}</SelectItem>)}</SelectContent></Select></div><Field label="SPOC email" value={spocForm.email} change={(value:string)=>updateSpocForm('email',value)} /><Field label="Supervisor" value={spocForm.supervisor} change={(value:string)=>updateSpocForm('supervisor',value)} /><Field label="Supervisor email" value={spocForm.supervisorEmail} change={(value:string)=>updateSpocForm('supervisorEmail',value)} /></div><DialogFooter><Button variant="outline" onClick={()=>setSpocDialogOpen(false)}>Cancel</Button><Button onClick={saveSpoc}>{editingSpocIndex===null?'Add SPOC':'Save Changes'}</Button></DialogFooter></DialogContent></Dialog><Dialog open={pendingRemovalIndex!==null} onOpenChange={(open:boolean)=>{if(!open)setPendingRemovalIndex(null)}}><DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>Remove SPOC?</DialogTitle><DialogDescription>Are you sure you want to remove {pendingRemovalIndex!==null?directorySpocs[pendingRemovalIndex]?.name:'this SPOC'} from the directory? This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={()=>setPendingRemovalIndex(null)}>Cancel</Button><Button variant="destructive" onClick={confirmRemoveSpoc}>Remove SPOC</Button></DialogFooter></DialogContent></Dialog></>}
  {page==='documents'&&<div className="space-y-5"><Card><CardHeader><div className="flex items-start gap-3"><span className="rounded-md bg-accent p-3 text-accent-foreground"><BookOpen /></span><div><CardTitle>SAT District SPOC Documents</CardTitle><CardDescription>Browse and search the currently available San Antonio District SPOC documents.</CardDescription></div></div></CardHeader><CardContent className="flex flex-wrap items-center gap-3"><Button asChild><a href={referenceDocumentsUrl} target="_blank" rel="noreferrer">Open live SharePoint library<ExternalLink /></a></Button><p className="text-sm text-muted-foreground">Opens SharePoint with your current organizational access.</p></CardContent></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{configuredDocuments.map((category: { name: string; url: string })=><Card key={category.name}><CardHeader><BookOpen className="text-primary"/><CardTitle>{category.name}</CardTitle><CardDescription>Reference document category</CardDescription></CardHeader><CardContent><Button variant="outline" asChild><a href={category.url} target="_blank" rel="noreferrer">Browse library<ExternalLink /></a></Button></CardContent></Card>)}</div><div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground"><strong className="text-foreground">Connection status:</strong> Direct in-app listing is pending Power Platform connection provisioning. The approved SharePoint connector could not be created because the environment denied connection-write permission; the live library remains available through the secure SharePoint link above.</div></div>}
  {page==='admin'&&<AdminConfiguration questions={configuredQuestions} setQuestions={setConfiguredQuestions} workGroups={configuredWorkGroups} setWorkGroups={setConfiguredWorkGroups} locations={configuredLocations} setLocations={setConfiguredLocations} spocs={directorySpocs} setSpocs={setDirectorySpocs} documents={configuredDocuments} setDocuments={setConfiguredDocuments} />}
  </main></div></div>;
}

function Field({label,value,change,icon}:{label:string;value:string;change:(value:string)=>void;icon?:React.ReactNode}){return <div className="min-w-0"><Label>{label}</Label><div className="relative mt-1">{icon&&<span className="absolute left-3 top-3">{icon}</span>}<Input className={`${icon?'pl-9 ':''}min-h-11 text-base sm:text-sm`} value={value} onChange={(event:ChangeEvent<HTMLInputElement>)=>change(event.target.value)} /></div></div>}
function SafetyDashboard({audits}:{audits:HistoryAudit[]}){
  const [startDate,setStartDate]=useState<Date>();
  const [endDate,setEndDate]=useState<Date>();
  const [selectedAsset,setSelectedAsset]=useState<string>();
  const parseAuditDate=(value:string)=>{const parsed=new Date(value);return Number.isNaN(parsed.getTime())?undefined:parsed;};
  const filteredAudits=useMemo(()=>audits.filter((audit:HistoryAudit)=>{const auditDate=parseAuditDate(audit.date);if(!auditDate)return false;const day=new Date(auditDate.getFullYear(),auditDate.getMonth(),auditDate.getDate());const start=startDate?new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()):undefined;const end=endDate?new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate(),23,59,59):undefined;return(!start||day>=start)&&(!end||day<=end);}),[audits,startDate,endDate]);
  const total=filteredAudits.length;
  const deficiencyAudits=filteredAudits.filter((audit:HistoryAudit)=>audit.sections.some((section:{deficiencies:number})=>section.deficiencies>0)).length;
  const totalDeficiencies=filteredAudits.reduce((sum:number,audit:HistoryAudit)=>sum+audit.sections.reduce((sectionSum:number,section:{deficiencies:number})=>sectionSum+section.deficiencies,0),0);
  const applicableSections=filteredAudits.flatMap((audit:HistoryAudit)=>audit.sections).filter((section:{status:string})=>section.status!=='Not Applicable');
  const compliantSections=applicableSections.filter((section:{deficiencies:number})=>section.deficiencies===0).length;
  const complianceRate=applicableSections.length?Math.round((compliantSections/applicableSections.length)*100):0;
  const assetData=useMemo(()=>{
    const grouped=new Map<string,{asset:string;deficiencies:number;auditIds:Set<string>;fallback:boolean}>();
    filteredAudits.forEach((audit:HistoryAudit)=>{
      const detailed=audit.responses?.filter((response:NonNullable<HistoryAudit['responses']>[number])=>response.nonCompliant)??[];
      if(detailed.length>0){detailed.forEach((response:NonNullable<HistoryAudit['responses']>[number])=>{const key=response.asset.trim()||response.section;const current=grouped.get(key)??{asset:key,deficiencies:0,auditIds:new Set<string>(),fallback:false};current.deficiencies+=1;current.auditIds.add(audit.id);grouped.set(key,current);});return;}
      audit.sections.filter((section:{deficiencies:number})=>section.deficiencies>0).forEach((section:{name:SectionName;deficiencies:number})=>{const key=`${section.name} (section)`;const current=grouped.get(key)??{asset:key,deficiencies:0,auditIds:new Set<string>(),fallback:true};current.deficiencies+=section.deficiencies;current.auditIds.add(audit.id);grouped.set(key,current);});
    });
    return Array.from(grouped.values()).map((entry:{asset:string;deficiencies:number;auditIds:Set<string>;fallback:boolean})=>({...entry,audits:entry.auditIds.size})).sort((first:{deficiencies:number},second:{deficiencies:number})=>second.deficiencies-first.deficiencies);
  },[filteredAudits]);
  const workGroupData=useMemo(()=>{const grouped=new Map<string,{workGroup:string;inspections:number;deficiencies:number}>();filteredAudits.filter((audit:HistoryAudit)=>audit.sections.some((section:{deficiencies:number})=>section.deficiencies>0)).forEach((audit:HistoryAudit)=>{const current=grouped.get(audit.workGroup)??{workGroup:audit.workGroup,inspections:0,deficiencies:0};current.inspections+=1;current.deficiencies+=audit.sections.reduce((sum:number,section:{deficiencies:number})=>sum+section.deficiencies,0);grouped.set(audit.workGroup,current);});return Array.from(grouped.values()).sort((first:{inspections:number},second:{inspections:number})=>second.inspections-first.inspections);},[filteredAudits]);
  const selectedAudits=selectedAsset?filteredAudits.filter((audit:HistoryAudit)=>{if(selectedAsset.endsWith(' (section)')){const sectionName=selectedAsset.replace(' (section)','');return audit.sections.some((section:{name:SectionName;deficiencies:number})=>section.name===sectionName&&section.deficiencies>0);}return audit.responses?.some((response:NonNullable<HistoryAudit['responses']>[number])=>response.nonCompliant&&(response.asset.trim()||response.section)===selectedAsset); }):[];
  const assetChartConfig={deficiencies:{label:'Deficiencies',color:'var(--chart-5)'}} satisfies ChartConfig;
  const workGroupChartConfig={inspections:{label:'Non-compliant inspections',color:'var(--chart-1)'},deficiencies:{label:'Recorded deficiencies',color:'var(--chart-5)'}} satisfies ChartConfig;
  const invalidRange=Boolean(startDate&&endDate&&startDate>endDate);
  return <div className="space-y-5">
    <Card><CardHeader><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><CardTitle>Submitted inspection analysis</CardTitle><CardDescription>Compliance trends are calculated from submitted inspections within the selected visit dates.</CardDescription></div><Badge variant="secondary">{total} inspection{total===1?'':'s'} in range</Badge></div></CardHeader><CardContent><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><div><Label>Start date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="mt-1 w-full justify-start"><CalendarDays />{startDate?format(startDate,'PPP'):'Select start date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent></Popover></div><div><Label>End date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="mt-1 w-full justify-start"><CalendarDays />{endDate?format(endDate,'PPP'):'Select end date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent></Popover></div><Button variant="outline" className="self-end" disabled={!startDate&&!endDate} onClick={()=>{setStartDate(undefined);setEndDate(undefined);}}><X />Clear dates</Button></div>{invalidRange&&<div className="mt-3 rounded-md bg-destructive p-3 text-destructive-foreground">The start date must be on or before the end date.</div>}</CardContent></Card>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Submitted inspections" value={total} icon={<ClipboardCheck/>}/><Metric label="Compliant sections" value={`${complianceRate}%`} icon={<Gauge/>}/><Metric label="Inspections with deficiencies" value={deficiencyAudits} icon={<AlertTriangle/>}/><Metric label="Total deficiencies" value={totalDeficiencies} icon={<Activity/>}/></div>
    {total===0?<Card><CardContent className="py-12 text-center"><CalendarDays className="mx-auto mb-3 h-10 w-10"/><p className="font-semibold">No submitted inspections in this date range</p><p className="mt-1 text-muted-foreground">Adjust or clear the date filters to view analysis.</p></CardContent></Card>:<>
      <div className="grid gap-5 xl:grid-cols-2"><Card><CardHeader><CardTitle>Deficiencies by asset</CardTitle><CardDescription>Recorded non-compliant responses by inspected equipment. Older records use a section fallback.</CardDescription></CardHeader><CardContent><ChartContainer config={assetChartConfig} className="h-[320px] w-full"><BarChart accessibilityLayer data={assetData} margin={{left:0,right:12}}><CartesianGrid vertical={false}/><XAxis dataKey="asset" tickLine={false} axisLine={false} tickMargin={10} interval={0} angle={-18} textAnchor="end" height={82}/><YAxis allowDecimals={false} tickLine={false} axisLine={false}/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="deficiencies" fill="var(--color-deficiencies)" radius={[4,4,0,0]}/></BarChart></ChartContainer></CardContent></Card>
      <Card><CardHeader><CardTitle>Non-compliant inspection origins</CardTitle><CardDescription>Work groups submitting inspections with recorded deficiencies.</CardDescription></CardHeader><CardContent><ChartContainer config={workGroupChartConfig} className="h-[320px] w-full"><BarChart accessibilityLayer data={workGroupData} layout="vertical" margin={{left:12,right:12}}><CartesianGrid horizontal={false}/><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false}/><YAxis type="category" dataKey="workGroup" width={150} tickLine={false} axisLine={false}/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="inspections" fill="var(--color-inspections)" radius={[0,4,4,0]}/></BarChart></ChartContainer></CardContent></Card></div>
      <Card><CardHeader><CardTitle>Asset compliance detail</CardTitle><CardDescription>Select an asset to review the audits and exact deficiencies recorded.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{assetData.map((asset:{asset:string;deficiencies:number;audits:number;fallback:boolean})=><button key={asset.asset} onClick={()=>setSelectedAsset(asset.asset)} className="rounded-lg border-l-4 border-l-destructive bg-card p-4 text-left text-card-foreground transition hover:ring-2 hover:ring-ring"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{asset.asset}</p><Badge variant="destructive">{asset.deficiencies}</Badge></div><p className="mt-2 text-sm">Found in {asset.audits} audit{asset.audits===1?'':'s'}</p>{asset.fallback&&<p className="mt-2 text-sm text-muted-foreground">Older record · grouped by section</p>}<p className="mt-3 flex items-center gap-1 text-sm font-medium">View recorded deficiencies <ChevronRight className="h-4 w-4"/></p></button>)}</CardContent></Card>
    </>}
    <Dialog open={Boolean(selectedAsset)} onOpenChange={(open:boolean)=>{if(!open)setSelectedAsset(undefined);}}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{selectedAsset}</DialogTitle><DialogDescription>Fields marked No or Non-Compliant, with any comments recorded for that field.</DialogDescription></DialogHeader><div className="space-y-4">{selectedAudits.map((audit:HistoryAudit)=><div key={audit.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{audit.id}</p><p className="text-sm text-muted-foreground">{audit.date} · {audit.workGroup}</p></div><Badge variant="destructive">Non-Compliant</Badge></div><div className="mt-4 space-y-3">{selectedAsset?.endsWith(' (section)')?<p className="rounded-md bg-muted p-3 text-muted-foreground">This older audit recorded {audit.sections.find((section:{name:SectionName})=>section.name===selectedAsset.replace(' (section)',''))?.deficiencies??0} deficiency response(s), but field-level responses and comments were not retained in this older record.</p>:audit.responses?.filter((response:NonNullable<HistoryAudit['responses']>[number])=>response.nonCompliant&&(response.asset.trim()||response.section)===selectedAsset).map((response:NonNullable<HistoryAudit['responses']>[number],index:number)=><div key={`${response.code}-${index}`} className="rounded-md border-l-4 border-l-destructive bg-card p-4 text-card-foreground"><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{response.code}</Badge><Badge variant="destructive">{response.value}</Badge></div><div className="mt-3"><p className="text-sm font-medium text-muted-foreground">Deficient field</p><p className="mt-1 font-semibold">{response.text}</p></div>{response.comment&&<div className="mt-3 rounded-md bg-muted p-3 text-muted-foreground"><p className="text-sm font-medium text-foreground">Recorded comment</p><p className="mt-1">{response.comment}</p></div>}</div>)}</div></div>)}</div><DialogFooter><Button variant="outline" onClick={()=>setSelectedAsset(undefined)}>Close</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
function Check({label,value,change}:{label:string;value:boolean;change:(value:boolean)=>void}){return <label className="flex min-h-11 items-center gap-3 rounded-md border p-3"><Checkbox checked={value} onCheckedChange={(checked:boolean|'indeterminate')=>change(checked===true)} />{label}</label>}
function Metric({label,value,icon}:{label:string;value:string|number;icon:React.ReactNode}){return <div className="rounded-lg border p-4"><div className="flex items-center gap-2 text-muted-foreground">{icon}<span>{label}</span></div><p className="mt-2 text-2xl font-bold">{value}</p></div>}
function HomeView({go,displayName}:{go:(page:Page)=>void;displayName:string}){return <><motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.3,ease:'easeOut' as const}} className="mb-6 rounded-xl bg-primary p-6 text-primary-foreground"><p className="text-lg">Welcome, {displayName}</p><h2 className="mt-1 text-2xl font-bold">District safety operations</h2><p className="mt-2 max-w-2xl">Start or resume facility audits, review authorized records, and find safety contacts and reference material.</p></motion.div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{navItems.filter((item)=>item.page!=='home').map(({page,label,icon:Icon})=><button key={page} onClick={()=>go(page)} className="group rounded-xl border bg-card p-5 text-left text-card-foreground shadow-sm transition hover:border-primary"><div className="flex items-start justify-between"><span className="rounded-md bg-accent p-3 text-accent-foreground"><Icon/></span><ChevronRight className="transition group-hover:translate-x-1"/></div><h3 className="mt-5 text-lg font-bold">{label}</h3><p className="mt-1 text-sm text-muted-foreground">Open {label.toLowerCase()} workspace</p></button>)}</div></>}
function TableView({title,rows,note,onView}:{title:string;rows:string[][];note:string;onView?:(id:string)=>void}){return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{note}</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="min-w-[640px] w-full text-left"><thead><tr className="border-b"><th className="p-3">Audit</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{rows.map((row:string[])=><tr key={row[0]} className="border-b"><td className="p-3 font-medium">{row[0]}</td><td className="p-3">{row[1]}</td><td className="p-3"><Badge variant={row[2]==='Non-Compliant'?'destructive':'outline'} className={row[2]==='Submitted'?'border-success bg-success text-success-foreground':''}>{row[2]}</Badge></td><td className="p-3"><Button size="sm" variant="outline" onClick={()=>onView?onView(row[0]):toast.info(`Opened ${row[0]}`)}>View</Button></td></tr>)}</tbody></table></div></CardContent></Card>}
function AuditHistoryDetail({audit,back,backLabel='Back to Audit History'}:{audit:HistoryAudit;back:()=>void;backLabel?:string}){const isDraft=audit.status==='In Progress';return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><Button variant="ghost" className="mb-2 px-0" onClick={back}>← {backLabel}</Button><div className="flex items-center gap-3"><h2 className="text-2xl font-bold">{audit.id}</h2><Badge variant={audit.status==='Non-Compliant'?'destructive':isDraft?'secondary':'default'}>{audit.status}</Badge></div><p className="mt-1 text-muted-foreground">{isDraft?'Last saved':'Submitted'} {audit.date}</p></div>{!isDraft&&<Button variant="outline" onClick={()=>window.print()}><FileText/>Print audit</Button>}</div><div className="grid gap-4 md:grid-cols-3"><Metric label="Non-compliant" value={audit.sections.reduce((total:number,section:{deficiencies:number})=>total+section.deficiencies,0)} icon={<AlertTriangle/>}/><Metric label="Comments" value={audit.comments} icon={<MessageSquare/>}/><Metric label="Photos" value={audit.evidence} icon={<Camera/>}/></div><Card><CardHeader><CardTitle>Site Information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Detail label="Date of Visit" value={audit.date}/><Detail label="Completed By" value={audit.inspector}/><Detail label="Work Group" value={audit.workGroup}/><Detail label="Supervisor" value={audit.supervisor}/><div className="md:col-span-2"><Detail label="Work Location" value={audit.location}/></div></CardContent></Card><Card><CardHeader><CardTitle>Inspection Sections</CardTitle></CardHeader><CardContent className="space-y-2">{audit.sections.map((section:{name:SectionName;status:string;deficiencies:number})=><div key={section.name} className={`flex items-center justify-between gap-3 rounded-lg border p-4 ${section.deficiencies>0?'border-destructive':''}`}><div><p className="font-semibold">{section.name}</p><p className="text-sm text-muted-foreground">{section.deficiencies} non-compliant response(s)</p></div><Badge variant={section.deficiencies>0?'destructive':section.status==='Not Applicable'?'secondary':'outline'}>{section.status}</Badge></div>)}</CardContent></Card>{audit.responses&&<Card><CardHeader><CardTitle>Responses, Comments & Evidence</CardTitle></CardHeader><CardContent className="space-y-3">{audit.responses.map((response,index:number)=><div key={`${response.code}-${index}`} className={`rounded-lg border p-4 ${response.nonCompliant?'border-destructive':''}`}><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{response.code}</Badge><strong>{response.text}</strong>{response.nonCompliant&&<Badge variant="destructive">Non-Compliant</Badge>}</div><p className="mt-2"><strong>Response:</strong> {response.value}</p>{response.comment&&<div className="mt-3 rounded-md bg-muted p-3 text-muted-foreground"><strong className="text-foreground">Comment:</strong> {response.comment}</div>}{response.photo&&<img src={response.photo} alt={`Evidence for ${response.code}`} className="mt-3 max-h-72 w-full max-w-lg rounded-md object-cover"/>}</div>)}</CardContent></Card>}</div>}
function Detail({label,value}:{label:string;value:string}){return <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>}
function AdminConfiguration({questions:questionData,setQuestions,workGroups:groupData,setWorkGroups,locations,setLocations,spocs:spocData,setSpocs,documents,setDocuments}:{questions:Record<SectionName,Question[]>;setQuestions:React.Dispatch<React.SetStateAction<Record<SectionName,Question[]>>>;workGroups:string[];setWorkGroups:React.Dispatch<React.SetStateAction<string[]>>;locations:string[];setLocations:React.Dispatch<React.SetStateAction<string[]>>;spocs:SpocRecord[];setSpocs:React.Dispatch<React.SetStateAction<SpocRecord[]>>;documents:Array<{name:string;url:string}>;setDocuments:React.Dispatch<React.SetStateAction<Array<{name:string;url:string}>>>}){
  const [questionSection,setQuestionSection]=useState<SectionName>('Fire Extinguisher (Form 2013)');
  const [questionSearch,setQuestionSearch]=useState('');
  const [newGroup,setNewGroup]=useState(''); const [newLocation,setNewLocation]=useState('');
  const [spocSearch,setSpocSearch]=useState('');
  const updateQuestion=(code:string,key:'text'|'required',value:string|boolean)=>setQuestions((current:Record<SectionName,Question[]>)=>({...current,[questionSection]:current[questionSection].map((question:Question)=>question.code===code?{...question,[key]:value}:question)}));
  const addListItem=(value:string,setValue:React.Dispatch<React.SetStateAction<string>>,items:string[],setItems:React.Dispatch<React.SetStateAction<string[]>>,label:string)=>{const trimmed=value.trim();if(!trimmed||items.includes(trimmed)){toast.error(`Enter a unique ${label}.`);return;}setItems((current:string[])=>[...current,trimmed]);setValue('');toast.success(`${label} added.`);};
  return <Tabs defaultValue="questions"><TabsList className="flex h-auto flex-wrap justify-start"><TabsTrigger value="questions">Questions</TabsTrigger><TabsTrigger value="org">Work Groups & Locations</TabsTrigger><TabsTrigger value="spocs">SPOCs</TabsTrigger><TabsTrigger value="docs">Documents</TabsTrigger></TabsList>
    <TabsContent value="questions" className="space-y-4"><Card><CardHeader><CardTitle>Inspection configuration</CardTitle><CardDescription>Edit question text and required status. Changes immediately affect new audits in this session.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><Select value={questionSection} onValueChange={(value:SectionName)=>setQuestionSection(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sectionNames.map((name:SectionName)=><SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select><Input placeholder="Search code or question" value={questionSearch} onChange={(event:ChangeEvent<HTMLInputElement>)=>setQuestionSearch(event.target.value)} /></div><div className="space-y-3">{questionData[questionSection].filter((question:Question)=>`${question.code} ${question.text}`.toLowerCase().includes(questionSearch.toLowerCase())).map((question:Question)=><div key={question.code} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[110px_1fr_auto]"><Badge variant="outline" className="w-fit">{question.code}</Badge><Input value={question.text} onChange={(event:ChangeEvent<HTMLInputElement>)=>updateQuestion(question.code,'text',event.target.value)} /><Check label="Required" value={question.required} change={(value:boolean)=>updateQuestion(question.code,'required',value)} /></div>)}</div></CardContent></Card></TabsContent>
    <TabsContent value="org"><div className="grid gap-4 xl:grid-cols-2"><ConfigList title="Work groups" items={groupData} value={newGroup} setValue={setNewGroup} add={()=>addListItem(newGroup,setNewGroup,groupData,setWorkGroups,'work group')} remove={(item:string)=>setWorkGroups((current:string[])=>current.filter((entry:string)=>entry!==item))}/><ConfigList title="Locations" items={locations} value={newLocation} setValue={setNewLocation} add={()=>addListItem(newLocation,setNewLocation,locations,setLocations,'location')} remove={(item:string)=>setLocations((current:string[])=>current.filter((entry:string)=>entry!==item))}/></div></TabsContent>
    <TabsContent value="spocs"><Card><CardHeader><CardTitle>SPOC records</CardTitle><CardDescription>Edit directory contact details inline. Changes immediately update the SPOC Directory.</CardDescription></CardHeader><CardContent className="space-y-4"><Input placeholder="Search SPOCs" value={spocSearch} onChange={(event:ChangeEvent<HTMLInputElement>)=>setSpocSearch(event.target.value)} />{spocData.map((spoc:SpocRecord,index:number)=>({spoc,index})).filter(({spoc}:{spoc:SpocRecord;index:number})=>Object.values(spoc).join(' ').toLowerCase().includes(spocSearch.toLowerCase())).map(({spoc,index}:{spoc:SpocRecord;index:number})=><div key={`${spoc.name}-${index}`} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4"><Input aria-label="SPOC name" value={spoc.name} onChange={(event:ChangeEvent<HTMLInputElement>)=>setSpocs((current:SpocRecord[])=>current.map((entry:SpocRecord,currentIndex:number)=>currentIndex===index?{...entry,name:event.target.value}:entry))}/><Input aria-label="Work group" value={spoc.group} onChange={(event:ChangeEvent<HTMLInputElement>)=>setSpocs((current:SpocRecord[])=>current.map((entry:SpocRecord,currentIndex:number)=>currentIndex===index?{...entry,group:event.target.value}:entry))}/><Input aria-label="SPOC email" value={spoc.email} onChange={(event:ChangeEvent<HTMLInputElement>)=>setSpocs((current:SpocRecord[])=>current.map((entry:SpocRecord,currentIndex:number)=>currentIndex===index?{...entry,email:event.target.value}:entry))}/><Button variant="destructive" onClick={()=>setSpocs((current:SpocRecord[])=>current.filter((_entry:SpocRecord,currentIndex:number)=>currentIndex!==index))}>Remove</Button></div>)}</CardContent></Card></TabsContent>
    <TabsContent value="docs"><Card><CardHeader><CardTitle>Reference document catalog</CardTitle><CardDescription>Edit category labels and SharePoint destinations. Changes immediately update Reference Documents.</CardDescription></CardHeader><CardContent className="space-y-3">{documents.map((document:{name:string;url:string},index:number)=><div key={`${document.name}-${index}`} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[220px_1fr_auto]"><Input aria-label="Document category" value={document.name} onChange={(event:ChangeEvent<HTMLInputElement>)=>setDocuments((current:Array<{name:string;url:string}>)=>current.map((entry:{name:string;url:string},currentIndex:number)=>currentIndex===index?{...entry,name:event.target.value}:entry))}/><Input aria-label="SharePoint URL" value={document.url} onChange={(event:ChangeEvent<HTMLInputElement>)=>setDocuments((current:Array<{name:string;url:string}>)=>current.map((entry:{name:string;url:string},currentIndex:number)=>currentIndex===index?{...entry,url:event.target.value}:entry))}/><Button variant="destructive" onClick={()=>setDocuments((current:Array<{name:string;url:string}>)=>current.filter((_entry:{name:string;url:string},currentIndex:number)=>currentIndex!==index))}>Remove</Button></div>)}<Button onClick={()=>setDocuments((current:Array<{name:string;url:string}>)=>[...current,{name:'New category',url:referenceDocumentsUrl}])}><Plus/>Add category</Button></CardContent></Card></TabsContent>
    <div className="mt-4 rounded-lg bg-muted p-4 text-muted-foreground">Prototype configuration is stored only for this session and resets when the app reloads. Historical submitted records are not rewritten.</div>
  </Tabs>;
}
function ConfigList({title,items,value,setValue,add,remove}:{title:string;items:string[];value:string;setValue:React.Dispatch<React.SetStateAction<string>>;add:()=>void;remove:(item:string)=>void}){return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>Add or remove options used by the app.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex flex-col gap-2 sm:flex-row"><Input value={value} onChange={(event:ChangeEvent<HTMLInputElement>)=>setValue(event.target.value)} placeholder={`Add ${title.toLowerCase()}`}/><Button onClick={add}><Plus/>Add</Button></div>{items.map((item:string)=><div key={item} className="flex flex-col items-start justify-between gap-3 rounded-md border p-3 sm:flex-row sm:items-center"><span className="min-w-0 break-words">{item}</span><Button className="w-full sm:w-auto" size="sm" variant="destructive" onClick={()=>remove(item)}>Remove</Button></div>)}</CardContent></Card>}
export default SafetyApp;
