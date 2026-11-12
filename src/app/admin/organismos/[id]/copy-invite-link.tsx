"use client";

import { useEffect, useState } from "react";
import { CopyLinkButton } from "@/components/organismo/copy-link-button";

export function CopyInviteLink({ path }: { path: string }) {
  const [url, setUrl] = useState(path);
  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);
  return <CopyLinkButton url={url} />;
}
