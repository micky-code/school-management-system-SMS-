// Academic hierarchy data for the Student Management System

export const degreeLevels = [
  { id: 1, name: 'Bachelor Degree' },
  { id: 2, name: 'Associate Degree' }
];

export const departments = [
  // Bachelor Degree Departments (degree_level_id: 1)
  { id: 1, name: 'Faculty of Information Technology', degree_level_id: 1 },
  { id: 2, name: 'Department of English Literature', degree_level_id: 1 },
  { id: 3, name: 'Department of Tourism Management', degree_level_id: 1 },
  { id: 4, name: 'Department of Agronomy', degree_level_id: 1 },
  { id: 5, name: 'Department of Social Work', degree_level_id: 1 }
];

export const programs = [
  // Associate Degree Programs (degree_level_id: 2)
  { id: 1, name: 'Software Development', degree_level_id: 2, department_id: null },
  { id: 2, name: 'System and Network Administration', degree_level_id: 2, department_id: null },
  { id: 3, name: 'Food Processing', degree_level_id: 2, department_id: null },
  { id: 4, name: 'Integrated Farming System', degree_level_id: 2, department_id: null },
  { id: 5, name: 'Veterinary Medicine', degree_level_id: 2, department_id: null },
  
  // Bachelor Degree Programs (linked to departments)
  { id: 6, name: 'Computer Science', degree_level_id: 1, department_id: 1 },
  { id: 7, name: 'Information Systems', degree_level_id: 1, department_id: 1 },
  { id: 8, name: 'English Literature', degree_level_id: 1, department_id: 2 },
  { id: 9, name: 'Tourism and Hospitality', degree_level_id: 1, department_id: 3 },
  { id: 10, name: 'Agricultural Science', degree_level_id: 1, department_id: 4 },
  { id: 11, name: 'Social Work', degree_level_id: 1, department_id: 5 }
];

export const batches = [
  { id: 1, name: 'Batch 2024-1', year: 2024, semester: 1 },
  { id: 2, name: 'Batch 2024-2', year: 2024, semester: 2 },
  { id: 3, name: 'Batch 2025-1', year: 2025, semester: 1 }
];

export const admissions = [
  { id: 1, name: 'Fall 2024', year: 2024, semester: 'Fall', status: 'active' },
  { id: 2, name: 'Spring 2025', year: 2025, semester: 'Spring', status: 'active' },
  { id: 3, name: 'Summer 2025', year: 2025, semester: 'Summer', status: 'upcoming' }
];

export const maritalStatuses = [
  { id: 1, name: 'Single' },
  { id: 2, name: 'Married' },
  { id: 3, name: 'Divorced' },
  { id: 4, name: 'Widowed' }
];

export const studentStatuses = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'Inactive' },
  { id: 3, name: 'Graduated' },
  { id: 4, name: 'Suspended' },
  { id: 5, name: 'Transferred' }
];

export const provinces = [
  { id: 1, name: 'Phnom Penh' },
  { id: 2, name: 'Siem Reap' },
  { id: 3, name: 'Battambang' },
  { id: 4, name: 'Kandal' },
  { id: 5, name: 'Kampong Cham' }
];

export const districts = [
  // Phnom Penh Districts
  { id: 1, name: 'Chamkar Mon', province_id: 1 },
  { id: 2, name: 'Doun Penh', province_id: 1 },
  { id: 3, name: 'Prampir Meakkakra', province_id: 1 },
  
  // Siem Reap Districts
  { id: 4, name: 'Siem Reap', province_id: 2 },
  { id: 5, name: 'Angkor Chum', province_id: 2 },
  
  // Battambang Districts
  { id: 6, name: 'Battambang', province_id: 3 },
  { id: 7, name: 'Banan', province_id: 3 },
  
  // Kandal Districts
  { id: 8, name: 'Kandal Stueng', province_id: 4 },
  { id: 9, name: 'Kien Svay', province_id: 4 },
  
  // Kampong Cham Districts
  { id: 10, name: 'Kampong Cham', province_id: 5 },
  { id: 11, name: 'Batheay', province_id: 5 }
];

export const communes = [
  // Sample communes for each district
  { id: 1, name: 'Tonle Bassac', district_id: 1 },
  { id: 2, name: 'Boeung Keng Kang', district_id: 1 },
  { id: 3, name: 'Phsar Kandal', district_id: 2 },
  { id: 4, name: 'Srah Chak', district_id: 2 },
  { id: 5, name: 'Prek Leap', district_id: 3 },
  { id: 6, name: 'Chroy Changvar', district_id: 3 },
  { id: 7, name: 'Siem Reap', district_id: 4 },
  { id: 8, name: 'Sala Kamreuk', district_id: 4 },
  { id: 9, name: 'Nokor Thum', district_id: 5 },
  { id: 10, name: 'Angkor Chum', district_id: 5 }
];

export const villages = [
  // Sample villages for each commune
  { id: 1, name: 'Village 1', commune_id: 1 },
  { id: 2, name: 'Village 2', commune_id: 1 },
  { id: 3, name: 'Village 3', commune_id: 2 },
  { id: 4, name: 'Village 4', commune_id: 2 },
  { id: 5, name: 'Village 5', commune_id: 3 },
  { id: 6, name: 'Village 6', commune_id: 3 },
  { id: 7, name: 'Village 7', commune_id: 4 },
  { id: 8, name: 'Village 8', commune_id: 4 },
  { id: 9, name: 'Village 9', commune_id: 5 },
  { id: 10, name: 'Village 10', commune_id: 5 }
];
