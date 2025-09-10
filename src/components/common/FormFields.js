import React from 'react';
import { Field, ErrorMessage, useField } from 'formik';

/**
 * Text Input Field Component
 */
export const TextField = ({ label, name, ...props }) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        {...field}
        {...props}
      />
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * Text Area Field Component
 */
export const TextAreaField = ({ label, name, ...props }) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        {...field}
        {...props}
      />
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * Select Field Component
 */
export const SelectField = ({ label, name, options, ...props }) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        {...field}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * Checkbox Field Component
 */
export const CheckboxField = ({ label, name, ...props }) => {
  const [field, meta] = useField({ ...props, name, type: 'checkbox' });
  return (
    <div className="mb-4 flex items-center">
      <input
        type="checkbox"
        className={`h-4 w-4 mr-2 focus:ring-blue-500 text-blue-600 border-gray-300 rounded
          ${meta.touched && meta.error ? 'border-red-500' : ''}`}
        id={name}
        {...field}
        {...props}
      />
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 ml-2" />
    </div>
  );
};

/**
 * Radio Group Field Component
 */
export const RadioGroupField = ({ label, name, options, ...props }) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <Field
              type="radio"
              name={name}
              value={option.value}
              id={`${name}-${option.value}`}
              className={`h-4 w-4 mr-2 focus:ring-blue-500 text-blue-600 border-gray-300
                ${meta.touched && meta.error ? 'border-red-500' : ''}`}
              {...props}
            />
            <label htmlFor={`${name}-${option.value}`} className="text-sm text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * Date Field Component
 */
export const DateField = ({ label, name, ...props }) => {
  const [field, meta] = useField(name);
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="date"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        {...field}
        {...props}
      />
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * File Upload Field Component
 */
export const FileField = ({ label, name, setFieldValue, ...props }) => {
  const [field, meta] = useField(name);
  
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    setFieldValue(name, file);
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="file"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        onChange={handleFileChange}
        {...props}
      />
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * Dependent Select Field Component (for hierarchical data like provinces/districts)
 */
export const DependentSelectField = ({ 
  label, 
  name, 
  options, 
  dependsOn, 
  dependentOptions,
  ...props 
}) => {
  const [field, meta] = useField(name);
  const [dependsOnField] = useField(dependsOn);
  
  // Filter options based on the parent field's value
  const filteredOptions = dependsOnField.value 
    ? dependentOptions[dependsOnField.value] || []
    : [];
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        {...field}
        {...props}
        disabled={!dependsOnField.value}
      >
        <option value="">Select {label}</option>
        {filteredOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};

/**
 * Academic Hierarchy Select Field Component (specific to the academic structure)
 * Based on the academic hierarchy in the student form memory
 */
export const AcademicSelect = ({
  label,
  name,
  degreeLevelId,
  options,
  ...props
}) => {
  const [field, meta] = useField(name);
  
  // Check if this is a department-dependent field and the degree level is Bachelor (ID: 1)
  const showField = name !== 'department_id' || degreeLevelId === 1;
  
  if (!showField) return null;
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
          ${meta.touched && meta.error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        id={name}
        {...field}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );
};
