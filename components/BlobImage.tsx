"use client";

import { useEffect, useState } from "react";

export default function BlobImage({ file, alt, className }: { file: File; alt?: string; className?: string }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;

  return <img src={url} alt={alt || file.name} className={className} />;
}
