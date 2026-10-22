import type { ThemeConfig } from "antd";

export const BRAND = "#7e22ce"; // purple-700

export const antdTheme: ThemeConfig = {
  cssVar: { key: "billbook" },
  hashed: false,
  token: {
    colorPrimary: BRAND,
    colorInfo: BRAND,
    colorLink: BRAND,
    colorTextBase: "#1e1b2e",
    colorBgLayout: "#f6f4fb",
    borderRadius: 10,
    borderRadiusLG: 16,
    fontFamily: "var(--font-body)",
    fontSize: 14,
    controlHeight: 40,
    colorBorder: "#e3dcf0",
  },
  components: {
    Button: { fontWeight: 600, controlHeight: 40, primaryShadow: "0 4px 14px rgba(126,34,206,.28)" },
    Card: { headerFontSize: 15 },
    Input: { activeShadow: "0 0 0 3px rgba(126,34,206,.12)" },
    Select: { optionSelectedBg: "#f3e8ff" },
    Drawer: { fontFamily: "var(--font-body)" },
    Table: { headerBg: "#faf5ff", headerColor: "#6b21a8", borderColor: "#f0e9fa" },
  },
};
