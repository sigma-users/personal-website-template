import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Award, Grant, Project } from "../types";

// タブの種類を定義
type TabType = "awards" | "grants" | "projects";

const Awards: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [awards, setAwards] = useState<Award[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("awards");
  const [showAll, setShowAll] = useState<boolean>(false);
  const maxItems = 6;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 言語に応じたJSONファイルのパス
        const awardsPath = `/api/awards.json`;
        const grantsPath = `/api/researchProjects.json`;
        const projectsPath = `./content/etc/projects_${i18n.language}.json`;

        // 並列でデータをフェッチ
        const [awardsResponse, grantsResponse, projectsResponse] =
          await Promise.all([
            fetch(awardsPath),
            fetch(grantsPath),
            fetch(projectsPath),
          ]);

        // 各データを解析
        const awardsData = await awardsResponse.json();
        const grantsData = await grantsResponse.json();
        const projectsData = await projectsResponse.json();

        setAwards(awardsData);
        setGrants(grantsData);
        setProjects(projectsData);

        // データが空の場合、表示可能な最初のタブをアクティブにする
        const setDefaultActiveTab = () => {
          if (awardsData.length > 0) {
            setActiveTab("awards");
          } else if (grantsData.length > 0) {
            setActiveTab("grants");
          } else if (projectsData.length > 0) {
            setActiveTab("projects");
          }
        };
        setDefaultActiveTab();
      } catch (error) {
        console.error("Failed to fetch awards data:", error);
        // エラー時は空の配列をセット
        setAwards([]);
        setGrants([]);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [i18n.language]);

  // タブ切り替えハンドラ
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setShowAll(false);
  };

  // 表示するアイテムの制限を行う関数を追加
  const getDisplayedItems = <T extends Award | Grant | Project>(
    items: T[]
  ): T[] => {
    return showAll ? items : items.slice(0, maxItems);
  };

  // 表示するタブがあるかどうかを確認
  const hasAnyData =
    awards.length > 0 || grants.length > 0 || projects.length > 0;

  if (!isLoading && !hasAnyData) {
    return null;
  }

  return (
    <section id="awards" className="py-16 bg-background-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          {t("awards.title")}
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
        ) : hasAnyData ? (
          <div>
            {/* タブ切り替え */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {awards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange("awards")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "awards"
                        ? "bg-primary text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    } ${
                      grants.length > 0 || projects.length > 0
                        ? "rounded-l-lg"
                        : "rounded-lg"
                    }`}
                  >
                    {t("awards.honorsAndAwards")}
                  </button>
                )}

                {grants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange("grants")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "grants"
                        ? "bg-primary text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    } ${awards.length > 0 ? "border-l-0" : ""} ${
                      projects.length > 0 ? "" : "rounded-r-lg"
                    } ${awards.length === 0 ? "rounded-l-lg" : ""}`}
                  >
                    {t("awards.grants")}
                  </button>
                )}

                {projects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange("projects")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                      activeTab === "projects"
                        ? "bg-primary text-white"
                        : "bg-white text-gray-700 border border-gray-300 border-l-0 hover:bg-gray-50"
                    } ${
                      awards.length === 0 && grants.length === 0
                        ? "rounded-l-lg"
                        : ""
                    }`}
                  >
                    {t("awards.projects")}
                  </button>
                )}
              </div>
            </div>

            {/* コンテンツ表示 */}
            <div className="mt-6">
              {/* 受賞歴 */}
              {activeTab === "awards" && awards.length > 0 && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {getDisplayedItems(awards).map((award) => (
                      <div
                        key={award.id}
                        className="p-4 bg-white rounded-lg shadow-sm"
                      >
                        <h4 className="text-lg font-medium text-primary">
                          {i18n.language == "en" ? award.title : award.titleJa}
                        </h4>
                        <p className="text-gray-700">
                          {i18n.language == "en"
                            ? award.awarder
                            : award.awarderJa}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {award.year}.{award.month}
                        </p>
                      </div>
                    ))}
                  </div>
                  {awards.length > maxItems && !showAll && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAll(true)}
                        className="bg-secondary hover:bg-secondary-light px-3 py-1 rounded text-sm transition-colors text-white"
                      >
                        {t("awards.showAll")}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 助成金・グラント */}
              {activeTab === "grants" && grants.length > 0 && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {getDisplayedItems(grants).map((grant) => (
                      <div
                        key={grant.id}
                        className="p-4 bg-white rounded-lg shadow-sm"
                      >
                        <h4 className="text-lg font-medium text-primary">
                          {i18n.language == "en" ? grant.title : grant.titleJa}{" "}
                          {i18n.language == "en"
                            ? grant.subject
                            : grant.subjectJa}
                        </h4>
                        <p className="text-gray-700">{grant.funder}</p>
                        <p className="text-gray-600">
                          {grant.number && grant.number.trim() !== "" ? (
                            <>
                              <span className="font-medium">
                                {grant.number}
                              </span>{" "}
                              •{" "}
                            </>
                          ) : null}
                          {grant.yearFrom}.{grant.monthFrom} - {grant.yearTo}.
                          {grant.monthTo}
                        </p>
                        {i18n.language == "en"
                          ? grant.description &&
                            grant.description.trim() !== "" && (
                              <p className="mt-2 text-gray-600">
                                {grant.description}
                              </p>
                            )
                          : grant.descriptionJa &&
                            grant.descriptionJa.trim() !== "" && (
                              <p className="mt-2 text-gray-600">
                                {grant.descriptionJa}
                              </p>
                            )}
                      </div>
                    ))}
                  </div>
                  {grants.length > maxItems && !showAll && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAll(true)}
                        className="bg-secondary hover:bg-secondary-light px-3 py-1 rounded text-sm transition-colors text-white"
                      >
                        {t("awards.showAll")}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* プロジェクト */}
              {activeTab === "projects" && projects.length > 0 && (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getDisplayedItems(projects).map((project) => (
                      <a
                        key={project.id}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
                      >
                        <h4 className="text-lg font-medium text-primary">
                          {project.title}
                        </h4>
                        <p className="text-gray-600 mb-2">
                          {project.description}
                        </p>
                        <div className="flex items-center">
                          {project.languages.map((language, index) => (
                            <div key={index} className="flex items-center mr-2">
                              <span
                                className="inline-block w-3 h-3 rounded-full mr-1"
                                style={{
                                  backgroundColor:
                                    project.languageColors[index],
                                }}
                              ></span>
                              <span className="text-sm text-gray-500">
                                {language}
                              </span>
                            </div>
                          ))}
                        </div>
                      </a>
                    ))}
                  </div>
                  {projects.length > maxItems && !showAll && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAll(true)}
                        className="bg-secondary hover:bg-secondary-light px-3 py-1 rounded text-sm transition-colors text-white"
                      >
                        {t("awards.showAll")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">{t("awards.noData")}</p>
        )}
      </div>
    </section>
  );
};

export default Awards;
