import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Validation Schema
const StudentSchema = Yup.object().shape({
  // Personal Information
  student_name_en: Yup.string()
    .required('English name is required')
    .min(2, 'Name must be at least 2 characters'),
  student_name_kh: Yup.string()
    .required('Khmer name is required'),
  dob: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  nationality: Yup.string().required('Nationality is required'),
  race: Yup.string().required('Race is required'),
  gender: Yup.string().required('Gender is required'),
  marital_status_id: Yup.number().required('Marital status is required'),
  
  // Contact Information
  phone: Yup.string()
    .matches(/^(\+\d{1,3}[- ]?)?\d{8,15}$/, 'Phone number is not valid')
    .required('Phone number is required'),
  email: Yup.string()
    .email('Invalid email format'),
  
  // Academic Information
  degree_level_id: Yup.number().required('Degree level is required'),
  department_id: Yup.number().when('degree_level_id', {
    is: (val) => val === 1, // Bachelor Degree
    then: () => Yup.number().required('Department is required'),
    otherwise: () => Yup.number()
  }),
  program_id: Yup.number().required('Program is required'),
  batch_id: Yup.number().required('Batch is required'),
  admission_id: Yup.number().required('Admission period is required'),
  student_status_id: Yup.number().required('Student status is required'),
  
  // Location Information
  province_id: Yup.number().required('Province is required'),
  district_id: Yup.number().required('District is required'),
  commune_id: Yup.number().required('Commune is required'),
  village_id: Yup.number().required('Village is required'),
  
  // Parent Information (optional)
  parent_id: Yup.number(),
  
  // User Account Information
  user_id: Yup.number(),
});

const StudentForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingStudent = null,
  degreeLevels = [],
  departments = [],
  programs = [],
  batches = [],
  admissions = [],
  maritalStatuses = [],
  studentStatuses = [],
  provinces = [],
  districts = [],
  communes = [],
  villages = [],
  parents = [],
  users = []
}) => {
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredCommunes, setFilteredCommunes] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');

  const initialValues = {
    // Personal Information
    student_name_en: editingStudent?.student_name_en || '',
    student_name_kh: editingStudent?.student_name_kh || '',
    dob: editingStudent?.dob || '',
    nationality: editingStudent?.nationality || '',
    race: editingStudent?.race || '',
    gender: editingStudent?.gender || '',
    marital_status_id: editingStudent?.marital_status_id || '',
    
    // Contact Information
    phone: editingStudent?.phone || '',
    email: editingStudent?.email || '',
    
    // Academic Information
    degree_level_id: editingStudent?.degree_level_id || '',
    department_id: editingStudent?.department_id || '',
    program_id: editingStudent?.program_id || '',
    batch_id: editingStudent?.batch_id || '',
    admission_id: editingStudent?.admission_id || '',
    student_status_id: editingStudent?.student_status_id || '',
    
    // Location Information
    province_id: editingStudent?.province_id || '',
    district_id: editingStudent?.district_id || '',
    commune_id: editingStudent?.commune_id || '',
    village_id: editingStudent?.village_id || '',
    
    // Relationships
    parent_id: editingStudent?.parent_id || '',
    user_id: editingStudent?.user_id || '',
    
    // Additional Information
    profile_picture: null,
    notes: editingStudent?.notes || ''
  };

  // Handle location cascading
  const handleProvinceChange = (provinceId, setFieldValue) => {
    const filtered = districts.filter(d => d.province_id === parseInt(provinceId));
    setFilteredDistricts(filtered);
    setFilteredCommunes([]);
    setFilteredVillages([]);
    setFieldValue('district_id', '');
    setFieldValue('commune_id', '');
    setFieldValue('village_id', '');
  };

  const handleDistrictChange = (districtId, setFieldValue) => {
    const filtered = communes.filter(c => c.district_id === parseInt(districtId));
    setFilteredCommunes(filtered);
    setFilteredVillages([]);
    setFieldValue('commune_id', '');
    setFieldValue('village_id', '');
  };

  const handleCommuneChange = (communeId, setFieldValue) => {
    const filtered = villages.filter(v => v.commune_id === parseInt(communeId));
    setFilteredVillages(filtered);
    setFieldValue('village_id', '');
  };

  const handleDegreeLevelChange = (degreeLevelId, setFieldValue) => {
    const degreeId = parseInt(degreeLevelId);
    
    if (degreeId === 1) {
      // Bachelor Degree - show departments
      const filtered = departments.filter(d => d.degree_level_id === degreeId);
      setFilteredDepartments(filtered);
      setFilteredPrograms([]);
    } else if (degreeId === 2) {
      // Associate Degree - show programs directly
      const filtered = programs.filter(p => p.degree_level_id === degreeId);
      setFilteredPrograms(filtered);
      setFilteredDepartments([]);
    } else {
      setFilteredDepartments([]);
      setFilteredPrograms([]);
    }
    
    setFieldValue('department_id', '');
    setFieldValue('program_id', '');
  };

  const handleDepartmentChange = (departmentId, setFieldValue) => {
    // Only for Bachelor degrees - filter programs by department
    const filtered = programs.filter(p => p.department_id === parseInt(departmentId));
    setFilteredPrograms(filtered);
    setFieldValue('program_id', '');
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserIcon },
    { id: 'contact', name: 'Contact Info', icon: PhoneIcon },
    { id: 'academic', name: 'Academic Info', icon: AcademicCapIcon },
    { id: 'location', name: 'Location', icon: MapPinIcon },
    { id: 'relationships', name: 'Relationships', icon: UsersIcon }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={StudentSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name (English) *
                      </label>
                      <Field
                        name="student_name_en"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name in English"
                      />
                      <ErrorMessage name="student_name_en" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name (Khmer) *
                      </label>
                      <Field
                        name="student_name_kh"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name in Khmer"
                      />
                      <ErrorMessage name="student_name_kh" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <Field
                        name="dob"
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <ErrorMessage name="dob" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <Field
                        as="select"
                        name="gender"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Field>
                      <ErrorMessage name="gender" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality *
                      </label>
                      <Field
                        name="nationality"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter nationality"
                      />
                      <ErrorMessage name="nationality" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Race *
                      </label>
                      <Field
                        name="race"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter race"
                      />
                      <ErrorMessage name="race" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status *
                      </label>
                      <Field
                        as="select"
                        name="marital_status_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Marital Status</option>
                        {maritalStatuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="marital_status_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          setFieldValue("profile_picture", event.currentTarget.files[0]);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Information Tab */}
                {activeTab === 'contact' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <Field
                        name="phone"
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                )}

                {/* Academic Information Tab */}
                {activeTab === 'academic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree Level *
                      </label>
                      <Field
                        as="select"
                        name="degree_level_id"
                        onChange={(e) => {
                          setFieldValue('degree_level_id', e.target.value);
                          handleDegreeLevelChange(e.target.value, setFieldValue);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Degree Level</option>
                        {degreeLevels.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="degree_level_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {values.degree_level_id === '1' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department *
                        </label>
                        <Field
                          as="select"
                          name="department_id"
                          onChange={(e) => {
                            setFieldValue('department_id', e.target.value);
                            handleDepartmentChange(e.target.value, setFieldValue);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Department</option>
                          {filteredDepartments.map(department => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="department_id" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {values.degree_level_id === '2' ? 'Program *' : 'Program *'}
                      </label>
                      <Field
                        as="select"
                        name="program_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">
                          {values.degree_level_id === '2' ? 'Select Program' : 'Select Program'}
                        </option>
                        {filteredPrograms.map(program => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="program_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch *
                      </label>
                      <Field
                        as="select"
                        name="batch_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                          <option key={batch.id} value={batch.id}>
                            {batch.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="batch_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admission Period *
                      </label>
                      <Field
                        as="select"
                        name="admission_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Admission Period</option>
                        {admissions.map(admission => (
                          <option key={admission.id} value={admission.id}>
                            {admission.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="admission_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Status *
                      </label>
                      <Field
                        as="select"
                        name="student_status_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Status</option>
                        {studentStatuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="student_status_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                )}

                {/* Location Information Tab */}
                {activeTab === 'location' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province *
                      </label>
                      <Field
                        as="select"
                        name="province_id"
                        onChange={(e) => {
                          setFieldValue('province_id', e.target.value);
                          handleProvinceChange(e.target.value, setFieldValue);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="province_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <Field
                        as="select"
                        name="district_id"
                        onChange={(e) => {
                          setFieldValue('district_id', e.target.value);
                          handleDistrictChange(e.target.value, setFieldValue);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select District</option>
                        {filteredDistricts.map(district => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="district_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commune *
                      </label>
                      <Field
                        as="select"
                        name="commune_id"
                        onChange={(e) => {
                          setFieldValue('commune_id', e.target.value);
                          handleCommuneChange(e.target.value, setFieldValue);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Commune</option>
                        {filteredCommunes.map(commune => (
                          <option key={commune.id} value={commune.id}>
                            {commune.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="commune_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village *
                      </label>
                      <Field
                        as="select"
                        name="village_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Village</option>
                        {filteredVillages.map(village => (
                          <option key={village.id} value={village.id}>
                            {village.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="village_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                )}

                {/* Relationships Tab */}
                {activeTab === 'relationships' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian
                      </label>
                      <Field
                        as="select"
                        name="parent_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Parent/Guardian</option>
                        {parents.map(parent => (
                          <option key={parent.id} value={parent.id}>
                            {parent.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="parent_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Account
                      </label>
                      <Field
                        as="select"
                        name="user_id"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select User Account</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="user_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <Field
                        as="textarea"
                        name="notes"
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional notes about the student..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default StudentForm;
