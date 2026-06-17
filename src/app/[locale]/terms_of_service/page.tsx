"use client";

import PolicyPage, { PolicyDocument, PolicyKey } from "@/components/policies/PolicyPage";

const termsDocuments: Record<PolicyKey, PolicyDocument> = {
  en: {
    label: "US",
    title: "Read Terms of Service",
    company: "IPHINT / UTRBOX Inc.",
    effectiveDate: "Effective Date: April 5, 2026",
    lang: "en",
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        paragraphs: [
          "These Terms of Service (\"Terms\") govern your access to and use of the IPHINT service (the \"Service\") operated by UTRBOX Inc. (\"Company,\" \"we,\" \"us,\" or \"our\").",
          "By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you may not use the Service.",
        ],
      },
      {
        id: "eligibility",
        title: "2. Eligibility",
        paragraphs: [
          "You must be at least 18 years old, or the age of majority in your jurisdiction, to use the Service.",
          "By using the Service, you represent and warrant that you meet these requirements.",
        ],
      },
      {
        id: "description",
        title: "3. Description of Service",
        paragraphs: [
          "The Service provides automated tools for monitoring, analyzing, and identifying potential matches of uploaded content across digital environments.",
          "The Service may generate detection results (\"Discovery\") based on algorithmic analysis.",
        ],
      },
      {
        id: "no-legal",
        title: "4. No Legal Services",
        paragraphs: [
          "The Service is a technology platform and does not provide legal advice or legal services.",
          "The Company is not a law firm and does not provide legal representation or legal determinations.",
          "All outputs are informational only and should not be relied upon as legal conclusions.",
        ],
      },
      {
        id: "user-content",
        title: "5. User Content",
        paragraphs: [
          "You retain ownership of content you upload (\"User Content\").",
          "By uploading content, you grant the Company a worldwide, non-exclusive, royalty-free license to use, process, analyze, and store such content solely for purposes of operating and improving the Service.",
          "You represent and warrant that you have all necessary rights to upload and use such content.",
        ],
      },
      {
        id: "prohibited",
        title: "6. Prohibited Conduct",
        paragraphs: ["You agree not to:"],
        list: [
          "Upload content you do not have rights to",
          "Use the Service for unlawful purposes",
          "Attempt to interfere with or disrupt the Service",
          "Reverse engineer or attempt to extract underlying algorithms",
          "Submit false or misleading infringement claims",
        ],
      },
      {
        id: "intellectual-property",
        title: "7. Intellectual Property",
        paragraphs: [
          "All rights, title, and interest in and to the Service (excluding User Content) are owned by the Company.",
          "No rights are granted except as expressly stated in these Terms.",
        ],
      },
      {
        id: "dmca",
        title: "8. DMCA and Copyright Policy",
        paragraphs: [
          "The Company complies with the Digital Millennium Copyright Act and responds to valid infringement notices.",
          "Users may submit claims in accordance with our DMCA Policy.",
        ],
      },
      {
        id: "fees",
        title: "9. Fees and Payments",
        paragraphs: [
          "Certain features of the Service may require payment.",
          "You agree to pay all applicable fees and authorize the Company or its payment processor to charge your selected payment method.",
          "All fees are non-refundable except as required by law.",
        ],
      },
      {
        id: "suspension",
        title: "10. Suspension and Termination",
        paragraphs: [
          "We may suspend or terminate your access at any time, with or without notice, if you violate these Terms or if required for legal or operational reasons.",
          "You may terminate your account at any time.",
        ],
      },
      {
        id: "disclaimer",
        title: "11. Disclaimer of Warranties",
        paragraphs: [
          "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE.\"",
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
          "THE COMPANY DOES NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY RESULTS.",
        ],
      },
      {
        id: "liability",
        title: "12. Limitation of Liability",
        paragraphs: [
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.",
          "IN NO EVENT SHALL THE COMPANY’S TOTAL LIABILITY EXCEED THE AMOUNT PAID BY YOU IN THE PRECEDING TWELVE (12) MONTHS.",
        ],
      },
      {
        id: "indemnification",
        title: "13. Indemnification",
        paragraphs: ["You agree to indemnify and hold harmless the Company from any claims, damages, liabilities, and expenses arising out of:"],
        list: ["Your use of the Service", "Your User Content", "Your violation of these Terms"],
      },
      {
        id: "third-party",
        title: "14. Third-Party Services",
        paragraphs: [
          "The Service may integrate with or link to third-party services.",
          "We are not responsible for the content, policies, or practices of such third parties.",
        ],
      },
      {
        id: "modifications",
        title: "15. Modifications to the Service",
        paragraphs: ["We may modify, suspend, or discontinue the Service at any time without liability."],
      },
      {
        id: "governing-law",
        title: "16. Governing Law",
        paragraphs: [
          "These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict of law principles.",
        ],
      },
      {
        id: "dispute",
        title: "17. Dispute Resolution",
        paragraphs: [
          "Any dispute arising out of or relating to these Terms shall be resolved exclusively in the courts located in California, unless otherwise required by law.",
        ],
      },
      {
        id: "changes",
        title: "18. Changes to Terms",
        paragraphs: [
          "We may update these Terms from time to time.",
          "Continued use of the Service constitutes acceptance of the updated Terms.",
        ],
      },
    ],
    support: {
      id: "contact",
      navLabel: "19. Contact",
      title: "19. Contact",
      description: "For questions regarding these Terms, contact:",
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
    title: "서비스 이용약관 읽기",
    company: "아이피힌트(IPHINT) / UTRBOX Inc.",
    effectiveDate: "시행일: 2026년 4월 5일",
    lang: "ko",
    sections: [
      {
        id: "acceptance",
        title: "제1조 (약관 동의)",
        paragraphs: [
          "본 서비스 이용약관(이하 \"약관\")은 UTRBOX Inc.(이하 \"회사\")가 운영하는 IPHINT 서비스(이하 \"서비스\")에 대한 이용자의 접근 및 이용을 규율합니다.",
          "이용자가 서비스에 접근하거나 이를 이용하는 경우 본 약관에 구속되는 것에 동의한 것으로 간주됩니다. 동의하지 않는 경우 서비스를 이용할 수 없습니다.",
        ],
      },
      {
        id: "eligibility",
        title: "제2조 (이용 자격)",
        paragraphs: [
          "이용자는 서비스 이용을 위해 만 18세 이상이거나 거주 지역에서 성년이어야 합니다.",
          "서비스를 이용함으로써 이용자는 이러한 요건을 충족함을 진술하고 보증합니다.",
        ],
      },
      {
        id: "description",
        title: "제3조 (서비스 설명)",
        paragraphs: [
          "서비스는 디지털 환경 전반에서 업로드된 콘텐츠의 잠재적 일치 항목을 모니터링, 분석 및 식별하기 위한 자동화 도구를 제공합니다.",
          "서비스는 알고리즘 분석을 기반으로 탐지 결과(\"Discovery\")를 생성할 수 있습니다.",
        ],
      },
      {
        id: "no-legal",
        title: "제4조 (법률 서비스 부인)",
        paragraphs: [
          "서비스는 기술 플랫폼일 뿐이며 법률 자문이나 법률 서비스를 제공하지 않습니다.",
          "회사는 로펌이 아니며, 법률 대리 또는 법적 판단을 제공하지 않습니다.",
          "모든 결과물은 참고용 정보이며 법적 결론으로 의존해서는 안 됩니다.",
        ],
      },
      {
        id: "user-content",
        title: "제5조 (이용자 콘텐츠)",
        paragraphs: [
          "이용자는 자신이 업로드한 콘텐츠(\"이용자 콘텐츠\")에 대한 소유권을 유지합니다.",
          "이용자는 콘텐츠를 업로드함으로써 회사가 서비스 운영 및 개선 목적에 한하여 해당 콘텐츠를 사용, 처리, 분석 및 저장할 수 있는 전 세계적이고 비독점적이며 로열티 없는 라이선스를 부여합니다.",
          "이용자는 해당 콘텐츠를 업로드하고 이용하는 데 필요한 모든 권리를 보유하고 있음을 진술하고 보증합니다.",
        ],
      },
      {
        id: "prohibited",
        title: "제6조 (금지 행위)",
        paragraphs: ["이용자는 다음 행위를 해서는 안 됩니다."],
        list: [
          "권리가 없는 콘텐츠를 업로드하는 행위",
          "불법적인 목적으로 서비스를 이용하는 행위",
          "서비스를 방해하거나 중단시키려는 시도",
          "기반 알고리즘을 역분석하거나 추출하려는 시도",
          "허위 또는 오해의 소지가 있는 침해 주장을 제출하는 행위",
        ],
      },
      {
        id: "intellectual-property",
        title: "제7조 (지식재산권)",
        paragraphs: [
          "이용자 콘텐츠를 제외한 서비스에 대한 모든 권리, 소유권 및 이익은 회사에 귀속됩니다.",
          "본 약관에 명시적으로 규정된 경우를 제외하고 어떠한 권리도 부여되지 않습니다.",
        ],
      },
      {
        id: "dmca",
        title: "제8조 (DMCA 및 저작권 정책)",
        paragraphs: [
          "회사는 Digital Millennium Copyright Act를 준수하며 적법한 침해 통지에 대응합니다.",
          "이용자는 회사의 DMCA 정책에 따라 침해 주장을 제출할 수 있습니다.",
        ],
      },
      {
        id: "fees",
        title: "제9조 (요금 및 결제)",
        paragraphs: [
          "서비스의 일부 기능은 유료일 수 있습니다.",
          "이용자는 적용되는 모든 요금을 지급하고, 회사 또는 회사의 결제 처리업체가 선택한 결제 수단에 청구하는 것에 동의합니다.",
          "모든 요금은 법률상 요구되는 경우를 제외하고 환불되지 않습니다.",
        ],
      },
      {
        id: "suspension",
        title: "제10조 (정지 및 해지)",
        paragraphs: [
          "이용자가 본 약관을 위반하거나 법률상 또는 운영상 필요가 있는 경우, 회사는 사전 통지 없이 언제든지 이용자의 접근을 정지하거나 해지할 수 있습니다.",
          "이용자는 언제든지 자신의 계정을 해지할 수 있습니다.",
        ],
      },
      {
        id: "disclaimer",
        title: "제11조 (보증의 부인)",
        paragraphs: [
          "서비스는 \"있는 그대로\", \"제공 가능한 상태로\" 제공됩니다.",
          "관련 법률이 허용하는 최대 범위 내에서 회사는 상품성, 특정 목적 적합성 및 비침해성을 포함한 모든 보증을 부인합니다.",
          "회사는 어떠한 결과의 정확성, 완전성 또는 신뢰성도 보장하지 않습니다.",
        ],
      },
      {
        id: "liability",
        title: "제12조 (책임의 제한)",
        paragraphs: [
          "관련 법률이 허용하는 최대 범위 내에서 회사는 간접손해, 부수손해, 특별손해, 결과손해 또는 징벌적 손해에 대해 책임지지 않습니다.",
          "어떠한 경우에도 회사의 총 책임은 직전 12개월 동안 이용자가 지급한 금액을 초과하지 않습니다.",
        ],
      },
      {
        id: "indemnification",
        title: "제13조 (면책 및 배상)",
        paragraphs: ["이용자는 다음 사유로 발생하는 청구, 손해, 책임 및 비용에 대하여 회사를 면책하고 배상하는 데 동의합니다."],
        list: ["이용자의 서비스 이용", "이용자 콘텐츠", "본 약관 위반"],
      },
      {
        id: "third-party",
        title: "제14조 (제3자 서비스)",
        paragraphs: [
          "서비스는 제3자 서비스와 연동되거나 이를 링크할 수 있습니다.",
          "회사는 그러한 제3자의 콘텐츠, 정책 또는 관행에 대해 책임지지 않습니다.",
        ],
      },
      {
        id: "modifications",
        title: "제15조 (서비스 변경)",
        paragraphs: ["회사는 책임 없이 언제든지 서비스를 수정, 중단 또는 종료할 수 있습니다."],
      },
      {
        id: "governing-law",
        title: "제16조 (준거법)",
        paragraphs: ["본 약관은 법률 충돌 원칙과 관계없이 캘리포니아주 법률에 따라 규율되고 해석됩니다."],
      },
      {
        id: "dispute",
        title: "제17조 (분쟁 해결)",
        paragraphs: ["본 약관과 관련하여 발생하는 모든 분쟁은 법률상 달리 요구되지 않는 한 캘리포니아주 소재 법원을 전속 관할로 하여 해결됩니다."],
      },
      {
        id: "changes",
        title: "제18조 (약관 변경)",
        paragraphs: [
          "회사는 필요에 따라 본 약관을 변경할 수 있습니다.",
          "서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 간주됩니다.",
        ],
      },
    ],
    support: {
      id: "contact",
      navLabel: "제19조 (문의)",
      title: "제19조 (문의)",
      description: "본 약관과 관련한 문의는 아래로 연락해 주세요.",
      details: [
        { label: "이메일", value: "team.iphint@gmail.com", href: "mailto:team.iphint@gmail.com" },
        { label: "고객센터", value: "02-1644-0395" },
        { label: "주소", value: "UTRBOX, 서울특별시 강북구 솔매로 7가길 20 (1F), 우편번호 01207, 대한민국" },
      ],
    },
  },
};

export default function TermsOfService() {
  return <PolicyPage pageTitles={{ en: "Terms of Service", ko: "서비스 이용약관" }} documents={termsDocuments} />;
}