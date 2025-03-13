"use client";

import { useEffect, useState } from "react";

const Privacy = () => {
    const [privacyContent, setPrivacyContent] = useState("");

    useEffect(() => {
      fetch("/docs/TN7PrivacyNotice_151024_.docx.html")
        .then((res) => res.text())
        .then((html) => setPrivacyContent(html));
    }, []);
  
    return (
        <div className="py-12 h-screen overflow-auto flex justify-center">
            <div className="max-w-[1024px]" dangerouslySetInnerHTML={{ __html: privacyContent }} />
      </div>
    );
}

export default Privacy;