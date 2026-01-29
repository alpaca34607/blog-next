"use client";

import React from "react";
import styles from "./Input.module.scss";

export interface DefaultInputProps {
  label: string;
  required?: boolean;
  name: string;
  onChangeFun: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  type?: string;
  value: string;
  placeholder?: string;
  textarea?: boolean;
  options?: { value: string; label: string }[];
}

const DefaultInput: React.FC<DefaultInputProps> = ({
  label,
  required = false,
  name,
  onChangeFun,
  type = "text",
  value,
  placeholder = "",
  textarea = false,
  options = [],
}) => {
  return (
    <div className={styles.defaultInput}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {required && <span className={styles.required}>&#42;</span>}
      </label>
      {!textarea && type !== "select" && (
        <input
          className={styles.input}
          value={value}
          type={type}
          name={name}
          id={name}
          onChange={onChangeFun}
          placeholder={placeholder}
        />
      )}
      {textarea && (
        <textarea
          className={styles.textarea}
          value={value}
          name={name}
          id={name}
          onChange={onChangeFun}
          placeholder={placeholder}
          rows={8}
        />
      )}
      {type === "select" && (
        <select
          className={styles.select}
          value={value}
          name={name}
          id={name}
          onChange={onChangeFun}
        >
          {options?.map((option: { value: string; label: string }) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}  
    </div>
  );
};

export default DefaultInput;
