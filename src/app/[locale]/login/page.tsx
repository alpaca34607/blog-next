"use client";
import React from "react";
import Layout from "@/components/Frontend/Layout";
import styles from "./page.module.scss";
import DefaultInput from "@/components/public/Input";
import { useRouter } from "next/navigation";
import { setAuthToken } from "@/utils/common";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.log("login failed: ", json?.error?.details || json?.details);
        const msg =
          json?.error?.message ||
          json?.message ||
          "登入失敗，請確認帳號密碼是否正確";
        setError(msg);
        return;
      }

      const token = json?.data?.token;
      if (!token) {
        setError("登入失敗：伺服器未回傳 token");
        return;
      }

      // 寫入 cookie，讓後續管理 API 會自動帶 Authorization
      setAuthToken(token, 7);
      router.push("/admin/dashboard");
    } catch (e) {
      console.error("登入時發生錯誤:", e);
      setError("登入時發生錯誤，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className={styles.loginWrapper}>
        <div className={styles.loginContainer}>
          <div className={styles.imageContainer}>
            <img src="/images/background/banner.jpg" alt="login banner" />
          </div>
          <div className={styles.loginFormWrapper}>
            <h1>CMS 後台管理系統</h1>
            <div className={styles.loginForm}>
              <DefaultInput
                label="Email"
                name="email"
                onChangeFun={(
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                  >
                ) => setEmail(e.target.value)}
                value={email}
                placeholder="請輸入 Email"
              />
              <DefaultInput
                label="密碼"
                name="password"
                type="password"
                onChangeFun={(
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                  >
                ) => setPassword(e.target.value)}
                value={password}
                placeholder="請輸入密碼"
              />
              {error ? (
                <div style={{ color: "#ff4d4f", fontSize: 14 }}>{error}</div>
              ) : null}
              <div className={styles.buttonGroup}>
                <button
                  className={styles.submitButton}
                  onClick={handleLogin}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "登入中..." : "登入"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

