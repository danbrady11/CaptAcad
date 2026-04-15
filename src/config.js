export const SESSIONS = [
  { id: 'duty_to_act',      label: 'Duty to Act/Report, FMLA, Reasonable Suspicion, MP308',              instructor: 'Megan Johnson',                          day: 1 },
  { id: 'disciplinary',     label: 'Disciplinary Process, PAFs, Corrective Action, Documentation',                instructor: 'Megan Johnson',                          day: 1 },
  { id: 'lessons_learned',  label: 'Lessons Learned From My 1st Year as a Captain',                           instructor: 'Captain Adam Sutter',                            day: 1 },
  { id: 'wellness',         label: 'Wellness / Industrial Injuries',             instructor: 'Captain Justin Hyde',                            day: 1 },
  { id: 'ethical_decision', label: 'Ethical Decision Making & Current Trends',  instructor: 'Chief Bailey',                           day: 2 },
  { id: 'alarm_room',       label: 'Alarm Room/Dispatch and Deployment',                                instructor: 'Chief Carmona',                          day: 2 },
  { id: 'leadership_pearls',label: 'Leadership Pearls, Critical Conversations', instructor: 'Chief Daniell',                         day: 2 },
  { id: 'transportation',   label: 'Transportation Division',                    instructor: 'Jason Taylor, Terra Wolfrey, Kayla Shaw', day: 2 },
  { id: 'captain_panel',    label: 'Captain Panel',                              instructor: 'Captains Robert Dolmage, Michael Ballard, Tim Burleson',           day: 3 },
  { id: 'leading_company',  label: 'Leading the Fire Company',                  instructor: 'Captain Bobby Smith',                            day: 3 },
  { id: 'labor_mgmt',       label: 'Labor Management Panel',                    instructor: '',                                       day: 3 },
  { id: 'peer_support',     label: 'Peer Support',                              instructor: 'Captain Dale Crogan',                            day: 3 },
  { id: 'ems_ops',          label: 'EMS Operations',                            instructor: 'Chief Otte',                               day: 3 },
  { id: 'mgmt_perspective', label: 'Management Perspective',                    instructor: 'Chief Ruiz',                             day: 4 },
  { id: 'prob_ffs',         label: 'Probationary FFs',                          instructor: 'Captain Chris Fifield',                          day: 4 },
  { id: 'company_training', label: 'Company Training',                          instructor: 'Captains Hagerman and Romo',                        day: 4 },
];

export const DAY_LABELS = {
  1: 'Day 1 - Human Resources',
  2: 'Day 2 - Non Emergency Supervision',
  3: 'Day 3 - Operations and Supervision',
  4: 'Day 4 - Emergency Operations',
};

export const DAYS = [1, 2, 3, 4];

export const QUESTIONS = [
  { id: 'q1', label: 'The session objectives were clearly communicated.', short: 'Clear objectives' },
  { id: 'q2', label: 'The content is directly applicable to my role as a company officer.', short: 'Relevance to officer role' },
  { id: 'q3', label: 'The presenter delivered the material effectively.', short: 'Presenter effectiveness' },
  { id: 'q4', label: 'This session increased my confidence in handling this area as a captain.', short: 'Confidence gain' },
  { id: 'q5', label: 'I would recommend this session be included in future academies.', short: 'Would include again' },
];

export const SCALE_LABELS = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree',
};

export const SHORT_ANSWERS = [
  { id: 'takeaway', label: 'What is your biggest takeaway from this session?',        placeholder: 'Key concept, tool, or perspective you are walking away with...' },
  { id: 'apply',    label: 'How will you apply this on your shift?',                  placeholder: 'Specific action or behavior change you plan to make...' },
  { id: 'improve',  label: 'What would make this session more effective? (optional)', placeholder: 'Suggestions, gaps, or anything that fell short...' },
];

export const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'captacad2024';
