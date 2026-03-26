import StringField from './fields/StringField';
import TextareaField from './fields/TextareaField';
import SelectField from './fields/SelectField';
import CredentialField from './fields/CredentialField';
import CheckboxField from './fields/CheckboxField';
import NumberField from './fields/NumberField';
import JsonField from './fields/JsonField';
import KnowledgeBaseField from './fields/KnowledgeBaseField';

const FIELD_COMPONENTS = {
  string: StringField,
  text: StringField,
  textarea: TextareaField,
  select: SelectField,
  credential: CredentialField,
  checkbox: CheckboxField,
  boolean: CheckboxField,
  number: NumberField,
  json: JsonField,
  knowledgebase: KnowledgeBaseField,
};

/**
 * DynamicForm renders form fields based on a schema array.
 *
 * @param {Object} props
 * @param {Array} props.schema - Array of field definitions: { key, type, label, ... }
 * @param {Object} props.values - Current config values keyed by field.key
 * @param {Function} props.onChange - Called with (key, value) when a field changes
 */
const DynamicForm = ({ schema, values = {}, onChange }) => {
  if (!schema || !Array.isArray(schema) || schema.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No configuration options for this node.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schema.map((field) => {
        const FieldComponent = FIELD_COMPONENTS[field.type] || StringField;
        return (
          <FieldComponent
            key={field.key}
            field={field}
            value={values[field.key] ?? field.default}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
};

export default DynamicForm;
