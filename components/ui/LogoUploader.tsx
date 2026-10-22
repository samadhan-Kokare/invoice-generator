"use client";

import { ReactNode } from "react";
import { App, Button, Upload } from "antd";
import { DeleteOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { imageFileToDataUrl } from "@/lib/image";
import FormField from "./FormField";

interface Props {
  label?: ReactNode;
  value?: string;
  onChange: (value: string | undefined) => void;
  hint?: ReactNode;
  /** Wider preview box, used for signatures. */
  wide?: boolean;
  maxSize?: number;
  className?: string;
}

export default function LogoUploader({ label = "Logo", value, onChange, hint, wide, maxSize, className }: Props) {
  const { message } = App.useApp();

  async function handleFile(file: File) {
    try {
      onChange(await imageFileToDataUrl(file, maxSize));
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  return (
    <FormField label={label} hint={hint} className={className}>
      <div className="flex items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-purple-200 bg-purple-50/60 ${
            wide ? "h-16 w-36" : "h-20 w-20"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-full w-full object-contain p-1.5" />
          ) : (
            <PictureOutlined className="text-2xl text-purple-300" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Upload
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            showUploadList={false}
            maxCount={1}
            beforeUpload={(file) => {
              void handleFile(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>{value ? "Change" : "Upload"}</Button>
          </Upload>
          {value && (
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onChange(undefined)}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </FormField>
  );
}
