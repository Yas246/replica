"use client";

import { useState, useEffect } from "react";
import { VCFData } from "../types/Contact";
import { generateModifiedVCF, parseVCF } from "../utils/vcfUtils";

export default function Home() {
  const [vcfData, setVcfData] = useState<VCFData | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Vérifier le mode sombre au chargement
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    setDarkMode(!darkMode);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    console.log("Contenu du fichier:", content);

    const parsedData = parseVCF(content);
    console.log("Données parsées:", parsedData);

    setVcfData(parsedData);
  };

  const handleDownload = () => {
    if (!vcfData) return;

    const modifiedContent = generateModifiedVCF(vcfData);
    const blob = new Blob([modifiedContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_modified.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="fixed top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            // Icône soleil pour le mode clair
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            // Icône lune pour le mode sombre
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Modificateur de fichiers VCF
            </h1>

            <div className="space-y-8">
              <div className="flex justify-center">
                <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors">
                  Charger un fichier VCF
                  <input
                    type="file"
                    accept=".vcf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {vcfData && (
                <>
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Contacts modifiés
                    </h2>
                    <div className="space-y-4">
                      {vcfData.contacts.map((contact, index) => (
                        <div
                          key={index}
                          className="border-b dark:border-gray-700 pb-4"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {contact.fullName}
                          </p>
                          {contact.phones.map((phone, phoneIndex) => (
                            <div key={phoneIndex} className="mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Original: {phone.original}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Secondaire: {phone.secondary}
                              </p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Télécharger le fichier modifié
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
