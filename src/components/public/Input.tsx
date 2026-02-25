"use client";

import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
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
  // 控制密碼顯示/隱藏狀態，僅在 type="password" 時使用
  const [showPassword, setShowPassword] = React.useState(false);

  const isPassword = type === "password";
  // 實際套用的 input type
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={styles.defaultInput}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {required && <span className={styles.required}>&#42;</span>}
      </label>
      {!textarea && type !== "select" && (
        <div className={isPassword ? styles.passwordWrapper : undefined}>
          <input
            className={styles.input}
            value={value}
            type={inputType}
            name={name}
            id={name}
            onChange={onChangeFun}
            placeholder={placeholder}
          />
          {/* 密碼欄位才顯示眼睛切換按鈕 */}
          {isPassword && (
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>
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
