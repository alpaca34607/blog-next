
import { cn } from "@/utils/cn";
import styles from "./TabBar.module.scss";

export interface TabItem {
  id: string | number;
  label: string;
  value?: string | number | null;
}

export interface TabBarProps {
  /** Tab 項目列表 */
  tabs: TabItem[];
  /** 當前選中的 tab value（如果沒有提供 value，則使用 id） */
  activeValue?: string | number | null;
  /** Tab 點擊事件 */
  onTabChange: (value: string | number | null, tab: TabItem) => void;
  /** 自訂類別名稱 */
  className?: string;
  /** 是否顯示「全部」選項（預設第一個 tab 為全部） */
  showAll?: boolean;
}

const TabBar = ({
  tabs,
  activeValue,
  onTabChange,
  className,
  showAll = true,
}: TabBarProps) => {
  const handleTabClick = (tab: TabItem) => {
    const value = tab.value !== undefined ? tab.value : tab.id;
    onTabChange(value, tab);
  };

  const isActive = (tab: TabItem) => {
    const value = tab.value !== undefined ? tab.value : tab.id;
    // 如果 activeValue 是 null 或 undefined，檢查 tab 的 value 是否也是 null
    if (activeValue === null || activeValue === undefined) {
      return value === null || value === undefined;
    }
    return value === activeValue;
  };

  return (
    <div className={cn(styles.tabBar, className)}>
      {tabs.map((tab) => {
        const value = tab.value !== undefined ? tab.value : tab.id;
        const active = isActive(tab);

        return (
          <button
            key={tab.id}
            type="button"
            className={cn(styles.tab, active && styles.tabActive)}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
