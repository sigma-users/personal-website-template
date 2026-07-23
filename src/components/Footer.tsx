import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 研究室ロゴとリンク */}
          <div className="mb-4 md:mb-0">
            {/* <a
              href={t("footer.labURL")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-accent transition-colors"
            >
              <img
                src="./images/lab-logo.png"
                alt={t("footer.labName")}
                className="h-10 mr-3"
              />
            </a> */}
          </div>

          {/* 著作権とテンプレート謝辞 */}
          <div className="text-center md:text-right">
            <p className="text-sm mb-1">
              &copy; {currentYear} {t("bio.name")}.{" "}
              {t("footer.allRightsReserved")}
            </p>
            <p className="text-xs text-gray-400">
              {t("footer.templateText")}
              <a
                href="https://github.com/kotabata/academic-website"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Github
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
