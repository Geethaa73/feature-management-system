import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" }
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (event) => {
    const language = event.target.value;

    i18n.changeLanguage(language);

    localStorage.setItem(
      "featureops-language",
      language
    );
  };

  return (
    <div className="language-selector">
      <label htmlFor="featureops-language">
        <i className="bi bi-translate" />
      </label>

      <select
        id="featureops-language"
        value={i18n.language}
        onChange={changeLanguage}
        aria-label={t("language")}
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
          >
            {language.native}
          </option>
        ))}
      </select>
    </div>
  );
}