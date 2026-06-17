"use client";

import PolicyPage, { PolicyDocument, PolicyKey } from "@/components/policies/PolicyPage";

const privacyDocuments: Record<PolicyKey, PolicyDocument> = {
  en: {
    label: "US",
    title: "Read Privacy Policy",
    company: "IPHINT / UTRBOX Inc.",
    effectiveDate: "Effective Date: April 5, 2026",
    lang: "en",
    sections: [
      {
        id: "scope",
        title: "1. Scope and Applicability",
        paragraphs: [
          "This Privacy Policy describes how UTRBOX Inc. (\"Company,\" \"we,\" \"us,\" or \"our\") collects, uses, discloses, and safeguards information in connection with the IPHINT service (the \"Service\").",
          "This Policy applies to both personal information and other data processed in connection with the operation of the Service, including technical and analytical data generated through use of the Service.",
        ],
      },
      {
        id: "definitions",
        title: "2. Definitions",
        paragraphs: [
          "\"Personal Information\" means information that identifies, relates to, describes, or can reasonably be linked to an identifiable individual.",
          "\"Service Data\" means any data uploaded by users or generated through use of the Service, including but not limited to images, analysis outputs, detection results (\"Discovery\"), logs, and related metadata. Service Data may or may not constitute Personal Information depending on context.",
        ],
      },
      {
        id: "information-collected",
        title: "3. Information We Collect",
        paragraphs: ["We may collect the following categories of information:"],
        subSections: [
          {
            subtitle: "(a) Account Information",
            text: "Email address, password (encrypted), name or username, contact information, and third-party authentication data.",
          },
          {
            subtitle: "(b) Service Data",
            text: "Uploaded content (including images and videos), image fingerprints, analytical data, detection results (\"Discovery\"), usage records, and related metadata.",
          },
          {
            subtitle: "(c) Transaction Information",
            text: "Billing details, payment records, and payout or settlement information.",
          },
          {
            subtitle: "(d) Automatically Collected Information",
            text: "IP address, device identifiers, browser type, operating system, log data, cookies, and usage activity.",
          },
        ],
      },
      {
        id: "how-we-use",
        title: "4. How We Use Information",
        paragraphs: ["We process information for the following purposes:"],
        list: [
          "To provide and operate the Service",
          "To analyze images and generate detection results",
          "To deliver notifications and user-facing outputs",
          "To improve and optimize Service performance",
          "To provide customer support",
          "To detect, prevent, and mitigate abuse or unauthorized use",
          "To process payments and transactions",
        ],
        footerParagraphs: [
          "We do not use Personal Information for purposes materially different from those described in this Policy without notice.",
        ],
      },
      {
        id: "usage-data",
        title: "5. Usage Data and Communications",
        paragraphs: [
          "We may collect and analyze user interaction data, including clicks, navigation patterns, and feature usage, to improve functionality and user experience.",
          "We may also track whether emails are opened and whether links are clicked for purposes of communication effectiveness and service improvement.",
        ],
      },
      {
        id: "cookies",
        title: "6. Cookies and Tracking Technologies",
        paragraphs: [
          "We use cookies and similar technologies to recognize users, analyze usage patterns, and improve the Service.",
          "You may control cookie settings through your browser; however, disabling cookies may limit certain functionality.",
          "The Service does not currently respond to \"Do Not Track\" signals.",
        ],
      },
      {
        id: "third-party",
        title: "7. Third-Party Services and Links",
        paragraphs: [
          "The Service may contain links to third-party websites or services.",
          "We are not responsible for the privacy practices or content of such third parties. Their respective privacy policies govern any information collected.",
        ],
      },
      {
        id: "de-identified",
        title: "8. De-Identified and Aggregated Data",
        paragraphs: [
          "We may de-identify or aggregate information so that it cannot reasonably be used to identify an individual.",
          "Such data may be used for analytics, research, service improvement, and business purposes, and may be shared with third parties.",
        ],
      },
      {
        id: "disclosure",
        title: "9. Disclosure of Information",
        paragraphs: [
          "We do not sell Personal Information.",
          "We may disclose information under the following circumstances:",
        ],
        list: [
          "With user consent",
          "To service providers performing functions on our behalf",
          "To comply with legal obligations",
          "To protect rights, safety, and security",
          "In connection with corporate transactions",
        ],
      },
      {
        id: "service-providers",
        title: "10. Service Providers and Contractors",
        paragraphs: [
          "We may engage third-party service providers to process information on our behalf.",
          "These parties are contractually obligated to use the information only as necessary to provide services to us and in accordance with applicable law.",
        ],
      },
      {
        id: "business-transfers",
        title: "11. Business Transfers",
        paragraphs: [
          "In the event of a merger, acquisition, reorganization, or sale of assets, information may be transferred as part of the transaction.",
          "We will take appropriate steps to ensure continued protection of such information.",
        ],
      },
      {
        id: "data-retention",
        title: "12. Data Retention",
        paragraphs: ["We retain information for as long as necessary to fulfill the purposes outlined in this Policy, including:"],
        list: [
          "Account data: retained until account deletion, then deleted within 30 days",
          "Uploaded content: up to 12 months",
          "Detection and usage data: up to 24 months",
          "Dispute-related data: up to 3 years",
          "Financial records: as required by applicable law",
        ],
        footerParagraphs: [
          "Certain data may be retained beyond these periods where necessary for legal, regulatory, or security purposes.",
        ],
      },
      {
        id: "rights-choices",
        title: "13. Your Rights and Choices",
        paragraphs: ["Depending on your jurisdiction, you may have the right to:"],
        list: [
          "Access your Personal Information",
          "Request correction or deletion",
          "Restrict processing",
          "Request data portability",
        ],
        callout: {
          label: "Email",
          value: "team.iphint@gmail.com",
          href: "mailto:team.iphint@gmail.com",
        },
        footerParagraphs: [
          "We may take reasonable steps to verify your identity before fulfilling requests.",
        ],
      },
      {
        id: "california-rights",
        title: "14. California Privacy Rights",
        paragraphs: ["Under the California Consumer Privacy Act, California residents have the right to:"],
        list: [
          "Know what Personal Information is collected",
          "Request deletion",
          "Opt out of the sale of Personal Information (note: we do not sell Personal Information)",
        ],
        footerParagraphs: ["Authorized agents may submit requests on behalf of users, subject to verification."],
      },
      {
        id: "no-legal",
        title: "15. No Legal Services and Limitation of Liability",
        paragraphs: [
          "The Service is a technology-based analytical tool and does not constitute legal advice or legal services.",
          "The Company is not a law firm and does not provide legal representation, legal opinions, or legal determinations.",
          "All outputs, including detection results (\"Discovery\"), are generated through automated processes and are provided for informational purposes only.",
          "Such outputs do not constitute legal conclusions regarding intellectual property infringement or ownership.",
          "Users are solely responsible for any decisions or actions taken based on the Service.",
          "To the maximum extent permitted by law, the Company disclaims all liability for any damages arising from use of the Service.",
          "In no event shall the Company’s total liability exceed the amount paid by the user in the preceding twelve (12) months.",
        ],
      },
      {
        id: "security",
        title: "16. Security",
        paragraphs: [
          "We implement reasonable technical and organizational safeguards to protect information.",
          "However, no system can be guaranteed to be completely secure.",
        ],
      },
      {
        id: "international-transfers",
        title: "17. International Data Transfers",
        paragraphs: [
          "Information may be processed and stored in countries other than your own.",
          "We take appropriate measures to ensure compliance with applicable laws, including the General Data Protection Regulation where applicable.",
        ],
      },
      {
        id: "childrens-privacy",
        title: "18. Children’s Privacy",
        paragraphs: [
          "The Service is not intended for individuals under the age of 13, and we do not knowingly collect Personal Information from children.",
        ],
      },
      {
        id: "changes",
        title: "20. Changes to This Policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time.",
          "Material changes will be notified through the Service or other appropriate means.",
        ],
      },
    ],
    support: {
      id: "contact",
      navLabel: "19. Contact",
      title: "19. Contact",
      description: "For questions regarding this Privacy Policy, contact:",
      details: [
        { label: "Email", value: "team.iphint@gmail.com", href: "mailto:team.iphint@gmail.com" },
        { label: "Customer Center", value: "02-1644-0395" },
        {
          label: "Address",
          value:
            "UTRBOX 20, Solmae-ro 7ga-gil, Gangbuk-gu, Seoul (1F), Postal Code: 01207, Republic of Korea (South Korea)",
        },
      ],
    },
  },
  ko: {
    label: "한국어",
    title: "개인정보처리방침 읽기",
    company: "아이피힌트(IPHINT) / UTRBOX Inc.",
    effectiveDate: "시행일: 2026년 4월 5일",
    lang: "ko",
    sections: [
      {
        id: "scope",
        title: "제1조 (적용 범위)",
        paragraphs: [
          "본 개인정보처리방침은 UTRBOX Inc.(이하 \"회사\")가 제공하는 IPHINT 서비스(이하 \"서비스\")와 관련하여 정보를 어떻게 수집, 이용, 공개 및 보호하는지 설명합니다.",
          "본 방침은 서비스 운영과 관련하여 처리되는 개인정보뿐 아니라 서비스 이용 과정에서 생성되는 기술적 데이터와 분석 데이터에도 적용됩니다.",
        ],
      },
      {
        id: "definitions",
        title: "제2조 (정의)",
        paragraphs: [
          "\"개인정보\"란 식별되었거나 합리적으로 식별 가능한 개인과 관련된 정보를 의미합니다.",
          "\"서비스 데이터\"란 이용자가 업로드하거나 서비스 이용 과정에서 생성되는 이미지, 분석 결과, 탐지 결과(\"Discovery\"), 로그 및 관련 메타데이터를 의미하며, 그 성격에 따라 개인정보에 해당할 수도 있고 그렇지 않을 수도 있습니다.",
        ],
      },
      {
        id: "information-collected",
        title: "제3조 (수집하는 정보)",
        paragraphs: ["회사는 다음 범주의 정보를 수집할 수 있습니다."],
        subSections: [
          {
            subtitle: "(가) 계정 정보",
            text: "이메일 주소, 비밀번호(암호화 저장), 이름 또는 사용자명, 연락처 정보 및 제3자 인증 정보",
          },
          {
            subtitle: "(나) 서비스 데이터",
            text: "업로드된 콘텐츠(이미지 및 동영상 포함), 이미지 지문, 분석 데이터, 탐지 결과(\"Discovery\"), 사용 기록 및 관련 메타데이터",
          },
          {
            subtitle: "(다) 거래 정보",
            text: "청구 정보, 결제 기록, 정산 또는 지급과 관련된 정보",
          },
          {
            subtitle: "(라) 자동 수집 정보",
            text: "IP 주소, 기기 식별자, 브라우저 유형, 운영체제, 로그 데이터, 쿠키 및 사용 활동",
          },
        ],
      },
      {
        id: "how-we-use",
        title: "제4조 (정보의 이용 목적)",
        paragraphs: ["회사는 다음 목적을 위해 정보를 처리합니다."],
        list: [
          "서비스 제공 및 운영",
          "이미지 분석 및 탐지 결과 생성",
          "알림 및 이용자 대상 결과 제공",
          "서비스 성능 개선 및 최적화",
          "고객 지원 제공",
          "오남용 및 무단 사용의 탐지, 예방 및 대응",
          "결제 및 거래 처리",
        ],
        footerParagraphs: [
          "회사는 별도의 고지 없이 본 방침에 명시된 목적과 실질적으로 다른 목적으로 개인정보를 이용하지 않습니다.",
        ],
      },
      {
        id: "usage-data",
        title: "제5조 (이용 데이터 및 커뮤니케이션)",
        paragraphs: [
          "회사는 기능 개선과 사용자 경험 향상을 위해 클릭, 탐색 패턴, 기능 사용 내역 등 이용자 상호작용 데이터를 수집하고 분석할 수 있습니다.",
          "또한 커뮤니케이션 효과와 서비스 개선을 위해 이메일 열람 여부 및 링크 클릭 여부를 추적할 수 있습니다.",
        ],
      },
      {
        id: "cookies",
        title: "제6조 (쿠키 및 추적 기술)",
        paragraphs: [
          "회사는 이용자를 인식하고, 사용 패턴을 분석하며, 서비스를 개선하기 위해 쿠키 및 유사 기술을 사용합니다.",
          "이용자는 브라우저 설정을 통해 쿠키를 제어할 수 있으나, 쿠키를 비활성화하면 일부 기능이 제한될 수 있습니다.",
          "현재 서비스는 \"Do Not Track\" 신호에 별도로 대응하지 않습니다.",
        ],
      },
      {
        id: "third-party",
        title: "제7조 (제3자 서비스 및 링크)",
        paragraphs: [
          "서비스에는 제3자 웹사이트 또는 서비스로 연결되는 링크가 포함될 수 있습니다.",
          "해당 제3자의 개인정보 처리방침이 별도로 적용되며, 회사는 그들의 개인정보 보호 관행이나 콘텐츠에 대해 책임지지 않습니다.",
        ],
      },
      {
        id: "de-identified",
        title: "제8조 (비식별화 및 집계 데이터)",
        paragraphs: [
          "회사는 개인을 합리적으로 식별할 수 없도록 정보를 비식별화하거나 집계할 수 있습니다.",
          "이러한 데이터는 분석, 연구, 서비스 개선 및 사업 운영 목적에 활용되거나 제3자와 공유될 수 있습니다.",
        ],
      },
      {
        id: "disclosure",
        title: "제9조 (정보의 제공 및 공개)",
        paragraphs: [
          "회사는 개인정보를 판매하지 않습니다.",
          "다만 다음과 같은 경우 정보를 제공하거나 공개할 수 있습니다.",
        ],
        list: [
          "이용자 동의가 있는 경우",
          "회사를 대신하여 업무를 수행하는 서비스 제공자에게 제공하는 경우",
          "법적 의무를 준수하기 위해 필요한 경우",
          "권리, 안전 및 보안을 보호하기 위해 필요한 경우",
          "기업 거래와 관련하여 필요한 경우",
        ],
      },
      {
        id: "service-providers",
        title: "제10조 (서비스 제공자 및 수탁자)",
        paragraphs: [
          "회사는 정보를 대신 처리하도록 제3자 서비스 제공자를 이용할 수 있습니다.",
          "이들 업체는 회사에 서비스를 제공하는 데 필요한 범위 내에서만 정보를 이용하도록 계약상 의무를 부담하며, 관련 법령을 준수해야 합니다.",
        ],
      },
      {
        id: "business-transfers",
        title: "제11조 (사업 이전)",
        paragraphs: [
          "합병, 인수, 조직 재편 또는 자산 매각이 발생하는 경우 정보는 해당 거래의 일부로 이전될 수 있습니다.",
          "회사는 그러한 정보가 계속 적절하게 보호되도록 필요한 조치를 취합니다.",
        ],
      },
      {
        id: "data-retention",
        title: "제12조 (정보 보관 기간)",
        paragraphs: ["회사는 본 방침의 목적 달성에 필요한 기간 동안 정보를 보관하며, 예시는 다음과 같습니다."],
        list: [
          "계정 정보: 계정 삭제 시까지 보관 후 30일 이내 삭제",
          "업로드 콘텐츠: 최대 12개월",
          "탐지 결과 및 이용 데이터: 최대 24개월",
          "분쟁 관련 데이터: 최대 3년",
          "금융 기록: 관련 법령이 요구하는 기간",
        ],
        footerParagraphs: [
          "법률, 규제 또는 보안 목적상 필요한 경우 일부 데이터는 위 기간을 초과하여 보관될 수 있습니다.",
        ],
      },
      {
        id: "rights-choices",
        title: "제13조 (이용자의 권리와 선택)",
        paragraphs: ["이용자는 거주 지역의 법률에 따라 다음과 같은 권리를 가질 수 있습니다."],
        list: [
          "개인정보 열람",
          "정정 또는 삭제 요청",
          "처리 제한 요청",
          "데이터 이동 요청",
        ],
        callout: {
          label: "이메일",
          value: "team.iphint@gmail.com",
          href: "mailto:team.iphint@gmail.com",
        },
        footerParagraphs: ["회사는 요청 처리 전에 합리적인 범위에서 이용자의 신원을 확인할 수 있습니다."],
      },
      {
        id: "california-rights",
        title: "제14조 (캘리포니아주 개인정보 권리)",
        paragraphs: ["캘리포니아 소비자 개인정보 보호법에 따라 캘리포니아 거주자는 다음 권리를 가질 수 있습니다."],
        list: [
          "수집되는 개인정보의 항목을 알 권리",
          "삭제를 요청할 권리",
          "개인정보 판매에 대한 거부권(회사는 개인정보를 판매하지 않습니다)",
        ],
        footerParagraphs: ["적법한 대리인은 적절한 확인 절차를 거쳐 이용자를 대신하여 요청할 수 있습니다."],
      },
      {
        id: "no-legal",
        title: "제15조 (법률 서비스 부인 및 책임 제한)",
        paragraphs: [
          "서비스는 기술 기반의 분석 도구이며 법률 자문이나 법률 서비스를 제공하지 않습니다.",
          "회사는 로펌이 아니며, 법률 대리, 법률 의견 또는 법적 판단을 제공하지 않습니다.",
          "탐지 결과(\"Discovery\")를 포함한 모든 출력물은 자동화된 절차를 통해 생성되며 참고용 정보로만 제공됩니다.",
          "이러한 결과는 지식재산권 침해 또는 권리 귀속에 관한 법적 결론을 의미하지 않습니다.",
          "이용자는 서비스 결과를 바탕으로 내리는 모든 결정과 행동에 대해 전적으로 책임을 집니다.",
          "관련 법률이 허용하는 최대 범위 내에서 회사는 서비스 사용으로 발생하는 손해에 대한 책임을 부인합니다.",
          "어떠한 경우에도 회사의 총 책임 한도는 직전 12개월 동안 이용자가 지급한 금액을 초과하지 않습니다.",
        ],
      },
      {
        id: "security",
        title: "제16조 (보안)",
        paragraphs: [
          "회사는 정보를 보호하기 위해 합리적인 기술적 및 관리적 보호조치를 시행합니다.",
          "다만 어떤 시스템도 완전한 보안을 보장할 수는 없습니다.",
        ],
      },
      {
        id: "international-transfers",
        title: "제17조 (국제적 데이터 이전)",
        paragraphs: [
          "정보는 이용자 거주국 외의 국가에서 처리되거나 저장될 수 있습니다.",
          "회사는 필요한 경우 General Data Protection Regulation을 포함한 관련 법령을 준수하기 위한 적절한 조치를 취합니다.",
        ],
      },
      {
        id: "childrens-privacy",
        title: "제18조 (아동의 개인정보)",
        paragraphs: ["서비스는 13세 미만 아동을 대상으로 하지 않으며, 회사는 아동의 개인정보를 고의로 수집하지 않습니다."],
      },
      {
        id: "changes",
        title: "제20조 (본 방침의 변경)",
        paragraphs: [
          "회사는 필요에 따라 본 개인정보처리방침을 변경할 수 있습니다.",
          "중대한 변경 사항은 서비스 또는 기타 적절한 수단을 통해 고지됩니다.",
        ],
      },
    ],
    support: {
      id: "contact",
      navLabel: "제19조 (문의)",
      title: "제19조 (문의)",
      description: "본 개인정보처리방침과 관련한 문의는 아래로 연락해 주세요.",
      details: [
        { label: "이메일", value: "team.iphint@gmail.com", href: "mailto:team.iphint@gmail.com" },
        { label: "고객센터", value: "02-1644-0395" },
        {
          label: "주소",
          value: "UTRBOX, 서울특별시 강북구 솔매로 7가길 20 (1F), 우편번호 01207, 대한민국",
        },
      ],
    },
  },
};

export default function PrivacyPolicy() {
  return <PolicyPage pageTitles={{ en: "Privacy Policy", ko: "개인정보처리방침" }} documents={privacyDocuments} />;
}
