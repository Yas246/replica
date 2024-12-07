"use client";

import { useState } from "react";
import Carousel from "../components/Carousel";
import { VCFData } from "../types/Contact";
import {
  generateModifiedVCF,
  parseVCF,
  generateOnlyModifiedVCF,
} from "../utils/vcfUtils";
import { Akronim } from "next/font/google";

const akronim = Akronim({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [vcfData, setVcfData] = useState<VCFData | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".vcf")) {
      alert("Veuillez sélectionner un fichier .vcf valide");
      event.target.value = "";
      return;
    }

    try {
      const content = await file.text();
      const parsedData = parseVCF(content, file.name);
      setVcfData(parsedData);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Une erreur est survenue lors du traitement du fichier");
      }
      event.target.value = "";
      return;
    }
  };

  const handleDownload = () => {
    if (!vcfData) return;

    const modifiedContent = generateModifiedVCF(vcfData);
    const blob = new Blob([modifiedContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_modified_rp.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadModifiedOnly = () => {
    if (!vcfData) return;

    const modifiedContent = generateOnlyModifiedVCF(vcfData);
    const blob = new Blob([modifiedContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_modified_only_rp.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 transition-colors duration-200">
      <div className="fixed top-4 right-4"></div>

      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1
              className={`mb-8 text-5xl tracking-wider text-white ${akronim.className}`}
            >
              REPLICA
            </h1>
            <h5 className="mb-4 font-sans text-white/80">
              Convertissez les numéros de vos contacts
            </h5>

            <div className="space-y-8">
              <div className="flex justify-center">
                <label className="px-4 py-2 font-bold text-white rounded backdrop-blur-md transition-all cursor-pointer bg-white/20 hover:bg-white/30">
                  Charger un fichier VCF
                  <input
                    type="file"
                    accept=".vcf,text/vcard"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {vcfData && (
                <div className="flex flex-col gap-4 justify-center sm:flex-row">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 font-bold text-white rounded backdrop-blur-md transition-all bg-white/20 hover:bg-white/30"
                  >
                    Télécharger avec numéros originaux et modifiés (recommandé)
                  </button>
                  <button
                    onClick={handleDownloadModifiedOnly}
                    className="px-4 py-2 font-bold text-white rounded backdrop-blur-md transition-all bg-white/20 hover:bg-white/30"
                  >
                    Télécharger avec uniquement les numéros modifiés
                  </button>
                </div>
              )}

              {vcfData ? (
                <div className="p-6 rounded-lg border shadow-lg backdrop-blur-md bg-white/20 border-white/30">
                  <h2 className="mb-4 text-xl font-semibold text-white">
                    Contacts modifiés
                  </h2>
                  <div className="space-y-4">
                    {vcfData.contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="pb-4 border-b border-white/30"
                      >
                        <p className="font-medium text-white">
                          {contact.fullName}
                        </p>
                        {contact.phones.map((phone, phoneIndex) => (
                          <div key={phoneIndex} className="mt-2">
                            <p className="text-sm text-white/80">
                              Original: {phone.original}
                            </p>
                            <p className="text-sm text-white/80">
                              Secondaire: {phone.secondary}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-12">
                  <Carousel />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
