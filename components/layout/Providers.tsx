"use client";

import { ReactNode } from "react";
import { App, ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { antdTheme } from "@/lib/theme";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry layer>
      <ConfigProvider theme={antdTheme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
