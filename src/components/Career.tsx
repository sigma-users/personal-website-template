import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CareerItem } from "../types";
import {
  HiOutlineAcademicCap,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import { CgWorkAlt } from "react-icons/cg";

const Career: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [careerItems, setCareerItems] = useState<CareerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCareerData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `./content/career/career_${i18n.language}.json`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for career data`);
        }
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];

        const sortedData = [...items].sort((a, b) => {
          const dateA = a.endDate || "9999";
          const dateB = b.endDate || "9999";

          if (dateA === dateB) {
            return b.startDate.localeCompare(a.startDate);
          }
          return dateB.localeCompare(dateA);
        });

        setCareerItems(sortedData);
      } catch (error) {
        console.error("Failed to fetch career data:", error);
        setCareerItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareerData();
  }, [i18n.language]);

  return (
    <section id="career" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          {t("career.title")}
        </h2>

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
          <div className="relative max-w-4xl mx-auto">
            {/* タイムラインの中央線 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 z-0"></div>

            {/* キャリアアイテム */}
            {careerItems.map((item, index) => (
              <div key={item.id} className="relative z-10 mb-12 w-full">
                {/* 中央マーカー */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-4 z-20">
                  <div
                    className={`w-6 h-6 rounded-full border-4 ${
                      item.type === "education"
                        ? "bg-secondary border-secondary-light"
                        : item.type === "work"
                        ? "bg-accent border-accent-light"
                        : "bg-primary border-primary-light"
                    }`}
                  ></div>
                </div>

                {/* コンテンツボックス */}
                <div
                  className={`relative ${
                    index % 2 === 0
                      ? "ml-auto mr-8 text-left"
                      : "ml-8 text-left"
                  } w-5/12 p-4 rounded-lg shadow-md bg-white border-l-4 ${
                    item.type === "education"
                      ? "border-secondary"
                      : item.type === "work"
                      ? "border-accent"
                      : "border-primary"
                  }`}
                >
                  {/* 日付 */}
                  <div
                    className={`inline-block px-2 py-1 mb-2 text-sm font-bold text-white rounded-md ${
                      item.type === "education"
                        ? "bg-secondary"
                        : item.type === "work"
                        ? "bg-accent"
                        : "bg-primary"
                    }`}
                  >
                    {item.startDate} - {item.endDate || t("career.present")}
                  </div>

                  {/* タイトルと組織 */}
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">
                    {item.position}
                  </h3>

                  <div className="flex items-center mb-1 opacity-90 text-gray-700">
                    <>
                      {item.type === "education" ? (
                        <HiOutlineAcademicCap className="ml-1 h-5 w-5 text-secondary" />
                      ) : item.type === "work" ? (
                        <CgWorkAlt className="ml-1 h-5 w-5 text-accent" />
                      ) : (
                        <HiOutlineComputerDesktop className="ml-1 h-5 w-5 text-primary" />
                      )}
                      <span className="ml-1">{item.organization}</span>
                    </>
                  </div>

                  {/* 場所 */}
                  <p className="text-gray-600 text-sm italic">
                    <span className="inline-block">📍 {item.location}</span>
                  </p>

                  {/* 説明文 */}
                  {item.description && (
                    <p className="mt-2 text-gray-600 border-t border-gray-100 pt-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {careerItems.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                {t("career.noData")}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Career;
