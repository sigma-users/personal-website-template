import React from "react";
import { useTranslation } from "react-i18next";
import { FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa";
import { CiPhone, CiMail, CiLocationOn } from "react-icons/ci";

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {t("contact.title")}
        </h2>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 連絡先情報 */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {t("contact.info")}
              </h3>

              <div className="space-y-4">
                {/* メールアドレス */}
                <div className="flex items-start">
                  <CiMail className="h-6 w-6 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-accent">
                      {t("contact.email")}
                    </h4>
                    {t("contact.emailAdress")}
                  </div>
                </div>

                {/* 電話番号 */}
                <div className="flex items-start">
                  <CiPhone className="h-6 w-6 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-accent">
                      {t("contact.phone")}
                    </h4>
                    {t("contact.phoneNumber")}
                  </div>
                </div>

                {/* 住所 */}
                <div className="flex items-start">
                  <CiLocationOn className="h-6 w-6 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-accent">
                      {t("contact.address")}
                    </h4>
                    <address className="not-italic">
                      {t("contact.addressLine1")}
                      <br />
                      {t("contact.addressLine2")}
                      <br />
                      {t("contact.addressLine3")}
                    </address>
                  </div>
                </div>

                {/* SNSリンク */}
                <div className="pt-2">
                  {t("contact.socialMedia") &&
                    t("contact.socialMedia") !== "" && (
                      <h4 className="font-medium text-accent mb-2">
                        {t("contact.socialMedia")}
                      </h4>
                    )}
                  <div className="flex space-x-4">
                    {t("contact.linkedin") && t("contact.linkedin") !== "" && (
                      <a
                        href={t("contact.linkedin")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-accent transition-colors"
                        aria-label="LinkedIn"
                      >
                        <FaLinkedin className="h-6 w-6" />
                      </a>
                    )}
                    {t("contact.facebook") && t("contact.facebook") !== "" && (
                      <a
                        href={t("contact.facebook")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-accent transition-colors"
                      >
                        <FaFacebook className="h-6 w-6" />
                      </a>
                    )}
                    {t("contact.twitter") && t("contact.twitter") !== "" && (
                      <a
                        href={t("contact.twitter")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-accent transition-colors"
                      >
                        <FaTwitter className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 関連リンクなど */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {t("contact.relatedLinks")}
              </h3>
              <div className="h-64 overflow-hidden">
                <a
                  href={t("contact.labURL")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-accent transition-colors"
                >
                  <img
                    src="./images/lab-logo.png"
                    alt={t("contact.labName")}
                    className="h-10 mr-3"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
