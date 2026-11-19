import { createContext, useContext } from 'react';

/** Shared by <Field> and the controls inside it (Input, Select, Textarea). */
export const FieldContext = createContext(null);

export const useFieldContext = () => useContext(FieldContext);
