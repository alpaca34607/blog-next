"use client";
import React from "react";
import Layout from "@/components/Frontend/Layout";
import styles from "./page.module.scss";
import DefaultInput from "@/components/public/Input";
import { useRouter } from "next/navigation";
import { setAuthToken, setDemoToken, setDemoId, clearAuthToken } from "@/utils/common";
import { FiInfo } from "react-icons/fi";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);
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
        const msg = json?.error?.message || json?.message || "無法啟動 DEMO，請稍後再試";
        setError(msg);
        return;
      }

      const { demoId, token } = json?.data || {};
      if (!token || !demoId) {
        setError("DEMO 啟動失敗：伺服器未回傳正確資料");
        return;
      }

      clearAuthToken();
      setDemoToken(token);
      setDemoId(demoId);
      router.push("/admin/dashboard");
    } catch (e) {
      console.error("DEMO 啟動錯誤:", e);
      setError("DEMO 啟動失敗，請稍後再試");
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
                  disabled={isSubmitting || isDemoLoading}
                >
                  {isSubmitting ? "登入中..." : "登入"}
                </button>
                <button
                  className={styles.demoButton}
                  onClick={handleDemoStart}
                  type="button"
                  disabled={isSubmitting || isDemoLoading}
                >
                  {isDemoLoading ? "啟動中..." : "訪客體驗 Demo"}
                </button>
              </div>
              <div className={styles.demoInfo}>
                <FiInfo size={16} /> <p>Demo模式下不需帳號密碼，可直接體驗完整功能，並不影響正式資料，體驗結束一天後，測試資料將會清除</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

