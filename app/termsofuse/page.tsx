"use client";

import { useEffect, useState } from "react";

const TermsOfUse = () => {
    const [termsContent, setTermsContent] = useState("");

    useEffect(() => {
      fetch("/docs/TN7WebsiteTermsofUse_240924_.docx.html")
        .then((res) => res.text())
        .then((html) => setTermsContent(html));
    }, []);
  
    return (
        <div className="py-12 h-screen overflow-auto flex justify-center">
            <div className="max-w-[1024px]" dangerouslySetInnerHTML={{ __html: termsContent }} />
      </div>
    );
}

export default TermsOfUse;