import { FileDrop } from "@/components/file-drop";

export function LogoField({ id = "org-logo" }: { id?: string }) {
  return (
    <FileDrop
      id={id}
      name="logo"
      label="Logo"
      accept="image/png,image/jpeg,image/webp"
      hint="PNG, JPG o WebP · hasta 2 MB"
      preview
    />
  );
}
