"use client";

import PolicyPage, { PolicyDocument, PolicyKey } from "@/components/policies/PolicyPage";

const usageDocuments: Record<PolicyKey, PolicyDocument> = {
  en: {
    label: "US",
    title: "Read Usage Policy",
    company: "IPHINT / UTRBOX Inc.",
    effectiveDate: "Effective Date: April 5, 2026",
    lang: "en",
    sections: [
      {
        id: "purpose",
        title: "1. Purpose",
        paragraphs: [
          "This Usage Policy (\"Policy\") governs acceptable and prohibited uses of the IPHINT service (the \"Service\").",
          "By using the Service, you agree to comply with this Policy. Violations may result in suspension or termination of access.",
        ],
      },
      {
        id: "principles",
        title: "2. General Principles",
        paragraphs: [
          "You may use the Service only for lawful purposes and in accordance with applicable laws and regulations.",
          "You are solely responsible for your use of the Service, including any content you upload and any actions taken based on Service outputs.",
        ],
      },
      {
        id: "prohibited-uses",
        title: "3. Prohibited Uses",
        paragraphs: ["You may not use the Service to:"],
        subSections: [
          {
            subtitle: "(a) Violate Laws or Rights",
            list: [
              "Infringe or misappropriate intellectual property rights",
              "Violate privacy, publicity, or other personal rights",
              "Engage in unlawful surveillance or tracking",
            ],
          },
          {
            subtitle: "(b) Abuse Intellectual Property Systems",
            list: [
              "Submit false, misleading, or fraudulent infringement claims",
              "Attempt to assert ownership over content you do not control",
              "Use the Service to harass, threaten, or extort others",
              "Generate or use detection results to initiate bad-faith legal actions",
            ],
          },
          {
            subtitle: "(c) Misuse Service Outputs",
            list: [
              "Represent detection results (\"Discovery\") as definitive legal conclusions",
              "Use outputs as sole evidence in legal proceedings without independent verification",
              "Misinterpret or manipulate outputs to mislead third parties",
            ],
          },
          {
            subtitle: "(d) Interfere with the Service",
            list: [
              "Reverse engineer, decompile, or attempt to extract algorithms",
              "Circumvent security measures or access restrictions",
              "Overload, disrupt, or degrade system performance",
              "Use automated scripts, bots, or scraping tools without authorization",
            ],
          },
          {
            subtitle: "(e) Upload Prohibited Content",
            paragraphs: ["You may not upload or process content that:"],
            list: [
              "Is illegal, harmful, or deceptive",
              "Contains malware or malicious code",
              "Violates third-party rights",
              "Is unrelated to legitimate IP monitoring purposes",
            ],
          },
        ],
      },
      {
        id: "ai-limitations",
        title: "4. AI and Automated Analysis Limitations",
        paragraphs: [
          "The Service relies on automated systems and machine learning models.",
          "Outputs may be incomplete, inaccurate, or outdated.",
          "You must not rely on the Service as a substitute for professional advice, including legal advice.",
        ],
      },
      {
        id: "enforcement",
        title: "5. Enforcement",
        paragraphs: ["The Company reserves the right, at its sole discretion, to:"],
        list: [
          "Monitor usage for compliance",
          "Remove or disable content",
          "Suspend or terminate accounts",
          "Report violations to authorities where required",
        ],
        footerParagraphs: ["No prior notice is required in cases of serious violations."],
      },
      {
        id: "reporting",
        title: "6. Reporting Violations",
        paragraphs: ["If you become aware of misuse of the Service, you may report it to:"],
        callout: {
          label: "Email",
          value: "team.iphint@gmail.com",
          href: "mailto:team.iphint@gmail.com",
        },
      },
      {
        id: "no-waiver",
        title: "7. No Waiver",
        paragraphs: [
          "Failure to enforce any provision of this Policy does not constitute a waiver of our rights.",
        ],
      },
      {
        id: "updates",
        title: "8. Updates",
        paragraphs: [
          "We may update this Policy at any time.",
          "Continued use of the Service constitutes acceptance of the updated Policy.",
        ],
      },
    ],
    support: {
      id: "support",
      navLabel: "Customer Support",
      title: "Customer Support & Inquiries (Contact us)",
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
    title: "이용 정책 읽기",
    company: "아이피힌트(IPHINT) / UTRBOX Inc.",
    effectiveDate: "시행일: 2026년 4월 5일",
    lang: "ko",
    sections: [
      {
        id: "purpose",
        title: "제1조 (목적)",
        paragraphs: [
          "본 이용 정책(이하 \"정책\")은 IPHINT 서비스(이하 \"서비스\")의 허용되는 사용 및 금지되는 사용을 규정합니다.",
          "이용자가 서비스를 사용하는 경우 본 정책을 준수하는 것에 동의한 것으로 간주됩니다. 위반 시 접근 권한의 정지 또는 해지로 이어질 수 있습니다.",
        ],
      },
      {
        id: "principles",
        title: "제2조 (일반 원칙)",
        paragraphs: [
          "이용자는 관련 법률 및 규정을 준수하는 적법한 목적에 한하여 서비스를 이용할 수 있습니다.",
          "이용자는 업로드한 콘텐츠와 서비스 결과를 바탕으로 취한 모든 행위를 포함하여 자신의 서비스 이용에 대해 전적으로 책임을 집니다.",
        ],
      },
      {
        id: "prohibited-uses",
        title: "제3조 (금지된 사용)",
        paragraphs: ["이용자는 다음과 같은 목적으로 서비스를 이용할 수 없습니다."],
        subSections: [
          {
            subtitle: "(가) 법률 또는 권리 침해",
            list: [
              "지식재산권을 침해하거나 부당하게 사용하는 행위",
              "개인정보, 퍼블리시티권 또는 기타 인격권을 침해하는 행위",
              "불법적인 감시 또는 추적 행위",
            ],
          },
          {
            subtitle: "(나) 지식재산 시스템의 남용",
            list: [
              "허위, 오해의 소지가 있는 또는 사기성 침해 주장을 제출하는 행위",
              "자신이 통제하지 않는 콘텐츠에 대한 소유권을 주장하려는 행위",
              "타인을 괴롭히거나 위협하거나 금전을 갈취하기 위해 서비스를 이용하는 행위",
              "탐지 결과를 이용해 악의적인 법적 조치를 시작하거나 지원하는 행위",
            ],
          },
          {
            subtitle: "(다) 서비스 결과의 오남용",
            list: [
              "탐지 결과(\"Discovery\")를 확정적인 법적 결론으로 표현하는 행위",
              "독립적인 검증 없이 결과물을 소송이나 분쟁의 유일한 증거로 사용하는 행위",
              "제3자를 오도하기 위해 결과를 잘못 해석하거나 조작하는 행위",
            ],
          },
          {
            subtitle: "(라) 서비스 방해",
            list: [
              "알고리즘을 역공학, 디컴파일 또는 추출하려는 시도",
              "보안 조치 또는 접근 제한을 우회하는 행위",
              "시스템 성능에 과부하를 주거나 방해하거나 저하시키는 행위",
              "승인 없이 자동화 스크립트, 봇 또는 스크래핑 도구를 사용하는 행위",
            ],
          },
          {
            subtitle: "(마) 금지된 콘텐츠 업로드",
            paragraphs: ["다음과 같은 콘텐츠를 업로드하거나 처리해서는 안 됩니다."],
            list: [
              "불법적이거나 유해하거나 기만적인 콘텐츠",
              "악성코드 또는 악성 코드를 포함한 콘텐츠",
              "제3자의 권리를 침해하는 콘텐츠",
              "정당한 지식재산 모니터링 목적과 무관한 콘텐츠",
            ],
          },
        ],
      },
      {
        id: "ai-limitations",
        title: "제4조 (AI 및 자동 분석의 한계)",
        paragraphs: [
          "서비스는 자동화 시스템과 머신러닝 모델에 의존합니다.",
          "출력 결과는 불완전하거나 부정확하거나 오래된 정보일 수 있습니다.",
          "이용자는 법률 자문을 포함한 전문가 조언을 대체하는 수단으로 서비스를 의존해서는 안 됩니다.",
        ],
      },
      {
        id: "enforcement",
        title: "제5조 (집행)",
        paragraphs: ["회사는 단독 재량으로 다음 조치를 취할 수 있습니다."],
        list: [
          "정책 준수를 위한 이용 모니터링",
          "콘텐츠 삭제 또는 비활성화",
          "계정 정지 또는 해지",
          "필요한 경우 관계 당국에 위반 사항 신고",
        ],
        footerParagraphs: ["중대한 위반의 경우 사전 통지는 요구되지 않습니다."],
      },
      {
        id: "reporting",
        title: "제6조 (위반 신고)",
        paragraphs: ["서비스의 오남용을 인지한 경우 아래 이메일로 신고할 수 있습니다."],
        callout: {
          label: "이메일",
          value: "team.iphint@gmail.com",
          href: "mailto:team.iphint@gmail.com",
        },
      },
      {
        id: "no-waiver",
        title: "제7조 (권리 불포기)",
        paragraphs: ["회사가 본 정책의 조항을 집행하지 않았다고 하여 회사의 권리를 포기한 것으로 해석되지 않습니다."],
      },
      {
        id: "updates",
        title: "제8조 (정책 변경)",
        paragraphs: [
          "회사는 언제든지 본 정책을 변경할 수 있습니다.",
          "서비스를 계속 이용하는 경우 변경된 정책을 수락한 것으로 간주됩니다.",
        ],
      },
    ],
    support: {
      id: "support",
      navLabel: "고객 지원 및 문의",
      title: "고객 지원 및 문의 (Contact us)",
      details: [
        { label: "이메일", value: "team.iphint@gmail.com", href: "mailto:team.iphint@gmail.com" },
        { label: "고객센터", value: "02-1644-0395" },
        { label: "주소", value: "UTRBOX, 서울특별시 강북구 솔매로 7가길 20 (1F), 우편번호 01207, 대한민국" },
      ],
    },
  },
};

export default function UsagePolicy() {
  return <PolicyPage pageTitles={{ en: "Usage Policy", ko: "이용 정책" }} documents={usageDocuments} />;
}