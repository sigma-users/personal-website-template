import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Paper, Presentation, Misc } from "../types";

const Publications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "papers" | "presentations" | "misc"
  >("papers");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<string[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [misc, setMisc] = useState<Misc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);
  const maxItems = 5;

  // 論文データの有無を確認し、デフォルトタブを設定
  useEffect(() => {
    const abortController = new AbortController();

    const checkPapersAndSetDefaultTab = async () => {
      try {
        const response = await fetch("/api/papers.json", {
          signal: abortController.signal,
        });
        const data = await response.json();
        if (!data || data.length === 0) {
          setActiveTab("presentations");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error("Failed to fetch papers:", error);
        setActiveTab("presentations");
      }
    };

    checkPapersAndSetDefaultTab();

    return () => {
      abortController.abort();
    };
  }, []);

  // 年のリストを取得
  useEffect(() => {
    const abortController = new AbortController();

    const fetchYears = async () => {
      try {
        const response = await fetch("/api/years.json", {
          signal: abortController.signal,
        });
        const data = await response.json();
        setYears(data.years || []);
        setSelectedYear("");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error("Failed to fetch years:", error);
        setYears([]);
      }
    };

    fetchYears();

    return () => {
      abortController.abort();
    };
  }, []);

  // 論文、発表、またはその他データを取得
  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endpoint =
          activeTab === "papers"
            ? selectedYear
              ? `./api/papers-${selectedYear}.json`
              : "/api/papers.json"
            : activeTab === "presentations"
            ? selectedYear
              ? `./api/presentations-${selectedYear}.json`
              : "/api/presentations.json"
            : selectedYear
            ? `./api/misc-${selectedYear}.json`
            : "/api/misc.json";

        const response = await fetch(endpoint, {
          signal: abortController.signal,
        });
        const data = await response.json();

        if (activeTab === "papers") {
          setPapers(data || []);
        } else if (activeTab === "presentations") {
          setPresentations(data || []);
        } else {
          setMisc(data || []);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error(`Failed to fetch ${activeTab}:`, error);
        if (activeTab === "papers") {
          setPapers([]);
        } else if (activeTab === "presentations") {
          setPresentations([]);
        } else {
          setMisc([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [activeTab, selectedYear]);

  // 表示するアイテムの制限
  const getDisplayedItems = <T extends Paper | Presentation | Misc>(
    items: T[]
  ): T[] => {
    return showAll ? items : items.slice(0, maxItems);
  };

  // タブが変更されたときにshowAllをリセットし、データを再取得
  const handleTabChange = async (tab: "papers" | "presentations" | "misc") => {
    setActiveTab(tab);
    setShowAll(false);
    setIsLoading(true);

    const abortController = new AbortController();

    try {
      const endpoint =
        tab === "papers"
          ? selectedYear
            ? `./api/papers-${selectedYear}.json`
            : "/api/papers.json"
          : tab === "presentations"
          ? selectedYear
            ? `./api/presentations-${selectedYear}.json`
            : "/api/presentations.json"
          : selectedYear
          ? `./api/misc-${selectedYear}.json`
          : "/api/misc.json";

      const response = await fetch(endpoint, {
        signal: abortController.signal,
      });
      const data = await response.json();

      if (tab === "papers") {
        setPapers(data || []);
      } else if (tab === "presentations") {
        setPresentations(data || []);
      } else {
        setMisc(data || []);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
        return;
      }
      console.error(`Failed to fetch ${tab}:`, error);
      if (tab === "papers") {
        setPapers([]);
      } else if (tab === "presentations") {
        setPresentations([]);
      } else {
        setMisc([]);
      }
    } finally {
      setIsLoading(false);
    }

    return () => {
      abortController.abort();
    };
  };

  // 年の選択
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setShowAll(false);
  };

  return (
    <section id="publications" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          {t("publications.title")}
        </h2>

        {/* タブ切り替え */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => handleTabChange("papers")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeTab === "papers"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("publications.papers")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("presentations")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "presentations"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("publications.presentations")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("misc")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeTab === "misc"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("publications.misc")}
            </button>
          </div>
        </div>

        {/* 年フィルター */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => handleYearChange("")}
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              selectedYear === ""
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t("publications.allYears")}
          </button>

          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleYearChange(year)}
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                selectedYear === year
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* コンテンツ表示 */}
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
          <div className="space-y-6">
            {activeTab === "papers" ? (
              papers.length > 0 ? (
                <>
                  {getDisplayedItems(papers).map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-2">
                        <div className="md:flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            {paper.isMainWork && (
                              <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                                {t("publications.mainWork")}
                              </span>
                            )}
                            <h3 className="text-lg font-semibold text-primary">
                              {i18n.language == "en"
                                ? paper.title
                                : paper.titleJa}
                            </h3>
                          </div>
                          <p className="text-gray-700 mb-1">{paper.authors}</p>
                          <p className="text-gray-600 italic mb-2">
                            {i18n.language == "en"
                              ? paper.journal
                              : paper.journalJa}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {paper.year}
                            {paper.month ? `.${paper.month}` : ""}
                          </p>
                          {paper.doi && (
                            <a
                              href={`https://doi.org/${paper.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-secondary hover:text-accent text-sm"
                            >
                              DOI: {paper.doi}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {papers.length > maxItems && !showAll && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAll(true)}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
                      >
                        {t("publications.showAll")}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {t("publications.noPapers")}
                </p>
              )
            ) : activeTab === "presentations" ? (
              presentations.length > 0 ? (
                <>
                  {getDisplayedItems(presentations).map((presentation) => (
                    <div
                      key={presentation.id}
                      className="p-4 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-2">
                        <div className="md:flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            {presentation.isInvited && (
                              <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                                {t("publications.invited")}
                              </span>
                            )}
                            <h3 className="text-lg font-semibold text-primary">
                              {i18n.language == "en"
                                ? presentation.title
                                : presentation.titleJa}
                            </h3>
                          </div>
                          <p className="text-gray-700 mb-1">
                            {i18n.language == "en"
                              ? presentation.speakers
                              : presentation.speakersJa}
                          </p>
                          <p className="text-gray-600 mb-1">
                            {i18n.language == "en"
                              ? presentation.conference
                              : presentation.conferenceJa}
                            {presentation.place &&
                              i18n.language == "en" &&
                              `, ${presentation.place}`}
                            {presentation.place &&
                              i18n.language == "ja" &&
                              `, ${presentation.placeJa}`}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {presentation.date.replace(/-/g, ".")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {presentations.length > maxItems && !showAll && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAll(true)}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
                      >
                        {t("publications.showAll")}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {t("publications.noPresentations")}
                </p>
              )
            ) : misc.length > 0 ? (
              <>
                {getDisplayedItems(misc).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-2">
                      <div className="md:flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          {item.isMainWork && (
                            <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                              {t("publications.mainWork")}
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-primary">
                            {i18n.language == "en" ? item.title : item.titleJa}
                          </h3>
                        </div>
                        <p className="text-gray-700 mb-1">{item.authors}</p>
                        <p className="text-gray-600 italic mb-2">
                          {i18n.language == "en"
                            ? item.journal
                            : item.journalJa}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {item.year}
                          {item.month ? `.${item.month}` : ""}
                        </p>
                        {item.doi && (
                          <a
                            href={`https://doi.org/${item.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-secondary hover:text-accent text-sm"
                          >
                            DOI: {item.doi}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {misc.length > maxItems && !showAll && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowAll(true)}
                      className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
                    >
                      {t("publications.showAll")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">
                {t("publications.noMisc")}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Publications;
