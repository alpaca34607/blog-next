"use client";
import React from "react";
import Layout from "@/components/Frontend/Layout";
import styles from "./page.module.scss";
import DefaultInput from "@/components/public/Input";
import { useRouter } from "next/navigation";
import { setAuthToken, setDemoToken, setDemoId, clearAuthToken } from "@/utils/common";
import { FiInfo } from "react-icons/fi";
import { useTranslations } from "next-intl";


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const t = useTranslations("login");
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
          t("loginFailed");
        setError(msg);
        return;
      }

      const token = json?.data?.token;
      if (!token) {
        setError(t("loginNoToken"));
        return;
      }

      // 寫入 cookie，讓後續管理 API 會自動帶 Authorization
      setAuthToken(token, 7);
      router.push("/admin/dashboard");
    } catch (e) {
      console.error("登入時發生錯誤:", e);
      setError(t("loginError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoStart = async () => {
    try {
      setIsDemoLoading(true);
      setError(null);

      const res = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.error?.message || json?.message || t("demoStartFailed");
        setError(msg);
        return;
      }

      const { demoId, token } = json?.data || {};
      if (!token || !demoId) {
        setError(t("demoNoData"));
        return;
      }

      clearAuthToken();
      setDemoToken(token);
      setDemoId(demoId);
      router.push("/admin/dashboard");
    } catch (e) {
      console.error("DEMO 啟動錯誤:", e);
      setError(t("demoError"));
    } finally {
      setIsDemoLoading(false);
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
            <h1>{t("loginTitle")}</h1>
            <div className={styles.loginForm}>
              <DefaultInput
                label={t("emailLabel")}
                name="email"
                onChangeFun={(
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                  >
                ) => setEmail(e.target.value)}
                value={email}
                placeholder={t("emailPlaceholder")}
              />
              <DefaultInput
                label={t("passwordLabel")}
                name="password"
                type="password"
                onChangeFun={(
                  e: React.ChangeEvent<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                  >
                ) => setPassword(e.target.value)}
                value={password}
                placeholder={t("passwordPlaceholder")}
              />
              {error ? (
                <div style={{ color: "#ff4d4f", fontSize: 14 }}>{error}</div>
              ) : null}
              <div className={styles.buttonGroup}>
                <button
                  className={styles.submitButton}
                  onClick={handleLogin}
                  type="submit"
                  disabled={isSubmitting || isDemoLoading}
                >
                  {isSubmitting ? t("loginLoading") : t("loginButton")}
                </button>
                <button
                  className={styles.demoButton}
                  onClick={handleDemoStart}
                  type="button"
                  disabled={isSubmitting || isDemoLoading}
                >
                  {isDemoLoading ? t("demoLoading") : t("demoButton")}
                </button>
              </div>
              <div className={styles.demoInfo}>
                <FiInfo size={16} /> <p>{t("demoInfo")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

