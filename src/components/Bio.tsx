import Markdown from "markdown-to-jsx";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGithub } from "react-icons/fa";
import { FaGoogleScholar } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";

const Bio: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [bioContent, setBioContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBioContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`./content/bio/bio_${i18n.language}.md`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for bio content`);
        }
        const content = await response.text();
        setBioContent(content);
      } catch (error) {
        console.error("Failed to fetch bio content:", error);
        setBioContent("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBioContent();
  }, [i18n.language]);

  // 研究タグのリスト
  const researchTagsResult = t("bio.researchTags", { returnObjects: true });
  const researchTags: string[] = Array.isArray(researchTagsResult)
    ? researchTagsResult
    : [];

  return (
    <section id="bio" className="py-16 bg-background-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* プロフィール写真 */}
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <img
              src="./images/profile.png"
              alt={t("bio.name")}
              className="w-full h-full object-cover"
            />
          </div>

          {/* プロフィール情報 */}
          <div className="flex-1">
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-3xl font-bold text-primary mb-1">
                {i18n.language === "en" ? (
                  <>
                    {t("bio.name")}
                    {t("bio.phd") && ` | ${t("bio.phd")}`}
                  </>
                ) : (
                  <>
                    {t("bio.nameJp")}
                    {t("bio.phdJp") && ` | ${t("bio.phdJp")}`}
                  </>
                )}
              </h1>
              <p className="text-xl text-gray-700 mb-1">
                {i18n.language === "en" ? (
                  <>
                    {t("bio.nameJp")}
                    {t("bio.phdJp") && ` | ${t("bio.phdJp")}`}
                  </>
                ) : (
                  <>
                    {t("bio.name")}
                    {t("bio.phd") && ` | ${t("bio.phd")}`}
                  </>
                )}
              </p>
              <p className="text-lg text-gray-600">
                {t("bio.position")} | {t("bio.affiliation")}
              </p>
            </div>

            {/* ソーシャルリンク */}
            <div className="flex justify-center md:justify-start space-x-4 mb-6">
              <div className="flex flex-col items-center">
                <a
                  href="#contact"
                  className="text-secondary hover:text-accent transition-colors"
                  aria-label="Contact"
                >
                  <MdOutlineMailOutline className="h-6 w-6" />
                </a>
                <span className="text-sm text-gray-600">Contact</span>
              </div>
              {t("bio.github") !== "" && (
                <div className="flex flex-col items-center">
                  <a
                    href={t("bio.github")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="black hover:text-accent transition-colors"
                    aria-label="GitHub"
                  >
                    <FaGithub className="h-6 w-6" />
                  </a>
                  <span className="text-sm text-gray-600">GitHub</span>
                </div>
              )}
              {t("bio.scholar") !== "" && (
                <div className="flex flex-col items-center">
                  <a
                    href={t("bio.scholar")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-accent transition-colors"
                    aria-label="Google Scholar"
                  >
                    <FaGoogleScholar className="h-6 w-6" />
                  </a>
                  <span className="text-sm text-gray-600">Scholar</span>
                </div>
              )}
              {t("bio.orcid") !== "" && (
                <div className="flex flex-col items-center">
                  <a
                    href={t("bio.orcid")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-accent transition-colors"
                    aria-label="ORCID"
                  >
                    <img
                      src="./ORCID-iD_icon_vector.svg"
                      alt="ORCID"
                      className="h-6 w-6"
                    />
                  </a>
                  <span className="text-sm text-gray-600">ORCID</span>
                </div>
              )}
              {t("bio.researchmap") !== "" && (
                <div className="flex flex-col items-center">
                  <a
                    href={t("bio.researchmap")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-accent transition-colors"
                    aria-label="Researchmap"
                  >
                    <img src="./rm.png" alt="Researchmap" className="h-6 w-6" />
                  </a>
                  <span className="text-sm text-gray-600">Researchmap</span>
                </div>
              )}
              {t("bio.linkedin") !== "" && (
                <div className="flex flex-col items-center">
                  <a
                    href={t("bio.linkedin")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-accent transition-colors"
                    aria-label="LinkedIn"
                  >
                    <img
                      src="./linkedin.png"
                      alt="LinkedIn"
                      className="h-6 w-6"
                    />
                  </a>
                  <span className="text-sm text-gray-600">LinkedIn</span>
                </div>
              )}
            </div>

            {/* 自己紹介文 */}
            {isLoading ? (
              <div className="text-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-primary mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              <div className="prose max-w-none">
                <Markdown options={{ disableParsingRawHTML: true }}>
                  {bioContent}
                </Markdown>
              </div>
            )}

            {/* 研究タグ */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("bio.researchInterests")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {researchTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bio;
